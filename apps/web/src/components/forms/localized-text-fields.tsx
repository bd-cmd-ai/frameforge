"use client";

import type { LocalizedText } from "@radar-domace/types";

interface LocalizedTextFieldsProps {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
}

const locales: Array<keyof LocalizedText> = ["sl", "en", "de", "it"];

export const LocalizedTextFields = ({ label, value, onChange, multiline = false }: LocalizedTextFieldsProps) => (
  <div className="localized-grid">
    {locales.map((locale) => (
      <div className="field" key={locale}>
        <label>
          {label} ({locale.toUpperCase()})
        </label>
        {multiline ? (
          <textarea
            rows={4}
            value={value[locale]}
            onChange={(event) =>
              onChange({
                ...value,
                [locale]: event.target.value,
              })
            }
          />
        ) : (
          <input
            value={value[locale]}
            onChange={(event) =>
              onChange({
                ...value,
                [locale]: event.target.value,
              })
            }
          />
        )}
      </div>
    ))}
  </div>
);
