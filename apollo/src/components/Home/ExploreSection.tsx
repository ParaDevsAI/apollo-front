"use client";

import SearchBar from "./SearchBar";

export default function ExploreSection() {
  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-[var(--color-text-primary)] text-xl md:text-2xl font-semibold text-center md:text-left">
        Explore Tasks
      </h2>
      <SearchBar />
    </div>
  );
}
