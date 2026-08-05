import { describe, expect, it } from "vitest";
import { normalizeThemeSettings } from "@/lib/theme/storage";

describe("normalizeThemeSettings", () => {
  it("membatasi nilai", () => {
    const value = normalizeThemeSettings({
      wallpaper: { overlay: 999, blur: -3, brightness: 0 },
      glass: 99,
    });
    expect(value.wallpaper.overlay).toBe(90);
    expect(value.wallpaper.blur).toBe(0);
    expect(value.wallpaper.brightness).toBe(40);
    expect(value.glass).toBe(20);
  });

  it("menolak warna tidak valid", () => {
    expect(normalizeThemeSettings({ customAccent: "javascript:red" }).customAccent).toBeNull();
  });
});
