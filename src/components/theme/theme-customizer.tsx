"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Check, ImagePlus, Loader2, Moon, RefreshCcw, Sparkles, Sun, Trash2 } from "lucide-react";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { optimizeWallpaper } from "@/lib/theme/image";
import { useTheme } from "@/lib/theme/theme-provider";
import type { ThemeKind, ThemeMode, WallpaperPosition } from "@/lib/theme/types";

const modes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Sparkles },
];

const kinds: { value: ThemeKind; label: string }[] = [
  { value: "solid", label: "Warna" },
  { value: "gradient", label: "Gradasi" },
  { value: "wallpaper", label: "Wallpaper" },
];

function Range({
  label, value, min, max, suffix, onChange,
}: {
  label: string; value: number; min: number; max: number; suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm font-semibold">
        <span>{label}</span><span className="tg-muted">{value}{suffix}</span>
      </span>
      <input className="w-full accent-[var(--tg-primary)]" type="range"
        min={min} max={max} value={value}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function ThemeCustomizer() {
  const theme = useTheme();
  const { settings } = theme;
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Perubahan tersimpan otomatis di perangkat ini.");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const blob = await optimizeWallpaper(file);
      await theme.setWallpaper(blob);
      setMessage(`Wallpaper tersimpan (${(blob.size / 1024 / 1024).toFixed(2)} MB).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memproses wallpaper.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="tg-card p-5">
        <h2 className="text-lg font-bold">Mode tampilan</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {modes.map(({ value, label, icon: Icon }) => (
            <button key={value} type="button" aria-pressed={settings.mode === value}
              onClick={() => theme.updateSettings({ mode: value })}
              className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold ${
                settings.mode === value
                  ? "border-[var(--tg-primary)] bg-[color-mix(in_srgb,var(--tg-primary)_12%,transparent)] text-[var(--tg-primary)]"
                  : "border-[var(--tg-border)] bg-[var(--tg-surface)]"
              }`}>
              <Icon className="mx-auto mb-1" size={18} />{label}
            </button>
          ))}
        </div>
      </section>

      <section className="tg-card p-5">
        <h2 className="text-lg font-bold">Jenis tema</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {kinds.map(({ value, label }) => (
            <button key={value} type="button"
              onClick={() => theme.updateSettings({
                kind: value,
                wallpaper: { ...settings.wallpaper, enabled: value === "wallpaper" && Boolean(theme.wallpaperUrl) },
              })}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                settings.kind === value
                  ? "border-[var(--tg-primary)] bg-[var(--tg-primary)] text-white"
                  : "border-[var(--tg-border)] bg-[var(--tg-surface)]"
              }`}>{label}</button>
          ))}
        </div>

        {settings.kind !== "wallpaper" && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {THEME_PRESETS.filter((preset) => preset.kind === settings.kind).map((preset) => (
              <button key={preset.id} type="button"
                onClick={() => theme.updateSettings({ presetId: preset.id, customAccent: null })}
                className={`overflow-hidden rounded-2xl border text-left ${
                  settings.presetId === preset.id ? "border-[var(--tg-primary)] ring-2 ring-[var(--tg-ring)]/30" : "border-[var(--tg-border)]"
                }`}>
                <span className="block h-20" style={{ background: preset.preview }} />
                <span className="block bg-[var(--tg-surface)] p-3">
                  <span className="flex justify-between font-bold">
                    {preset.name}{settings.presetId === preset.id && <Check size={17} />}
                  </span>
                  <span className="mt-1 block text-xs tg-muted">{preset.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {settings.kind === "solid" && (
          <label className="mt-6 block max-w-sm">
            <span className="text-sm font-semibold">Warna aksen sendiri</span>
            <input className="mt-2 h-12 w-full rounded-xl" type="color"
              value={settings.customAccent ?? "#4f46e5"}
              onChange={(event) => theme.updateSettings({ customAccent: event.target.value })} />
          </label>
        )}

        {settings.kind === "gradient" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <input aria-label="Warna awal" type="color" className="h-12 w-full rounded-xl"
              value={settings.customGradient.from}
              onChange={(event) => theme.updateSettings({
                presetId: "custom-gradient",
                customGradient: { ...settings.customGradient, from: event.target.value },
              })} />
            <input aria-label="Warna akhir" type="color" className="h-12 w-full rounded-xl"
              value={settings.customGradient.to}
              onChange={(event) => theme.updateSettings({
                presetId: "custom-gradient",
                customGradient: { ...settings.customGradient, to: event.target.value },
              })} />
            <Range label="Arah" value={settings.customGradient.angle} min={0} max={360} suffix="°"
              onChange={(angle) => theme.updateSettings({
                presetId: "custom-gradient",
                customGradient: { ...settings.customGradient, angle },
              })} />
          </div>
        )}
      </section>

      {settings.kind === "wallpaper" && (
        <section className="tg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Wallpaper pribadi</h2>
              <p className="text-sm tg-muted">Hanya disimpan pada browser perangkat ini.</p>
            </div>
            <div className="flex gap-2">
              <input ref={fileInput} className="sr-only" type="file"
                accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} />
              <button className="tg-primary-button" disabled={busy}
                onClick={() => fileInput.current?.click()}>
                {busy ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} />}
                {theme.wallpaperUrl ? "Ganti" : "Pilih gambar"}
              </button>
              {theme.wallpaperUrl && (
                <button className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 text-rose-700"
                  onClick={() => void theme.removeWallpaper()}>
                  <Trash2 size={18} /> Hapus
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Range label="Lapisan gelap" value={settings.wallpaper.overlay} min={0} max={90} suffix="%"
              onChange={(overlay) => theme.updateSettings({ wallpaper: { ...settings.wallpaper, overlay } })} />
            <Range label="Blur" value={settings.wallpaper.blur} min={0} max={24} suffix="px"
              onChange={(blur) => theme.updateSettings({ wallpaper: { ...settings.wallpaper, blur } })} />
            <Range label="Kecerahan" value={settings.wallpaper.brightness} min={40} max={140} suffix="%"
              onChange={(brightness) => theme.updateSettings({ wallpaper: { ...settings.wallpaper, brightness } })} />
            <Range label="Efek kaca" value={settings.glass} min={0} max={20} suffix="px"
              onChange={(glass) => theme.updateSettings({ glass })} />
            <select aria-label="Posisi wallpaper" value={settings.wallpaper.position}
              onChange={(event) => theme.updateSettings({
                wallpaper: { ...settings.wallpaper, position: event.target.value as WallpaperPosition },
              })}
              className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">
              {["center","top","bottom","left","right","left top","right top","left bottom","right bottom"].map((position) => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
            <select aria-label="Ukuran wallpaper" value={settings.wallpaper.fit}
              onChange={(event) => theme.updateSettings({
                wallpaper: { ...settings.wallpaper, fit: event.target.value === "contain" ? "contain" : "cover" },
              })}
              className="min-h-11 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">
              <option value="cover">Penuhi layar</option>
              <option value="contain">Tampilkan utuh</option>
            </select>
            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--tg-border)] bg-[var(--tg-surface)] px-3">
              <input
                type="checkbox"
                checked={settings.wallpaper.repeat}
                onChange={(event) => theme.updateSettings({
                  wallpaper: { ...settings.wallpaper, repeat: event.target.checked },
                })}
              />
              <span className="text-sm font-semibold">Ulangi gambar kecil</span>
            </label>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--tg-border)] bg-[var(--tg-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm tg-muted">{message}</p>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--tg-border)] px-4 font-semibold"
          onClick={() => void theme.resetTheme()}>
          <RefreshCcw size={17} /> Reset tema
        </button>
      </div>
    </div>
  );
}
