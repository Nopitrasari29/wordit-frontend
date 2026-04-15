export type Role = "STUDENT" | "TEACHER" | "ADMIN"

export interface User {

  id: string
  name: string
  email: string
  role: Role

  photoUrl?: string

  createdAt?: string

}