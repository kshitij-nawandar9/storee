# Images

Product photography is stored once, at full resolution, and served as small
responsive WebP variants. Nothing under `assets-src/` ever reaches the browser.

```
assets-src/images/**          masters (PNG/JPEG) — committed, never deployed
      │
      │  npm run images        (scripts/convert-images.mjs, needs `cwebp`)
      ▼
public/images/**              <name>-<hash>-<width>.webp at 200/400/800/native
src/data/imageManifest.json   master path -> { b: variant base, w: [widths] }
```

## Using an image

Never put a master path straight into `src`. The master isn't deployed, so it
404s. Go through one of these instead:

```tsx
import Img from '@/components/common/Img';
import { imageAtWidth } from '@/utils/images';

// Layout-driven slot — always pass `sizes`, or the browser assumes 100vw
// and fetches the largest variant.
<Img src={variant.image} alt={product.name} sizes="(min-width: 1280px) 300px, 47vw" />

// Fixed, tiny slot (swatch, cart thumbnail) — one variant, no srcSet.
<img src={imageAtWidth(variant.image, 200)} alt="" />
```

Paths that aren't in the manifest (an absolute URL, an OAuth avatar) pass
through untouched, so both helpers are safe on API-supplied data.

## Adding or replacing a photo

1. Drop the master in `assets-src/images/<category>/<product>/`.
2. `npm run images` (`--force` to re-encode everything).
3. Commit both the new `public/images/**` variants and the updated manifest —
   the deploy build does not run the converter.

Each run prunes variants it did not produce, so replacing or deleting a master
cleans up after itself.

Output names are slugified and carry a hash of the master:
`Jungle Safari.png` becomes `jungle-safari-4f2a91c0-800.webp`. Spaces in a
master's name are fine — they'd break a `srcSet`, which is why variants get
renamed. The hash is what lets `vercel.json` serve `/images/**` as `immutable`
for a year: a replaced photo lands on a new URL rather than sitting stale in
somebody's cache.

## Guardrail

`tests/images.spec.ts` loads the main pages in Chromium and fails if any
`/images/` request 404s, if a master is served instead of a variant, or if a
page pulls more than 6 MB of imagery. Run it against a built preview:

```sh
npm run build && npx vite preview --port 5173 &
npx playwright test tests/images.spec.ts
```
