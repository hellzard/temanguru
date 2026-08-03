import { describe, expect, it } from "vitest";
import { createCsv, safeFilename } from "@/lib/export/csv";

describe("CSV export", () => {
  it("preserves Indonesian characters and escapes quotes", () => {
    const csv = createCsv([{ nama: "Siti Nur 'Aisyah", catatan: 'Baik, "aktif"' }]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Baik, ""aktif"""');
  });

  it("sanitizes filenames", () => {
    expect(safeFilename("Nilai VIII A / Semester 1")).toBe("nilai-viii-a-semester-1");
  });
});
