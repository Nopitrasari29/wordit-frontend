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
- [x] **FE-NEW-01**: Fitur **Edit sebelum Publish** — feedback Bu Rizka.
  - [x] Tombol "Edit" tersedia di `PreviewGamePage.tsx` dan `EditGamePage.tsx` fungsional.
  - [x] Alur: Buat Game → Preview → Edit (revisi) → Publish. ✅

### Frontend (FE) - Student Arena
> Kerjakan satu per satu. Selesaikan SD dulu sebelum lanjut SMP/SMA.

- [x] **FE-14-Anagram**: Fully functional ✅ (benchmark untuk engine lain)
- [x] **FE-14-Flashcard**: Upgrade ke "Active Recall".
  - [x] Tombol "Hafal ✅" & "Lupa ❌" fungsional.
  - [x] `finishGame()` dipanggil di akhir game.
- [x] **FE-14-Hangman**: Upgrade dengan sistem nyawa.
  - [x] Maks 6 kesalahan per kata.
  - [x] `finishGame()` dipanggil di akhir game.
- [x] **FE-14-WordSearch**: Upgrade dari grid statis ke interaktif.
  - [x] Algoritma Grid Generator & highlight interaktif fungsional.
  - [x] `finishGame()` dipanggil di akhir game.
- [x] **FE-14-MazeChase**: Upgrade dari dummy ke labirin interaktif.
  - [x] Pergerakan karakter & portal jawaban fungsional.
  - [x] `finishGame()` dipanggil di akhir game.
- [x] **FE-14-SpinWheel**: Upgrade agar siswa input jawaban manual.
  - [x] Input teks setelah roda berhenti & validasi fungsional.
  - [x] `finishGame()` dipanggil di akhir game.
- [x] **FE-15**: Result Page (skor total, akurasi, breakdown, rating bintang).
- [x] **FE-16**: Overlay ranking muncul tiap akhir soal.

### Frontend (FE) - Admin Dashboard
- [x] **FE-NEW-02**: Halaman Admin Dashboard.
  - [x] List semua user + status approval di `UserManagementPage.tsx`.
  - [x] Tombol **Approve / Reject** fungsional tersambung ke API.
  - [x] Fitur ganti role & hapus user fungsional.

### Frontend (FE) - Auth & UX
- [x] **FE-NEW-03**: Update halaman Register — Teacher harus pilih 1 jenjang (radio button). ✅
- [x] **FE-NEW-04**: Panduan format username siswa di EnterPlayerPage. ✅
  - [x] Tambah placeholder/hint: *"Contoh: 3A_Nayla (format: Kelas_Nama)"*
- [x] **FE-NEW-05**: Disclaimer AI di halaman AI Generator — feedback Bu Rizka. ✅
  - [x] Banner: *"Hasil AI tidak selalu 100% akurat. Verifikasi manual sebelum dipublikasikan."*

### AI
- [x] **AI-NEW-01**: Dynamic prompt length — jumlah soal mengikuti input user. ✅
- [x] **AI-NEW-02**: Rekomendasi panjang kata Anagram per jenjang di prompt. ✅

### QA & Testing
- [ ] **QA-04**: Menguji semua 6 template gameplay Sprint 2.
- [ ] **QA-05**: Menguji filter validasi jenjang pendidikan.
- [ ] **QA-NEW-01**: Test sistem approval Teacher end-to-end.

---

## 🤖 Sprint 3: AI, Smart Grading & Analytics (To Do)
*(Fokus: AI Integration, Telegram Bot Automation, & Dashboard Real-Data)*

### I. AI Integration (The Brain)
- [x] **AI-05**: Auto-quiz Generation (Topic to Quiz)
  - [x] Input topik + level → Groq generate soal dalam < 8 detik.
  - [x] Validasi JSON mutlak agar tidak ada halusinasi (khusus Anagram/Hangman).
  - [ ] **NOTED**: Pastikan jumlah soal akurat sesuai input user (tambahkan looping/retry jika AI memberikan soal kurang dari jumlah request). ✅
- [x] **AI-06**: AI Feedback Per Soal
  - [x] Penjelasan edukatif < 100 kata untuk jawaban salah dalam < 5 detik via Groq/Gemini.
- [x] **AI-07**: Smart Grading (Essay)
  - [x] AI menilai jawaban essay, return skor 0-100 + justifikasi. Target akurasi > 85%.
- [ ] **AI-08**: Prompt Engineering & Tuning
  - [ ] Optimasi prompt agar respons konsisten dan minimalisir halusinasi data.
  - [ ] **NOTED**: Perbaiki mapping prompt khusus untuk format template MATCHING agar sesuai struktur `pairs` (kiri-kanan).
