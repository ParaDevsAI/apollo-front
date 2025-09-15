"use client";

import SearchBar from "./SearchBar";

export default function ExploreSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-[var(--color-text-primary)] text-2xl font-semibold">
        Explore Tasks
      </h2>
      <SearchBar />
    </div>
  );
}
