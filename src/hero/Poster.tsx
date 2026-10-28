/** Lightweight stand-in shown while 3D loads, if WebGL is missing, or until `npm run render` produces real PNG renders. */
export function Poster({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`} aria-hidden>
      <svg viewBox="0 0 400 400" className="h-[62%] max-h-[620px] w-auto opacity-80">
        <defs><linearGradient id="pf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A8AFB8" /><stop offset="1" stopColor="#2a2e35" /></linearGradient></defs>
        <path d="M108 235C104 105 150 52 200 52s96 53 92 183" fill="none" stroke="url(#pf)" strokeWidth="9" strokeLinecap="round" />
        <rect x="80" y="205" width="54" height="108" rx="27" fill="#171A1F" stroke="#A8AFB8" strokeOpacity=".45" strokeWidth="3" />
        <rect x="266" y="205" width="54" height="108" rx="27" fill="#171A1F" stroke="#A8AFB8" strokeOpacity=".45" strokeWidth="3" />
        <circle cx="107" cy="259" r="9" fill="none" stroke="#8BAFC5" strokeOpacity=".7" /><circle cx="293" cy="259" r="9" fill="none" stroke="#8BAFC5" strokeOpacity=".7" />
      </svg>
    </div>
  )
}
