# REKAP PENGEMBANGAN — PT Storasia Nevara Integrata

Dokumen ini mencatat seluruh riwayat pembaruan, perubahan struktur data, dan peningkatan performa/visual pada repositori Storasia Nevara Integrata.

---

### [2026-09-20] — Peningkatan Kualitas Video Background Hero & Inisialisasi Modul Google Apps Script

#### 1. Masalah Kualitas Video Awal
- Video lama (`dist/assets/storasia-flow.mp4`) memiliki resolusi **960x540 (qHD)** dengan bitrate rendah (**~541 kbps**).
- Ketika direntangkan pada hero container berukuran 1360px+ di layar desktop atau monitor Full HD/4K, video tampak buram, pixelated, serta artefak kompresi terlihat nyata.

#### 2. Implementasi Solusi Teknis
- **Upscaling & Sharpening Full HD 1080p (`dist/assets/storasia-flow-hd.mp4`)**:
  - Dihasilkan video beresolusi **1920x1080** menggunakan interpolasi **Lanczos scaling** (`scale=1920:1080:flags=lanczos`).
  - Diterapkan filter **Unsharp Mask** (`unsharp=5:5:1.0:5:5:0.0`) untuk mempertajam detail rak, palet barang, dan pencahayaan lorong gudang.
  - Bitrate dinaikkan dari ~541 kbps menjadi **~7.000 kbps (7 Mbps)** menggunakan H.264 High Profile (CRF 17).
  - Ditambahkan metadata **FastStart** (`-movflags +faststart`) agar video dapat streaming secara instan di browser tanpa menunggu seluruh file terunduh.
- **Pembaruan Tag `<video>` pada `dist/index.html`**:
  - Sumber utama diarahkan ke `assets/storasia-flow-hd.mp4` dengan fallback ke `assets/storasia-flow.mp4`.
  - Atribut `preload` ditingkatkan menjadi `"auto"` untuk transisi loading yang mulus.
- **Penyempurnaan CSS Filter**:
  - Filter video diatur ke `saturate(1.06) contrast(1.08) brightness(.94)` dengan akselerasi hardware `will-change: transform`.
  - Lapisan gradien overlay disesuaikan agar teks hero "Stok aman. Bisnis melaju" tetap kontras tinggi dan mudah dibaca tanpa mengaburkan detail video latar.

#### 3. Inisialisasi Berkas Google Apps Script (GAS)
- **`setup.gs`**:
  - Struktur tabel spreadsheet lengkap: `MASTER_BARANG`, `LOG_INBOUND`, `STOK_LIVE_FEFO`, `LOG_OUTBOUND`, dan `KONFIGURASI_SISTEM`.
  - Fungsi otomatis `setupWarehouseSpreadsheet()` dengan pewarnaan header bertema korporat Storasia, lebar kolom adaptif, dan pembekuan baris judul.
- **`code.gs`**:
  - Fungsi controller `doGet(e)` dengan konfigurasi ALLOWALL XFrameOptions untuk embedding.
  - Endpoint `getDashboardSummary()` dan `getLiveInventory()` untuk konsumsi data live FEFO/FIFO dari Spreadsheet ke frontend.

#### 4. Kepatuhan Pedoman Build
- Sesuai instruksi pengguna, build Vite **tidak dijalankan secara otomatis** sebelum mendapatkan konfirmasi eksplisit dari pengguna.

---

### [2026-09-20] — Penghapusan Gambar Tengah pada Bagian Digital Warehouse Flow

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna meminta untuk menghilangkan gambar di bagian tengah (*"ini gambar ditengah hilangkan saja"*), yang merujuk pada visual stok 3D warehouse conveyor (`assets/logistics-flow.webp`) di dalam kartu panggung utama `.twin-core`.

#### 2. Perubahan Desain & Kode
- **Penghapusan Asset Gambar**:
  - Menghapus tag `<img>` `assets/logistics-flow.webp` dari elemen `.twin-core`.
  - Menghapus deklarasi `background: ... url('assets/logistics-flow.webp')` pada CSS `.twin-core`.
- **Penggantian dengan Digital Inventory Bay Matrix**:
  - Mengganti visual gambar dengan representasi digital twin berbasis antarmuka sistem pergudangan: grid bay rak penyimpanan interaktif (`Bay A1 · Inbound`, `Bay A2 · Storage`, `Bay B1 · FEFO Fast`, `Bay B2 · FIFO Reg`, `Bay C1 · Dispatch`).
  - Dilengkapi slot kapasitas live, penanda FEFO ungu kontras tinggi, garis pemindai dinamis (*scan line*), dan lencana status sistem aktif.
- **Penyesuaian Responsif Mobile**:
  - Mengatur susunan grid bay pada layar ponsel (maksimal 620px) agar tetap proporsional dan tidak bertumpuk dengan kartu alur mengambang.
- **Pembaruan Google Apps Script (`code.gs`)**:
  - Menambahkan endpoint `getWarehouseBaysStatus()` untuk menyuplai status okupansi rak dan slot FEFO secara dinamis dari sheet `STOK_LIVE_FEFO`.

---

