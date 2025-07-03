// app/components/dark-mode.tsx
"use client";

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";

export function DarkMode(props: ThemeProviderProps) {
  return <NextThemesProvider {...props} />;
}
