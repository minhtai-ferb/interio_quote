"use client";

import { useState } from "react";

function formatThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Money field: shows dot-grouped digits ("20.000.000") while typing, but
 * submits the raw number through a hidden input of the given `name` — number
 * inputs can't display thousand separators, so a formatted text input plus a
 * hidden numeric twin is the only way to get both.
 */
export function MoneyInput({
  name,
  defaultValue,
  placeholder,
  required,
  style,
}: {
  name: string;
  defaultValue?: number | string | null;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(() => {
    if (defaultValue == null || defaultValue === "") return "";
    return formatThousands(String(defaultValue).replace(/\D/g, ""));
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(formatThousands(e.target.value.replace(/\D/g, "")));
  }

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        style={style}
      />
      <input type="hidden" name={name} value={display.replace(/\./g, "")} />
    </>
  );
}
