import { Link } from "react-router-dom";
import Hero from "../../components/ui/Hero";
import FeatureCard from "../../components/ui/FeatureCard";

export default function LandingPage() {
  return (
    <div className="bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. HYBRID MODES SECTION */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Dekorasi Tambahan */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
              Pilih Mode Belajarmu 🚀
            </h2>
            <p className="text-slate-500 font-bold text-lg">Sesuaikan WordIT dengan kebutuhan pengajaran Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Mode Moodle */}
            <div className="group bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl shadow-indigo-200 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl group-hover:scale-110 transition-transform">🎓</div>
              <h3 className="text-3xl md:text-4xl font-black mb-6">Moodle Integration</h3>
              <p className="text-indigo-100 font-semibold text-lg leading-relaxed mb-8">
                Sinkronkan nilai dan kuis WordIT langsung ke dalam kursus Moodle Anda menggunakan standar LTI 1.3. Belajar lebih terstruktur dan privat.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                🔗 LMS Sync Active
              </div>
            </div>

            {/* Mode Public */}
            <div className="group bg-gradient-to-br from-slate-800 to-slate-950 rounded-[3.5rem] p-10 md:p-14 text-white shadow-2xl shadow-slate-300 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl group-hover:scale-110 transition-transform">🌐</div>
              <h3 className="text-3xl md:text-4xl font-black mb-6">Public Gallery</h3>
              <p className="text-slate-400 font-semibold text-lg leading-relaxed mb-8">
                Publikasikan game buatanmu atau gunakan ribuan kuis gratis dari komunitas pengajar global. Belajar tanpa batas kapan saja.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                🌍 Open for Everyone
              </div>
            </div>
          </div>
        </div>

        {/* WAVE TRANSITION KE BAWAH */}
        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L1440 120L1440 0C1440 0 1140 120 720 120C300 120 0 0 0 0L0 120Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <div className="bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

        {/* 3. VALUE FEATURES */}
        <section className="bg-white py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-16 text-slate-900 tracking-tighter italic">
              Powerful Features ✨
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard title="Auto-Grading" desc="Hasil permainan siswa di Moodle otomatis masuk ke Gradebook." icon="📝" />
              <FeatureCard title="Global Library" desc="Akses bank soal publik untuk berbagai mata pelajaran." icon="📚" />
              <FeatureCard title="SSO Security" desc="Keamanan data siswa maksimal dengan integrasi Moodle." icon="🛡️" />
            </div>
          </div>

          {/* WAVE TRANSITION: Dari Putih ke Abu-abu (Slate-50) */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px]">
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C49.1,15.1,104.13,32,165,42.26,220.44,51.62,271.39,57.44,321.39,56.44Z"
                fill="#f8fafc"
              ></path>
            </svg>
          </div>
        </section>

        {/* 4. ALUR KERJA */}
        <section className="bg-slate-50 py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic">Alur Kerja WordIT</h2>
              <div className="h-1.5 w-20 bg-indigo-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-8 border-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">1</div>
                <h3 className="text-xl md:text-2xl font-black mt-8 mb-3 text-slate-800 uppercase tracking-tighter">Build or Pick</h3>
                <p className="text-slate-500 font-bold leading-relaxed text-sm md:text-base">Buat kuis sendiri atau ambil dari galeri publik yang tersedia.</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-8 border-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">2</div>
                <h3 className="text-xl md:text-2xl font-black mt-8 mb-3 text-slate-800 uppercase tracking-tighter">Embed or Link</h3>
                <p className="text-slate-500 font-bold leading-relaxed text-sm md:text-base">Pasang langsung di Moodle (LTI) atau cukup bagikan link publik.</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 border-8 border-indigo-100 text-white rounded-[2.5rem] flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">3</div>
                <h3 className="text-xl md:text-2xl font-black mt-8 mb-3 text-slate-800 uppercase tracking-tighter">Analyze</h3>
                <p className="text-slate-500 font-bold leading-relaxed text-sm md:text-base">Pantau perkembangan belajar siswa di dashboard cerdas Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FINAL CTA */}
        <section className="bg-slate-50 pb-24 md:pb-32 px-4 relative z-10">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-center relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden group">

            <div className="absolute top-0 left-0 w-full h-full opacity-5 animate-pulse bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Dekorasi Blob di dalam CTA */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>

            <h2 className="text-3xl md:text-6xl font-black mb-10 text-white italic relative z-10 tracking-tighter leading-[1.1]">
              Siap Menghidupkan <br className="hidden md:block" /> Kelas Anda?
            </h2>

            <div className="flex flex-col sm:flex-row gap-5 justify-center relative z-10">
              <Link to="/register" className="bg-indigo-600 text-white px-10 py-4 md:px-12 md:py-5 rounded-full font-black text-lg md:text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20">
                Coba Gratis Sekarang
              </Link>
              <Link to="/explore" className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-10 py-4 md:px-12 md:py-5 rounded-full font-black text-lg md:text-xl hover:bg-white/20 transition-all">
                Lihat Galeri ➔
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}