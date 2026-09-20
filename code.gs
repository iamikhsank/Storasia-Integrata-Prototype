/**
 * ============================================================================
 * PT STORASIA NEVARA INTEGRATA - WAREHOUSE MANAGEMENT SYSTEM
 * File: code.gs
 * Fungsi: Controller Google Apps Script utama untuk integrasi Web App & HTML Dashboard
 * ============================================================================
 */

/**
 * Entry point HTTP GET untuk menyajikan web app ke browser pengguna
 */
function doGet(e) {
  const templateName = 'Dashboard-for-Spreadsheet';
  let htmlOutput;
  
  try {
    htmlOutput = HtmlService.createHtmlOutputFromFile(templateName);
  } catch (err) {
    // Fallback jika file build Dashboard-for-Spreadsheet belum di-upload di Apps Script Editor
    htmlOutput = HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:30px;color:#11151b;">' +
      '<h2>Storasia Nevara Integrata</h2>' +
      '<p>File <code>Dashboard-for-Spreadsheet.html</code> sedang dalam proses sinkronisasi.</p>' +
      '</div>'
    );
  }
  
  return htmlOutput
    .setTitle('Storasia Nevara Integrata — Warehouse & 3PL Batam')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Utility untuk modularisasi file HTML di Google Apps Script jika menggunakan template tag
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mengambil ringkasan metrik gudang secara live untuk ditampilkan pada dashboard
 */
function getDashboardSummary() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const stockSheet = ss.getSheetByName('STOK_LIVE_FEFO');
    const inboundSheet = ss.getSheetByName('LOG_INBOUND');
    const outboundSheet = ss.getSheetByName('LOG_OUTBOUND');
    
    let totalSku = 0;
    let totalQty = 0;
    let totalExpiryWarning = 0;
    
    if (stockSheet && stockSheet.getLastRow() > 1) {
      const data = stockSheet.getRange(2, 1, stockSheet.getLastRow() - 1, 11).getValues();
      const uniqueSkus = new Set();
      
      data.forEach(row => {
        const sku = row[0];
        const qty = Number(row[4]) || 0;
        const sisaHari = Number(row[8]);
        
        if (sku) uniqueSkus.add(sku);
        totalQty += qty;
        
        // Peringatan jika sisa kadaluarsa kurang dari 90 hari
        if (!isNaN(sisaHari) && sisaHari > 0 && sisaHari <= 90) {
          totalExpiryWarning++;
        }
      });
      totalSku = uniqueSkus.size;
    }
    
    const totalInboundEntries = inboundSheet && inboundSheet.getLastRow() > 1 ? inboundSheet.getLastRow() - 1 : 0;
    const totalOutboundEntries = outboundSheet && outboundSheet.getLastRow() > 1 ? outboundSheet.getLastRow() - 1 : 0;
    
    return {
      status: 'success',
      data: {
        totalSku: totalSku,
        totalStockUnits: totalQty,
        totalInbound: totalInboundEntries,
        totalOutbound: totalOutboundEntries,
        expiryAlerts: totalExpiryWarning,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.toString()
    };
  }
}

/**
 * Mengambil daftar stok live per nomor batch dan lokasi rak (FEFO / FIFO)
 */
function getLiveInventory(limit) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('STOK_LIVE_FEFO');
    if (!sheet || sheet.getLastRow() <= 1) {
      return { status: 'success', data: [] };
    }
    
    const maxRows = limit ? Math.min(limit, sheet.getLastRow() - 1) : sheet.getLastRow() - 1;
    const values = sheet.getRange(2, 1, maxRows, 11).getValues();
    
    const items = values.map((r, idx) => ({
      rowId: idx + 2,
      sku: r[0],
      name: r[1],
      batch: r[2],
      location: r[3],
      qty: Number(r[4]) || 0,
      unit: r[5],
      inboundDate: r[6] ? new Date(r[6]).toLocaleDateString('id-ID') : '-',
      expiryDate: r[7] ? new Date(r[7]).toLocaleDateString('id-ID') : '-',
      remainingDays: r[8],
      rotationStatus: r[9]
    }));
    
    return { status: 'success', data: items };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * Mengambil ringkasan okupansi per Bay/Lokasi Rak gudang untuk konsol visualisasi status 2D
 * (Bay A1 Inbound, Bay A2 Storage, Bay B1 FEFO Fast, Bay B2 FIFO Reg, Bay C1 Dispatch)
 */
function getWarehouseBaysStatus() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('STOK_LIVE_FEFO');
    const bays = {
      'Bay A1': { name: 'Bay A1 · Inbound', total: 0, fefo: 0, items: 0 },
      'Bay A2': { name: 'Bay A2 · Storage', total: 0, fefo: 0, items: 0 },
      'Bay B1': { name: 'Bay B1 · FEFO Fast', total: 0, fefo: 0, items: 0 },
      'Bay B2': { name: 'Bay B2 · FIFO Reg', total: 0, fefo: 0, items: 0 },
      'Bay C1': { name: 'Bay C1 · Dispatch', total: 0, fefo: 0, items: 0 }
    };
    
    if (sheet && sheet.getLastRow() > 1) {
      const values = sheet.getRange(2, 4, sheet.getLastRow() - 1, 6).getValues();
      values.forEach(row => {
        const loc = String(row[0] || '').trim();
        const sisaHari = Number(row[4]);
        Object.keys(bays).forEach(key => {
          if (loc.startsWith(key)) {
            bays[key].items++;
            if (!isNaN(sisaHari) && sisaHari > 0 && sisaHari <= 90) {
              bays[key].fefo++;
            }
          }
        });
      });
    }
    
    return { status: 'success', data: bays };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
