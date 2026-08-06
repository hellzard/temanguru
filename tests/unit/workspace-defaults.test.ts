import { describe, expect, it } from "vitest";
import { createEmptyWorkspace, createSampleWorkspace, isWorkspaceEmpty } from "@/lib/workspace/defaults";

describe("local workspace defaults", () => {
  it("creates an empty guest workspace", () => {
    const workspace = createEmptyWorkspace();
    expect(workspace.schemaVersion).toBe(1);
    expect(isWorkspaceEmpty(workspace)).toBe(true);
  });

  it("creates sample data without external services", () => {
    const workspace = createSampleWorkspace();
    expect(isWorkspaceEmpty(workspace)).toBe(false);
    expect(workspace.classes.length).toBeGreaterThan(0);
    expect(workspace.students.length).toBeGreaterThan(0);
  });
});
