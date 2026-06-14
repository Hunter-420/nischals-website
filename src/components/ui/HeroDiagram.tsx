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
        <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-800 animate-[spin_60s_linear_infinite]" />
        <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-700" />
        
        {/* Nodes */}
        <g className="text-slate-800 dark:text-slate-200">
          {/* Node 1 - Source */}
          <circle cx="200" cy="80" r="12" fill="currentColor" />
          <circle cx="200" cy="80" r="18" stroke="var(--color-accent-blue)" strokeWidth="2" className="opacity-50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <text x="200" y="50" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">EVENT_SOURCE</text>

          {/* Node 2 - Worker */}
          <circle cx="304" cy="260" r="10" fill="currentColor" />
          <text x="330" y="263" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">WORKER_01</text>

          {/* Node 3 - Worker */}
          <circle cx="96" cy="260" r="10" fill="currentColor" />
          <text x="70" y="263" textAnchor="end" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">WORKER_02</text>
        </g>

        {/* Center Process */}
        <g>
          <rect x="175" y="175" width="50" height="50" rx="8" className="fill-white dark:fill-deep-dark stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />
          <path d="M190 200L210 200M200 190L200 210" stroke="var(--color-neon-green)" strokeWidth="3" strokeLinecap="round" />
          <text x="200" y="245" textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">DISRUPTOR</text>
        </g>

        {/* Connections / Paths */}
        <g stroke="var(--color-accent-blue)" strokeWidth="1.5" strokeDasharray="6 6" fill="none" className="opacity-60">
          {/* Source to Center */}
          <path d="M200 98 L200 175" />
          {/* Center to Worker 1 */}
          <path d="M220 210 L294 255" />
          {/* Center to Worker 2 */}
          <path d="M180 210 L106 255" />
        </g>
        
        {/* Active Packets */}
        <circle cx="200" cy="130" r="3" fill="var(--color-accent-blue)">
          <animate attributeName="cy" values="98;175" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="257" cy="232" r="3" fill="var(--color-neon-green)">
          <animate attributeName="cx" values="220;294" dur="1.5s" repeatCount="indefinite" begin="0.75s" />
          <animate attributeName="cy" values="210;255" dur="1.5s" repeatCount="indefinite" begin="0.75s" />
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.75s" />
        </circle>
        <circle cx="143" cy="232" r="3" fill="var(--color-neon-green)">
          <animate attributeName="cx" values="180;106" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
          <animate attributeName="cy" values="210;255" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
        </circle>
      </svg>
    </div>
  );
}
