#!/usr/bin/env node
// Checks that the Claude and Cursor copies of each Wingspan skill agree on
// the parallel-first sections and on the shared parallel-execution-map
// reference. Exits 1 on drift.
//
//   node scripts/check-skill-copies.mjs [pluginDir]
//
// pluginDir defaults to plugins/vgv-wingspan relative to the repo root.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** H2 headings whose sections must match between the two copies. */
export const TRACKED_SECTIONS = ['## Parallel execution map', '## Parallel build'];

/** Sections that must be present (in both copies) for a given skill. */
export const REQUIRED_SECTIONS = {
  plan: ['## Parallel execution map'],
  build: ['## Parallel build'],
};

/** Reference files (relative to a skill dir) that must match when shared. */
export const TRACKED_REFERENCES = ['references/parallel-execution-map.md'];

/** Skills that must ship the tracked reference in both copies. */
export const REQUIRED_REFERENCE_SKILLS = ['plan', 'build'];

/** Shared policy docs that must match across Claude and Cursor trees. */
export const POLICY_MIRROR_PAIRS = [
  {
    label: 'scoped-commit-validation',
    claude: 'skills/shared/references/scoped-commit-validation.md',
    cursor: 'cursor/skills/shared/references/scoped-commit-validation.md',
  },
  {
    label: 'consumer-push-scripts',
    claude: 'skills/shared/references/consumer-push-scripts.md',
    cursor: 'cursor/skills/shared/references/consumer-push-scripts.md',
  },
];

/** Wingspan paths scanned for contradictory broad-gate instructions. */
export const POLICY_SCAN_FILES = [
  'skills/shared/references/scoped-commit-validation.md',
  'skills/shared/references/consumer-push-scripts.md',
  'skills/shared/references/drive-to-green.md',
  'skills/shared/references/validate-and-fix.md',
  'skills/create-pr/SKILL.md',
  'skills/create-pr/references/ci-checks.md',
  'skills/create-pr/references/push.md',
  'skills/build/SKILL.md',
  'skills/build/references/consumer-push-gate.md',
  'skills/hotfix/SKILL.md',
  'cursor/skills/shared/references/scoped-commit-validation.md',
  'cursor/skills/shared/references/consumer-push-scripts.md',
  'cursor/skills/create-pr/SKILL.md',
  'cursor/skills/create-pr/references/ci-checks.md',
  'cursor/skills/create-pr/references/push.md',
  'cursor/skills/build/SKILL.md',
  'cursor/skills/build/references/consumer-push-gate.md',
  'cursor/skills/hotfix/SKILL.md',
  'rules/vgv-cli-required.mdc',
];

/** Phrases that re-instate broad commit/push gates (forbidden in POLICY_SCAN_FILES). */
export const POLICY_FORBIDDEN_PATTERNS = [
  { id: 'consumer-documents-required', pattern: /consumer repo documents them as required/i },
  { id: 'documents-mandatory-user', pattern: /documents that command as mandatory and the user requires/i },
  { id: 'run-gate-when-documented', pattern: /run that gate only when the repo documents/i },
  { id: 'ship-skill-requires', pattern: /\(or ship skill\) requires it/i },
  { id: 'agents-requires-it', pattern: /\(or repo `AGENTS\.md`\) requires it/i },
  { id: 'when-repo-documents-user', pattern: /when the repo documents it and the user/i },
  { id: 'skip-checks', pattern: /skip-checks/i },
  { id: 'create-pr-skip-checks', pattern: /\/create-pr skip-checks/i },
];

export function normalizePolicyDualHost(text) {
  return normalize(text)
    .replace(
      /\*\*AskQuestion\*\* \(Cursor\) \/ \*\*AskUserQuestion\*\* \(Claude Code\)/g,
      'HOST_QUESTION_TOOL',
    )
    .replace(/\*\*AskUserQuestion\*\*/g, 'HOST_QUESTION_TOOL')
    .replace(/\*\*AskQuestion\*\*/g, 'HOST_QUESTION_TOOL')
    .replace(/HOST_QUESTION_TOOL\s+/g, 'HOST_QUESTION_TOOL ');
}

/**
 * @param {string} content
 * @returns {string[]} forbidden pattern ids found
 */
export function findForbiddenPolicyPatterns(content) {
  return POLICY_FORBIDDEN_PATTERNS.filter(({ pattern }) => pattern.test(content)).map(
    ({ id }) => id,
  );
}

/**
 * @returns {string[]} mirror drift errors
 */
export function checkPolicyMirrors(pluginDir) {
  const errors = [];

  for (const pair of POLICY_MIRROR_PAIRS) {
    const a = readIfExists(path.join(pluginDir, pair.claude));
    const b = readIfExists(path.join(pluginDir, pair.cursor));
    if (a === null || b === null) {
      errors.push(`policy mirror ${pair.label}: missing file on one side`);
      continue;
    }
    if (normalizePolicyDualHost(a) !== normalizePolicyDualHost(b)) {
      errors.push(`policy mirror ${pair.label}: Claude and Cursor copies differ`);
    }
  }

  return errors;
}

/**
 * @returns {string[]} contradiction and required-phrase errors
 */
export function checkPolicyContradictions(pluginDir) {
  const errors = [];

  for (const rel of POLICY_SCAN_FILES) {
    const file = path.join(pluginDir, rel);
    const content = readIfExists(file);
    if (content === null) {
      errors.push(`policy scan: missing ${rel}`);
      continue;
    }
    for (const id of findForbiddenPolicyPatterns(content)) {
      errors.push(`policy contradiction in ${rel}: forbidden pattern ${id}`);
    }
  }

  const scoped = readIfExists(
    path.join(pluginDir, 'skills/shared/references/scoped-commit-validation.md'),
  );
  if (scoped !== null) {
    if (!/user explicitly starts separate\s+work/i.test(scoped)) {
      errors.push('policy: scoped-commit-validation must require explicit user for broad work');
    }
    if (!/\*\*Never mandatory\*\*/i.test(scoped)) {
      errors.push('policy: scoped-commit-validation must include Never mandatory broad gates');
    }
    if (!/\*\*never\*\* bypass hooks/i.test(scoped)) {
      errors.push('policy: scoped-commit-validation must forbid hook bypass');
    }
  }

  return errors;
}

