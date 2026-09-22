import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  checkSkillCopies,
  defaultPluginDir,
  extractTrackedSections,
} from './check-skill-copies.mjs';

const MAP_SECTION = ['## Parallel execution map', '', 'Shards table and `shards` JSON.', ''].join('\n');
const BUILD_SECTION = ['## Parallel build (default when the plan has a Parallel execution map)', '', 'Fan out.', ''].join('\n');
const REF = '# Parallel execution map\n\nspec\n';

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Builds a minimal plugin tree with plan + build in both copies. */
function fixture(overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-copies-'));
  const planMd = `---\nname: plan\n---\n\n# Plan\n\n${MAP_SECTION}\n## Output\n\nx\n`;
  const buildMd = `---\nname: build\n---\n\n# Build\n\n## Phase 2\n\ny\n\n${BUILD_SECTION}\n## Phase 3\n\nz\n`;
  const files = {
    'skills/plan/SKILL.md': planMd,
    'cursor/skills/plan/SKILL.md': `---\nname: plan\n---\n\n<!-- CURSOR -->\n\n# Plan\n\n${MAP_SECTION}\n## Output\n\ncursor-specific\n`,
    'skills/plan/references/parallel-execution-map.md': REF,
    'cursor/skills/plan/references/parallel-execution-map.md': REF,
    'skills/build/SKILL.md': buildMd,
    'cursor/skills/build/SKILL.md': buildMd,
    'skills/build/references/parallel-execution-map.md': REF,
    'cursor/skills/build/references/parallel-execution-map.md': REF,
    'skills/brainstorm/SKILL.md': '# Brainstorm\n',
    'cursor/skills/brainstorm/SKILL.md': '# Brainstorm (cursor)\n',
    'skills/review/SKILL.md': '# Claude only\n',
    ...overrides,
  };
  for (const [rel, content] of Object.entries(files)) {
    if (content === null) continue;
    write(path.join(dir, rel), content);
  }
  return dir;
}

test('extractTrackedSections returns tracked H2 sections up to the next H2', () => {
  const md = ['# Title', '', '## Parallel execution map', '', 'body', '', '### Sub', 'more', '', '## Next', 'ignored'].join('\n');
  const sections = extractTrackedSections(md);
  assert.equal(sections.size, 1);
  assert.equal(sections.get('## Parallel execution map'), '## Parallel execution map\n\nbody\n\n### Sub\nmore');
});

test('extractTrackedSections ignores "## " lines inside fenced code blocks', () => {
  const md = ['## Parallel build (default)', '', '```markdown', '## Not a heading', '```', 'tail', '', '## Real next'].join('\n');
  const sections = extractTrackedSections(md);
  assert.equal(sections.get('## Parallel build'), '## Parallel build (default)\n\n```markdown\n## Not a heading\n```\ntail');
});

test('passes when both copies agree and non-tracked prose differs', () => {
  const dir = fixture();
  const { errors, checked } = checkSkillCopies(dir);
  assert.deepEqual(errors, []);
  assert.deepEqual(checked, ['brainstorm', 'build', 'plan']);
});

test('fails when a tracked section differs', () => {
  const dir = fixture({
    'cursor/skills/plan/SKILL.md': `# Plan\n\n## Parallel execution map\n\nDIFFERENT\n\n## Output\n`,
  });
  const { errors } = checkSkillCopies(dir);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /plan: section "## Parallel execution map" differs/);
});

test('fails when a tracked section exists in only one copy', () => {
  const dir = fixture({ 'cursor/skills/build/SKILL.md': '# Build\n\n## Phase 2\n' });
  const { errors } = checkSkillCopies(dir);
  assert.ok(errors.some((e) => /build: section "## Parallel build" present in one copy/.test(e)));
});

test('fails when a required section is missing from both copies', () => {
  const dir = fixture({
    'skills/plan/SKILL.md': '# Plan\n',
    'cursor/skills/plan/SKILL.md': '# Plan\n',
  });
  const { errors } = checkSkillCopies(dir);
  assert.ok(errors.some((e) => /plan: required section "## Parallel execution map" missing from both/.test(e)));
});

test('fails when the shared reference drifts or is missing on one side', () => {
  const drift = fixture({ 'cursor/skills/plan/references/parallel-execution-map.md': REF + 'extra\n' });
  assert.ok(checkSkillCopies(drift).errors.some((e) => /plan: reference .* differs/.test(e)));

  const missing = fixture({ 'cursor/skills/build/references/parallel-execution-map.md': null });
  assert.ok(checkSkillCopies(missing).errors.some((e) => /build: reference .* missing from cursor\/skills/.test(e)));
});

test('tolerates trailing whitespace and CRLF differences', () => {
  const dir = fixture({
    'cursor/skills/build/SKILL.md': `# Build\r\n\r\n${BUILD_SECTION.replace(/\n/g, '  \r\n')}\r\n## Phase 3\r\n`,
  });
  assert.deepEqual(checkSkillCopies(dir).errors, []);
});

test('the real vgv-wingspan plugin passes', () => {
  const { errors } = checkSkillCopies(defaultPluginDir());
  assert.deepEqual(errors, []);
});
