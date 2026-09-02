#!/usr/bin/env node
/**
 * Generates responsive WebP variants from the image masters.
 *
 *   assets-src/images/**  (masters, never deployed)
 *        ->  public/images/**            `<name>-<hash>-<width>.webp`
 *        ->  src/data/imageManifest.json master path -> { b: base, w: [widths] }
 *
 * Variant names carry a hash of the master, so replacing a photo produces new
 * URLs and `Cache-Control: immutable` in vercel.json stays honest. Variants
 * whose master is gone (or changed) are pruned on each run.
 *
 * Requires the `cwebp` binary on PATH (`brew install webp` / `apt install webp`).
 * Re-run after adding or replacing a master; output is committed.
 *
 *   node scripts/convert-images.mjs [--force]
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'assets-src/images');
const OUT_DIR = path.join(ROOT, 'public/images');
const MANIFEST = path.join(ROOT, 'src/data/imageManifest.json');

/** Widths we emit, when the master is wide enough to supply them. */
const TARGET_WIDTHS = [200, 400, 800];
/** Never emit anything wider than this, even if the master is. */
const MAX_WIDTH = 1280;
const QUALITY = 78;
/** Masters copied through as-is: favicons need a format every client accepts. */
const PASSTHROUGH = ['logo/logo.jpeg'];

const force = process.argv.includes('--force');

/* ── intrinsic size, without pulling in an image library ────────────── */

function pngSize(buf) {
  // IHDR is always the first chunk: 8-byte signature, 4 length, 4 type, then w/h.
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let off = 2;
  while (off < buf.length) {
    if (buf[off] !== 0xff) return null;
    const marker = buf[off + 1];
    // SOF0..SOF15, minus the non-frame markers DHT/JPG/DAC that share the range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    off += 2 + buf.readUInt16BE(off + 2);
  }
  return null;
}

function imageSize(file) {
  const buf = fs.readFileSync(file);
  const size = pngSize(buf) ?? jpegSize(buf);
  if (!size) throw new Error(`could not read dimensions of ${file}`);
  return size;
}

/* ── walking + naming ───────────────────────────────────────────────── */

function walkAll(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkAll(full) : [full];
  });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(png|jpe?g)$/i.test(entry.name) ? [full] : [];
  });
}

/** Short digest of the master, so a replaced photo gets a fresh URL. */
const digest = (file) =>
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 8);

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Widths to emit for a master of the given intrinsic width. */
function widthsFor(intrinsic) {
  const cap = Math.min(intrinsic, MAX_WIDTH);
  const widths = TARGET_WIDTHS.filter((w) => w < cap);
  widths.push(cap);
  return widths;
}

/* ── run ────────────────────────────────────────────────────────────── */

try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('cwebp not found on PATH. Install it with `brew install webp`.');
  process.exit(1);
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(`No masters at ${path.relative(ROOT, SRC_DIR)}`);
  process.exit(1);
}

const masters = walk(SRC_DIR).sort();
const manifest = {};
const claimed = new Map();
const kept = new Set();
let written = 0;
let skipped = 0;
let pruned = 0;
let srcBytes = 0;
let outBytes = 0;

for (const master of masters) {
  const rel = path.relative(SRC_DIR, master); // e.g. products/kids_bag/Jungle Safari.png
  const dir = path.dirname(rel);
  const slug = slugify(path.basename(rel, path.extname(rel)));
  const stem = `${slug}-${digest(master)}`;
  const outDir = path.join(OUT_DIR, dir);
  const base = path.posix.join('/images', dir === '.' ? '' : dir, stem);

  const slugKey = path.posix.join(dir, slug);
  const previous = claimed.get(slugKey);
  if (previous) {
    console.error(`Name collision: "${rel}" and "${previous}" both slugify to ${slug}`);
    process.exit(1);
  }
  claimed.set(slugKey, rel);

  const { width } = imageSize(master);
  const widths = widthsFor(width);
  fs.mkdirSync(outDir, { recursive: true });
  srcBytes += fs.statSync(master).size;

  for (const w of widths) {
    const out = path.join(outDir, `${stem}-${w}.webp`);
    kept.add(out);
    if (!force && fs.existsSync(out)) {
      skipped += 1;
    } else {
      execFileSync('cwebp', ['-quiet', '-q', String(QUALITY), '-resize', String(w), '0', master, '-o', out]);
      written += 1;
    }
    outBytes += fs.statSync(out).size;
  }

  manifest[path.posix.join('/images', rel.split(path.sep).join('/'))] = { b: base, w: widths };
}

for (const rel of PASSTHROUGH) {
  const from = path.join(SRC_DIR, rel);
  const to = path.join(OUT_DIR, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  kept.add(to);
}

// Drop variants left behind by a master that was renamed, replaced or deleted.
for (const existing of walkAll(OUT_DIR)) {
  if (!kept.has(existing)) {
    fs.rmSync(existing);
    pruned += 1;
  }
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
console.log(`masters   ${masters.length} files, ${mb(srcBytes)}`);
console.log(`variants  ${written + skipped} files, ${mb(outBytes)} (${written} written, ${skipped} up to date, ${pruned} pruned)`);
console.log(`manifest  ${path.relative(ROOT, MANIFEST)}`);
