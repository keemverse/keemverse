import React from "react";

interface UniverseTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

// A compact dropdown, not a wrapping row of pills — keeps the category
// picker from pushing the actual product grid below the fold, especially
// on mobile. Styled to match UniverseSearch's pill so the two sit as a
// pair under the page heading.
export default function UniverseTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}: UniverseTabsProps) {
  return (
    <div className={`relative w-[110px] md:w-[150px] shrink-0 ${className}`}>
      <select
        value={activeTab}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by category"
        className="w-full appearance-none rounded-full border border-stone-300/70 bg-[#F8F5EF] px-4 md:px-5 py-3 pr-8 md:pr-10 text-sm font-medium text-stone-700 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.04)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] focus:-translate-y-0.5 focus:border-stone-400/60 cursor-pointer"
      >
        {tabs.map((tab) => (
          <option key={tab} value={tab}>
            {tab}
          </option>
        ))}
      </select>

      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
