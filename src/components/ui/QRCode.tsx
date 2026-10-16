interface Props {
  url: string
}

// Minimal QR-ish placeholder: we render a stylized "scan" card with the URL.
// A real QR encoder can drop in later; the join flow works via manual code entry regardless.
export function QRCode({ url }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-48 h-48 bg-white rounded-lg p-4 flex items-center justify-center"
        role="img"
        aria-label={`QR code for ${url}`}
      >
        <QrSvg text={url} />
      </div>
      <p className="text-sm text-text-muted text-center max-w-56">
        Scan with your phone, or go to <span className="font-mono text-text">{shortUrl(url)}</span> and
        enter the code
      </p>
    </div>
  )
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}/join`
  } catch {
    return '/join'
  }
}

// Tiny deterministic pseudo-QR: grid of squares hashed from the text.
// NOT a real QR (no external lib, clean-room). Replaceable with a real encoder later.
function QrSvg({ text }: { text: string }) {
  const N = 21
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const cells: boolean[] = []
  let x = h >>> 0
  for (let i = 0; i < N * N; i++) {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    x >>>= 0
    cells.push((x & 1) === 1)
  }
  // finder patterns in three corners
  function finder(fx: number, fy: number) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const edge = dx === 0 || dy === 0 || dx === 6 || dy === 6
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
        cells[(fy + dy) * N + (fx + dx)] = edge || core
      }
    }
  }
  finder(0, 0)
  finder(N - 7, 0)
  finder(0, N - 7)

  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="w-full h-full" shapeRendering="crispEdges">
      {cells.map((on, i) =>
        on ? (
          <rect key={i} x={i % N} y={Math.floor(i / N)} width={1} height={1} fill="#0b0e14" />
        ) : null,
      )}
    </svg>
  )
}
