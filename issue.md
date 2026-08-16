# 📋 Daftar Temuan / Issues — tumbuhbelajar.my.id

> **Referensi**: Analisis codebase pada branch `main` (commit `0601f2f`).
> **Platform**: Next.js 16 (App Router) · TypeScript · Prisma (SQLite) · Tailwind CSS v4 · Sumopod AI API.

---

## 🐛 Bug & Kelemahan Kode

### 1. Missing `.env.example`
- **File** — root
- README (baris 23) menyuruh `cp .env.example .env`, namun **file `.env.example` tidak ada** di repo.
- **Dampak**: Developer baru tidak bisa menyiapkan environment.
- **Referensi env** yang dibaca kode:
  - `DATABASE_URL` (prisma/schema.prisma)
  - `SUMOPOD_BASE_URL`, `SUMOPOD_API_KEY` (src/lib/ai.ts)
- **Env** yang didokumentasikan di README: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MIDTRANS_SERVER_KEY`.

### 2. Broken links `/login` & `/register` (404)
- **File** — `src/app/page.tsx` (baris 21–24, 44, 47, 186, 217, 249, 262)
- Landing page menautkan ke `/login`, `/register`, `/register?plan=starter|premium`, namun **routes tersebut tidak ada**.
- **Dampak**: CTA utama ("Masuk", "Daftar Gratis", "Mulai Gratis", "Pilih Starter/Premium") semuanya menghasilkan 404.

### 3. Header statistik menggunakan data palsu (hardcoded)
- **File** — `src/app/page.tsx` (baris 59–76)
- Angka "10+ Guru Aktif", "500+ Siswa", "1000+ Soal TKA", "85% N-Gain" diketik statis (belum ada data nyata).
- **Dampak**: Klaim menyesatkan/berpotensi melanggar regulasi iklan padahal produk masih MVP.

### 4. `JSON.parse(subTopics || '[]')` rentan crash
- **File** — `src/app/api/ai/generate-questions/route.ts` (baris 37)
- Jika `subTopics` dari body berupa string yang bukan JSON valid, `JSON.parse` akan melempar error → ditangkap jadi 500.
- Tidak ada validasi/sanitasi input dari client.

### 5. `modelUsed` hardcoded di AI log
- **File** — `src/app/api/ai/generate-questions/route.ts` (baris 93)
- `modelUsed: 'MiniMax-M2.7-highspeed'` diketik manual, tidak diambil dari data respons AI (`callAI` tidak mengembalikan `model` yang dipakai).

### 6. Endpoints API tanpa autentikasi & autorisasi
- **File** — `src/app/api/games/route.ts` (GET & POST), `src/app/api/ai/generate-questions/route.ts`
- Tidak ada verifikasi session/user (NextAuth) siapa yang memanggil.
- **Dampak**: Siapa pun bisa membuat game, melihat seluruh game (termasuk orang lain), dan memakai kuota AI milik teacher mana pun (hanya menyangkut `teacherId` dari body).

---

## ⚠️ Inkonsistensi

### 7. README tidak sinkron dengan realita
- README klaim "Next.js 14" & "Framework: Next.js 14 (App Router)", padahal **package.json memakai `next: 16.3.1`** + `react: 19.2.8`.
- README menyebut struktur `src/components/` dan `src/styles/`, namun **keduanya tidak ada** di repo.
- README "Production Deploy" menyebut "ready for Vercel/GitHub Pages" — Vercel sudah via `vercel.json`, GitHub Pages tidak dibahas.

### 8. Dua lockfile manajer paket
- Terdapat **`package-lock.json` (npm)** dan **`pnpm-lock.yaml` + `pnpm-workspace.yaml`**.
- `vercel.json` menginstal dengan **pnpm**, sementara README menyuruh **npm install**.
- **Rekomendasi**: pilih satu standar (pnpm) agar lockfile konsisten.

### 9. Label pricing salah / typo
- **File** — `src/app/page.tsx`
  - Baris 223: card yang seharusnya **Pro** (Rp 50.000/bln) justru diberi label header **"Premium"** (dan isi "Unlimited tudo" — campur bahasa, typo).
  - Baris 224→226: harga Rp 100.000 dengan deskripsi "Unlimited tudo".
  - Sinkronkan kartu Free / Starter / Pro / Premium dengan tabel harga di README (Rp 0 / 25rb / 50rb / 100rb).

### 10. Karakter non-ASCII dalam prompt AI
- **File** — `src/lib/ai.ts` (baris ~124)
- Prompt `analyzeClass` mengandung kata "分布" (karakter Cina, maksud "distribution"). Sebaiknya diganti Bahasa Indonesia.

---

## 🎯 Status Fitur (ceklist README)

- [x] Landing page dengan pricing
- [x] Database schema (Prisma + SQLite)
- [x] AI question generation (Sumopod)
- [ ] Teacher dashboard
- [ ] Student game interface
- [ ] Google OAuth login (NextAuth belum terpasang/config)
- [ ] Document generation (RPP, LKPD)
- [ ] Analytics & N-Gain calculation
- [ ] Payment integration (Midtrans)
- [ ] Affiliate system

---

## ✅ Kekuatan yang Dipertahankan
- Skema database matang & komprehensif (auth, kelas, game, AI usage, subscription, referral, audit) dengan relasi cascade yang baik.
- Lapisan AI terpisah & bersih (`src/lib/ai.ts`) dengan estimasi biaya per request dalam Rupiah.
- Landing page lengkap secara visual.
- TypeScript strict + alias path `@/*`.
