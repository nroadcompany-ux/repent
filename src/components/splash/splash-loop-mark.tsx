/**
 * Splash Loop Mark — exact to the Owner-referenced Figma source.
 *
 * Figma: MRh882Jk04Htb17cXyccGg, frame "[RT] Splash Loop Mark · Source 9:2
 * Exact" (nodes 59:2 / 59:10 / 59:18 inside Splash C 55:2). Its two paths are
 * exported from page 9:2 ellipses 9:40 (upper) and 9:41 (lower).
 *
 * The geometry below is the exported asset verbatim — same viewBox, same path
 * data, same stroke colours, opacities and widths. It is inlined rather than
 * linked because Figma asset URLs expire.
 *
 * NOTE: this is NOT the same artwork as src/components/brand/loop-mark.tsx.
 * That component is exact to nodes 3:9 + 3:10 (a true circle plus a rotated
 * leaf) and drives the Journey surface and the PWA icons. The Owner's Splash
 * correction points at 9:2, whose mark is two rotated ellipses with different
 * colours, opacities and stroke widths, so reusing the brand component here
 * would not be exact. Both marks are therefore kept, unmodified, side by side.
 */
export function SplashLoopMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 69.12 91.3344"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M29.8705 4.25511C35.6656 2.37215 42.2577 3.81129 48.3646 8.2657C54.4673 12.7171 59.8386 20.0417 62.8309 29.2512C65.8233 38.4606 65.7831 47.5435 63.4624 54.7319C61.14 61.9252 56.6532 66.965 50.858 68.848C45.0628 70.731 38.4705 69.291 32.3636 64.8365C26.2609 60.3851 20.8896 53.0605 17.8972 43.851C14.9049 34.6415 14.945 25.5586 17.2658 18.3703C19.5882 11.1771 24.0753 6.13807 29.8705 4.25511Z"
        stroke="#A78BFA"
        strokeOpacity="0.75"
        strokeWidth="6.89013"
      />
      <path
        d="M40.899 29.2282C45.8511 30.463 49.9573 34.5019 52.3575 40.6844C54.7537 46.8565 55.2996 54.8805 53.2154 63.2396C51.1312 71.5986 46.8824 78.4264 41.8691 82.751C36.8474 87.083 31.3256 88.7214 26.3735 87.4867C21.4215 86.252 17.3151 82.213 14.915 76.0306C12.5189 69.8586 11.9738 61.8354 14.0578 53.4765C16.1419 45.1175 20.3901 38.2887 25.4034 33.9639C30.425 29.6321 35.9469 27.9937 40.899 29.2282Z"
        stroke="#6C4CFF"
        strokeOpacity="0.45"
        strokeWidth="6.89013"
      />
    </svg>
  )
}
