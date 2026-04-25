// Sesuaikan dengan Enum di Prisma backend kamu
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type EducationLevel = "SD" | "SMP" | "SMA" | "UNIVERSITY";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  approvalStatus: ApprovalStatus; // Tambahkan ini
  educationLevel?: EducationLevel | null; // Tambahkan ini
  photoUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}