import { WORKSPACE_SCHEMA_VERSION, type LocalWorkspace } from "./types";

export function createId(prefix = "item") {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export function createEmptyWorkspace(): LocalWorkspace {
  const now = new Date().toISOString();
  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    id: createId("workspace"),
    name: "Ruang Kerja Saya",
    createdAt: now,
    updatedAt: now,
    profile: {
      teacherName: "",
      schoolName: "",
      academicYear: "",
    },
    classes: [],
    students: [],
    classRecords: [],
    assessments: [],
    scores: [],
    documents: [],
    events: [],
    inventory: [],
  };
}

export function createSampleWorkspace(): LocalWorkspace {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const classA = createId("class");
  const classB = createId("class");
  const studentA = createId("student");
  const studentB = createId("student");
  const studentC = createId("student");
  const assessment = createId("assessment");

  return {
    ...createEmptyWorkspace(),
    name: "Contoh Ruang Kerja",
    updatedAt: now,
    profile: {
      teacherName: "Ibu/Bapak Guru",
      schoolName: "Sekolah Contoh",
      academicYear: "2026/2027",
    },
    classes: [
      { id: classA, name: "VIII A", subject: "Matematika", grade: "8", schedule: "Senin 07.00", createdAt: now },
      { id: classB, name: "VII B", subject: "IPA", grade: "7", schedule: "Rabu 09.00", createdAt: now },
    ],
    students: [
      { id: studentA, classId: classA, name: "Alya Putri", studentCode: "A-001", parentPhone: "", createdAt: now },
      { id: studentB, classId: classA, name: "Bima Pratama", studentCode: "A-002", parentPhone: "", createdAt: now },
      { id: studentC, classId: classB, name: "Citra Lestari", studentCode: "B-001", parentPhone: "", createdAt: now },
    ],
    classRecords: [
      {
        id: createId("record"),
        classId: classA,
        date: today,
        topic: "Persamaan linear",
        notes: "Latihan kelompok berjalan baik.",
        attendance: { [studentA]: "present", [studentB]: "sick" },
        createdAt: now,
        updatedAt: now,
      },
    ],
    assessments: [
      { id: assessment, classId: classA, title: "Kuis Persamaan Linear", category: "Kuis", date: today, maxScore: 100, weight: 20, createdAt: now },
    ],
    scores: [
      { id: createId("score"), assessmentId: assessment, studentId: studentA, score: 88, updatedAt: now },
      { id: createId("score"), assessmentId: assessment, studentId: studentB, score: 76, updatedAt: now },
    ],
    documents: [
      { id: createId("document"), title: "Catatan Rapat Wali Kelas", type: "Catatan", content: "Agenda dan tindak lanjut dapat ditulis di sini.", status: "draft", createdAt: now, updatedAt: now },
    ],
    events: [
      { id: createId("event"), title: "Rapat Evaluasi Bulanan", category: "meeting", date: today, status: "planned", notes: "Siapkan rekap kelas.", createdAt: now },
    ],
    inventory: [
      { id: createId("inventory"), name: "Proyektor Kelas", code: "INV-001", quantity: 1, condition: "good", notes: "Tersimpan di ruang guru.", updatedAt: now },
    ],
  };
}

export function isWorkspaceEmpty(workspace: LocalWorkspace) {
  return workspace.classes.length === 0
    && workspace.students.length === 0
    && workspace.classRecords.length === 0
    && workspace.assessments.length === 0
    && workspace.documents.length === 0
    && workspace.events.length === 0
    && workspace.inventory.length === 0;
}
