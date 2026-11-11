export type Role = "admin" | "student";
export type AccountStatus = "active" | "suspended";
export type ProgressStatus = "in_progress" | "completed";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  status: AccountStatus;
  must_change_password: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  full_name: string;
  email: string;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
};

export type Subject = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Paper = {
  id: string;
  subject_id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  created_at: string;
  updated_at: string;
};

export type PaperStat = {
  paper_id: string;
  viewed_count: number;
  completed_count: number;
};

/** Result returned by form actions to show a message on screen. */
export type ActionState = {
  error?: string;
  success?: string;
  warning?: string;
  /** Temporary login shown ONCE to the admin, who passes it to the student privately. Never stored. */
  credentials?: { name: string; email: string; password: string };
} | null;
