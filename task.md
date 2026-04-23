# 📋 Master Task List — WordIT Project
> **File ini adalah satu-satunya sumber kebenaran untuk progress project.**
> Terakhir diperbarui: 23 April 2026 — setelah zoom dengan Bu Rizka & Bu Henning.
> **NOTE: Integrasi Moodle/LTI TIDAK jadi dikerjakan di project ini. Fokus full ke standalone web app + hosting server departemen.**

---

## ✅ Sprint 1: Fondasi (DONE)
- [x] **AI-01 s/d AI-04**: Setup Groq API, Fallback Gemini, Prompt Template & Feedback AI.
- [x] **BE-01 s/d BE-10**: Auth (Register, Login, Logout), Profile Update, CRUD Games & Filter Template/Education Level.
- [x] **FE-01 s/d FE-07**: UI Register, Login, Landing Page, Pilih Education Level, Filter Template & Halaman Profil.
- [x] **PM-01 s/d QA-03**: Project Management & QA Testing Sprint 1.

---

## 🏃 Sprint 2: Core Game & Arena (In Progress)
> Prioritas urutan: **SD -> SMP -> SMA -> University**

### Backend (BE)
- [x] **BE-11**: Memainkan game dan mendapat feedback langsung.
- [x] **BE-12**: Skor tersimpan otomatis setelah game selesai (via `finishGame` endpoint).
- [x] **BE-13**: WebSocket broadcast ranking real-time saat bermain.
- [x] **BE-NEW-01**: Schema migration — tambah `approvalStatus` di model `User`.
  - [x] Tambah enum `ApprovalStatus { PENDING APPROVED REJECTED }` di `schema.prisma`.
  - [x] Tambah field `approvalStatus ApprovalStatus @default(APPROVED)` di model `User`.
  - [x] Tambah field `educationLevel EducationLevel?` di model `User`.
  - [x] Jalankan `bunx prisma migrate dev --name add_approval_status_education_level`. ✅
  - [x] Update `users.seed.ts`: Teacher & Admin seed langsung `APPROVED`, Student `APPROVED` juga.
- [x] **BE-NEW-02**: Sistem Approval Teacher — logic & endpoint.
  - [x] Endpoint `PATCH /api/users/:id/approve` (body: `{ action: "APPROVE" | "REJECT" }`).
  - [x] Teacher `PENDING` → 403 saat login: "Menunggu persetujuan admin".
  - [x] Teacher `REJECTED` → 403 saat login dengan pesan ditolak.
  - [x] Hanya Admin yang bisa akses endpoint approve.
- [x] **BE-NEW-03**: Blokir register sebagai Admin via endpoint.
  - [x] Validasi di `auth.service.ts`: jika `role === ADMIN` → throw error 400.
  - [x] Schema Zod `registerSchema` hanya terima `STUDENT` atau `TEACHER`.
- [x] **BE-NEW-04**: Satu akun Teacher = satu jenjang pendidikan.
  - [x] Validasi Zod: Teacher wajib isi `educationLevel`.
  - [x] Field `educationLevel` tersimpan di database.

### Frontend (FE) - Game Builders
- [x] **FE-08**: Game Builder Flashcard.
- [x] **FE-09**: Game Builder Hangman.
- [x] **FE-10**: Game Builder Word Search.
- [x] **FE-11**: Game Builder Anagram.
- [x] **FE-12**: Game Builder Maze Chase.
- [x] **FE-13**: Game Builder Spin the Wheel.
- [ ] **FE-NEW-01**: Fitur **Edit sebelum Publish** — feedback Bu Rizka.
  - [ ] Tambahkan tombol "Edit" di `PreviewGamePage.tsx` yang mengarah ke `EditGamePage`.
  - [ ] Alur yang benar: Buat Game → Preview → **Edit (revisi)** → Publish.

### Frontend (FE) - Student Arena
> Kerjakan satu per satu. Selesaikan SD dulu sebelum lanjut SMP/SMA.

