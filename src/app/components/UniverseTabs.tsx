import React from "react";

interface UniverseTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}

export default function UniverseTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}: UniverseTabsProps) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-3 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            activeTab === tab
              ? "bg-stone-900 text-white shadow-lg"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}