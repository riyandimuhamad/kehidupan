/**
 * Store Service for Managing Household Income, Saved Budget Allocations,
 * Buffer Reserve, Extra Top-Ups, and Financial Overview Cashflow.
 */

import { saveToStorage, getFromStorage } from '../utils/formatters.js';

const STORAGE_KEY_INCOME = 'monthly_income';
const STORAGE_KEY_BUDGETS = 'saved_budgets';
const STORAGE_KEY_EXTRA_TOPUPS = 'extra_topups';
const STORAGE_KEY_BUFFER_PERCENT = 'buffer_percent';
const STORAGE_KEY_SHEET_URL = 'spreadsheet_webhook_url';

export const BudgetStore = {
  getIncome: () => {
    return getFromStorage(STORAGE_KEY_INCOME, 6000000);
  },

  setIncome: (amount) => {
    saveToStorage(STORAGE_KEY_INCOME, amount);
  },

  getBufferPercent: () => {
    return getFromStorage(STORAGE_KEY_BUFFER_PERCENT, 10); // Default 10% safety buffer
  },

  setBufferPercent: (percent) => {
    saveToStorage(STORAGE_KEY_BUFFER_PERCENT, percent);
  },

  getBudgets: () => {
    return getFromStorage(STORAGE_KEY_BUDGETS, {
      beras: { id: 'beras', name: 'Beras & Pangan', amount: 300000, category: 'Pokok', source: 'Kalkulator Beras' },
      air: { id: 'air', name: 'Air Galon Minum', amount: 80000, category: 'Pokok', source: 'Kalkulator Air' },
      airpam: { id: 'airpam', name: 'Air PAM / PDAM', amount: 120000, category: 'Pokok', source: 'Kalkulator Air PAM' },
      listrik: { id: 'listrik', name: 'Listrik PLN', amount: 450000, category: 'Pokok', source: 'Kalkulator Listrik' },
      gas: { id: 'gas', name: 'Gas LPG Dapur', amount: 44000, category: 'Pokok', source: 'Kalkulator Gas' },
      transport: { id: 'transport', name: 'BBM & Transportasi', amount: 300000, category: 'Pokok', source: 'Kalkulator Transport' },
      internet: { id: 'internet', name: 'Internet & Paket Data', amount: 275000, category: 'Pokok', source: 'Kalkulator Internet' },
      sembako: { id: 'sembako', name: 'Sembako & Kebersihan', amount: 350000, category: 'Pokok', source: 'Kalkulator Sembako' },
      sewa: { id: 'sewa', name: 'Hunian & Tempat Tinggal', amount: 1500000, category: 'Pokok', source: 'Kalkulator Sewa' },
      sandang: { id: 'sandang', name: 'Sandang & Grooming', amount: 200000, category: 'Pokok', source: 'Kalkulator Sandang' },
      kesehatan: { id: 'kesehatan', name: 'Kesehatan & BPJS', amount: 350000, category: 'Pokok', source: 'Kalkulator Kesehatan' },
      pendidikan: { id: 'pendidikan', name: 'Pendidikan & Anak', amount: 680000, category: 'Pokok', source: 'Kalkulator Pendidikan' },
      tabungan: { id: 'tabungan', name: 'Tabungan & Dana Darurat', amount: 1000000, category: 'Tabungan', source: 'Alokasi Mandiri' }
    });
  },

  saveBudgetItem: (id, data) => {
    const current = BudgetStore.getBudgets();
    current[id] = {
      ...current[id],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEY_BUDGETS, current);
    return current;
  },

  removeBudgetItem: (id) => {
    const current = BudgetStore.getBudgets();
    delete current[id];
    saveToStorage(STORAGE_KEY_BUDGETS, current);
    return current;
  },

  // Extra Top-Up Transactions (Habis awal & Beli Lagi)
  getExtraTopups: () => {
    return getFromStorage(STORAGE_KEY_EXTRA_TOPUPS, []);
  },

  addExtraTopup: (topup) => {
    const current = BudgetStore.getExtraTopups();
    const newTopup = {
      id: 'topup_' + Date.now(),
      date: new Date().toLocaleDateString('id-ID'),
      ...topup
    };
    const updated = [newTopup, ...current];
    saveToStorage(STORAGE_KEY_EXTRA_TOPUPS, updated);
    return updated;
  },

  removeExtraTopup: (id) => {
    const current = BudgetStore.getExtraTopups();
    const updated = current.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEY_EXTRA_TOPUPS, updated);
    return updated;
  },

  getSpreadsheetUrl: () => {
    return getFromStorage(STORAGE_KEY_SHEET_URL, '');
  },

  setSpreadsheetUrl: (url) => {
    saveToStorage(STORAGE_KEY_SHEET_URL, url);
  },

  getFinancialSummary: () => {
    const income = BudgetStore.getIncome();
    const budgets = BudgetStore.getBudgets();
    const bufferPercent = BudgetStore.getBufferPercent();
    const extraTopups = BudgetStore.getExtraTopups();

    let totalPokok = 0;
    let totalTabungan = 0;
    let totalLainnya = 0;

    Object.values(budgets).forEach(b => {
      const amt = Number(b.amount) || 0;
      if (b.category === 'Tabungan') {
        totalTabungan += amt;
      } else if (b.category === 'Lainnya') {
        totalLainnya += amt;
      } else {
        totalPokok += amt;
      }
    });

    // Calculate Buffer Reserve (Safety Net for items running out early)
    const danaBufferSafety = (totalPokok * bufferPercent) / 100;

    // Calculate Actual Extra Top-Ups (Beli lagi di minggu ke-3)
    const totalExtraTopups = extraTopups.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const totalPengeluaranRencana = totalPokok + totalTabungan + totalLainnya + danaBufferSafety;
    const totalPengeluaranTotal = totalPengeluaranRencana + totalExtraTopups;

    const sisaUang = income - totalPengeluaranTotal;
    const persentasePengeluaran = income > 0 ? Math.min(100, (totalPengeluaranTotal / income) * 100) : 0;

    return {
      income,
      bufferPercent,
      danaBufferSafety,
      totalExtraTopups,
      totalPokok,
      totalTabungan,
      totalLainnya,
      totalPengeluaranRencana,
      totalPengeluaranTotal,
      sisaUang,
      persentasePengeluaran,
      budgetsList: Object.values(budgets),
      extraTopupsList: extraTopups
    };
  }
};