- [x] **FE-14-Anagram**: Fully functional ✅ (benchmark untuk engine lain)
- [ ] **FE-14-Flashcard**: Upgrade ke "Active Recall".
  - [ ] Hapus auto-advance timer.
  - [ ] Setelah kartu dibalik → munculkan 2 tombol: **"Hafal ✅"** (poin penuh) & **"Lupa ❌"** (0 poin).
  - [ ] `finishGame()` sudah ada, pastikan dipanggil dengan data `breakdown` yang benar.
- [ ] **FE-14-Hangman**: Upgrade dengan sistem nyawa.
  - [ ] Maks 6 kesalahan per kata — tampilkan indikator ♥️♥️♥️♥️♥️♥️.
  - [ ] Nyawa habis → reveal jawaban → lanjut soal berikutnya (0 poin).
  - [ ] `finishGame()` sudah ada.
- [ ] **FE-14-WordSearch**: Upgrade dari grid statis ke interaktif.
  - [ ] Algoritma Grid Generator 8x8: sembunyikan kata horizontal/vertikal, isi ruang kosong dengan huruf acak.
  - [ ] Interaksi drag/klik: pilih huruf pertama & terakhir → highlight hijau jika benar.
  - [ ] Tambahkan `finishGame()` di akhir game.
- [ ] **FE-14-MazeChase**: Upgrade dari dummy ke labirin interaktif.
  - [ ] Grid 5x5, karakter 🏃 digerakkan via tombol panah keyboard + D-Pad on-screen (mobile).
  - [ ] Jawaban (1 benar + 3 salah) ditempatkan di tepi grid sebagai "portal tujuan".
  - [ ] Nabrak jawaban benar → poin. Nabrak salah → nyawa berkurang.
  - [ ] Tambahkan `finishGame()` di akhir game.
- [ ] **FE-14-SpinWheel**: Upgrade agar siswa input jawaban manual.
  - [ ] Setelah roda berhenti → jawaban disembunyikan → muncul input teks.
  - [ ] Validasi case-insensitive → benar = poin, salah = 0.
  - [ ] Tambahkan `finishGame()` di akhir semua soal.
- [x] **FE-15**: Result Page (skor total, akurasi, breakdown, rating bintang).
- [x] **FE-16**: Overlay ranking muncul tiap akhir soal.

### Frontend (FE) - Admin Dashboard
- [ ] **FE-NEW-02**: Halaman Admin Dashboard.
  - [ ] List semua user (Student, Teacher) + status approval.
  - [ ] Tombol **Approve / Reject** untuk Teacher berstatus PENDING.
  - [ ] Tombol ganti role & hapus user.

### Frontend (FE) - Auth & UX
- [ ] **FE-NEW-03**: Update halaman Register — Teacher harus pilih 1 jenjang (radio button).
  - [ ] Ganti multi-select/checkbox menjadi radio button untuk educationLevel.
- [ ] **FE-NEW-04**: Panduan format username siswa di EnterPlayerPage.
  - [ ] Tambah placeholder/hint: *"Contoh: 3A_Nayla (format: Kelas_Nama)"*
- [ ] **FE-NEW-05**: Disclaimer AI di halaman AI Generator — feedback Bu Rizka.
  - [ ] Banner: *"Hasil AI tidak selalu 100% akurat. Verifikasi manual sebelum dipublikasikan."*

### AI
- [ ] **AI-NEW-01**: Dynamic prompt length — jumlah soal mengikuti input user, bukan hardcode 5.
- [ ] **AI-NEW-02**: Rekomendasi panjang kata Anagram per jenjang di prompt & hint builder.
  - [ ] SD ≤5 huruf | SMP ≤7 huruf | SMA ≤10 huruf | Kuliah bebas.

### QA & Testing
- [ ] **QA-04**: Menguji semua 6 template gameplay Sprint 2.
- [ ] **QA-05**: Menguji filter validasi jenjang pendidikan.
- [ ] **QA-NEW-01**: Test sistem approval Teacher end-to-end.

---

## 🤖 Sprint 3: AI-Quiz, Smart Grading & Analytics (To Do)

### AI & Engine
- [ ] **AI-05**: Generate soal otomatis dari topik materi.
  - [ ] Perbaikan prompt: hindari halusinasi, paksa 1 kata tanpa spasi untuk Anagram/Hangman.
  - [ ] Dynamic prompt length (jumlah soal sesuai request).
  - [ ] Prompt Maze Chase: AI wajib generate field `wrongAnswers`.
  - [ ] Prompt Anagram: sertakan rekomendasi panjang kata sesuai jenjang.
