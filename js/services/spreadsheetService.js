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
      totalPengeluaran: summary.totalPengeluaran,
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
// PASTE KODE INI DI GOOGLE SHEETS: Extension -> Apps Script
// =======================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tanggal", "Pemasukan", "Total Pengeluaran", "Total Pokok", "Total Tabungan", "Sisa Uang", "Detail Rincian"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#6366f1").setFontColor("#ffffff");
    }
    
    var detailText = data.detailBudgets.map(function(b) {
      return b.nama + ": Rp " + b.jumlahBiaya;
    }).join(" | ");
    
    sheet.appendRow([
      data.formattedDate,
      data.pemasukanBulanan,
      data.totalPengeluaran,
      data.totalKebutuhanPokok,
      data.totalTabungan,
      data.sisaUang,
      detailText
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
};
