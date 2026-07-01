// ds-analyze-preview.js
// Analyze a preview HTML and discover its visual sections dynamically.
// Each design system has different sections — this workflow reads whatever
// the preview contains and returns a structured section list.
//
// Called by ds-reconstruct-overview (or standalone for inspection):
//   workflow('ds-analyze-preview', { previewPath })

export const meta = {
  name: 'ds-analyze-preview',
  description: 'Analyze a preview HTML and discover its visual sections dynamically.',
  phases: [
    { title: 'Read preview', detail: 'Load and parse preview HTML' },
    { title: 'Identify sections', detail: 'Discover visual sections and their structure' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : (args || {})
const { previewPath } = parsedArgs
if (!previewPath) throw new Error('ds-analyze-preview: previewPath is required')

phase('Read preview')
log('[ds-analyze-preview] Reading: ' + previewPath)

const previewContent = await agent(
  'Read the preview HTML at "' + previewPath + '" and return its full content.\n' +
  'Run: cat "' + previewPath + '"\nReturn the complete HTML.',
  { label: 'read:' + previewPath, phase: 'Read preview' }
)

const html = String(previewContent || '')
if (html.length < 100) throw new Error('Preview too short or empty: ' + html.length + ' chars')
log('[ds-analyze-preview] Loaded ' + html.length + ' bytes')

// ===== IDENTIFY SECTIONS =====
phase('Identify sections')
log('[ds-analyze-preview] Identifying visual sections')

const analysis = await agent(
  'Analyze the preview HTML and identify every distinct visual section.\n\n' +
  'Look for structural elements that create visual sections:\n' +
  '- <header>, <nav>, <main>, <footer>, <section>, <article>, <aside>\n' +
  '- <div> elements with distinct background colors, padding, or borders\n' +
  '- Elements with id attributes (e.g. id="palette", id="typography")\n' +
  '- Consecutive elements with the same background/padding pattern\n\n' +
  'For each section identify:\n' +
  '1. name — short descriptive name (e.g. "Hero", "Color Palette", "Pricing Cards")\n' +
  '2. selector — CSS selector that uniquely identifies this section\n' +
  '3. description — what this section contains and its visual style\n' +
  '4. keyComponents — UI components visible in this section (Button, Card, Input, etc.)\n\n' +
  'Read the HTML step by step from top to bottom. Group elements that belong together visually.\n\n' +
  'Return JSON: { "sections": [{ "name": string, "selector": string, "description": string, "keyComponents": string[] }] }',
  {
    label: 'analyze-preview', phase: 'Identify sections',
    schema: {
      type: 'object',
      properties: {
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              selector: { type: 'string' },
              description: { type: 'string' },
              keyComponents: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'selector'],
          },
        },
      },
      required: ['sections'],
    },
  }
)

const sections = (analysis?.sections ?? []).filter(Boolean)
log('[ds-analyze-preview] Found ' + sections.length + ' sections:')
for (const s of sections) {
  const comps = (s.keyComponents || []).join(', ')
  log('  - ' + s.name + (comps ? ' [' + comps + ']' : ''))
}

return {
  sections,
  totalSections: sections.length,
  previewPath,
  previewSize: html.length,
}
