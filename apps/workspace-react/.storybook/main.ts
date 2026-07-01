import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Resolve to the ACTIVE design system only (avoid duplicate IDs from wildcard).
const activeFile = path.resolve(here, '../.emdesign/active-ds');
const active = fs.existsSync(activeFile) ? fs.readFileSync(activeFile, 'utf8').trim() : 'atelier';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(ts|tsx)',
    '../src/generated/**/*.stories.@(ts|tsx)',
    // Only the active design system's story files (not a wildcard scan).
    `../../../design-systems/${active}/code/**/*.stories.@(ts|tsx)`,
  ],
  addons: [
    '@storybook/addon-essentials',
    '@emdesign/addon',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // `@ds` always resolves to the ACTIVE design system's primitives (same active as above).
  viteFinal: async (vite) => {
    vite.resolve = vite.resolve ?? {};
    vite.resolve.alias = {
      ...(vite.resolve.alias ?? {}),
      '@ds': path.resolve(here, `../../../design-systems/${active}/code`),
    };
    // The addon and dsr packages are npm workspace symlinks. Allow Vite to serve
    // their real paths (packages/*/) so sub-path exports like charters/preview
    // don't fail on @fs restrictions.
    vite.server = vite.server ?? {};
    vite.server.fs = vite.server.fs ?? {};
    vite.server.fs.allow = [
      ...(vite.server.fs.allow ?? []),
      path.resolve(here, '../../..'), // monorepo root
    ];
    return vite;
  },
};

export default config;
