import React from "react";

interface UniverseSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function UniverseSearch({
  value,
  onChange,
  placeholder = "Search products...",
  className = "",
}: UniverseSearchProps) {
  return (
    <div className={`relative w-full max-w-[520px] mx-auto ${className}`}>
      <div className="flex items-center rounded-full border border-stone-300/70 bg-[#F8F5EF] px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_rgba(0,0,0,.04)] transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] focus-within:-translate-y-0.5 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_12px_28px_rgba(0,0,0,.08)] focus-within:border-stone-400/60">
        <svg
          className="w-5 h-5 text-stone-500 mr-3 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-stone-800 placeholder:text-stone-400 text-sm md:text-base"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-3 h-7 w-7 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200/70 transition-colors"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
