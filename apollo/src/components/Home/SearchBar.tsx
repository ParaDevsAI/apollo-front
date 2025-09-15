"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[var(--color-text-secondary)]" />
      </div>
      <input
        type="text"
        placeholder="Search for task..."
        className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg-cards)] border border-[var(--color-border)] rounded-full text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-white transition-colors"
      />
    </div>
  );
}
