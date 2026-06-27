import fs from 'node:fs';
import path from 'node:path';
import type { RepoPaths, Store } from '@emdesign/backend';
import {
  resolveDesignSystem,
  lintComponent,
  tokenScore,
  countMustFix,
  renderFindingsForAgent,
  effectiveAdapter,
  toStoryId,
  ensureDir,
} from '@emdesign/backend';
import { formatJson, formatError } from '../lib/format.js';
import { activeDsId } from '../lib/resolve.js';

export interface GenerateArgs {
  name: string;
  mode: 'create' | 'edit';
  source?: string;        // file path
  stdin?: boolean;        // read source from stdin
  story?: string;         // file path
  stdinStory?: boolean;   // read story from stdin
  json?: boolean;
}

export async function cmdGenerate(args: GenerateArgs, paths: RepoPaths, store: Store): Promise<void> {
  const name = args.name;
  if (!name) {
    formatError('generate requires a component name');
    process.exit(1);
  }

  // Resolve source
  let source: string | undefined;
  if (args.stdin) {
    source = await readStdin();
  } else if (args.source) {
    source = fs.readFileSync(path.resolve(args.source), 'utf8');
  }

  if (!source) {
    formatError('generate requires source via --source <file> or --stdin');
    process.exit(1);
  }

  // Resolve story
  let story: string | undefined;
  if (args.stdinStory) {
    story = await readStdin();
  } else if (args.story) {
    story = fs.readFileSync(path.resolve(args.story), 'utf8');
  }

  // Write files
  const adapter = effectiveAdapter(paths);
  ensureDir(paths.generatedDir);
  fs.writeFileSync(path.join(paths.generatedDir, `${name}${adapter.fileExt}`), source);
  if (story) {
    fs.writeFileSync(path.join(paths.generatedDir, `${name}${adapter.storyExt}`), story);
  }

  // Run lint automatically
  const ds = resolveDesignSystem(paths, activeDsId(store));
  const findings = lintComponent(source, {
    declaredTokens: ds.declaredTokens,
    exemptions: ds.exemptions,
    bindsDisplayFace: ds.bindsDisplayFace,
  });
  const mf = countMustFix(findings);
  const tScore = tokenScore(findings);
  store.update({ currentComponent: name, lintPassing: mf === 0 });

  const previewUrl = `${process.env.EMDESIGN_STORYBOOK_URL ?? 'http://localhost:6006'}/iframe.html?id=${toStoryId(name)}&viewMode=story`;

  if (args.json) {
    formatJson({
      name,
      mode: args.mode,
      lint: {
        mustFix: mf,
        tokenScore: tScore,
        findings: findings.length,
        report: renderFindingsForAgent(findings),
      },
      previewUrl,
    });
  } else {
    const status = mf === 0 ? '✅ lint clean' : `⚠️ ${mf} P0 issue(s)`;
    process.stderr.write(`Generated ${name} → ${args.mode}\n`);
    process.stderr.write(`Lint: ${status} (token score: ${tScore.toFixed(2)})\n`);
    process.stderr.write(`Preview: ${previewUrl}\n`);
    if (findings.length > 0) {
      process.stderr.write(renderFindingsForAgent(findings) + '\n');
    }
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}
