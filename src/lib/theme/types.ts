export type ThemeMode = "light" | "dark" | "system";
export type ThemeKind = "solid" | "gradient" | "wallpaper";
export type WallpaperFit = "cover" | "contain";
export type WallpaperPosition =
  | "center" | "top" | "bottom" | "left" | "right"
  | "left top" | "right top" | "left bottom" | "right bottom";

export interface ThemePalette {
  primary: string;
  primaryHover: string;
  ring: string;
  selection: string;
  selectionText: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  kind: "solid" | "gradient";
  description: string;
  palette: ThemePalette;
  lightGradient: string;
  darkGradient: string;
  preview: string;
}

export interface ThemeSettings {
  version: 1;
  mode: ThemeMode;
  kind: ThemeKind;
  presetId: string;
  customAccent: string | null;
  customGradient: { from: string; to: string; angle: number };
  wallpaper: {
    enabled: boolean;
    fit: WallpaperFit;
    position: WallpaperPosition;
    repeat: boolean;
    overlay: number;
    blur: number;
    brightness: number;
  };
  glass: number;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  version: 1,
  mode: "system",
  kind: "solid",
  presetId: "indigo-guru",
  customAccent: null,
  customGradient: { from: "#4f46e5", to: "#06b6d4", angle: 135 },
  wallpaper: {
    enabled: false,
    fit: "cover",
    position: "center",
    repeat: false,
    overlay: 68,
    blur: 0,
    brightness: 92,
  },
  glass: 6,
};
