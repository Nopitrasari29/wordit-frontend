export type Role = "STUDENT" | "TEACHER" | "SCHOOL_ADMIN" | "SUPER_ADMIN" | "ADMIN";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EducationLevel = "SD" | "SMP" | "SMA" | "UNIVERSITY";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  approvalStatus: ApprovalStatus;
  educationLevels?: EducationLevel[];
  photoUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  schoolOrigin?: string | null;
  phoneNumber?: string | null;
  hasAdminAccess?: boolean;
  adminRequestStatus?: ApprovalStatus | null;

  profile?: {
    bio?: string | null;
    totalPoints?: number;
    badges?: string[];
  };

  _count?: {
    gamesCreated?: number;
    sessions?: number;
  };
}