### [2026-09-20] — Eliminasi Efek 3D, Animasi, & Gambar pada Modul Digital Warehouse Flow

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna meminta untuk menghilangkan seluruh efek 3D, gambar, dan animasi pada bagian alur digital gudang (*"hilangkan aja 3d yg ada disini . serta gaperlu ada gambar dan animasi dibagian ini"*).

#### 2. Perubahan Desain & Teknis
- **Penghapusan Efek 3D & Transformasi Miring**:
  - Menghapus konfigurasi `perspective: 1300px`, `transform-style: preserve-3d`, `rotateX`, `rotateY`, dan `translateZ` dari elemen kanvas panggung dan kartu.
  - Menghapus event listener JavaScript interaktif untuk *pointermove tilt* dan *scroll parallax* (`--rx`, `--ry`, `--shift`).
- **Penghapusan Seluruh Animasi**:
  - Menghapus animasi laser pemindai `@keyframes scan`.
  - Menghapus jalur kurva rute SVG beranimasi `@keyframes route`.
- **Desain Ulang Menjadi 2D Enterprise Flat UI**:
  - **4-Langkah Alur Operasional (Flow Pipeline)**: Ditata dalam kartu 2D statis horizontal (`01 Receiving`, `02 Storage`, `03 Stock Control`, `04 Dispatch`) dengan ikon SVG ringkas dan deskripsi operasional yang terstruktur.
  - **Konsol Okupansi Rak 2D (Bay Console)**: Menggantikan panggung 3D dengan panel konsol pemetaan rak datar (Bay A1–C1) yang bersih, dilengkapi indikator kapasitas, penanda FEFO, dan legenda status.
  - **Bebas Gambar**: Tidak ada ketergantungan pada berkas gambar eksternal di bagian ini, seluruhnya dirender murni menggunakan CSS flat dan SVG stroke outline.
- **Kepatuhan Pedoman Build**:
  - Build Vite tidak dijalankan otomatis dan tetap menunggu konfirmasi pengguna.

---

### [2026-09-20] — Integrasi Video Sinematik 3D Baru `Generated Video September 20, 2026 - 10_31AM.mp4`

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna mengunggah dan meminta menggunakan berkas video baru hasil generasi: `Generated Video September 20, 2026 - 10_31AM.mp4` (*"gunakan yg ini saja"*).
- Berkas video lama (`gemini_generated_video_5106d547.mp4`) dihapus dan digantikan dengan video sinematik baru ini.

#### 2. Perubahan Desain & Teknis
- **Penyalinan & Penempatan Aset**:
  - Berkas asli video berukuran ~10.8 MB (MP4 Base Media v1, H.264) disalin ke `dist/assets/Generated Video September 20, 2026 - 10_31AM.mp4` dan disinkronkan ke `dist/assets/storasia-flow.mp4`.
- **Integrasi Tag `<video>` Latar Belakang Hero**:
  - Menetapkan berkas `assets/Generated Video September 20, 2026 - 10_31AM.mp4` sebagai sumber utama pemutaran pada elemen `.hero-video` di `dist/index.html`.
  - Menerapkan opsi fallback ke `assets/storasia-flow.mp4` serta poster gambar cadangan.
- **Pengaturan Proporsi & Penataan Visual**:
  - Memastikan parameter video `autoplay`, `muted`, `loop`, dan `playsinline` terpasang aktif.
  - Mempertahankan tata letak 2D flat pada modul alur pergudangan tanpa 3D dan tanpa animasi di section alur sesuai arahan sebelumnya.
- **Kepatuhan Pedoman Build**:
  - Build Vite tidak dijalankan otomatis dan tetap menunggu konfirmasi pengguna.

---

### [2026-09-20] — Pemulihan Desain & Palet Warna Versi Sebelumnya (Mempertahankan Video Baru)

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna meminta untuk mengembalikan desain, tipografi, dan warna web app ke versi sebelumnya yang telah disetujui, sembari tetap mempertahankan berkas video baru `Generated Video September 20, 2026 - 10_31AM.mp4`.

#### 2. Perubahan Desain & Teknis
- **Pemulihan Sistem Tipografi & Token Warna Asli**:
  - Mengembalikan font display `'Manrope'` dengan bobot 300..800 dan body font `'DM Sans'` (100..1000).
  - Mengembalikan variabel CSS asli: `--ink: #11151b`, `--muted: #6c747e`, `--paper: #f6f7f9`, `--line: #dfe3e8`, `--blue: #0b3f85`, `--cyan: #70cafa`, `--violet: #8157ef`, dan warna latar kanvas luar `#dfe1e4`.
  - Mengembalikan struktur hero asli: judul utama *"Stok aman. Bisnis melaju."*, kicker *"Warehouse & Third-Party Logistics · Batam"*, tombol aksi pill kontras, dan 4 metrik status operasional.
- **Pemertahanan Video Latar Belakang Baru**:
  - Elemen video hero tetap menggunakan berkas unggahan baru: `assets/Generated Video September 20, 2026 - 10_31AM.mp4` dengan cadangan `assets/storasia-flow.mp4`.
