export const WORKSPACE_SCHEMA_VERSION = 1 as const;

export type AttendanceStatus = "present" | "sick" | "excused" | "absent";
export type DocumentStatus = "draft" | "final";
export type EventStatus = "planned" | "ongoing" | "completed";
export type InventoryCondition = "good" | "needs_attention" | "damaged";

export type WorkspaceProfile = {
  teacherName: string;
  schoolName: string;
  academicYear: string;
};

export type LocalClass = {
  id: string;
  name: string;
  subject: string;
  grade: string;
  schedule: string;
  createdAt: string;
};

export type LocalStudent = {
  id: string;
  classId: string;
  name: string;
  studentCode: string;
  parentPhone: string;
  createdAt: string;
};

export type LocalClassRecord = {
  id: string;
  classId: string;
  date: string;
  topic: string;
  notes: string;
  attendance: Record<string, AttendanceStatus>;
  createdAt: string;
  updatedAt: string;
};

export type LocalAssessment = {
  id: string;
  classId: string;
  title: string;
  category: string;
  date: string;
  maxScore: number;
  weight: number;
  createdAt: string;
};

export type LocalScore = {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  updatedAt: string;
};

export type LocalDocument = {
  id: string;
  title: string;
  type: string;
  content: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
};

export type LocalEvent = {
  id: string;
  title: string;
  category: "event" | "meeting" | "task";
  date: string;
  status: EventStatus;
  notes: string;
  createdAt: string;
};

export type LocalInventoryItem = {
  id: string;
  name: string;
  code: string;
  quantity: number;
  condition: InventoryCondition;
  notes: string;
  updatedAt: string;
};

export type LocalWorkspace = {
  schemaVersion: typeof WORKSPACE_SCHEMA_VERSION;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  profile: WorkspaceProfile;
  classes: LocalClass[];
  students: LocalStudent[];
  classRecords: LocalClassRecord[];
  assessments: LocalAssessment[];
  scores: LocalScore[];
  documents: LocalDocument[];
  events: LocalEvent[];
  inventory: LocalInventoryItem[];
};

export type WorkspaceBackupEnvelope = {
  app: "Teman Guru";
  backupVersion: 1;
  exportedAt: string;
  workspace: LocalWorkspace;
};

export type CloudWorkspaceRow = {
  user_id: string;
  payload: LocalWorkspace;
  device_id: string | null;
  updated_at: string;
};
