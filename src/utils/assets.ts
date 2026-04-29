/**
 * Helper untuk mendapatkan URL gambar yang valid dari Backend.
 * Jika path kosong, mengembalikan avatar default.
 */
export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/avatar.png";
  
  // Jika sudah berupa URL (misal dari Google OAuth atau external link), langsung kembalikan
  if (path.startsWith("http")) return path;

  // Pastikan URL Backend sesuai dengan yang ada di EditProfilePage
  const BASE_URL = "http://localhost:3000";
  
  // Hapus slash di depan jika ada agar tidak double slash
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  return `${BASE_URL}/${cleanPath}`;
};
