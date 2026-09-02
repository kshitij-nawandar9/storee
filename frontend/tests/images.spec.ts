import { expect, test, type Page, type Request } from '@playwright/test';

/**
 * Guards the responsive-image pipeline. The masters live in `assets-src/` and
 * are not deployed, so anything still pointing at a master path 404s — which is
 * exactly what happens when `imageManifest.json` drifts from the data modules.
 */

const PAGES = ['/', '/products', '/hampers', '/products/kids-bag'];

async function collectImages(page: Page, path: string) {
  const requests: { url: string; status: number; bytes: number }[] = [];

  const onResponse = async (response: Awaited<ReturnType<Request['response']>>) => {
    if (!response) return;
    const url = response.url();
    if (!/\/images\//.test(url)) return;
    let bytes = 0;
    try {
      bytes = Number((await response.allHeaders())['content-length'] ?? 0);
    } catch {
      /* response body already discarded */
    }
    requests.push({ url, status: response.status(), bytes });
  };

  page.on('response', onResponse);
  // `networkidle` never settles here — the analytics client keeps a socket warm.
  await page.goto(path, { waitUntil: 'load' });
  // Pull lazy images below the fold into view, then let them settle.
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  });
  await page.waitForTimeout(1500);
  page.off('response', onResponse);

  return requests;
}

for (const path of PAGES) {
  test(`${path} serves only generated image variants`, async ({ page }) => {
    const images = await collectImages(page, path);

    const broken = images.filter((r) => r.status >= 400);
    expect(broken, `broken image requests:\n${broken.map((b) => `${b.status} ${b.url}`).join('\n')}`).toEqual([]);

    const masters = images.filter((r) => /\.(png|jpe?g)$/i.test(new URL(r.url).pathname) && !/\/logo\//.test(r.url));
    expect(masters, `master images served instead of WebP:\n${masters.map((m) => m.url).join('\n')}`).toEqual([]);

    const total = images.reduce((sum, r) => sum + r.bytes, 0);
    console.log(`${path}: ${images.length} images, ${(total / 1048576).toFixed(2)} MB`);
    expect(total).toBeLessThan(6 * 1024 * 1024);
  });
}