/**
 * @returns {string[]} policy drift and contradiction errors
 */
export function checkScopedValidationPolicy(pluginDir) {
  return [
    ...checkPolicyMirrors(pluginDir),
    ...checkPolicyContradictions(pluginDir),
  ];
}

function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/u, ''))
    .join('\n')
    .replace(/\n+$/u, '');
}

/**
 * Extracts every tracked H2 section from a markdown string.
 * A section runs from its heading line to the line before the next H2.
 * @returns {Map<string, string>} heading -> normalized section body
 */
export function extractTrackedSections(markdown, tracked = TRACKED_SECTIONS) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const found = new Map();
  let inFence = false;
  let fenceMarker = '';
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current !== null) found.set(current, normalize(buffer.join('\n')));
    current = null;
    buffer = [];
  };

  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/u);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence[1];
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
    }
    const isH2 = !inFence && /^## /u.test(line);
    if (isH2) {
      flush();
      const heading = tracked.find((h) => line.startsWith(h));
      if (heading) {
        current = heading;
        buffer.push(line);
      }
      continue;
    }
    if (current !== null) buffer.push(line);
  }
  flush();
  return found;
}

function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function listSkillDirs(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(root, name, 'SKILL.md')))
    .sort();
}

/**
 * Compares the Claude (`skills/`) and Cursor (`cursor/skills/`) copies under
 * `pluginDir`.
 * @returns {{ errors: string[], checked: string[] }}
 */
export function checkSkillCopies(pluginDir) {
  const claudeRoot = path.join(pluginDir, 'skills');
  const cursorRoot = path.join(pluginDir, 'cursor', 'skills');
  const errors = [];
  const checked = [];

  const claudeSkills = new Set(listSkillDirs(claudeRoot));
  const cursorSkills = listSkillDirs(cursorRoot);
  const shared = cursorSkills.filter((name) => claudeSkills.has(name));

  if (shared.length === 0) {
    errors.push(`no skills present in both ${claudeRoot} and ${cursorRoot}`);
    return { errors, checked };
  }

  for (const skill of shared) {
    checked.push(skill);
    const claudeSkill = path.join(claudeRoot, skill);
    const cursorSkill = path.join(cursorRoot, skill);

    const claudeMd = fs.readFileSync(path.join(claudeSkill, 'SKILL.md'), 'utf8');
    const cursorMd = fs.readFileSync(path.join(cursorSkill, 'SKILL.md'), 'utf8');
    const claudeSections = extractTrackedSections(claudeMd);
    const cursorSections = extractTrackedSections(cursorMd);

    for (const heading of TRACKED_SECTIONS) {
      const a = claudeSections.get(heading);
      const b = cursorSections.get(heading);
      const required = (REQUIRED_SECTIONS[skill] ?? []).includes(heading);
      if (a === undefined && b === undefined) {
        if (required) {
          errors.push(`${skill}: required section "${heading}" missing from both copies`);
        }
        continue;
      }
      if (a === undefined || b === undefined) {
        const missing = a === undefined ? 'skills' : 'cursor/skills';
        errors.push(`${skill}: section "${heading}" present in one copy but missing from ${missing}/${skill}/SKILL.md`);
        continue;
      }
      if (a !== b) {
        errors.push(`${skill}: section "${heading}" differs between skills/ and cursor/skills/ copies`);
      }
    }

    for (const ref of TRACKED_REFERENCES) {
      const a = readIfExists(path.join(claudeSkill, ref));
      const b = readIfExists(path.join(cursorSkill, ref));
      const required = REQUIRED_REFERENCE_SKILLS.includes(skill);
      if (a === null && b === null) {
        if (required) errors.push(`${skill}: required reference ${ref} missing from both copies`);
        continue;
      }
      if (a === null || b === null) {
        const missing = a === null ? 'skills' : 'cursor/skills';
        errors.push(`${skill}: reference ${ref} present in one copy but missing from ${missing}/${skill}/${ref}`);
        continue;
      }
      if (normalize(a) !== normalize(b)) {
        errors.push(`${skill}: reference ${ref} differs between skills/ and cursor/skills/ copies`);
      }
    }
  }

  return { errors, checked };
}

/**
 * Parallel sections + scoped-validation policy mirrors and contradictions.
 * @returns {{ errors: string[], checked: string[] }}
 */
export function checkWingspanCopies(pluginDir) {
  const { errors, checked } = checkSkillCopies(pluginDir);
  const policyErrors = checkScopedValidationPolicy(pluginDir);
  return { errors: [...errors, ...policyErrors], checked };
}

export function defaultPluginDir() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..', 'plugins', 'vgv-wingspan');
}

function main(argv) {
  const pluginDir = path.resolve(argv[0] ?? defaultPluginDir());
  const { errors, checked } = checkWingspanCopies(pluginDir);
  console.log(`check-skill-copies: ${pluginDir}`);
  console.log(`checked skills: ${checked.join(', ') || '(none)'}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`DRIFT: ${error}`);
    console.error(`${errors.length} problem(s) found`);
    return 1;
  }
  console.log('OK: Claude and Cursor skill copies and scoped-validation policy agree');
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exit(main(process.argv.slice(2)));
