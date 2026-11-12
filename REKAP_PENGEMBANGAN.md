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

---

### [2026-09-20] — Sinkronisasi Seluruh Aset Media & Struktur Berkas ke Git Repository

#### 1. Latar Belakang & Permintaan Pengguna
- Pengguna melihat aset gambar, video, dan logo belum tampak pada repositori GitHub dan meminta agar seluruh aset tersebut ikut disertakan (push/sync).

#### 2. Perubahan Desain & Teknis
- **Restrukturisasi Direktori Aset**:
  - Menyalin dan menyinkronkan seluruh aset media ke 3 lokasi standar:
    1. Direktori akar (`/assets/`) untuk keterbacaan langsung di repositori utama GitHub.
    2. Direktori `/public/assets/` sesuai konvensi bundling Vite & statis.
    3. Direktori `/dist/assets/` untuk output build dan serving server Express.
  - Aset mencakup: Video MP4 (`Generated Video September 20, 2026 - 10_31AM.mp4`, `storasia-flow.mp4`), Logo Resmi (`Gemini_Generated_Image_sppbudsppbudsppb (1).jpg`, `storasia-logo.jpg`, `storasia-logo.svg`), dan Gambar Pendukung (`warehouse-editorial.webp`, `logistics-flow.webp`).
- **Penyelarasan 2 File HTML Sesuai SOP**:
  - `index.html` (HTML Utama di root).
  - `Dashboard-for-Spreadsheet.html` (HTML terintegrasi GAS).
  - `dist/index.html` (Output live server).
- **Inisialisasi & Pelacakan Git**:
  - Mengonfigurasi branch `main`, memperbarui `.gitignore` agar mengabaikan `node_modules/` namun menyertakan semua berkas media dan HTML, serta membuat komit komprehensif sehingga seluruh aset siap diekspor/sinkron ke GitHub.
- **Kepatuhan Pedoman Build**:
  - Menunggu konfirmasi sebelum menjalankan build Vite otomatis.

---

### [2026-09-20] — Perbaikan Path & Konfigurasi GitHub Pages (Broken Image & Video Fix)

#### 1. Masalah yang Terdeteksi pada GitHub Pages
- Gambar logo navbar dan video hero tidak termuat saat diakses via GitHub Pages (`[broken icon] PT Storasia Nevara Integrata`).
- **Penyebab Utama**:
  1. **Karakter Khusus pada Nama Berkas**: Penggunaan nama berkas dengan spasi dan tanda kurung (`Gemini_Generated_Image_sppbudsppbudsppb (1).jpg` dan `Generated Video September 20, 2026 - 10_31AM.mp4`) menyebabkan URL parser browser dan server web GitHub Pages gagal memetakan tautan jika tidak di-encode secara ketat.
  2. **Interferensi Mesin Jekyll**: GitHub Pages secara default menjalankan parser Jekyll jika berkas `.nojekyll` tidak ada, sehingga folder/berkas tertentu terabaikan.
  3. **Resolusi Path Sub-Direktori GitHub Pages**: GitHub Pages menggunakan sub-path repositori (`https://username.github.io/repo-name/`). Jalur relatif tanpa titik (`assets/...`) rentan gagal jika URL dibuka tanpa trailing slash `/`.

#### 2. Solusi yang Diterapkan
- **Penggunaan Nama Berkas URL-Safe**:
  - Mengubah tautan gambar logo menjadi `./assets/storasia-logo.jpg` dengan proteksi fallback otomatis ke `./assets/storasia-logo.svg` (`onerror`).
  - Mengubah sumber video utama hero menjadi `./assets/storasia-flow.mp4` dan sekunder `./assets/gemini_generated_video_5106d547.mp4` (tanpa spasi dan tanpa karakter khusus).
  - Menyelaraskan seluruh aset latar belakang dan ilustrasi alur dengan awalan `./assets/`.
- **Penambahan Berkas `.nojekyll`**:
  - Menambahkan berkas kosong `.nojekyll` pada direktori root (`/`), `/dist/`, dan `/public/` untuk mematikan Jekyll sehingga GitHub Pages menyajikan seluruh berkas statis apa adanya.
- **Skrip Deteksi Trailing Slash**:
  - Menyematkan skrip ringan pada `<head>` untuk memastikan URL memiliki trailing slash (`/`) saat dibuka di GitHub Pages, sehingga resolusi path relatif selalu mengarah ke repositori terkait.
- **Sinkronisasi Ganda (Root & Dist)**:
  - Memastikan kedua direktori (`/` dan `/dist/`) memiliki versi `index.html` dan aset yang identik, sehingga situs bekerja dengan baik baik jika GitHub Pages disetel melalui "Deploy from a branch" maupun "GitHub Actions".







---

### [2026-11-12] — Penyempurnaan Landing Page & Aksesibilitas

