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
      {/* Category Pills */}
      <div className="filter-row">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.value)}
            >
              <span className="tab-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="filter-controls">
          {/* Date range */}
          <div className="date-range-group">
            <div className="date-input-wrapper">
              <svg className="date-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                className="date-input"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                placeholder="From"
                title="Filter from date"
              />
            </div>
            <span className="date-sep">→</span>
            <div className="date-input-wrapper">
              <svg className="date-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                className="date-input"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                placeholder="To"
                title="Filter to date"
              />
            </div>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button onClick={onReset} className="reset-filters-btn" title="Clear all filters">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .filter-bar-container {
          margin-bottom: 32px;
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
        }

        .category-tabs {
          display: flex;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 2px;
        }

        .category-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: calc(var(--radius-md) - 4px);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .tab-icon { font-size: 0.9rem; }

        .category-tab:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        .category-tab.active {
          background: linear-gradient(135deg, var(--primary-green) 0%, hsl(142, 60%, 35%) 100%);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 10px var(--primary-green-glow);
        }

        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }



        /* Date range */
        .date-range-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .date-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .date-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
          z-index: 1;
        }

        .date-input {
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 10px 12px 10px 30px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 148px;
        }

        .date-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-gold-glow);
          color: var(--text-primary);
        }

        .date-input::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }

        .date-sep {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        /* Reset button */
        .reset-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all var(--transition-fast);
          background: transparent;
        }

        .reset-filters-btn:hover {
          color: var(--danger);
          border-color: var(--danger);
          background: hsla(0, 75%, 55%, 0.07);
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
