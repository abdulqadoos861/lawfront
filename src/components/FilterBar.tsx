'use client';

import React from 'react';

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (d: string) => void;
  onDateToChange: (d: string) => void;
  onReset: () => void;
}

const categories = [
  { label: 'All',        value: '',          icon: '📋' },
  { label: 'Bills',      value: 'Bill',      icon: '📄' },
  { label: 'Acts',       value: 'Act',       icon: '⚖️' },
  { label: 'Ordinances', value: 'Ordinance', icon: '📜' },
];

export default function FilterBar({
  selectedCategory, onCategoryChange,
  dateFrom, dateTo, onDateFromChange, onDateToChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = selectedCategory || dateFrom || dateTo;

  return (
    <div className="filter-bar-container">
      <div className="filter-row">
        {/* Category Pills */}
        <div className="category-tabs" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat.value}
              id={`cat-tab-${cat.value || 'all'}`}
              className={`category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.value)}
              aria-pressed={selectedCategory === cat.value}
            >
              <span className="tab-icon" aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="filter-controls">
          {/* Date range */}
          <div className="date-range-group">
            <div className="date-input-wrapper">
              <svg className="date-icon" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <input
                id="date-from"
                type="date"
                className="date-input"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                title="Filter from date"
                aria-label="From date"
              />
            </div>
            <span className="date-sep" aria-hidden="true">→</span>
            <div className="date-input-wrapper">
              <svg className="date-icon" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <input
                id="date-to"
                type="date"
                className="date-input"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                title="Filter to date"
                aria-label="To date"
              />
            </div>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button id="reset-filters" onClick={onReset} className="reset-filters-btn" title="Clear all filters">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13" height="13">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .filter-bar-container { margin-bottom: 32px; }

        .filter-row {
          display: flex; flex-wrap: wrap; gap: 14px;
          align-items: center; justify-content: space-between;
        }

        .category-tabs {
          display: flex;
          background: hsla(228,22%,10%,0.8);
          border: 1px solid var(--border);
          padding: 5px; border-radius: var(--radius-md); gap: 3px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .category-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          border-radius: calc(var(--radius-md) - 5px);
          font-size: 0.875rem; font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer; transition: all var(--transition-fast);
          white-space: nowrap; position: relative;
        }
        .tab-icon { font-size: 0.88rem; }
        .category-tab:hover { color: var(--text-primary); background: rgba(255,255,255,0.04); }
        .category-tab.active {
          background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
          color: #fff; font-weight: 700;
          box-shadow: 0 2px 12px var(--indigo-glow);
        }

        .filter-controls {
          display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
        }

        .date-range-group { display: flex; align-items: center; gap: 6px; }

        .date-input-wrapper {
          position: relative; display: flex; align-items: center;
        }

        .date-icon {
          position: absolute; left: 10px;
          color: var(--text-muted); pointer-events: none; z-index: 1;
        }

        .date-input {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 10px 12px 10px 30px;
          border-radius: var(--radius-md);
          color: var(--text-secondary); font-size: 0.84rem;
          cursor: pointer; transition: all var(--transition-fast); width: 148px;
        }
        .date-input:focus {
          border-color: var(--indigo);
          box-shadow: 0 0 0 3px var(--indigo-glow);
          color: var(--text-primary);
        }
        .date-input::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }

        .date-sep { color: var(--text-muted); font-size: 0.85rem; }

        .reset-filters-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 14px; border-radius: var(--radius-md);
          font-size: 0.8rem; font-weight: 700;
          color: var(--text-muted);
          border: 1px solid var(--border); cursor: pointer;
          transition: all var(--transition-fast); background: transparent;
        }
        .reset-filters-btn:hover {
          color: hsl(0,70%,65%); border-color: hsl(0,70%,55%);
          background: hsla(0,70%,55%,0.07);
        }

        @media (max-width: 768px) {
          .filter-row { flex-direction: column; align-items: stretch; }
          .filter-controls { justify-content: stretch; }
          .date-range-group { flex-wrap: wrap; }
          .date-input { width: 100%; }
        }
      `}</style>
    </div>
  );
}
