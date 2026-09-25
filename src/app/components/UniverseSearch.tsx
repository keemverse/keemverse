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
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <div className="flex items-center rounded-full border border-border bg-card px-5 py-3 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] focus-within:-translate-y-0.5 focus-within:border-foreground/30">
        <svg
          className="w-5 h-5 text-muted-foreground mr-3 shrink-0"
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
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm md:text-base"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-3 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
