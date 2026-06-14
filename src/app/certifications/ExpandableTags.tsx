"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ExpandableTags({ skills }: { skills: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!skills || skills.length === 0) return null;

  const topSkills = skills.slice(0, 4);
  const remainingSkills = skills.slice(4);
  const hasMore = remainingSkills.length > 0;

  return (
    <div className="relative mt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {topSkills.map((skill: string) => (
          <span
            key={skill}
            className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700/50"
          >
            {skill}
          </span>
        ))}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            className="group relative flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-slate-50 dark:bg-deep-dark text-slate-500 hover:text-accent-blue dark:text-slate-500 rounded border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            +{remainingSkills.length} more
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            
            {/* Micro-drawer */}
            {expanded && (
              <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-white dark:bg-deep-dark border border-slate-200 dark:border-slate-800 rounded-md shadow-xl z-50 flex flex-wrap gap-1.5 cursor-default">
                {remainingSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
