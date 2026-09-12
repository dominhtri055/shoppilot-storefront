import type { CSSProperties, ReactNode } from "react";
import { contrastText, type StoreTheme } from "@/lib/store-theme";
export function StoreSurface({
  theme,
  children,
}: {
  theme: StoreTheme;
  children: ReactNode;
}) {
  return (
    <div
      className="store-surface"
      data-font={theme.font}
      data-corners={theme.corners}
      style={
        {
          "--store-accent": theme.accent,
          "--store-on-accent": contrastText(theme.accent),
          "--store-link":
            contrastText(theme.accent) === "#FFFFFF" ? theme.accent : "#334155",
          "--store-bg": theme.background,
          "--store-text": contrastText(theme.background),
          "--store-columns": theme.columns,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
