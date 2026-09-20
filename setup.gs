/**
 * ============================================================================
 * PT STORASIA NEVARA INTEGRATA - WAREHOUSE MANAGEMENT SYSTEM
 * File: setup.gs
 * Fungsi: Inisialisasi struktur database Google Sheets, tabel, kolom, dan validasi
 * ============================================================================
 */

const SHEETS_CONFIG = {
  INVENTORY_MASTER: {
    name: 'MASTER_BARANG',
    headers: [
      'SKU',
      'Nama Barang',
      'Kategori',
      'Satuan',
      'Lokasi Default (Rak/Bin)',
      'Minimum Stok',
      'Maksimum Stok',
      'Status Aktif',
      'Catatan Khusus'
    ],
    widths: [120, 220, 140, 90, 160, 110, 110, 110, 200],
    color: '#0b3f85'
  },
  INBOUND_LOG: {
    name: 'LOG_INBOUND',
    headers: [
      'ID Inbound',
      'Timestamp',
      'SKU',
      'Nama Barang',
      'Nomor Batch',
      'Tanggal Produksi',
      'Tanggal Kadaluarsa (Expiry)',
      'Qty Masuk',
      'Satuan',
      'Lokasi Bin',
      'Petugas QC',
      'Status Verifikasi'
    ],
    widths: [130, 150, 120, 200, 130, 120, 140, 100, 90, 120, 130, 130],
    color: '#1070ca'
  },
  STOCK_LIVE: {
    name: 'STOK_LIVE_FEFO',
    headers: [
      'SKU',
      'Nama Barang',
      'Nomor Batch',
      'Lokasi Rak',
      'Qty Tersedia',
      'Satuan',
      'Tanggal Masuk',
      'Tanggal Kadaluarsa',
      'Sisa Hari Expiry',
      'Status Rotasi (FEFO/FIFO)',
      'Terakhir Update'
    ],
    widths: [120, 200, 130, 120, 110, 90, 120, 140, 120, 160, 150],
    color: '#071527'
  },
  OUTBOUND_LOG: {
    name: 'LOG_OUTBOUND',
    headers: [
      'ID Outbound',
      'Timestamp',
      'SKU',
      'Nama Barang',
      'Nomor Batch',
      'Qty Keluar',
      'Tujuan Distribusi',
      'Metode Pengeluaran',
      'Nomor DO / Resi',
      'Operator Gudang',
      'Status Pengiriman'
    ],
    widths: [130, 150, 120, 200, 130, 100, 180, 140, 140, 130, 140],
    color: '#1b4d3e'
  },
  SYSTEM_CONFIG: {
    name: 'KONFIGURASI_SISTEM',
    headers: ['Kunci Konfigurasi', 'Nilai', 'Deskripsi'],
    widths: [180, 260, 320],
    color: '#4f5660'
  }
};

/**
 * Jalankan fungsi ini satu kali pada spreadsheet aktif untuk menginisialisasi
 * seluruh lembar kerja, header terformat, dan validasi data.
 */
function setupWarehouseSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.keys(SHEETS_CONFIG).forEach(key => {
    const config = SHEETS_CONFIG[key];
    let sheet = ss.getSheetByName(config.name);
    
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }
    
    // Terapkan header jika baris pertama masih kosong atau diinisialisasi
    const headerRange = sheet.getRange(1, 1, 1, config.headers.length);
    headerRange.setValues([config.headers]);
    headerRange.setBackground(config.color);
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Roboto');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    sheet.setRowHeight(1, 36);
    
    // Set lebar kolom
    config.widths.forEach((width, index) => {
      sheet.setColumnWidth(index + 1, width);
    });
    
    // Bekukan baris pertama
    sheet.setFrozenRows(1);
  });
  
  // Isi konfigurasi awal jika belum terisi
  seedInitialConfigurations(ss);
  
  SpreadsheetApp.flush();
  Logger.log('Inisialisasi Spreadsheet Storasia selesai dengan sukses.');
}

/**
 * Mengisi nilai default konfigurasi sistem pergudangan
 */
function seedInitialConfigurations(ss) {
  const configSheet = ss.getSheetByName(SHEETS_CONFIG.SYSTEM_CONFIG.name);
  if (configSheet && configSheet.getLastRow() <= 1) {
    const defaultConfigs = [
      ['GUDANG_NAMA', 'Storasia Nevara Integrata - Hub Sekupang Batam', 'Lokasi fasilitas pergudangan'],
      ['ROTASI_DEFAULT', 'FEFO', 'Metode rotasi utama (FEFO untuk barang bertanggal kadaluarsa, FIFO untuk umum)'],
      ['AMBANG_KRITIS_EXPIRY_HARI', '60', 'Jumlah hari sisa kadaluarsa untuk memicu alert merah'],
      ['AMBANG_PERINGATAN_EXPIRY_HARI', '120', 'Jumlah hari sisa kadaluarsa untuk memicu alert kuning'],
      ['TIMEZONE', 'Asia/Jakarta', 'Zona waktu operasional pencatatan']
    ];
    configSheet.getRange(2, 1, defaultConfigs.length, 3).setValues(defaultConfigs);
  }
}
