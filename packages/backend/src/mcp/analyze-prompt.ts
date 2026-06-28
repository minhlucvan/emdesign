/**
 * MCP tool: analyze-design-prompt
 *
 * Extracts mood, category, keywords, accent color hints, and font preferences
 * from a natural language design prompt.
 */

export interface AnalyzeResult {
  mood: string;
  category: string;
  keywords: string[];
  accentColor?: string;
  fonts?: Record<string, string>;
}

/** Analyze a natural language prompt to extract design attributes. */
export async function analyzeDesignPrompt(input: { prompt: string }): Promise<AnalyzeResult> {
  const { prompt } = input;
  const lower = prompt.toLowerCase();

  // Simple keyword-based extraction (in production this would use an LLM call)
  const mood = detectMood(lower);
  const category = detectCategory(lower);
  const keywords = extractKeywords(prompt);
  const accentColor = detectAccentColor(lower);
  const fonts = detectFonts(lower);

  return { mood, category, keywords, accentColor, fonts };
}

function detectMood(lower: string): string {
  if (lower.includes('dark') || lower.includes('editorial') || lower.includes('sophisticated')) return 'dark, editorial, sophisticated';
  if (lower.includes('minimal') || lower.includes('clean')) return 'minimal, clean';
  if (lower.includes('vibrant') || lower.includes('playful')) return 'vibrant, playful';
  if (lower.includes('warm') || lower.includes('cozy')) return 'warm, inviting';
  if (lower.includes('corporate') || lower.includes('professional')) return 'corporate, professional';
  if (lower.includes('fintech') || lower.includes('finance')) return 'clean, trustworthy';
  return 'neutral, balanced';
}

function detectCategory(lower: string): string {
  if (lower.includes('editorial') || lower.includes('magazine') || lower.includes('publishing')) return 'editorial';
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('bank')) return 'fintech';
  if (lower.includes('product') || lower.includes('saas') || lower.includes('dashboard')) return 'product';
  if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store')) return 'ecommerce';
  if (lower.includes('brand') || lower.includes('marketing')) return 'brand';
  if (lower.includes('social') || lower.includes('media')) return 'social';
  return 'custom';
}

function extractKeywords(prompt: string): string[] {
  const all = prompt.split(/[\s,]+/).filter(w => w.length > 2);
  const stopwords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have']);
  return [...new Set(all.filter(w => !stopwords.has(w.toLowerCase()) && !w.startsWith('#')))];
}

function detectAccentColor(lower: string): string | undefined {
  const colorMap: Record<string, string> = {
    lime: '#84cc16',
    blue: '#2563eb',
    green: '#16a34a',
    red: '#dc2626',
    orange: '#ea580c',
    purple: '#9333ea',
    pink: '#ec4899',
    yellow: '#eab308',
    teal: '#0d9488',
    cyan: '#06b6d4',
    indigo: '#4f46e5',
    amber: '#d97706',
    emerald: '#059669',
  };
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lower.includes(name)) return hex;
  }
  return undefined;
}

function detectFonts(lower: string): Record<string, string> | undefined {
  const knownFonts = ['inter', 'roboto', 'georgia', 'times new roman', 'source serif', 'merriweather', 'playfair', 'manrope', 'spoqa han sans', 'noto sans'];
  const found: Record<string, string> = {};
  for (const font of knownFonts) {
    if (lower.includes(font)) {
      if (lower.includes('serif') || lower.includes('display')) {
        found.display = font.charAt(0).toUpperCase() + font.slice(1);
      }
      if (!found.body) found.body = font.charAt(0).toUpperCase() + font.slice(1);
    }
  }
  return Object.keys(found).length > 0 ? found : undefined;
}