- **Kepatuhan Pedoman Build**:
  - Build Vite tidak dijalankan otomatis dan tetap menunggu konfirmasi pengguna.

---

### [2026-09-20] — Penghapusan Komponen Status Okupansi Rak & Zona Gudang (Bay Console)

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna mengunggah tangkapan layar panel *"Status Okupansi Rak & Zona Gudang / Live Inventory Visibility"* (Bay A1–C1 beserta penanda slot FEFO dan legendanya) dengan instruksi *"hapus aja ini"*.

#### 2. Perubahan Desain & Teknis
- **Penghapusan Elemen DOM**:
  - Menghapus kontainer `.bay-console` beserta sub-elemen `.console-bar`, `.console-bays`, `.bay-unit`, `.bay-slots`, dan `.console-legend` dari `dist/index.html`.
- **Pembersihan & Penyesuaian Gaya CSS**:
  - Menghapus aturan CSS terkait `.bay-console` dan sub-komponennya untuk menghemat ukuran berkas dan menghindari CSS tak terpakai.
  - Menghapus aturan media queries breakpoint 980px dan 620px yang mengontrol grid konsol.
  - Mengatur `.flow-pipeline` dengan `margin-bottom: 0` agar tata letak 4 kartu alur logistik (`01 Receiving`, `02 Storage`, `03 Stock Control`, `04 Dispatch`) memiliki jarak bantalan (*padding*) yang seimbang dan simetris di dalam wadah `.immersive-shell`.
- **Kepatuhan Pedoman Build**:
  - Build Vite tidak dijalankan otomatis dan tetap menunggu konfirmasi pengguna.

---

### [2026-09-20] — Pembaruan Aset Logo Resmi Storasia (`Gemini_Generated_Image_sppbudsppbudsppb (1).jpg`)

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna mengunggah gambar logo baru beresolusi tinggi (`Gemini_Generated_Image_sppbudsppbudsppb (1).jpg`, rasio horizontal ~2.72:1) dan meminta untuk menggunakannya sebagai logo resmi.

#### 2. Perubahan Desain & Teknis
- **Manajemen Aset**:
  - Menyalin gambar logo ke direktori aset `dist/assets/Gemini_Generated_Image_sppbudsppbudsppb (1).jpg` dan menyinkronkan juga ke `dist/assets/storasia-logo.jpg`.
- **Integrasi Elemen & Responsivitas**:
  - Memperbarui tag `<img>` pada navigasi utama (`header nav .logo`) dan bagian footer (`footer .footer-brand`).
  - Mengatur proporsi CSS `.logo img` dengan `height: 44px; width: auto; max-width: 185px; object-fit: contain; mix-blend-mode: multiply;` agar logo tampil tajam tanpa distorsi dan membaur rapi ke dalam latar belakang bar navigasi.
  - Menyesuaikan proporsi logo footer (`height: 52px; width: auto; max-width: 210px; object-fit: contain; mix-blend-mode: multiply;`).
  - Menyesuaikan batas tinggi logo pada layar mobile (`max-width: 620px`) menjadi `height: 36px` agar tata letak tetap proporsional dan tidak mendesak tombol menu.
- **Kepatuhan Pedoman Build**:
  - Build Vite tidak dijalankan otomatis dan tetap menunggu konfirmasi pengguna.

---

### [2026-09-20] — Konfigurasi Hero Video Menjadi Full-Screen Edge-to-Edge (Tanpa Efek Mengapung)

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna meminta agar video hero dibuat *full screen* ke pinggir layar sehingga tidak tampak mengapung seperti kartu terisolasi di atas kanvas putih dan abu-abu.

#### 2. Perubahan Desain & Teknis
- **Penyesuaian Tata Letak Global (`.page` & `body`)**:
  - Mengubah wadah `.page` menjadi `width: 100%; margin: 0; border-radius: 0; box-shadow: none;` sehingga kontainer situs membentang penuh (*edge-to-edge*) tanpa sisa margin luar abu-abu.
  - Menyelaraskan latar belakang `body` ke `var(--paper)`.
- **Penyesuaian Bagian Hero Video (`.hero`)**:
  - Mengubah lebar `.hero` menjadi `width: 100%; margin: 0; border-radius: 0;` sehingga video latar belakang menempel langsung ke tepi kiri dan kanan viewport layar.
  - Mengatur batas tinggi fleksibel `min-height: clamp(650px, 80vh, 860px);` dengan `padding: clamp(72px, 8vw, 112px) 0 38px;`.
  - Mengisolasi konten teks hero (`.hero-grid`) dan baris metrik (`.hero-stats`) dengan `width: min(1240px, calc(100% - 64px)); margin: 0 auto;` agar teks dan tombol tetap berada dalam garis vertikal yang sejajar rapi (*grid alignment*) dengan konten halaman lainnya.
- **Responsivitas Tablet & Mobile**:
  - Mengeliminasi sisa margin kartu pada breakpoint 980px dan 620px (`.hero { width: 100%; margin: 0; border-radius: 0; }`).
- **Kepatuhan Pedoman Build**:
  - Build Vite tidak dijalankan otomatis dan tetap menunggu konfirmasi pengguna.