- Mempertahankan identitas navy/cyan, logo, seluruh kontak, statistik existing, hero video edge-to-edge, serta alur pergudangan 2D statis tanpa gambar/animasi.
- Memperjelas hierarki judul hero, ritme section, kartu kategori klien, standar layanan, dan panel konsultasi; menambahkan FAQ native berdasarkan isi layanan yang sudah ada.
- Mengarahkan CTA “Lihat Alur Operasional” ke section alur yang sesuai.
- Menambahkan skip link, focus ring, offset anchor untuk header, label menu dinamis, penutupan menu melalui Escape/klik luar/focus keluar, dan reset pada perubahan breakpoint.
- Menampilkan konten tanpa ketergantungan IntersectionObserver; navigasi tetap tersedia tanpa JavaScript.
- Menambahkan kontrol putar/jeda video; menghormati reduced motion dan saveData, menggunakan preload none, serta lazy loading gambar di bawah hero.
- Menyinkronkan index.html, dist/index.html, dan Dashboard-for-Spreadsheet.html secara langsung. Tidak ada perubahan model data atau komponen dashboard GAS.
- Validasi: parsing HTML, ID unik, semua anchor internal memiliki target, empat FAQ native, dan syntax check kedua inline script berhasil.
- Batasan validasi: pengujian visual/interaksi Chromium dicoba tetapi diblokir runtime (socket() failed: Operation not permitted). Responsivitas, playback video, dan tampilan browser masih perlu review manual.
- Tidak menjalankan build Vite, deployment, atau merge. Angka dan klaim layanan existing dipertahankan tanpa verifikasi bisnis tambahan.


### [2026-11-12] — Eksplorasi Gudang 3D Interaktif

- Menindaklanjuti permintaan pengguna untuk memperbagus landing page dengan elemen 3D JavaScript terkait bisnis pergudangan.
- Menambahkan section Eksplorasi 3D terpisah: rak dua tingkat, pallet, area receiving/dispatch, dan jalur pergerakan barang. Modul Digital Warehouse Flow lama tetap 2D statis.
- Renderer proyeksi 3D ortografis berbasis Canvas 2D dan JavaScript native, tanpa dependency CDN, model, atau tekstur eksternal.
- Empat tombol tahap memperbarui highlight dan penjelasan; slider mengubah sudut kamera; tombol menjalankan/menjeda alur dan mengatur ulang tampilan.
- Animasi hanya berjalan atas tindakan pengguna, berhenti ketika section keluar viewport atau tab tersembunyi; rasio piksel dibatasi maksimal 2. Reduced motion menggunakan perpindahan tahap tanpa animasi.
- Fallback teks tersedia tanpa JavaScript/Canvas. Kontrol keyboard native, aria-pressed dan live region mendukung aksesibilitas. Tampilan menegaskan bahwa scene adalah ilustrasi konsep, bukan denah/data stok aktual.
- Ketiga entry HTML disinkronkan. Tidak ada perubahan backend atau struktur data GAS; tidak menjalankan Vite build/deploy/merge.
- Validasi: syntax tiga inline script; parsing HTML, ID dan anchor; harness renderer/interaction dengan canvas native pada 820×450 dan 350×310, stage selection, rotasi, reset, animasi, penghentian saat tab tersembunyi, dan reduced-motion (lulus). Render canvas desktop/mobile diperiksa visual.
- Batasan: belum ada uji end-to-end layout seluruh halaman; Chromium lokal diblokir socket runtime, sementara CUA menolak protokol file lokal. Tidak dilakukan bypass.


### [2026-11-12] — Favicon Logo Resmi dari Pengguna

- Memasang gambar logo navy yang dilampirkan pengguna sebagai favicon tab browser.
- Konversi proporsional dengan padding persegi: PNG 32×32 serta ICO 16/32/48 piksel, tanpa perubahan desain logo.
- Menyimpan aset yang sama pada assets/, public/assets/, dist/assets/ dan menambahkan link relatif favicon pada tiga entry HTML tersinkron.
- Tidak menjalankan Vite build. Merge dan publikasi melalui workflow existing dilakukan atas instruksi eksplisit pengguna.


### [2026-11-12] — Visual Gudang Sinematik untuk Landing Page

- Mengganti headline menjadi “Setiap barang bergerak. Semua tetap terkendali.” dan menulis ulang section untuk presentasi pemasaran yang bersih.
- Menghapus sidebar tahapan, slider kamera, kontrol jalankan/jeda/reset, legenda, serta istilah simulator dari tampilan.
- Membuat scene navy lebar dengan empat bank rak tiga tingkat, pallet kayu, variasi karton berlabel/pita, struktur gudang, marka jalur, bayangan, detail forklift dan pallet yang dibawanya.
- Animasi forklift loop otomatis sesuai permintaan pengguna; diam-diam berhenti ketika section tidak terlihat/tab tersembunyi. Reduced motion menghasilkan frame statis. Render dibatasi sekitar 30 fps dan DPR maksimal 1,75.
- Renderer tetap JavaScript/Canvas native tanpa CDN. Fallback tanpa Canvas/JS tetap menyediakan teks alur, dan canvas disembunyikan pada noscript.
- Ketiga entry HTML, favicon, dan kontak tetap sinkron/terjaga. Modul flow operasional lama tidak diubah.
- Validasi: syntax tiga script, parsing HTML, anchor/ID, tidak adanya kontrol simulator, keutuhan favicon/kontak; harness canvas desktop 1160×570 dan mobile 350×350 memverifikasi autoplay, loop frame, pause/resume visibility, serta reduced motion. Render desktop/mobile diperiksa visual. Uji layout browser penuh tetap belum tersedia karena keterbatasan runtime yang terdokumentasi sebelumnya.
- Publikasi dilanjutkan melalui PR dan workflow Pages existing sesuai otorisasi pengguna; tanpa Vite build.
