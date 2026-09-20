# REQUIREMENTS.md — Spesifikasi Arsitektur Sistem Storasia Integrata

Dokumen ini mendokumentasikan spesifikasi teknis, arsitektur data, dan pedoman pengembangan untuk Web App Dashboard & Landing Page **PT Storasia Nevara Integrata** (Warehouse & 3PL Batam).

---

## 1. Arsitektur Komponen

Sistem dirancang untuk berjalan dalam dua ekosistem:
1. **Ekosistem Web Preview / Prototyping (Node.js/Express + Vite)**: Menyajikan UI responsif dengan performa streaming visual tinggi dan live preview.
2. **Ekosistem Google Apps Script (GAS)**: Hosting murni di Google Spreadsheet/Google Drive tanpa ketergantungan server berbayar.

### Berkas Utama Ekosistem GAS:
- **`setup.gs`**: Bertanggung jawab atas inisialisasi skema data, penataan tabel, pembuatan sheet otomatis, pemformatan header, dan validasi data.
  - Sheet `MASTER_BARANG` (SKU, Nama, Kategori, Satuan, Lokasi Bin, Min/Max Stok)
  - Sheet `LOG_INBOUND` (ID Inbound, Timestamp, SKU, Batch, Expiry, Qty, QC)
  - Sheet `STOK_LIVE_FEFO` (SKU, Batch, Lokasi Rak, Qty, Expiry, Sisa Hari, Status FEFO/FIFO)
  - Sheet `LOG_OUTBOUND` (ID Outbound, Timestamp, SKU, Batch, Qty, Tujuan, Dispatched)
  - Sheet `KONFIGURASI_SISTEM` (Parameter ambang batas alert expiry, timezone)
- **`code.gs`**: Berfungsi sebagai backend controller utama:
  - `doGet(e)`: Menyajikan file template `Dashboard-for-Spreadsheet.html` dengan mode ALLOWALL x-frame.
  - API endpoints: `getDashboardSummary()`, `getLiveInventory()`, `getWarehouseBaysStatus()`, `include()`.

### Berkas HTML:
- **HTML Utama (`dist/index.html`)**: Berkas HTML pengembangan interaktif dengan stylesheet mandiri, ikon SVG inlined, asset visual, dan video flow.
- **HTML Integrasi GAS (`Dashboard-for-Spreadsheet.html`)**: Berkas HTML hasil build/sinkronisasi dari Vite untuk diunggah langsung ke Apps Script Editor.

---

## 2. Kebutuhan Media & Kualitas Visual (Video & Asset)

- **Logo Resmi Perusahaan (`Gemini_Generated_Image_sppbudsppbudsppb (1).jpg`)**:
  - Format & Kualitas: JPEG sRGB resolusi tinggi (1699x624 piksel, rasio horizontal ~2.72:1).
  - Penempatan Berkas: Disimpan di `dist/assets/Gemini_Generated_Image_sppbudsppbudsppb (1).jpg` dan disinkronkan ke `dist/assets/storasia-logo.jpg`.
  - Integrasi: Dipasang pada bilah navigasi atas (`header nav .logo`) dan bagian footer (`footer .footer-brand`).
  - Rendering CSS: Menggunakan `object-fit: contain` dan `mix-blend-mode: multiply` agar logo menyatu mulus dan kontras tinggi di atas latar belakang navbar dan footer.

- **Video Background Hero (`Generated Video September 20, 2026 - 10_31AM.mp4`)**:
  - Format & Kualitas: MP4 Base Media v1 H.264 asli tanpa kompresi ulang (~10.8 MB).
  - Penempatan Berkas: Disimpan di `dist/assets/Generated Video September 20, 2026 - 10_31AM.mp4` dan disinkronkan ke `dist/assets/storasia-flow.mp4`.
  - Poster cadangan: `assets/warehouse-editorial.webp`.
- **CSS Video Enhancement & Tata Letak Edge-to-Edge**:
  - `width: 100%` dan `margin: 0` tanpa sudut melengkung pada batas luar (`border-radius: 0`) agar video membentang penuh (*edge-to-edge*) ke tepi layar browser tanpa tampak mengapung di atas kanvas putih/abu-abu.
  - Wadah global `.page` menggunakan `width: 100%`, `margin: 0`, dan `border-radius: 0` untuk tampilan antarmuka web enterprise modern.
  - `object-fit: cover` untuk memenuhi seluruh kanvas hero.
  - Skala presisi `transform: scale(1.08); transform-origin: center center;` dipadukan dengan kontainer hero ber-`overflow: hidden` untuk ketajaman bingkai.
  - Filter kontras dan saturasi optimal (`saturate(1.06) contrast(1.08) brightness(.94)`).
  - Gradien perlindungan teks (`linear-gradient`) untuk memastikan kontras teks memenuhi standar aksesibilitas WCAG AA.
  - Penataan isi konten hero (`.hero-grid` dan `.hero-stats`) tetap terkunci pada lebar kontainer standar (`width: min(1240px, calc(100% - 64px)); margin: 0 auto;`) agar teks dan tombol tetap sejajar dengan konten halaman lainnya.

- **Modul Alur Pergudangan (Digital Warehouse Flow)**:
  - Tata letak: **2D Flat Enterprise Architecture** (bebas dari efek 3D, perspektif, kemiringan tilt, dan transformasi preserve-3d).
  - Statis murni: **Bebas dari animasi** (tidak ada scan line, tidak ada rute bergerak, tidak ada mousemove tilt parallax).
  - Ringan & Mandiri: **Bebas dari berkas gambar** (dirender murni menggunakan CSS flat dan ikon outline SVG).
  - Komponen: 4 kartu alur operasional (`Receiving`, `Storage`, `Stock Control`, `Dispatch`) tanpa panel konsol bay tambahan agar tampilan tetap minimalis dan fokus pada alur.

- **Struktur Penempatan & Ketersediaan Aset (GitHub & Multi-Directory Sync)**:
  - Seluruh aset media (video H.264, gambar latar belakang, ilustrasi alur, dan logo resmi) wajib tersedia secara paralel pada 3 direktori:
    1. `/assets/` (akar proyek untuk visibilitas langsung repositori GitHub).
    2. `/public/assets/` (direktori publik standar bundler Vite).
    3. `/dist/assets/` (direktori output penyajian server produksi/dev).
  - Berkas HTML harus tersedia dalam 2 versi terkelola:
    - `index.html` (HTML utama di root untuk repositori).
    - `Dashboard-for-Spreadsheet.html` (HTML terintegrasi GAS hasil sinkronisasi).
    - `dist/index.html` (HTML aktif yang disajikan oleh server).

---

## 3. Aturan & Pedoman Operasional (SOP)

1. **Aturan Build Vite**:
   - **Wajib meminta konfirmasi pengguna** sebelum menjalankan proses build menggunakan Vite.
   - Jangan pernah melakukan build otomatis tanpa instruksi/persetujuan eksplisit.
   - Setelah proses build selesai, sinkronkan output (`dist/index.html`) ke `Dashboard-for-Spreadsheet.html`.
2. **Sinkronisasi Skrip GAS (`.gs`)**:
   - Setiap ada perubahan struktur data atau komponen interaktif dashboard, `setup.gs` dan `code.gs` wajib diperbarui.
3. **Pencatatan Dokumentasi**:
   - Setiap perubahan teknis harus dicatat dalam `REKAP_PENGEMBANGAN.md`.
4. **Bahasa Komunikasi**:
   - Seluruh interaksi chat wajib menggunakan Bahasa Indonesia.
