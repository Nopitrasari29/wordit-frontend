// Sesuaikan dengan Enum di Prisma backend kamu
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
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

  // 🛠️ FIX UTAMA: Daftarkan objek relasi profile agar dikenali di tabel Admin Frontend
  profile?: {
    bio?: string | null;
    totalPoints?: number;
    badges?: string[];
  };

  // 🛠️ TAMBAHAN: Daftarkan properti agregat count untuk kalkulasi jumlah kuis terbuat
  _count?: {
    gamesCreated?: number;
    sessions?: number;
  };
}