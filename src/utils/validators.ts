export const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email)
export const validatePassword = (password: string) => password.length >= 8  // sesuai registerSchema backend
export const validateName = (name: string) => name.trim().length >= 2        // sesuai registerSchema backend