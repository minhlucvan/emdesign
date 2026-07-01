/**
 * Region cropping — extract a bounding box region from an HTML document
 * by rendering it in Playwright and cropping the screenshot.
 *
 * This is used for per-section visual-diff: crop both the preview and the
 * rendered component to the section's bounding box before comparing,
 * removing noise from surrounding sections.
 */

import { chromium } from 'playwright';
import { PNG } from 'pngjs';

/**
 * Extract a region from an HTML document by rendering it and cropping
 * the screenshot to the given bounding box.
 *
 * @param html      — the HTML content to render
 * @param selector  — CSS selector to find the target element (optional; if omitted, uses bbox)
 * @param bbox      — { x, y, width, height } bounding box to crop to (CSS pixels)
 * @param viewport  — viewport dimensions
 * @returns         — { png: cropped PNG buffer, actualBbox: the actual bbox used }
 */
export async function cropRegion(
  html: string,
  selector?: string,
  bbox?: { x: number; y: number; width: number; height: number },
  viewport: { width: number; height: number } = { width: 1280, height: 900 },
): Promise<{ png: Buffer; actualBbox: { x: number; y: number; width: number; height: number } }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { ...viewport, deviceScaleFactor: 2 } });
    const uri = 'data:text/html;base64,' + Buffer.from(html, 'utf8').toString('base64');
    await page.goto(uri, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Resolve the bounding box from selector if provided
    let cropBbox = bbox;
    if (selector && !cropBbox) {
      cropBbox = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      }, selector);
    }

    // Fallback: use viewport center region
    if (!cropBbox) {
      cropBbox = { x: 0, y: 0, width: viewport.width, height: Math.min(viewport.height, 600) };
    }

    // Take a full screenshot and crop
    const fullPng = await page.screenshot({ type: 'png' });
    const img = PNG.sync.read(fullPng);

    // crop with DPR adjustment (2x)
    const dpr = 2;
    const sx = Math.round(cropBbox.x * dpr);
    const sy = Math.round(cropBbox.y * dpr);
    const sw = Math.round(cropBbox.width * dpr);
    const sh = Math.round(cropBbox.height * dpr);

    const cropped = new PNG({ width: sw, height: sh });
    for (let y = 0; y < sh && sy + y < img.height; y++) {
      for (let x = 0; x < sw && sx + x < img.width; x++) {
        const srcIdx = ((sy + y) * img.width + (sx + x)) * 4;
        const dstIdx = (y * sw + x) * 4;
        cropped.data[dstIdx] = img.data[srcIdx];
        cropped.data[dstIdx + 1] = img.data[srcIdx + 1];
        cropped.data[dstIdx + 2] = img.data[srcIdx + 2];
        cropped.data[dstIdx + 3] = img.data[srcIdx + 3];
      }
    }

    await page.close();
    return { png: PNG.sync.write(cropped), actualBbox: cropBbox };
  } finally {
    await browser.close();
  }
}

/**
 * Extract just the element text content for a given CSS selector,
 * without taking a screenshot (fast, no rendering needed for text).
 */
export async function extractElementText(
  html: string,
  selector: string,
): Promise<string | null> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const uri = 'data:text/html;base64,' + Buffer.from(html, 'utf8').toString('base64');
    await page.goto(uri, { waitUntil: 'domcontentloaded' });
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el as HTMLElement).innerText?.trim() || el.textContent?.trim() || null : null;
    }, selector);
  } finally {
    await browser.close();
  }
}
