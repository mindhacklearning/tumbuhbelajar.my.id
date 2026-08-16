// Small inline icon set (dependency-free, avoids import churn)
function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-gray-900 antialiased">
      {/* ===== Header ===== */}
      <header className="border-b bg-white/85 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">TB</span>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg text-gray-900 block">TumbuhBelajar</span>
              <span className="text-[11px] text-gray-500 -mt-0.5 block">Game Edukasi Matematika SMP</span>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <a href="#manfaat" className="hover:text-blue-600 transition">Manfaat</a>
            <a href="#cara" className="hover:text-blue-600 transition">Cara Kerja</a>
            <a href="#harga" className="hover:text-blue-600 transition">Harga</a>
            <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Masuk</a>
            <a href="/register" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm">
              Daftar Gratis
            </a>
          </div>
        </div>
      </header>

      {/* ===== Hero (fokus ke guru) ===== */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Icon d="M11.998 2 13.2 8.2L19.4 9.4l-6.2 1.2-1.2 6.2-1.2-6.2L4.6 9.4l6.2-1.2z" className="w-4 h-4" />
          <span>Dibuat khusus untuk Guru Matematika SMP</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Hemat waktu persiapan mengajar,
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">siswa belajar lebih paham</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          TumbuhBelajar membantu Anda menyiapkan soal, RPP, dan LKPD berstandar Kurikulum Merdeka
          dengan bantuan AI — lalu mengajak siswa bermain game Matematika yang seru.
          Otomatis muncul analitik N-Gain &amp; rekomendasi perbaikan.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Daftar Gratis untuk Guru
          </a>
          <a href="#demo" className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 font-medium">
            <Icon d="M8 5.14v14l11-7-11-7z" className="w-5 h-5" />
            Lihat cara kerjanya
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-5">
          Tanpa kartu kredit · 14 hari gratis · Harga mulai Rp 25.000/bulan
        </p>
      </section>

      {/* ===== Value props (fakta produk, bukan angka pengguna palsu) ===== */}
      <section className="border-y bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <div className="text-3xl font-extrabold text-blue-600">6 misi</div>
            <div className="text-sm text-gray-500 mt-1">per game detektif</div>
          </div>
          <div className="p-2">
            <div className="text-3xl font-extrabold text-blue-600">15 soal</div>
            <div className="text-sm text-gray-500 mt-1">TKA per misi</div>
          </div>
          <div className="p-2">
            <div className="text-3xl font-extrabold text-blue-600">&lt; 1 menit</div>
            <div className="text-sm text-gray-500 mt-1">generate soal + RPP dengan AI</div>
          </div>
          <div className="p-2">
            <div className="text-3xl font-extrabold text-blue-600">N-Gain</div>
            <div className="text-sm text-gray-500 mt-1">analitik otomatis per siswa</div>
          </div>
        </div>
      </section>

      {/* ===== Manfaat (pain-driven, khusus guru) ===== */}
      <section id="manfaat" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Manfaat untuk Guru</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">
              Fokus pada yang terpenting: <span className="text-blue-600">mengajar</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Kurangi pekerjaan administrasi yang berulang. AI menangani soal, perangkat ajar, dan laporan —
              Anda punya lebih banyak waktu untuk mendampingi siswa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'M17 8h2a3 3 0 0 1 3 3v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8a3 3 0 0 1 3-3h2m4-4v4m-6-1a17 17 0 0 1 12 0M7 14h.01M11 14h.01M15 14h.01M7 18h.01M11 18h.01M15 18h.01',
                title: 'Soal TKA instan dengan AI',
                desc: 'Pilih topik &amp; tingkat kesulitan, AI menyusun 15 soal pilihan ganda berstandar TKA lengkap dengan kunci &amp; pembahasan.',
              },
              {
                icon: 'M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-6 3.5V19m6-9.5V19m0-12V4m-3 9h6m-9 6h6M4 13a8 8 0 1 0 16 0h-3m0 0-2-2m2 2 2 2',
                title: 'RPP &amp; LKPD Kurikulum Merdeka',
                desc: 'Generate RPP lengkap dan LKPD siap pakai yang mendukung pembelajaran berdiferensiasi dan asesmen awal.',
              },
              {
                icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z',
                title: 'Analitik N-Gain otomatis',
                desc: 'Nilai, kekuatan, dan area yang perlu penguatan tiap siswa terangkum otomatis — siap disajikan dalam rapor asesmen.',
              },
              {
                icon: 'M14 8h5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-5m-6 8V7a1 1 0 0 1 1-1h2m6-2h4v4m0-4L3 18M17 10h.01',
                title: 'Rekomendasi AI per siswa',
                desc: 'Dapatkan intervensi yang disarankan per siswa — dari data diagnosis hingga aspek non-kognitif seperti motivasi.',
              },
              {
                icon: 'M10 9V6l-2 3H4v7h14a3 3 0 0 0 0-6h-6V7h4m0 0V4m0 3-2-3',
                title: 'Game Detektif Data',
                desc: 'Siswa menyelesaikan 6 misi penuh cerita tanpa merasa sedang ujian. Belajar sambil bermain meningkatkan keaktifan.',
              },
              {
                icon: 'M9 12l2 2 4-4m5.6-2.6A2 2 0 0 0 21 5.5V4a1 1 0 0 0-1-1h-1.5a2 2 0 0 0-1.4.6L9 12l-4 4-1 3 3-1 3-3 7.4-7.4Z',
                title: 'Tersedia 1–3–7 kelas',
                desc: 'Plan Starter hingga Premium mengikuti kebutuhan Anda — dari 1 kelas hingga unlimited untuk sekolah &amp; bimbel.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon d={f.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cara kerja (3 langkah guru) ===== */}
      <section id="cara" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Cara Kerja</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">Mulai dalam 3 langkah</h2>
            <p className="text-gray-600 text-lg">Tidak perlu pengalaman teknis. Semua otomatis.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Buat game', desc: 'Pilih topik dan kesulitan, lalu biarkan AI menyusun soal TKA beserta RPP/LKPD.' },
              { step: '02', title: 'Bagikan kode kelas', desc: 'Siswa masuk lewat kode kelas dan mulai bermain 6 misi detektif dari HP mereka.' },
              { step: '03', title: 'Lihat laporan', desc: 'Analitik N-Gain dan rekomendasi AI tersusun otomatis untuk tiap siswa.' },
            ].map((s, i) => (
              <div key={i} className="relative bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-bl-2xl rounded-tr-2xl">{s.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Untuk siapa (segmentasi guru + bimbel) ===== */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Untuk Siapa</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">Dibuat untuk Anda</h2>
            <p className="text-gray-600 text-lg">Dirancang khusus untuk kebutuhan guru Matematika di Indonesia.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="border-2 border-blue-600 rounded-2xl p-8 relative bg-white shadow-sm">
              <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Utama</div>
              <div className="text-lg font-extrabold text-gray-900 mb-1">Guru Matematika SMP</div>
              <p className="text-gray-600 text-sm mb-4">Negeri maupun swasta</p>
              <ul className="space-y-3 text-sm text-gray-700">
                {['Hemat waktu menyusun soal &amp; perangkat ajar', 'Mendukung Kurikulum Merdeka &amp; asesmen diagnostik', 'Report N-Gain siap untuk rapor asesmen', 'Harga terjangkau, mulai Rp 25.000/bulan'].map((li, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-sm">
              <div className="text-lg font-extrabold text-gray-900 mb-1">Bimbel &amp; Sekolah</div>
              <p className="text-gray-600 text-sm mb-4">Untuk beberapa kelas</p>
              <ul className="space-y-3 text-sm text-gray-700">
                {['Konten &amp; analitik siap pakai untuk banyak siswa', 'Laporan ke orang tua secara otomatis', 'Plan Pro &amp; Premium 4–7 kelas atau unlimited', 'Dukungan prioritas'].map((li, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Icon d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Harga ===== */}
      <section id="harga" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Harga</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">Harga transparan</h2>
            <p className="text-gray-600 text-lg">Mulai gratis. Upgrade kapan saja sesuai kebutuhan kelas Anda.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="font-bold text-gray-700 mb-1">Free</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-3">Rp 0<span className="text-base font-normal text-gray-400">/bln</span></div>
              <p className="text-gray-500 text-sm mb-6">Coba &amp; demo</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8 flex-1">
                {['1 game demo', 'Analitik dasar', '5 aksi AI'].map((li, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" className="w-5 h-5 text-emerald-500 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
              <a href="/register" className="block text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Daftar Gratis</a>
            </div>
            {/* Starter */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-6 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Populer</div>
              <div className="font-bold text-blue-700 mb-1">Starter</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-3">Rp 25.000<span className="text-base font-normal text-gray-400">/bln</span></div>
              <p className="text-gray-500 text-sm mb-6">Untuk 1–3 kelas</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8 flex-1">
                {['Unlimited games', '50 aksi AI/bulan', 'Generate soal &amp; RPP/LKPD', 'Analitik N-Gain dasar'].map((li, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" className="w-5 h-5 text-emerald-500 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
              <a href="/register?plan=starter" className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium text-sm">Pilih Starter</a>
            </div>

            {/* Pro */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="font-bold text-gray-700 mb-1">Pro</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-3">Rp 50.000<span className="text-base font-normal text-gray-400">/bln</span></div>
              <p className="text-gray-500 text-sm mb-6">Untuk 4–7 kelas</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8 flex-1">
                {['Semua di Starter', 'AI unlimited', 'Generate RPP/LKPD lebih lengkap', 'Laporan orang tua'].map((li, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" className="w-5 h-5 text-emerald-500 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
              <a href="/register?plan=pro" className="block text-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium text-sm">Pilih Pro</a>
            </div>
            {/* Premium */}
            <div className="bg-white border-2 border-purple-600 rounded-2xl p-6 flex flex-col">
              <div className="font-bold text-purple-700 mb-1">Premium</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-3">Rp 100.000<span className="text-base font-normal text-gray-400">/bln</span></div>
              <p className="text-gray-500 text-sm mb-6">Unlimited kelas</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8 flex-1">
                {['Semua di Pro', 'Kedalaman analitik penuh', 'Semua fitur tanpa batas', 'Dukungan prioritas'].map((li, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" className="w-5 h-5 text-purple-500 shrink-0" />
                    {li}
                  </li>
                ))}
              </ul>
              <a href="/register?plan=premium" className="block text-center border border-purple-600 text-purple-600 px-4 py-2.5 rounded-xl hover:bg-purple-50 transition font-medium text-sm">Pilih Premium</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">Pertanyaan yang sering diajukan</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Apakah siswa perlu menginstal aplikasi?', a: 'Tidak. Siswa cukup membuka situs dari HP/komputer dan masuk dengan kode kelas — tanpa instalasi.' },
              { q: 'Apakah saya perlu bisa coding atau teknisi?', a: 'Tidak sama sekali. Anda memilih topik dan kesulitan; soal, RPP, dan LKPD dibuat otomatis oleh AI.' },
              { q: 'Bagaimana dengan Kurikulum Merdeka?', a: 'RPP/LKPD mendukung pembelajaran berdiferensiasi dan asesmen awal, serta analitik N-Gain siap untuk rapor asesmen.' },
              { q: 'Bisakah saya mencoba dulu sebelum bayar?', a: 'Tentu. Daftar gratis untuk 1 game demo tanpa kartu kredit, lalu upgrade kapan saja.' },
              { q: 'Data siswa saya amankah?', a: 'Data tersimpan di database Anda, dan siswa hanya melihat progress miliknya tanpa detail jawaban orang lain.' },
            ].map((f, i) => (
              <details key={i} className="group bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 list-none">
                  {f.q}
                  <span className="ml-4 transition-transform group-open:rotate-45 text-blue-600">
                    <Icon d="M12 5v14M5 12h14" className="w-5 h-5" />
                  </span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA (fokus guru) ===== */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Mulai menghemat waktu mengajar Anda</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Daftar gratis dan coba 1 game demo selama 14 hari. Tanpa kartu kredit, kapan pun bisa dibatalkan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition shadow-lg">
              Daftar Gratis untuk Guru
            </a>
            <a href="#" className="text-blue-100 hover:text-white transition font-medium">
              Hubungi tim kami → 
            </a>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base">TB</span>
              </div>
              <span className="font-extrabold text-xl text-gray-900">TumbuhBelajar</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#manfaat" className="hover:text-blue-600 transition">Manfaat</a>
              <a href="#cara" className="hover:text-blue-600 transition">Cara Kerja</a>
              <a href="#harga" className="hover:text-blue-600 transition">Harga</a>
              <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2025 TumbuhBelajar.my.id — Game Edukasi Matematika SMP untuk Guru Indonesia.</p>
            <p className="flex items-center gap-2">
              Dibuat dengan
              <Icon d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z" className="w-4 h-4 text-rose-500" />
              untuk guru Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