- [ ] **AI-09**: AI Quota Monitoring
  - [ ] Logging penggunaan API & sistem alert jika mendekati limit harian.
- [x] **AI-10**: Adaptive Difficulty (Dynamic Gameplay)
  - [x] Sistem otomatis: Naik ke Hard jika accuracy > 80%, turun ke Easy jika < 50%.

### II. Backend (BE) - Machine & Automation
- [x] **BE-15**: Analytics Performa Student (Real Data Aggregation)
  - [x] Hapus hardcoded stats; gunakan Prisma Aggregation (GroupBy & Avg).
  - [x] Kalkulasi history skor dan akurasi dinamis dari tabel Result.
- [x] **BE-16**: Auto-Group Analytics (Creator View)
  - [x] Logika parsing awalan nama (regex: `Kelas_`) untuk pengelompokan otomatis.
  - [x] Endpoint `GET /api/analytics/game/:id` (distribusi nilai per kelompok & topik sulit).
- [x] **BE-17**: Smart Grading API
  - [x] Endpoint `POST /api/ai/grade` terintegrasi dengan logika penilaian AI.
- [x] **BE-18**: Adaptive Difficulty Logic
  - [x] Integrasi ke game session untuk pemilihan bank soal sesuai performa pemain.
- [x] **BE-19**: Telegram Approval Bot System 🚀 [REVISED]
  - [x] Setup `telegraf` atau `node-telegram-bot-api` & Token @BotFather di `.env`.
  - [x] Fungsi `sendApprovalRequestToTele` dengan Inline Buttons (Approve ✅ / Reject ❌).
  - [x] Implementasi Callback Query Listener untuk update `approvalStatus` di DB via Prisma langsung dari chat Telegram.
- [x] **BE-20**: Admin Notification Dispatcher
  - [x] Logika Socket.io untuk emit notifikasi ke room admin saat ada pendaftar baru.
- [x] **BE-NEW-05**: Standard Assessment Engine (Files & Logic)
  - [x] **`prisma/schema.prisma`**: Tambah `MULTIPLE_CHOICE`, `TRUE_FALSE`, `MATCHING`, `ESSAY` di enum `TemplateType`. Jalankan `prisma migrate dev`.
  - [x] **`src/modules/game/game.schema.ts`**: Update skema Zod. Tentukan struktur JSON valid untuk masing-masing 4 tipe game ini.
  - [x] **`src/modules/game/game.service.ts`**: Pastikan 4 game ini bisa dibuat untuk semua jenjang (`educationLevel`). Update fungsi kalkulasi di dalam `finishGame` untuk menilai Multiple Choice, True/False, dan Matching secara otomatis.
  - [x] **`src/modules/ai/ai.service.ts`**: Buat fungsi generator baru (contoh: `generateMultipleChoice`) dengan prompt yang menghasilkan struktur JSON persis sesuai `game.schema.ts`.
  - [x] **`src/modules/ai/smart-grading.service.ts` [NEW FILE]**: File khusus menangani logika AI Smart Grading untuk tipe Essay.

### III. Frontend (FE) - UI, UX & Alerts
- [ ] **FE-17**: Halaman AI Quiz Generator (Full Flow)
  - [x] UI Input topik, preview hasil AI, edit konten, & banner disclaimer AI.
  - [ ] **NOTED**: AI masih belum mematuhi strict count soal (misal minta 10 keluar 5).
- [ ] **FE-18**: Feedback AI di Result Page
  - [ ] Komponen penjelasan AI yang muncul di breakdown kuis untuk tiap soal salah (Saat ini masih pakai teks dummy simulasi).
- [ ] **FE-19**: Analytics Dashboard Siswa (Personal Growth & Gamification)
  - [ ] **Konsep**: Fokus memotivasi siswa secara individu dengan melihat progres mereka.
  - [ ] **Statistik Utama**: Hubungkan `AnalyticsStudentPage.tsx` dengan database untuk menampilkan *Total Kuis Dimainkan*, *Rata-Rata Akurasi*, dan *Total Waktu Belajar*.
  - [ ] **Riwayat (History)**: Buat daftar/tabel riwayat kuis terakhir yang dimainkan lengkap dengan skor dan tanggal.
  - [ ] **Badges (Gamification)**: Siswa bisa mendapat medali otomatis (misal: Emas untuk skor 100, Kilat untuk waktu < 1 menit, Rajin untuk > 5 game).
