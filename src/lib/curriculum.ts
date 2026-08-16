// Daftar BAB & Sub-BAB Matematika SMP (Kurikulum Merdeka)
export interface SubBab {
  name: string
}

export interface Bab {
  id: string
  kelas: number
  bab: string
  subBabs: SubBab[]
}

export const MATH_CURRICULUM: Bab[] = [
  {
    id: '7-bab1',
    kelas: 7,
    bab: 'Bab 1: Bilangan Bulat',
    subBabs: [
      { name: 'Bilangan Bulat & Garis Bilangan' },
      { name: 'Operasi Hitung Bilangan Bulat' },
      { name: 'Bilangan Pecahan' },
      { name: 'Operasi Hitung Pecahan' },
    ],
  },
  {
    id: '7-bab2',
    kelas: 7,
    bab: 'Bab 2: Aljabar',
    subBabs: [
      { name: 'Bentuk Aljabar' },
      { name: 'Operasi Bentuk Aljabar' },
      { name: 'Penyederhanaan Aljabar' },
    ],
  },
  {
    id: '7-bab3',
    kelas: 7,
    bab: 'Bab 3: Persamaan & Pertidaksamaan Linear',
    subBabs: [
      { name: 'Persamaan Linear Satu Variabel' },
      { name: 'Pertidaksamaan Linear Satu Variabel' },
      { name: 'Aplikasi dalam Kehidupan Sehari-hari' },
    ],
  },
  {
    id: '7-bab4',
    kelas: 7,
    bab: 'Bab 4: Perbandingan',
    subBabs: [
      { name: 'Perbandingan Senilai' },
      { name: 'Perbandingan Berbalik Nilai' },
      { name: 'Skala' },
    ],
  },
  {
    id: '7-bab5',
    kelas: 7,
    bab: 'Bab 5: Garis & Sudut',
    subBabs: [
      { name: 'Garis' },
      { name: 'Hubungan Antar Sudut' },
      { name: 'Menggambar Sudut' },
    ],
  },
  {
    id: '7-bab6',
    kelas: 7,
    bab: 'Bab 6: Segiempat & Segitiga',
    subBabs: [
      { name: 'Sifat-sifat Segiempat' },
      { name: 'Keliling & Luas Segiempat' },
      { name: 'Sifat-sifat Segitiga' },
      { name: 'Keliling & Luas Segitiga' },
    ],
  },
  {
    id: '7-bab7',
    kelas: 7,
    bab: 'Bab 7: Penyajian Data',
    subBabs: [
      { name: 'Membaca Data (Tabel & Diagram)' },
      { name: 'Diagram Batang' },
      { name: 'Diagram Garis' },
      { name: 'Diagram Lingkaran' },
    ],
  },
  {
    id: '8-bab1',
    kelas: 8,
    bab: 'Bab 1: Bilangan Berpangkat',
    subBabs: [
      { name: 'Perpangkatan' },
      { name: 'Bentuk Akar' },
      { name: 'Notasi Ilmiah' },
    ],
  },
  {
    id: '8-bab2',
    kelas: 8,
    bab: 'Bab 2: Teorema Pythagoras',
    subBabs: [
      { name: 'Teorema Pythagoras' },
      { name: 'Tripel Pythagoras' },
      { name: 'Aplikasi Pythagoras' },
    ],
  },
  {
    id: '8-bab3',
    kelas: 8,
    bab: 'Bab 3: Relasi & Fungsi',
    subBabs: [
      { name: 'Relasi' },
      { name: 'Fungsi' },
      { name: 'Nilai Fungsi' },
      { name: 'Diagram Kartesius' },
    ],
  },
  {
    id: '8-bab4',
    kelas: 8,
    bab: 'Bab 4: Persamaan Garis Lurus',
    subBabs: [
      { name: 'Kemiringan Garis (Gradien)' },
      { name: 'Persamaan Garis Lurus' },
      { name: 'Grafik Garis Lurus' },
    ],
  },
  {
    id: '8-bab5',
    kelas: 8,
    bab: 'Bab 5: Sistem Persamaan Linear Dua Variabel (SPLDV)',
    subBabs: [
      { name: 'Konsep SPLDV' },
      { name: 'Metode Substitusi' },
      { name: 'Metode Eliminasi' },
      { name: 'Aplikasi SPLDV' },
    ],
  },
  {
    id: '8-bab6',
    kelas: 8,
    bab: 'Bab 6: Statistika',
    subBabs: [
      { name: 'Rata-rata (Mean)' },
      { name: 'Median' },
      { name: 'Modus' },
      { name: 'Jangkauan & Kuartil' },
    ],
  },
  {
    id: '8-bab7',
    kelas: 8,
    bab: 'Bab 7: Peluang',
    subBabs: [
      { name: 'Ruang Sampel' },
      { name: 'Peluang Teoretik' },
      { name: 'Peluang Empirik' },
    ],
  },
  {
    id: '8-bab8',
    kelas: 8,
    bab: 'Bab 8: Lingkaran',
    subBabs: [
      { name: 'Unsur-unsur Lingkaran' },
      { name: 'Keliling & Luas Lingkaran' },
      { name: 'Sudut Pusat & Sudut Keliling' },
      { name: 'Panjang Busur & Luas Juring' },
    ],
  },
  {
    id: '8-bab9',
    kelas: 8,
    bab: 'Bab 9: Bangun Ruang Sisi Datar',
    subBabs: [
      { name: 'Kubus' },
      { name: 'Balok' },
      { name: 'Prisma' },
      { name: 'Limas' },
      { name: 'Volume & Luas Permukaan' },
    ],
  },
  {
    id: '9-bab1',
    kelas: 9,
    bab: 'Bab 1: Perpangkatan & Bentuk Akar',
    subBabs: [
      { name: 'Perpangkatan & Sifat-sifatnya' },
      { name: 'Bentuk Akar & Penyederhanaan' },
      { name: 'Operasi Bentuk Akar' },
    ],
  },
  {
    id: '9-bab2',
    kelas: 9,
    bab: 'Bab 2: Persamaan & Fungsi Kuadrat',
    subBabs: [
      { name: 'Persamaan Kuadrat' },
      { name: 'Faktorisasi' },
      { name: 'Fungsi Kuadrat & Grafik' },
      { name: 'Aplikasi Persamaan Kuadrat' },
    ],
  },
  {
    id: '9-bab3',
    kelas: 9,
    bab: 'Bab 3: Transformasi Geometri',
    subBabs: [
      { name: 'Translasi' },
      { name: 'Refleksi' },
      { name: 'Rotasi' },
      { name: 'Dilatasi' },
    ],
  },
  {
    id: '9-bab4',
    kelas: 9,
    bab: 'Bab 4: Kesebangunan & Kekongruenan',
    subBabs: [
      { name: 'Kesebangunan Bangun Datar' },
      { name: 'Kekongruenan' },
      { name: 'Aplikasi Kesebangunan' },
    ],
  },
  {
    id: '9-bab5',
    kelas: 9,
    bab: 'Bab 5: Bangun Ruang Sisi Lengkung',
    subBabs: [
      { name: 'Tabung' },
      { name: 'Kerucut' },
      { name: 'Bola' },
      { name: 'Volume & Luas Permukaan' },
    ],
  },
  {
    id: '9-bab6',
    kelas: 9,
    bab: 'Bab 6: Barisan & Deret',
    subBabs: [
      { name: 'Pola Bilangan' },
      { name: 'Barisan Aritmetika' },
      { name: 'Barisan Geometri' },
      { name: 'Deret Aritmetika & Geometri' },
    ],
  },
  {
    id: '9-bab7',
    kelas: 9,
    bab: 'Bab 7: Statistika & Peluang Lanjutan',
    subBabs: [
      { name: 'Penyajian Data Lanjutan' },
      { name: 'Ukuran Penyebaran Data' },
      { name: 'Peluang Lanjutan' },
    ],
  },
]
