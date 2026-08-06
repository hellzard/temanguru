"use client";

import { z } from "zod";
import type { LocalWorkspace, WorkspaceBackupEnvelope } from "./types";

const isoString = z.string().min(1);
const workspaceSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  createdAt: isoString,
  updatedAt: isoString,
  profile: z.object({
    teacherName: z.string().max(150),
    schoolName: z.string().max(180),
    academicYear: z.string().max(40),
  }),
  classes: z.array(z.object({
    id: z.string(), name: z.string(), subject: z.string(), grade: z.string(), schedule: z.string(), createdAt: isoString,
  })).max(500),
  students: z.array(z.object({
    id: z.string(), classId: z.string(), name: z.string(), studentCode: z.string(), parentPhone: z.string(), createdAt: isoString,
  })).max(20_000),
  classRecords: z.array(z.object({
    id: z.string(), classId: z.string(), date: z.string(), topic: z.string(), notes: z.string(),
    attendance: z.record(z.string(), z.enum(["present", "sick", "excused", "absent"])),
    createdAt: isoString, updatedAt: isoString,
  })).max(20_000),
  assessments: z.array(z.object({
    id: z.string(), classId: z.string(), title: z.string(), category: z.string(), date: z.string(),
    maxScore: z.number().positive().max(10_000), weight: z.number().min(0).max(100), createdAt: isoString,
  })).max(10_000),
  scores: z.array(z.object({
    id: z.string(), assessmentId: z.string(), studentId: z.string(), score: z.number().min(0).max(10_000), updatedAt: isoString,
  })).max(200_000),
  documents: z.array(z.object({
    id: z.string(), title: z.string(), type: z.string(), content: z.string(), status: z.enum(["draft", "final"]), createdAt: isoString, updatedAt: isoString,
  })).max(20_000),
  events: z.array(z.object({
    id: z.string(), title: z.string(), category: z.enum(["event", "meeting", "task"]), date: z.string(),
    status: z.enum(["planned", "ongoing", "completed"]), notes: z.string(), createdAt: isoString,
  })).max(20_000),
  inventory: z.array(z.object({
    id: z.string(), name: z.string(), code: z.string(), quantity: z.number().int().min(0).max(1_000_000),
    condition: z.enum(["good", "needs_attention", "damaged"]), notes: z.string(), updatedAt: isoString,
  })).max(20_000),
});

const backupSchema = z.object({
  app: z.literal("Teman Guru"),
  backupVersion: z.literal(1),
  exportedAt: isoString,
  workspace: workspaceSchema,
});

function safeFilename(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "workspace";
}

export function downloadWorkspaceBackup(workspace: LocalWorkspace) {
  const envelope: WorkspaceBackupEnvelope = {
    app: "Teman Guru",
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    workspace,
  };
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `temanguru-backup-${safeFilename(workspace.name)}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function parseWorkspaceBackup(file: File): Promise<LocalWorkspace> {
  if (file.size > 15 * 1024 * 1024) throw new Error("File backup lebih besar dari batas 15 MB.");
  const parsed: unknown = JSON.parse(await file.text());
  const result = backupSchema.safeParse(parsed);
  if (!result.success) throw new Error("Format backup tidak valid atau berasal dari versi yang tidak didukung.");
  return result.data.workspace;
}