- [ ] **FE-20**: Analytics Dashboard Guru (Zero Setup Auto-Grouping)
  - [x] **Bug Fix**: Memperbaiki masalah blank page saat menekan tombol "Lihat Detail" pada daftar kelas atau saat menekan tombol "Kembali".
  - [ ] **Bug Fix**: Pastikan hanya data siswa (role STUDENT) yang dimasukkan ke dalam daftar, jangan sertakan akun Guru yang ikut mencoba kuis.
  - [ ] **Konsep Auto-Grouping**: Guru tidak perlu repot membuat kelas dan menginput siswa manual. Sistem memotong teks sebelum garis bawah `_` pada nama pemain (Contoh: input `3A_Budi` otomatis membuat grup `3A`).
  - [ ] **Halaman Daftar Kelas (`ClassPage.tsx`)**: Tampilkan kartu kelompok (misal: Card Kelas 3A, Kelas 3B) yang berisi Total Siswa dan Rata-rata Skor per kelompok.
  - [ ] **Halaman Detail Kelas (`AnalyticsClassPage.tsx`)**: Menampilkan grafik performa kuis yang dimainkan oleh kelas spesifik tersebut, serta list "Siswa Perlu Perhatian Khusus" (skor < 60) lengkap dengan tombol tindak lanjut.
- [x] **FE-21**: Standard Assessment - Multiple Choice (Semua Jenjang)
  - [x] **[NEW FILE] `src/components/game/builder/MultipleChoiceBuilder.tsx`**: Form pembuat soal, 4 opsi jawaban, penentu kunci jawaban.
  - [x] **[NEW FILE] `src/components/game/engines/MultipleChoiceEngine.tsx`**: UI kuis bergaya modern saat dimainkan (timer, highlight klik).
- [x] **FE-22**: Standard Assessment - True/False (Semua Jenjang)
  - [x] **[NEW FILE] `src/components/game/builder/TrueFalseBuilder.tsx`**: Form pembuat pernyataan & Set Benar/Salah.
  - [x] **[NEW FILE] `src/components/game/engines/TrueFalseEngine.tsx`**: Mekanisme UI Swipe Kiri/Kanan ala Tinder.
- [x] **FE-23**: Standard Assessment - Drag & Drop / Matching (Semua Jenjang)
  - [x] **[NEW FILE] `src/components/game/builder/MatchingBuilder.tsx`**: Form pasangan jawaban (Kiri dan Kanan).
  - [x] **[NEW FILE] `src/components/game/engines/MatchingEngine.tsx`**: Implementasi library `@dnd-kit` untuk fitur tarik-pasang.
  - [ ] **NOTED**: AI Generator untuk Matching masih gagal mapping format `pairs` kiri/kanan.
- [x] **FE-24**: Standard Assessment - Smart Essay (Semua Jenjang)
  - [x] **[NEW FILE] `src/components/game/builder/EssayBuilder.tsx`**: Form soal & Kata Kunci untuk patokan nilai AI.
  - [x] **[NEW FILE] `src/components/game/engines/EssayEngine.tsx`**: Textarea jawaban siswa & trigger AI Grading di akhir soal.
  - [ ] **NOTED**: AI Grading di Essay Engine belum konek ke API real backend, masih pakai mock function lokal.
- [x] **FE-NEW-06**: Update Main Components & Routing
  - [x] **`src/pages/creator/CreateGamePage.tsx`**: Tambah 4 opsi template baru ke menu pemilihan guru.
  - [x] **`src/components/game/GameEngineSelector.tsx`**: Arahkan routing player agar memuat *Engine* yang tepat sesuai tipe kuis.
  - [x] **Bug Fix**: Sinkronisasi module router dan renderer (termasuk prop `onIntermission`).
- [ ] **FE-NEW-06**: Admin Navigation Handling
  - [ ] Memastikan Dashboard Admin otomatis terupdate (refetch data) saat status user berubah via Telegram.
- [ ] **FE-NEW-07**: Real-time Admin Alerts (Badge & Toast)
  - [ ] **Badge Count**: Angka merah pada menu "Users" untuk jumlah status PENDING.
  - [ ] **Live Toast**: Notifikasi pop-up instan via `react-hot-toast` saat ada guru daftar.

### IV. QA & Validation
- [ ] **QA-06**: Stress Test AI Generator
  - [ ] Menguji 10 topik berbeda secara simultan untuk memastikan JSON tidak break.
- [ ] **QA-07**: End-to-End Telegram Approval Flow 📱 [REVISED]
  - [ ] Uji coba: Guru Register -> Bot kirim pesan ke Admin -> Admin klik Approve di HP -> Status di DB & Web berubah otomatis.
- [ ] **QA-08**: Validation Analytics Accuracy
  - [ ] Memastikan hitungan rata-rata di dashboard FE sesuai dengan data asli di PostgreSQL.

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
