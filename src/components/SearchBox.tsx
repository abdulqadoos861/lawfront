'use client';

import React from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="search-box-container">
      <div className="search-icon-wrapper">
        <svg
          className="search-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="20"
          height="20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Search legislative titles, bills, acts, keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search laws"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="search-clear-btn"
          type="button"
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
