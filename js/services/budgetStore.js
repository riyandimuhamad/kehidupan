/**
 * Store Service for Managing Household Income, Saved Budget Allocations,
 * and Financial Overview Cashflow.
 */

import { saveToStorage, getFromStorage } from '../utils/formatters.js';

const STORAGE_KEY_INCOME = 'monthly_income';
const STORAGE_KEY_BUDGETS = 'saved_budgets';
const STORAGE_KEY_SHEET_URL = 'spreadsheet_webhook_url';

export const BudgetStore = {
  // Get Monthly Income
  getIncome: () => {
    return getFromStorage(STORAGE_KEY_INCOME, 5000000); // Default Rp 5.000.000
  },

  // Set Monthly Income
  setIncome: (amount) => {
    saveToStorage(STORAGE_KEY_INCOME, amount);
  },

  // Get Saved Budget Allocations
  getBudgets: () => {
    return getFromStorage(STORAGE_KEY_BUDGETS, {
      beras: { id: 'beras', name: 'Beras & Pangan', amount: 300000, category: 'Pokok', source: 'Kalkulator Beras' },
      air: { id: 'air', name: 'Air Galon Minum', amount: 80000, category: 'Pokok', source: 'Kalkulator Air' },
      listrik: { id: 'listrik', name: 'Listrik PLN', amount: 450000, category: 'Pokok', source: 'Kalkulator Listrik' },
      gas: { id: 'gas', name: 'Gas LPG Dapur', amount: 44000, category: 'Pokok', source: 'Kalkulator Gas' },
      transport: { id: 'transport', name: 'BBM & Transportasi', amount: 300000, category: 'Pokok', source: 'Kalkulator Transport' },
      internet: { id: 'internet', name: 'Internet & Paket Data', amount: 275000, category: 'Pokok', source: 'Kalkulator Internet' },
      sembako: { id: 'sembako', name: 'Sembako & Kebersihan', amount: 200000, category: 'Pokok', source: 'Kalkulator Sembako' },
      sewa: { id: 'sewa', name: 'Hunian & Tempat Tinggal', amount: 1500000, category: 'Pokok', source: 'Kalkulator Sewa' },
      tabungan: { id: 'tabungan', name: 'Tabungan & Dana Darurat', amount: 1000000, category: 'Tabungan', source: 'Alokasi Mandiri' }
    });
  },

  // Save / Update Budget Item
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

  // Delete Budget Item
  removeBudgetItem: (id) => {
    const current = BudgetStore.getBudgets();
    delete current[id];
    saveToStorage(STORAGE_KEY_BUDGETS, current);
    return current;
  },

  // Spreadsheet Webhook URL
  getSpreadsheetUrl: () => {
    return getFromStorage(STORAGE_KEY_SHEET_URL, '');
  },

  setSpreadsheetUrl: (url) => {
    saveToStorage(STORAGE_KEY_SHEET_URL, url);
  },

  // Calculate Overall Financial Overview
  getFinancialSummary: () => {
    const income = BudgetStore.getIncome();
    const budgets = BudgetStore.getBudgets();

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
        totalPokok += amt; // Default Pokok / Living
      }
    });

    const totalPengeluaran = totalPokok + totalTabungan + totalLainnya;
    const sisaUang = income - totalPengeluaran;
    const persentasePengeluaran = income > 0 ? Math.min(100, (totalPengeluaran / income) * 100) : 0;

    // Ideal Allocation Standard
    const targetPokok = income * 0.50;
    const targetTabungan = income * 0.20;

    return {
      income,
      totalPokok,
      totalTabungan,
      totalLainnya,
      totalPengeluaran,
      sisaUang,
      persentasePengeluaran,
      targetPokok,
      targetTabungan,
      budgetsList: Object.values(budgets)
    };
  }
};
