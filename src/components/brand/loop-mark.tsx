/**
 * RETURN Loop Mark.
 *
 * Figma source: MRh882Jk04Htb17cXyccGg, nodes 3:9 + 3:10 inside frame 3:2.
 * Geometry is reproduced exactly from the two exported assets:
 *
 *   3:9  outer  70x70 box, circle cx/cy 35 r 31, stroke #8A67F7 @ 0.55, width 8
 *              placed at frame (278, 95) -> center (313, 130)
 *   3:10 inner  46x66 leaf, stroke #6C43F3 @ 0.38, width 7, rotated 24deg
 *              wrapper (273.16, 111) 68.868x79.004 -> center (307.59, 150.50)
 *
 * Combined bounding box in frame space: x 273.16..348, y 95..190 (75 x 95),
 * which is the viewBox below. Both leaves keep their designed dimensions and
 * their relative offset; only the shared outer box scales.
 */
export function LoopMark({
  width = 75,
  className,
}: {
  width?: number
  className?: string
}) {
  return (
    <svg
      width={width}
      height={(width * 95) / 75}
      viewBox="0 0 75 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="39.84"
        cy="35"
        r="31"
        stroke="#8A67F7"
        strokeOpacity="0.55"
        strokeWidth="8"
      />
      <g transform="translate(34.43 55.5) rotate(24) translate(-23 -33)">
        <path
          d="M23 3.5C27.8888 3.5 32.6783 6.33918 36.3916 11.667C40.0965 16.9828 42.5 24.5141 42.5 33C42.5 41.4859 40.0965 49.0172 36.3916 54.333C32.6783 59.6608 27.8888 62.5 23 62.5C18.1112 62.5 13.3217 59.6608 9.6084 54.333C5.90346 49.0172 3.5 41.4859 3.5 33C3.5 24.5141 5.90346 16.9828 9.6084 11.667C13.3217 6.33918 18.1112 3.5 23 3.5Z"
          stroke="#6C43F3"
          strokeOpacity="0.38"
          strokeWidth="7"
        />
      </g>
    </svg>
  )
}
