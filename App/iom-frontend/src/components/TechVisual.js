export default function TechVisual() {
  return (
    <div className="tech-visual" aria-label="A technical illustration of an idea taking shape, from design to a finished build" role="img">
      <div className="tech-visual-heading"><span>IRONROOT / DESIGN → REALITY</span><span className="visual-cross">+</span></div>
      <svg viewBox="0 0 620 510" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="layer-fill" x1="100" y1="80" x2="490" y2="430" gradientUnits="userSpaceOnUse"><stop stopColor="#79caff" stopOpacity=".23" /><stop offset="1" stopColor="#3b63ff" stopOpacity=".03" /></linearGradient>
          <linearGradient id="core-fill" x1="245" y1="180" x2="375" y2="345" gradientUnits="userSpaceOnUse"><stop stopColor="#ade6ff" /><stop offset=".5" stopColor="#648cff" /><stop offset="1" stopColor="#2550bc" /></linearGradient>
          <pattern id="tech-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" stroke="#84b4ea" strokeOpacity=".075" /></pattern>
        </defs>
        <rect width="620" height="510" fill="url(#tech-grid)" />
        <ellipse cx="310" cy="310" rx="260" ry="132" stroke="#476380" strokeDasharray="3 9" />
        <ellipse cx="310" cy="310" rx="214" ry="107" stroke="#263f58" />
        <path d="M310 45V455M55 310H565" stroke="#476380" strokeDasharray="4 8" />
        <g className="visual-layers" strokeLinejoin="round">
          <path d="m310 218 168 96-168 97-168-97z" fill="url(#layer-fill)" stroke="#678bc3" />
          <path d="m142 314 0 18 168 97 168-97v-18M310 411v18" stroke="#3f608b" />
          <path d="m310 171 168 96-168 97-168-97z" fill="url(#layer-fill)" stroke="#81aff1" />
          <path d="m310 124 168 96-168 97-168-97z" fill="url(#layer-fill)" stroke="#9cd6ff" />
          <path d="m310 77 168 96-168 97-168-97z" fill="url(#layer-fill)" stroke="#bbdfff" />
          <path d="M142 173v141m168-44v141m168-238v141M310 77v141" stroke="#87b6f2" strokeDasharray="3 6" strokeOpacity=".6" />
          <path d="m310 161 59 34v67l-59 34-59-34v-67z" fill="url(#core-fill)" stroke="#c8edff" />
          <path d="m251 195 59 34 59-34M310 229v67" stroke="#d7f1ff" strokeOpacity=".7" />
          <path d="m279 179 61 35" stroke="white" strokeWidth="2" />
        </g>
        <g stroke="#a7cdfb" strokeWidth="1.5">
          <path d="M150 172H72v-45H39M475 267h75v-66h33M310 430v35h115" />
          <circle cx="150" cy="172" r="4" fill="#91ceff" /><circle cx="475" cy="267" r="4" fill="#91ceff" /><circle cx="310" cy="430" r="4" fill="#91ceff" />
          <path d="M30 38h18M39 29v18M574 452h18M583 443v18" />
        </g>
        <g fill="#aabed6" fontSize="10" fontFamily="monospace" letterSpacing="2"><text x="44" y="113">DESIGN</text><text x="519" y="187">BUILD</text><text x="433" y="469">REFINE</text></g>
      </svg>
      <div className="tech-visual-footer"><span>SOFTWARE / HARDWARE / FABRICATION</span><span>01—04</span></div>
    </div>
  );
}
