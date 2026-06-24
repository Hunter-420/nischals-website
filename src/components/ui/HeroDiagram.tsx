export function HeroDiagram() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto flex items-center justify-center p-8">
      {/* Background glow */}
      <div className="absolute inset-0 bg-accent-blue/5 dark:bg-accent-blue/10 blur-3xl rounded-full mix-blend-screen" />
      
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Core Ring */}
        <circle cx="200" cy="160" r="130" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800 animate-[spin_60s_linear_infinite]" />
        
        {/* Connections / Paths */}
        <g stroke="var(--color-accent-blue)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" className="opacity-50 dark:opacity-60">
          <path d="M200 62 L200 133" /> {/* MARKETS -> SYSTEMS */}
          <path d="M82 160 L173 160" /> {/* NETWORKING -> SYSTEMS */}
          <path d="M318 160 L227 160" /> {/* PERFORMANCE -> SYSTEMS */}
          <path d="M70 172 L70 258" /> {/* NETWORKING -> OS */}
          <path d="M200 187 L200 258" /> {/* SYSTEMS -> DISTRIBUTED */}
        </g>
        
        {/* Active Packets */}
        <circle cx="200" cy="62" r="3" fill="var(--color-accent-blue)">
          <animate attributeName="cy" values="62;133" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
        
        <circle cx="82" cy="160" r="3" fill="var(--color-neon-green)">
          <animate attributeName="cx" values="82;173" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="0.5s" />
        </circle>

        <circle cx="318" cy="160" r="3" fill="var(--color-neon-green)">
          <animate attributeName="cx" values="318;227" dur="2.2s" repeatCount="indefinite" begin="1s" />
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" repeatCount="indefinite" begin="1s" />
        </circle>

        <circle cx="70" cy="172" r="3" fill="var(--color-accent-blue)">
          <animate attributeName="cy" values="172;258" dur="1.5s" repeatCount="indefinite" begin="0.8s" />
          <animate attributeName="opacity" values="1;0;0" dur="1.5s" repeatCount="indefinite" begin="0.8s" />
        </circle>

        <circle cx="200" cy="187" r="3" fill="var(--color-neon-green)">
          <animate attributeName="cy" values="187;258" dur="1.9s" repeatCount="indefinite" begin="0.3s" />
          <animate attributeName="opacity" values="1;0;0" dur="1.9s" repeatCount="indefinite" begin="0.3s" />
        </circle>

        {/* Nodes */}
        <g className="text-slate-800 dark:text-slate-200">
          {/* MARKETS */}
          <circle cx="200" cy="50" r="10" fill="currentColor" />
          <circle cx="200" cy="50" r="16" stroke="var(--color-accent-blue)" strokeWidth="2" className="opacity-50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <text x="200" y="30" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">MARKETS</text>

          {/* NETWORKING */}
          <circle cx="70" cy="160" r="10" fill="currentColor" />
          <text x="70" y="140" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">NETWORKING</text>

          {/* PERFORMANCE */}
          <circle cx="330" cy="160" r="10" fill="currentColor" />
          <text x="330" y="140" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">PERFORMANCE</text>

          {/* OPERATING SYSTEMS */}
          <circle cx="70" cy="270" r="10" fill="currentColor" />
          <text x="70" y="295" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">OPERATING SYSTEMS</text>

          {/* DISTRIBUTED SYSTEMS */}
          <circle cx="200" cy="270" r="10" fill="currentColor" />
          <text x="200" y="295" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">DISTRIBUTED SYSTEMS</text>
        </g>

        {/* Center Process - SYSTEMS */}
        <g>
          <rect x="175" y="135" width="50" height="50" rx="12" className="fill-white dark:fill-deep-dark stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />
          {/* Inner details for SYSTEMS node */}
          <circle cx="200" cy="160" r="8" className="fill-slate-100 dark:fill-slate-800" />
          <circle cx="200" cy="160" r="3" fill="var(--color-neon-green)" />
          <text x="200" y="205" textAnchor="middle" className="text-[11px] font-bold font-mono fill-slate-800 dark:fill-slate-200">SYSTEMS</text>
        </g>

        {/* CONTINUOUS LEARNING */}
        <g>
          <text x="200" y="355" textAnchor="middle" className="text-xs font-mono font-bold tracking-[0.2em] fill-blue-600 dark:fill-blue-400 opacity-90">
            CONTINUOUS LEARNING
          </text>
          {/* Subtle underline or glow */}
          <path d="M120 365 L280 365" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" className="opacity-60" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient" x1="120" y1="365" x2="280" y2="365" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-accent-blue)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--color-neon-green)" />
            <stop offset="1" stopColor="var(--color-accent-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
