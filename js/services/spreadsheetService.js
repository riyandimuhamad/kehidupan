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
      pemasukanBulanan: summary.income,
      totalPengeluaran: summary.totalPengeluaranTotal,
      totalKebutuhanPokok: summary.totalPokok,
      totalTabungan: summary.totalTabungan,
      sisaUang: summary.sisaUang,
      detailBudgets: summary.budgetsList.map(b => ({
        id: b.id,
        nama: b.name,
        kategori: b.category,
        jumlahBiaya: b.amount,
        sumber: b.source || 'Kehidupan App'
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
        message: 'Berhasil mengirimkan data estimasi anggaran ke Google Sheets!',
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
// =======================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Sheet 1: Ringkasan Cashflow Bulanan
    var sheetSummary = ss.getSheetByName("Ringkasan Cashflow") || ss.getActiveSheet();
    sheetSummary.setName("Ringkasan Cashflow");
    
    if (sheetSummary.getLastRow() === 0) {
      sheetSummary.appendRow(["Tanggal Sync", "Pemasukan", "Total Pengeluaran", "Total Pokok", "Total Tabungan", "Sisa Uang Net", "Rincian Pos Ringkas"]);
      sheetSummary.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#6366f1").setFontColor("#ffffff");
    }
    
    var detailText = data.detailBudgets ? data.detailBudgets.map(function(b) {
      return b.nama + ": Rp " + Number(b.jumlahBiaya).toLocaleString('id-ID');
    }).join(" | ") : "";
    
    sheetSummary.appendRow([
      data.formattedDate || new Date().toLocaleDateString('id-ID'),
      data.pemasukanBulanan || 0,
      data.totalPengeluaran || 0,
      data.totalKebutuhanPokok || 0,
      data.totalTabungan || 0,
      data.sisaUang || 0,
      detailText
    ]);
    
    // Format mata uang Rupiah untuk kolom angka
    var lastRow = sheetSummary.getLastRow();
    if (lastRow > 1) {
      sheetSummary.getRange(lastRow, 2, 1, 5).setNumberFormat('"Rp "#,##0');
    }
    
    // Sheet 2: Detail Pos Anggaran (Breakdown Rinci)
    var sheetDetail = ss.getSheetByName("Detail Pos Anggaran");
    if (!sheetDetail) {
      sheetDetail = ss.insertSheet("Detail Pos Anggaran");
    }
    if (sheetDetail.getLastRow() === 0) {
      sheetDetail.appendRow(["Tanggal Sync", "ID Pos", "Nama Pos", "Kategori", "Jumlah Alokasi (Rp)", "Sumber"]);
      sheetDetail.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
    }
    
    if (data.detailBudgets && data.detailBudgets.length > 0) {
      data.detailBudgets.forEach(function(item) {
        sheetDetail.appendRow([
          data.formattedDate || new Date().toLocaleDateString('id-ID'),
          item.id,
          item.nama,
          item.kategori,
          item.jumlahBiaya,
          item.sumber
        ]);
        var dLastRow = sheetDetail.getLastRow();
        sheetDetail.getRange(dLastRow, 5).setNumberFormat('"Rp "#,##0');
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: "success", message: "Data berhasil disimpan!"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
};