- [ ] **AI-06**: Feedback AI untuk jawaban salah (< 100 kata).
- [ ] **AI-07**: Sistem penilai jawaban essay otomatis.
- [ ] **AI-08**: Prompt engineering & tuning untuk akurasi >85%.
- [ ] **AI-09**: Monitor usage quota Groq & Gemini.
- [ ] **AI-10**: Adaptive Difficulty — soal menyesuaikan performa siswa.

### Backend (BE)
- [ ] **BE-15**: Analytics performa student (history skor, total play).
- [ ] **BE-16**: Statistik kelas (rata-rata skor, distribusi nilai).
- [ ] **BE-17**: Smart grading API — terima jawaban, return skor & justifikasi AI.
- [ ] **BE-18**: API Adaptive difficulty.

### Frontend (FE)
- [ ] **FE-17**: Halaman AI Quiz Generator (input topik → generate → preview + disclaimer).
- [ ] **FE-18**: Feedback AI di Result Page per soal yang salah.
- [ ] **FE-19**: Analytics Dashboard — grafik performa student.
- [ ] **FE-20**: Analytics Dashboard — statistik kelas untuk guru/creator.

### QA
- [ ] **QA-06**: Menguji fitur AI Sprint 3.

---

## 🚀 Sprint 4: Polish, Responsif & Deployment (To Do)
*(Moodle/LTI TIDAK dikerjakan — ini project lanjutan)*

- [ ] **FE-21**: Seluruh halaman responsif di semua perangkat (360px, 768px, 1280px).
- [ ] **FE-22**: Dark mode / accessibility improvements (opsional).
- [ ] **DEPLOY-01**: Setup hosting ke **server departemen**.
  - [ ] Koordinasi dengan Bu Rizka / Pak Ridho / admin lab untuk akses server.
  - [ ] Setup environment: Docker, PostgreSQL, Redis di server.
  - [ ] Konfigurasi domain/subdomain agar bisa diakses via internet.
  - [ ] Setup CI/CD sederhana atau deploy manual via SSH.
- [ ] **QA-07**: Menguji seluruh flow E2E di environment production (server dept).

---

## 🏁 Sprint 5: Finalisasi & Handover (To Do)
- [ ] **PM-04**: Laporan akhir & presentasi demo ke dosen.
- [ ] **QA-08**: UAT dengan min. 10 pengguna nyata multi-jenjang.
- [ ] **QA-09**: Laporan testing final komprehensif.
- [ ] **DEMO-01**: Demo per jenjang untuk review Bu Henning.
  - [ ] SD: semua game fully functional.
  - [ ] SMP: semua game fully functional.
  - [ ] SMA: semua game fully functional.

---

## 📌 Keputusan Final dari Zoom (23 April 2026)

| # | Keputusan | Detail |
|---|-----------|--------|
| 1 | **Moodle TIDAK jadi** | Integrasi LTI adalah project lanjutan, bukan scope ini |
| 2 | Prioritas standalone | Fokus full ke web app mandiri |
| 3 | Target per jenjang | SD selesai dulu → SMP → SMA |
| 4 | Sistem approval Teacher | PENDING sampai Admin approve. Admin tidak bisa register sendiri |
| 5 | Satu jenjang per Teacher | Radio button, bukan multi-select |
| 6 | Rekomendasi panjang Anagram | SD ≤5 huruf, SMP ≤7, SMA ≤10 (saran, bukan paksa) |
| 7 | Format nama siswa | Saran: Kelas_Nama (contoh: 3A_Nayla) |
| 8 | Disclaimer AI wajib | Di halaman AI Generator — hasil tidak selalu akurat |
| 9 | Edit sebelum Publish | Tombol Edit tersedia di Preview sebelum dipublikasikan |
| 10 | Hosting | Server departemen (koordinasi Bu Rizka / Pak Ridho / admin lab) |
| 11 | Benchmark | Ikuti pola Quizizz & WordWall |
