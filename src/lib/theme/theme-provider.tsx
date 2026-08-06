"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { getThemePreset } from "./presets";
import { DEFAULT_THEME_SETTINGS, type ThemeMode, type ThemeSettings } from "./types";
import {
  deleteWallpaperBlob, loadThemeSettings, loadWallpaperBlob,
  saveThemeSettings, saveWallpaperBlob,
} from "./storage";

type ResolvedMode = "light" | "dark";

interface ThemeContextValue {
  settings: ThemeSettings;
  resolvedMode: ResolvedMode;
  wallpaperUrl: string | null;
  wallpaperReady: boolean;
  updateSettings: (patch: Partial<ThemeSettings>) => void;
  setWallpaper: (blob: Blob) => Promise<void>;
  removeWallpaper: () => Promise<void>;
  resetTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(mode: ThemeMode): ResolvedMode {
  if (mode !== "system") return mode;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function shade(hex: string, amount: number): string {
  const number = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const ratio = Math.abs(amount);
  const channel = (value: number) => Math.round(value + (target - value) * ratio);
  const red = channel(number >> 16);
  const green = channel((number >> 8) & 255);
  const blue = channel(number & 255);
  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
}

function apply(settings: ThemeSettings, mode: ResolvedMode, wallpaperUrl: string | null) {
  const root = document.documentElement;
  const preset = getThemePreset(settings.presetId);
  const primary = settings.customAccent ?? preset.palette.primary;

  root.dataset.themeMode = mode;
  root.dataset.themeKind = settings.kind;
  root.style.colorScheme = mode;
  root.style.setProperty("--tg-primary", primary);
  root.style.setProperty(
    "--tg-primary-hover",
    settings.customAccent ? shade(primary, mode === "dark" ? 0.12 : -0.12) : preset.palette.primaryHover,
  );
  root.style.setProperty("--tg-ring", settings.customAccent ?? preset.palette.ring);

  const custom = `linear-gradient(${settings.customGradient.angle}deg, ${settings.customGradient.from}, ${settings.customGradient.to})`;
  const appGradient = settings.kind === "gradient"
    ? (settings.presetId === "custom-gradient"
        ? custom
        : mode === "dark" ? preset.darkGradient : preset.lightGradient)
    : mode === "dark" ? preset.darkGradient : preset.lightGradient;

  root.style.setProperty("--tg-app-gradient", appGradient);
  root.style.setProperty("--tg-glass-blur", `${settings.glass}px`);
  root.style.setProperty("--tg-wallpaper-overlay", String(settings.wallpaper.overlay / 100));
  root.style.setProperty("--tg-wallpaper-blur", `${settings.wallpaper.blur}px`);
  root.style.setProperty("--tg-wallpaper-brightness", `${settings.wallpaper.brightness}%`);
  root.style.setProperty("--tg-wallpaper-size", settings.wallpaper.fit);
  root.style.setProperty("--tg-wallpaper-position", settings.wallpaper.position);
  root.style.setProperty("--tg-wallpaper-repeat", settings.wallpaper.repeat ? "repeat" : "no-repeat");

  if (settings.kind === "wallpaper" && settings.wallpaper.enabled && wallpaperUrl) {
    root.style.setProperty("--tg-wallpaper-url", `url("${wallpaperUrl}")`);
    root.dataset.hasWallpaper = "true";
  } else {
    root.style.removeProperty("--tg-wallpaper-url");
    delete root.dataset.hasWallpaper;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_THEME_SETTINGS);
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>("light");
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [wallpaperReady, setWallpaperReady] = useState(false);
  const currentUrl = useRef<string | null>(null);

  const replaceUrl = useCallback((next: string | null) => {
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    currentUrl.current = next;
    setWallpaperUrl(next);
  }, []);

  useEffect(() => {
    const stored = loadThemeSettings();
    setSettings(stored);
    setResolvedMode(resolveMode(stored.mode));
    loadWallpaperBlob()
      .then((blob) => replaceUrl(blob ? URL.createObjectURL(blob) : null))
      .catch(() => replaceUrl(null))
      .finally(() => setWallpaperReady(true));
    return () => {
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    };
  }, [replaceUrl]);

  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const listener = () => settings.mode === "system" && setResolvedMode(resolveMode("system"));
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [settings.mode]);

  useEffect(() => {
    const mode = resolveMode(settings.mode);
    setResolvedMode(mode);
    saveThemeSettings(settings);
    apply(settings, mode, wallpaperUrl);
  }, [settings, wallpaperUrl]);

  const updateSettings = useCallback((patch: Partial<ThemeSettings>) => {
    setSettings((current) => ({
      ...current,
      ...patch,
      customGradient: patch.customGradient
        ? { ...current.customGradient, ...patch.customGradient }
        : current.customGradient,
      wallpaper: patch.wallpaper
        ? { ...current.wallpaper, ...patch.wallpaper }
        : current.wallpaper,
    }));
  }, []);

  const setWallpaper = useCallback(async (blob: Blob) => {
    await saveWallpaperBlob(blob);
    replaceUrl(URL.createObjectURL(blob));
    setSettings((current) => ({
      ...current,
      kind: "wallpaper",
      wallpaper: { ...current.wallpaper, enabled: true },
    }));
  }, [replaceUrl]);

  const removeWallpaper = useCallback(async () => {
    await deleteWallpaperBlob();
    replaceUrl(null);
    setSettings((current) => ({
      ...current,
      kind: "solid",
      wallpaper: { ...current.wallpaper, enabled: false },
    }));
  }, [replaceUrl]);

  const resetTheme = useCallback(async () => {
    await deleteWallpaperBlob();
    replaceUrl(null);
    setSettings(DEFAULT_THEME_SETTINGS);
  }, [replaceUrl]);

  const value = useMemo(() => ({
    settings, resolvedMode, wallpaperUrl, wallpaperReady,
    updateSettings, setWallpaper, removeWallpaper, resetTheme,
  }), [
    settings, resolvedMode, wallpaperUrl, wallpaperReady,
    updateSettings, setWallpaper, removeWallpaper, resetTheme,
  ]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme harus digunakan di dalam ThemeProvider.");
  return value;
}
