import type { ThemePreset } from "./types";

const solid = (
  id: string, name: string, description: string,
  primary: string, hover: string, ring: string,
  light: string, dark: string
): ThemePreset => ({
  id, name, description, kind: "solid",
  palette: {
    primary, primaryHover: hover, ring,
    selection: ring, selectionText: "#0f172a",
  },
  lightGradient: light,
  darkGradient: dark,
  preview: `linear-gradient(135deg, ${primary}, ${ring})`,
});

const gradient = (
  id: string, name: string, description: string,
  primary: string, hover: string, ring: string,
  light: string, dark: string, preview: string
): ThemePreset => ({
  id, name, description, kind: "gradient",
  palette: {
    primary, primaryHover: hover, ring,
    selection: ring, selectionText: "#0f172a",
  },
  lightGradient: light,
  darkGradient: dark,
  preview,
});

export const THEME_PRESETS: readonly ThemePreset[] = [
  solid("indigo-guru", "Indigo Guru", "Tenang dan profesional.", "#4f46e5", "#4338ca", "#a5b4fc", "linear-gradient(180deg,#f8faff,#f3f4ff)", "linear-gradient(180deg,#0f1224,#111827)"),
  solid("ocean-blue", "Ocean Blue", "Biru bersih dan segar.", "#0284c7", "#0369a1", "#7dd3fc", "linear-gradient(180deg,#f5fbff,#eff8ff)", "linear-gradient(180deg,#071a2b,#0f172a)"),
  solid("emerald", "Emerald", "Hijau produktif.", "#059669", "#047857", "#6ee7b7", "linear-gradient(180deg,#f4fdf9,#eefbf5)", "linear-gradient(180deg,#06251c,#0f172a)"),
  solid("rose", "Rose", "Hangat dan ekspresif.", "#e11d48", "#be123c", "#fda4af", "linear-gradient(180deg,#fff7f9,#fff1f4)", "linear-gradient(180deg,#2b0a14,#17121b)"),
  solid("amber", "Amber", "Cerah dan ramah.", "#d97706", "#b45309", "#fcd34d", "linear-gradient(180deg,#fffdf5,#fff9e8)", "linear-gradient(180deg,#2a1905,#181510)"),
  solid("violet", "Violet", "Kreatif dan premium.", "#7c3aed", "#6d28d9", "#c4b5fd", "linear-gradient(180deg,#fbf9ff,#f6f1ff)", "linear-gradient(180deg,#1d1038,#151425)"),
  solid("teal", "Teal", "Modern dan seimbang.", "#0d9488", "#0f766e", "#5eead4", "linear-gradient(180deg,#f3fdfc,#ecfafa)", "linear-gradient(180deg,#052824,#101c21)"),
  solid("slate", "Slate", "Netral dan fokus.", "#475569", "#334155", "#cbd5e1", "linear-gradient(180deg,#fafafa,#f1f5f9)", "linear-gradient(180deg,#111827,#0f172a)"),

  gradient("aurora", "Aurora", "Cyan, hijau, dan violet.", "#6366f1", "#4f46e5", "#67e8f9", "linear-gradient(135deg,#ecfeff,#ecfdf5 42%,#f5f3ff)", "linear-gradient(135deg,#06202a,#06291d 42%,#24143d)", "linear-gradient(135deg,#22d3ee,#34d399,#8b5cf6)"),
  gradient("sunset", "Sunset", "Oranye, pink, dan ungu.", "#ea580c", "#c2410c", "#fda4af", "linear-gradient(135deg,#fff7ed,#fff1f2 48%,#faf5ff)", "linear-gradient(135deg,#301306,#32101d 48%,#211133)", "linear-gradient(135deg,#fb923c,#fb7185,#a855f7)"),
  gradient("ocean-gradient", "Ocean", "Biru laut menuju turquoise.", "#0284c7", "#0369a1", "#67e8f9", "linear-gradient(145deg,#eff6ff,#ecfeff 55%,#f0fdfa)", "linear-gradient(145deg,#071b35,#063344 55%,#062d2a)", "linear-gradient(145deg,#2563eb,#06b6d4,#14b8a6)"),
  gradient("candy", "Candy", "Pastel pink, biru, lavender.", "#db2777", "#be185d", "#d8b4fe", "linear-gradient(135deg,#fdf2f8,#eff6ff 50%,#faf5ff)", "linear-gradient(135deg,#321125,#101e3d 50%,#28123c)", "linear-gradient(135deg,#f472b6,#60a5fa,#c084fc)"),
  gradient("forest", "Forest", "Hijau hutan dan lumut.", "#15803d", "#166534", "#86efac", "linear-gradient(140deg,#f0fdf4,#f7fee7 52%,#ecfdf5)", "linear-gradient(140deg,#052e16,#1a2e05 52%,#052b24)", "linear-gradient(140deg,#166534,#65a30d,#059669)"),
  gradient("midnight", "Midnight", "Biru malam dan violet.", "#6366f1", "#4f46e5", "#a5b4fc", "linear-gradient(135deg,#eef2ff,#f5f3ff 55%,#eff6ff)", "linear-gradient(135deg,#090f2c,#1c1038 55%,#071a33)", "linear-gradient(135deg,#1e3a8a,#4c1d95,#312e81)"),
  gradient("peach", "Peach", "Peach dan aprikot.", "#e76f51", "#c85b40", "#fdba74", "linear-gradient(135deg,#fff7ed,#fff1f2 55%,#fffbeb)", "linear-gradient(135deg,#30150d,#32131a 55%,#2b2108)", "linear-gradient(135deg,#fb923c,#fb7185,#fbbf24)"),
  gradient("cyber", "Cyber", "Cyan dan violet futuristik.", "#0891b2", "#0e7490", "#c084fc", "linear-gradient(130deg,#ecfeff,#f5f3ff 58%,#eef2ff)", "linear-gradient(130deg,#032c36,#25113b 58%,#111b3e)", "linear-gradient(130deg,#06b6d4,#8b5cf6,#2563eb)"),
] as const;

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}
