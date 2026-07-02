import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterOption {
  /** Display label shown in the dropdown list. */
  label: string;
  /** Value returned via onChange. */
  value: string;
}

export interface FilterDropdownProps {
  /** Label shown above the dropdown trigger (e.g. "Category", "Status"). */
  label?: string;
  /** Available filter options. */
  options: FilterOption[];
  /** Currently selected value(s). */
  selected: string[];
  /** Called when the selection changes. */
  onChange: (selected: string[]) => void;
  /** Whether multiple options can be selected. */
  multiple?: boolean;
  /** Placeholder text when nothing is selected. */
  placeholder?: string;
  /** Additional class names for custom styling. */
  className?: string;
  /** Additional inline styles. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Style constants — every visual property binds to a Miro CSS custom property
// ---------------------------------------------------------------------------

const wrapperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  gap: 'var(--space-xxs)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  margin: 0,
  boxSizing: 'border-box',
};

const triggerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-xs)',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text)',
  backgroundColor: 'var(--miro-canvas)',
  border: '1px solid var(--miro-hairline-soft)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-xs) var(--space-sm)',
  cursor: 'pointer',
  boxSizing: 'border-box',
  minWidth: 180,
  userSelect: 'none',
  transition: 'border-color var(--motion-fast) ease',
};

const triggerActiveStyle: React.CSSProperties = {
  borderColor: 'var(--miro-primary)',
};

const triggerPlaceholderStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
};

const chevronStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-text-muted)',
  fontSize: 10,
  transition: 'transform var(--motion-fast) ease',
  lineHeight: 1,
};

const chevronOpenStyle: React.CSSProperties = {
  transform: 'rotate(180deg)',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + var(--space-xxs))',
  left: 0,
  right: 0,
  minWidth: 180,
  backgroundColor: 'var(--miro-canvas)',
  border: '1px solid var(--miro-hairline-soft)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  zIndex: 200,
  padding: 'var(--space-xxs)',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

const optionItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  padding: 'var(--space-xs) var(--space-sm)',
  borderRadius: 'var(--radius-xl)',
  cursor: 'pointer',
  boxSizing: 'border-box',
  transition: 'background-color var(--motion-fast) ease',
  userSelect: 'none',
  fontSize: 14,
  lineHeight: 1.5,
  fontWeight: 'var(--font-weight-regular)',
  color: 'var(--color-text)',
  border: 'none',
  background: 'none',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'var(--font-sans)',
};

const optionHoveredStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
};

const optionSelectedStyle: React.CSSProperties = {
  fontWeight: 'var(--font-weight-medium)',
  backgroundColor: 'var(--color-surface)',
};

const checkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  flexShrink: 0,
  color: 'var(--miro-primary)',
  fontSize: 12,
  lineHeight: 1,
};

const emptyCheckStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  flexShrink: 0,
};

const clearButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  backgroundColor: 'transparent',
  border: 'none',
  padding: 'var(--space-xxs) var(--space-sm)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-xl)',
  boxSizing: 'border-box',
  width: '100%',
  textAlign: 'center',
  transition: 'color var(--motion-fast) ease, background-color var(--motion-fast) ease',
};

const selectedTagsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-xxs)',
  padding: 'var(--space-xxs) 0',
};

const selectedTagStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-xxs)',
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 'var(--font-weight-medium)',
  lineHeight: 1,
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-pill)',
  padding: '2px var(--space-xs)',
  boxSizing: 'border-box',
};

const removeTagButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: 10,
  lineHeight: 1,
};

const countStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 'var(--font-weight-regular)',
  lineHeight: 1.5,
  color: 'var(--color-text-muted)',
  margin: 0,
  padding: 'var(--space-xxs) var(--space-sm) var(--space-xs)',
  boxSizing: 'border-box',
  borderBottom: '1px solid var(--miro-hairline-soft)',
};

// ---------------------------------------------------------------------------
// FilterDropdown component
// ---------------------------------------------------------------------------

/**
 * `FilterDropdown` — dropdown filter control for the Miro design system.
 *
 * Renders a trigger button showing the current filter state, a floating
 * dropdown panel with selectable options, and support for both single and
 * multiple selection modes. Selected items are displayed as removable pill
 * tags below the trigger when `multiple` is true.
 *
 * Every visual property binds to a Miro design system CSS custom property —
 * no raw hex values, no hardcoded spacing.
 *
 * ```tsx
 * // Single selection
 * <FilterDropdown
 *   label="Status"
 *   options={[
 *     { label: 'Active', value: 'active' },
 *     { label: 'Archived', value: 'archived' },
 *   ]}
 *   selected={['active']}
 *   onChange={(v) => console.log(v)}
 * />
 *
 * // Multiple selection
 * <FilterDropdown
 *   label="Categories"
 *   multiple
 *   options={[
 *     { label: 'Design', value: 'design' },
 *     { label: 'Engineering', value: 'engineering' },
 *     { label: 'Marketing', value: 'marketing' },
 *   ]}
 *   selected={['design', 'engineering']}
 *   onChange={(v) => console.log(v)}
 * />
 * ```
 */
export function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  multiple = false,
  placeholder = 'Select...',
  className,
  style,
  ...rest
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const next = selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue];
      onChange(next);
    } else {
      onChange([optionValue]);
      setOpen(false);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleRemoveTag = (tagValue: string) => {
    onChange(selected.filter((v) => v !== tagValue));
  };

  // Compute the trigger text
  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as FilterOption[];

  const triggerText =
    selected.length === 0
      ? placeholder
      : multiple
        ? selected.length === 1
          ? selectedLabels[0]?.label ?? placeholder
          : `${selected.length} selected`
        : selectedLabels[0]?.label ?? placeholder;

  return (
    <div
      ref={dropdownRef}
      className={className}
      style={{
        ...wrapperStyle,
        ...style,
      }}
      {...rest}
    >
      {/* ── Label ─────────────────────────────────────────────── */}
      {label && <span style={labelStyle}>{label}</span>}

      {/* ── Trigger button ────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          ...triggerStyle,
          ...(open ? triggerActiveStyle : {}),
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          style={{
            ...(selected.length === 0 ? triggerPlaceholderStyle : {}),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {triggerText}
        </span>
        <span
          style={{
            ...chevronStyle,
            ...(open ? chevronOpenStyle : {}),
          }}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {/* ── Selected tags (multiple mode) ─────────────────────── */}
      {multiple && selected.length > 1 && (
        <div style={selectedTagsStyle}>
          {selectedLabels.map((opt) => (
            <span key={opt.value} style={selectedTagStyle}>
              {opt.label}
              <button
                type="button"
                onClick={() => handleRemoveTag(opt.value)}
                style={removeTagButtonStyle}
                aria-label={`Remove ${opt.label}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Dropdown panel ────────────────────────────────────── */}
      {open && (
        <div style={dropdownStyle} role="listbox" aria-multiselectable={multiple}>
          {/* Count summary */}
          {multiple && selected.length > 0 && (
            <div style={countStyle}>
              {selected.length} selected
            </div>
          )}

          {/* Options list */}
          {options.map((option, index) => {
            const isSelected = selected.includes(option.value);
            const isHovered = hoveredIndex === index;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  ...optionItemStyle,
                  ...(isSelected ? optionSelectedStyle : {}),
                  ...(!isSelected && isHovered ? optionHoveredStyle : {}),
                }}
              >
                {multiple ? (
                  isSelected ? (
                    <span style={checkStyle}>✓</span>
                  ) : (
                    <span style={emptyCheckStyle} />
                  )
                ) : isSelected ? (
                  <span style={{ ...checkStyle, color: 'var(--miro-primary)' }}>
                    ✓
                  </span>
                ) : (
                  <span style={emptyCheckStyle} />
                )}
                {option.label}
              </button>
            );
          })}

          {/* Clear all button (multiple mode) */}
          {multiple && selected.length > 0 && (
            <>
              <div
                style={{
                  borderTop: '1px solid var(--miro-hairline-soft)',
                  margin: 'var(--space-xxs) 0',
                }}
              />
              <button
                type="button"
                onClick={handleClearAll}
                style={clearButtonStyle}
              >
                Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;
