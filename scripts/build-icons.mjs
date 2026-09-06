/**
 * Generates the RETURN PWA icon set from the official Loop Mark geometry.
 *
 * The mark is NOT redrawn here. The circle and leaf below are the exact values
 * exported from Figma nodes 3:9 and 3:10 and used by
 * src/components/brand/loop-mark.tsx — same radii, stroke widths, opacities,
 * colours, and the same 24° rotation and relative offset. Only the surrounding
 * square canvas and the scale change.
 *
 * Run: node scripts/build-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const CANVAS = '#F7F7FA' // --color-canvas, Figma 3:2 frame fill
const OUT = 'public/icons'

/** The Loop Mark, drawn into a square of `size` occupying `coverage` of it. */
function loopMarkSquare(size, coverage, background) {
  // Mark's own bounding box in Figma space.
  const MARK_W = 75
  const MARK_H = 95

  const markHeight = size * coverage
  const scale = markHeight / MARK_H
  const markWidth = MARK_W * scale
  const offsetX = (size - markWidth) / 2
  const offsetY = (size - markHeight) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${background}"/>
  <g transform="translate(${offsetX} ${offsetY}) scale(${scale})">
    <circle cx="39.84" cy="35" r="31" stroke="#8A67F7" stroke-opacity="0.55" stroke-width="8" fill="none"/>
    <g transform="translate(34.43 55.5) rotate(24) translate(-23 -33)">
      <path d="M23 3.5C27.8888 3.5 32.6783 6.33918 36.3916 11.667C40.0965 16.9828 42.5 24.5141 42.5 33C42.5 41.4859 40.0965 49.0172 36.3916 54.333C32.6783 59.6608 27.8888 62.5 23 62.5C18.1112 62.5 13.3217 59.6608 9.6084 54.333C5.90346 49.0172 3.5 41.4859 3.5 33C3.5 24.5141 5.90346 16.9828 9.6084 11.667C13.3217 6.33918 18.1112 3.5 23 3.5Z" stroke="#6C43F3" stroke-opacity="0.38" stroke-width="7" fill="none"/>
    </g>
  </g>
</svg>`
}

const targets = [
  // Standard icons: generous clear space around the mark.
  { file: 'icon-192.png', size: 192, coverage: 0.62 },
  { file: 'icon-512.png', size: 512, coverage: 0.62 },
  // Maskable: the platform may crop to a circle inscribed in the middle 80%,
  // so the mark sits well inside that safe zone.
  { file: 'icon-maskable-192.png', size: 192, coverage: 0.46 },
  { file: 'icon-maskable-512.png', size: 512, coverage: 0.46 },
  // iOS home screen. iOS applies its own rounding and does not honour
  // transparency, so the canvas fill matters here.
  { file: 'apple-touch-icon.png', size: 180, coverage: 0.58 },
]

await mkdir(OUT, { recursive: true })

for (const { file, size, coverage } of targets) {
  const svg = loopMarkSquare(size, coverage, CANVAS)
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`${OUT}/${file}`)
  console.log(`  ${file}  ${size}x${size}  coverage ${coverage}`)
}

// A scalable copy of the composed mark, useful for the favicon and anywhere
// a vector is preferable.
await writeFile('public/brand/loop-mark.svg', loopMarkSquare(512, 0.62, CANVAS))
console.log('  public/brand/loop-mark.svg')
