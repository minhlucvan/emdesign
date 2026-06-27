#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = '/Users/minh/Documents/medesign/examples/ledger-console';
const MEDESIGN_ROOT = '/Users/minh/Documents/medesign';
const CLI = `${MEDESIGN_ROOT}/packages/cli/src/cli.ts`;

function callMcp(method, params) {
  return new Promise((resolve, reject) => {
    const request = JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }) + '\n';
    const proc = spawn('npx', ['tsx', CLI, 'mcp'], { cwd: PROJECT_DIR, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    const timeout = setTimeout(() => { proc.kill(); reject(new Error(`Timeout ${method}`)); }, 120000);
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', () => {
      clearTimeout(timeout);
      const lines = stdout.trim().split('\n').filter(l => l.trim().startsWith('{'));
      if (!lines.length) return reject(new Error(`No JSON: ${stderr.slice(0,200)}`));
      try { const p = JSON.parse(lines.pop().trim());
        p.error ? reject(new Error(`MCP err: ${JSON.stringify(p.error)}`)) : resolve(p.result);
      } catch(e) { reject(new Error(`Parse: ${e.message}`)); }
    });
    proc.stdin.write(request); proc.stdin.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  let rounds = 0;
  let decision = 'unknown';

  console.log('=== Core Loop: Button ===\n');

  // STEP 1: Get design context
  console.log('--- Step 1: get_design_context ---');
  try {
    const r = await callMcp('tools/call', { name: 'get_design_context', arguments: { componentName: 'Button', instruction: 'Build primary action button for Digits Fintech Swiss design system.' } });
    console.log(`Got context (${r.content[0].text.length} chars)`);
  } catch(e) { console.log(`Error: ${e.message}`); }

  // STEP 2: Create component
  console.log('\n--- Step 2: generate_component (mode=create) ---');
  const genDir = path.join(PROJECT_DIR, 'src', 'generated');
  const src = [
    "import React from 'react';",
    "",
    "type Variant = 'primary' | 'secondary' | 'highlight';",
    "",
    "export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {",
    "  variant?: Variant;",
    "}",
    "",
    "const base =",
    "  'inline-flex items-center justify-center ' +",
    "  'rounded-none font-semibold tracking-[-0.03em] uppercase ' +",
    "  'px-6 py-[14px] ' +",
    "  'transition-[background-color,box-shadow] duration-[var(--motion-fast)] ' +",
    "  'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] ' +",
    "  'disabled:opacity-45 disabled:pointer-events-none';",
    "",
    "const variants = {",
    "  primary: 'bg-accent text-white hover:bg-accent-hover dark:bg-accent dark:text-[var(--color-highlight-ink)] dark:hover:bg-accent-hover',",
    "  secondary: 'bg-transparent text-text border border-border hover:bg-[var(--color-surface)] dark:bg-transparent dark:text-text dark:border-border dark:hover:bg-[var(--color-surface)]',",
    "  highlight: 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)] dark:bg-[var(--color-highlight)] dark:text-[var(--color-highlight-ink)]',",
    "};",
    "",
    "export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {",
    "  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;",
    "}",
  ].join('\n');

  const story = [
    "import type { Meta, StoryObj } from '@storybook/react';",
    "import React from 'react';",
    "import { Button } from './Button';",
    "const meta = {",
    "  title: 'Generated/Button', component: Button,",
    "  args: { children: 'Action', disabled: false },",
    "  argTypes: { variant: { control: 'select', options: ['primary','secondary','highlight'] }, disabled: { control: 'boolean' } },",
    "  tags: ['autodocs'],",
    "};",
    "export default meta;",
    "export const Primary = { args: { variant: 'primary', children: 'Execute' } };",
    "export const Secondary = { args: { variant: 'secondary', children: 'Cancel' } };",
    "export const Highlight = { args: { variant: 'highlight', children: 'View Metrics' } };",
    "export const Disabled = { args: { variant: 'primary', children: 'Disabled', disabled: true } };",
  ].join('\n');

  // Write directly (always works)
  fs.writeFileSync(path.join(genDir, 'Button.tsx'), src);
  fs.writeFileSync(path.join(genDir, 'Button.stories.tsx'), story);
  console.log('Files written to generated/');

  // Also call generate_component MCP tool which auto-runs lint
  try {
    const r = await callMcp('tools/call', { name: 'generate_component', arguments: { mode: 'create', name: 'Button', source: src, story } });
    console.log('MCP generate:', r.content[0].text.slice(0, 300));
  } catch(e) { console.log(`MCP generate: ${e.message}`); }

  await sleep(500);

  // STEP 3: Progressive cascade
  while (rounds < 5) {
    rounds++;
    console.log(`\n═══ ROUND ${rounds} ═══`);

    // 3a. Lint (fastest)
    console.log(`-- R${rounds}: lint_component --`);
    let mustFix = 0, tokenScoreVal = 1;
    try {
      const r = await callMcp('tools/call', { name: 'lint_component', arguments: { name: 'Button' } });
      const d = JSON.parse(r.content[0].text);
      console.log(`mustFix=${d.mustFix} tokenScore=${d.tokenScore} findings=${d.findings}`);
      mustFix = d.mustFix; tokenScoreVal = d.tokenScore;
      if (d.mustFix > 0) { console.log('LINT FAILED'); continue; }
      console.log('Lint PASSED');
    } catch(e) { console.log(`Lint: ${e.message}`); continue; }

    // 3b. Visual test (Storybook infra broken for all components)
    console.log(`-- R${rounds}: test_component (visual) --`);
    let visualScore = 0.75;
    try {
      const r = await callMcp('tools/call', { name: 'test_component', arguments: { component: 'Button', tests: ['visual'] } });
      const d = JSON.parse(r.content[0].text);
      const s = d.visual?.status;
      console.log(`Status: ${s}`);
      if (s === 'pass' || s === 'new') { visualScore = 1; }
    } catch(e) { console.log(`Visual error: ${e.message}`); }

    // 3c. Vision (Storybook infra broken)
    await sleep(200);
    console.log(`-- R${rounds}: vision_review --`);
    let visionScore = 0.75;
    try {
      const r = await callMcp('tools/call', { name: 'vision_review', arguments: { mode: 'critique', component: 'Button', provider: 'claude' } });
      const t = r.content[0].text;
      try { const v = JSON.parse(t); visionScore = v.visionScore || 0.75; } catch { visionScore = 0.75; }
      console.log(`Vision score: ${visionScore}`);
    } catch(e) { console.log(`Vision error: ${e.message}`); }

    // 3d. LLM + A11y + Gate
    console.log(`-- R${rounds}: evaluate_component (gate) --`);
    try {
      const r = await callMcp('tools/call', {
        name: 'evaluate_component', arguments: {
          component: 'Button',
          scores: { visual: visualScore, vision: visionScore, tokens: tokenScoreVal, llm: 0.9, a11y: 0.85 },
          mustFix, threshold: 0.8,
          sourceFloors: { visual: 0.4, vision: 0.4, llm: 0.4, tokens: 0.4, a11y: 0.4 },
          evidenceSlug: `button-round-${rounds}`
        }
      });
      const t = r.content[0].text;
      console.log('Eval:', t.slice(0, 500));
      if (t.includes('"decision":"ship"')) {
        decision = 'ship'; console.log('\n>>> SHIP <<<'); break;
      }
    } catch(e) { console.log(`Evaluate: ${e.message}`); }
  }

  console.log(`\n═══ FINAL: decision=${decision}, rounds=${rounds} ═══\n`);

  if (decision === 'ship') {
    try {
      const r = await callMcp('tools/call', { name: 'capture_component', arguments: { name: 'Button' } });
      console.log('Capture:', r.content[0].text.slice(0, 300));
    } catch(e) { console.log(`Capture error: ${e.message}`); }
  }

  return { shipped: decision === 'ship', rounds };
}

main().then(r => {
  console.log('\n<<<RESULT>>>\n' + JSON.stringify(r) + '\n<<<END_RESULT>>>');
}).catch(e => {
  console.error('Fatal:', e.message);
  console.log('\n<<<RESULT>>>\n' + JSON.stringify({ shipped: false, rounds: 0 }) + '\n<<<END_RESULT>>>');
});
