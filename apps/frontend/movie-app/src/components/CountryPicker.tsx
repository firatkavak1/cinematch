/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { theme } from '../styles/theme';

interface CountryPickerProps {
  selected: string | null;
  onChange: (language: string | null) => void;
}

const COUNTRIES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'it', label: 'Italian' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'hi', label: 'Hindi' },
  { code: 'zh', label: 'Chinese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' },
  { code: 'no', label: 'Norwegian' },
  { code: 'pl', label: 'Polish' },
  { code: 'th', label: 'Thai' },
  { code: 'ar', label: 'Arabic' },
  { code: 'nl', label: 'Dutch' },
  { code: 'el', label: 'Greek' },
  { code: 'fa', label: 'Persian' },
  { code: 'he', label: 'Hebrew' },
  { code: 'fi', label: 'Finnish' },
];

const wrapper = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const heading = css`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: 0.85rem;
`;

const grid = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`;

const chipBase = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 500;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.bg.tertiary};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: ${theme.colors.accent.gold};
    color: ${theme.colors.accent.gold};
    background: ${theme.colors.bg.elevated};
  }
`;

const chipActive = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.accent.gold};
  background: ${theme.colors.accent.gold}18;
  color: ${theme.colors.accent.gold};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const chipAll = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 500;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.bg.tertiary};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-style: italic;

  &:hover {
    border-color: ${theme.colors.accent.gold};
    color: ${theme.colors.accent.gold};
    background: ${theme.colors.bg.elevated};
  }
`;

const chipAllActive = css`
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: ${theme.radii.full};
  border: 1px solid ${theme.colors.accent.gold};
  background: ${theme.colors.accent.gold}18;
  color: ${theme.colors.accent.gold};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-style: italic;
`;

export function CountryPicker({ selected, onChange }: CountryPickerProps) {
  return (
    <div css={wrapper}>
      <span css={heading}>Language</span>
      <div css={grid}>
        <button
          css={selected === null ? chipAllActive : chipAll}
          onClick={() => onChange(null)}
        >
          Any Language
        </button>
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            css={selected === c.code ? chipActive : chipBase}
            onClick={() => onChange(selected === c.code ? null : c.code)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
