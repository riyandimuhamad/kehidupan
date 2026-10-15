/**
 * Spreadsheet Sync Service (Google Sheets API / Webhook Integration)
 */

import { BudgetStore } from './budgetStore.js';
import { formatDate, formatRupiah } from '../utils/formatters.js';

export const SpreadsheetService = {
  // Sync current budget state to Google Sheets via Webhook POST
  syncToSpreadsheet: async (customUrl = null) => {
    const webhookUrl = customUrl || BudgetStore.getSpreadsheetUrl();

    if (!webhookUrl) {
      return {
        success: false,
        message: 'URL Google Sheets Webhook belum diatur. Silakan masukkan URL Webhook Google Apps Script Anda.'
      };
    }

    const summary = BudgetStore.getFinancialSummary();
    const payload = {
      timestamp: new Date().toISOString(),
      formattedDate: formatDate(new Date()),
      periode: summary.selectedPeriod,
      periodeLabel: summary.periodLabel,
      pemasukanBulanan: summary.income,
      totalPengeluaran: summary.totalPengeluaranTotal,
      totalKebutuhanPokok: summary.totalPokok,
      totalTabungan: summary.totalTabungan,
      sisaUang: summary.sisaUang,
      isSurplus: summary.isSurplus,
      bufferSafety: summary.danaBufferSafety,
      dampakInflasi: summary.dampakInflasi,
      detailBudgets: summary.budgetsList.map(b => ({
        id: b.id,
        nama: b.name,
        kategori: b.category,
        jumlahBiaya: b.amount,
        sumber: b.source || 'Kehidupan App',
        rincianTeks: b.details ? JSON.stringify(b.details) : '-',
        terakhirDiupdate: b.updatedAt || new Date().toISOString()
      }))
    };

    try {
      // Send HTTP POST request to Google Apps Script / Sheety API
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'no-cors' // Google Apps Script Web App requires mode no-cors for CORS redirect
      });

      return {
        success: true,
        message: `Berhasil mengirimkan data periode ${summary.periodLabel} ke Google Sheets!`,
        timestamp: formatDate(new Date())
      };
    } catch (error) {
      console.error('Spreadsheet Sync Error:', error);
      return {
        success: false,
        message: `Gagal menghubungkan ke Google Sheets: ${error.message}`
      };
    }
  },

  // Google Apps Script Template code to copy
  getAppsScriptTemplate: () => {
    return `// =======================================================
// SKRIP GOOGLE APPS SCRIPT DATABASE - KEHIDUPAN SUITE
// Pasang di Google Sheets: Menu Extensions -> Apps Script
// Deploy as Web App -> Execute as: Me -> Who has access: Anyone
// =======================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // SHEET 1: Ringkasan Cashflow Bulanan
    var sheetSummary = ss.getSheetByName("Ringkasan Cashflow") || ss.getActiveSheet();
    sheetSummary.setName("Ringkasan Cashflow");
    
    if (sheetSummary.getLastRow() === 0) {
      sheetSummary.appendRow([
        "Waktu Simpan (Timestamp)", 
        "Periode", 
        "Pemasukan Bulanan", 
        "Total Pengeluaran", 
        "Total Pokok", 
        "Total Tabungan", 
        "Buffer Cadangan", 
        "Sisa Uang (Surplus/Defisit)", 
        "Status"
      ]);
      sheetSummary.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
    }
    
    sheetSummary.appendRow([
      data.timestamp || new Date().toISOString(),
      data.periodeLabel || data.periode || "-",
      data.pemasukanBulanan || 0,
      data.totalPengeluaran || 0,
      data.totalKebutuhanPokok || 0,
      data.totalTabungan || 0,
      data.bufferSafety || 0,
      data.sisaUang || 0,
      data.isSurplus ? "SURPLUS" : "DEFISIT"
    ]);
    
    var lastRowSummary = sheetSummary.getLastRow();
    if (lastRowSummary > 1) {
      sheetSummary.getRange(lastRowSummary, 3, 1, 6).setNumberFormat('"Rp "#,##0');
    }
    
    // SHEET 2: Rincian Detail Pos & Tabel Kalkulator
    var sheetDetail = ss.getSheetByName("Rincian Detail Pos");
    if (!sheetDetail) {
      sheetDetail = ss.insertSheet("Rincian Detail Pos");
    }
    if (sheetDetail.getLastRow() === 0) {
      sheetDetail.appendRow([
        "Waktu Simpan", 
        "Periode", 
        "ID Modul", 
        "Nama Pos Anggaran", 
        "Kategori", 
        "Alokasi Bulanan (Rp)", 
        "Sumber & Catatan Parameter", 
        "Detail JSON Parameter"
      ]);
      sheetDetail.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
    }
    
    if (data.detailBudgets && data.detailBudgets.length > 0) {
      data.detailBudgets.forEach(function(item) {
        sheetDetail.appendRow([
          data.timestamp || new Date().toISOString(),
          data.periodeLabel || data.periode || "-",
          item.id,
          item.nama,
          item.kategori,
          item.jumlahBiaya,
          item.sumber,
          item.rincianTeks || "-"
        ]);
        var dLastRow = sheetDetail.getLastRow();
        sheetDetail.getRange(dLastRow, 6).setNumberFormat('"Rp "#,##0');
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: "success", message: "Data tersimpan lengkap!"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
};
