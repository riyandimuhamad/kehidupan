/**
 * Store Service for Managing Household Income, Saved Budget Allocations,
 * Buffer Reserve, Extra Top-Ups, Profile Modes, Inflation Simulator, and Financial Overview Cashflow.
 */

import { saveToStorage, getFromStorage } from '../utils/formatters.js';

const STORAGE_KEY_INCOME = 'monthly_income';
const STORAGE_KEY_BUDGETS = 'saved_budgets';
const STORAGE_KEY_EXTRA_TOPUPS = 'extra_topups';
const STORAGE_KEY_BUFFER_PERCENT = 'buffer_percent';
const STORAGE_KEY_SHEET_URL = 'spreadsheet_webhook_url';
const STORAGE_KEY_PROFILE = 'user_profile';
const STORAGE_KEY_INFLATION = 'inflation_rate';
const STORAGE_KEY_CHART_MODE = 'dashboard_chart_mode';

export const BudgetStore = {
  getIncome: () => {
    return getFromStorage(STORAGE_KEY_INCOME, 6000000);
  },

  setIncome: (amount) => {
    saveToStorage(STORAGE_KEY_INCOME, amount);
  },

  getProfile: () => {
    return getFromStorage(STORAGE_KEY_PROFILE, 'family_small'); // single | couple | family_small | family_large
  },

  setProfile: (profile) => {
    saveToStorage(STORAGE_KEY_PROFILE, profile);
  },

  getInflation: () => {
    return getFromStorage(STORAGE_KEY_INFLATION, 0); // 0% s/d 25% uji sensitivitas kenaikan harga
  },

  setInflation: (percent) => {
    saveToStorage(STORAGE_KEY_INFLATION, percent);
  },

  getChartMode: () => {
    return getFromStorage(STORAGE_KEY_CHART_MODE, 'doughnut'); // 'doughnut' | 'bar'
  },

  setChartMode: (mode) => {
    saveToStorage(STORAGE_KEY_CHART_MODE, mode);
  },

  getBufferPercent: () => {
    return getFromStorage(STORAGE_KEY_BUFFER_PERCENT, 10); // Default 10% safety buffer
  },

  setBufferPercent: (percent) => {
    saveToStorage(STORAGE_KEY_BUFFER_PERCENT, percent);
  },

  getBudgets: () => {
    return getFromStorage(STORAGE_KEY_BUDGETS, {
      beras: { id: 'beras', name: 'Beras & Pangan', amount: 300000, category: 'Pokok', group: 'pangan', source: 'Kalkulator Beras' },
      air: { id: 'air', name: 'Air Galon Minum', amount: 80000, category: 'Pokok', group: 'pangan', source: 'Kalkulator Air' },
      airpam: { id: 'airpam', name: 'Air PAM / PDAM', amount: 120000, category: 'Pokok', group: 'papan', source: 'Kalkulator Air PAM' },
      listrik: { id: 'listrik', name: 'Listrik PLN', amount: 450000, category: 'Pokok', group: 'papan', source: 'Kalkulator Listrik' },
      gas: { id: 'gas', name: 'Gas LPG Dapur', amount: 44000, category: 'Pokok', group: 'pangan', source: 'Kalkulator Gas' },
      transport: { id: 'transport', name: 'BBM & Transportasi', amount: 300000, category: 'Pokok', group: 'mobilitas', source: 'Kalkulator Transport' },
      internet: { id: 'internet', name: 'Internet & Paket Data', amount: 275000, category: 'Pokok', group: 'mobilitas', source: 'Kalkulator Internet' },
      sembako: { id: 'sembako', name: 'Sembako & Kebersihan', amount: 350000, category: 'Pokok', group: 'pangan', source: 'Kalkulator Sembako' },
      sewa: { id: 'sewa', name: 'Hunian & Tempat Tinggal', amount: 1500000, category: 'Pokok', group: 'papan', source: 'Kalkulator Sewa' },
      sandang: { id: 'sandang', name: 'Sandang & Grooming', amount: 200000, category: 'Pokok', group: 'keluarga', source: 'Kalkulator Sandang' },
      kesehatan: { id: 'kesehatan', name: 'Kesehatan & BPJS', amount: 350000, category: 'Pokok', group: 'keluarga', source: 'Kalkulator Kesehatan' },
      pendidikan: { id: 'pendidikan', name: 'Pendidikan & Anak', amount: 680000, category: 'Pokok', group: 'keluarga', source: 'Kalkulator Pendidikan' },
      hiburan: { id: 'hiburan', name: 'Hiburan & Gaya Hidup', amount: 250000, category: 'Lainnya', group: 'lifestyle', source: 'Kalkulator Hiburan' },
      pajak: { id: 'pajak', name: 'Pajak & Administrasi', amount: 150000, category: 'Pokok', group: 'pajak', source: 'Kalkulator Pajak' },
      tabungan: { id: 'tabungan', name: 'Tabungan & Dana Darurat', amount: 1000000, category: 'Tabungan', group: 'investasi', source: 'Kalkulator Tabungan' }
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
    const profile = BudgetStore.getProfile();
    const inflationPercent = BudgetStore.getInflation();
    const chartMode = BudgetStore.getChartMode();

    let totalPokok = 0;
    let totalTabungan = 0;
    let totalLainnya = 0;

    // Kategori fungsional terperinci untuk Pie / Doughnut Chart
    const categoryTotals = {
      'Pangan & Konsumsi': 0,
      'Papan & Utilitas': 0,
      'Keluarga & Sehat': 0,
      'Mobilitas & Digital': 0,
      'Gaya Hidup & Sosial': 0,
      'Pajak & Administrasi': 0,
      'Tabungan & Investasi': 0
    };

    let highestItem = null;

    Object.values(budgets).forEach(b => {
      const amt = Number(b.amount) || 0;
      if (!highestItem || amt > highestItem.amount) {
        highestItem = { name: b.name, amount: amt };
      }

      if (b.category === 'Tabungan') {
        totalTabungan += amt;
        categoryTotals['Tabungan & Investasi'] += amt;
      } else if (b.category === 'Lainnya') {
        totalLainnya += amt;
        categoryTotals['Gaya Hidup & Sosial'] += amt;
      } else {
        totalPokok += amt;
        // Map ke kelompok fungsional
        const id = b.id || '';
        if (['beras', 'air', 'gas', 'sembako'].includes(id)) {
          categoryTotals['Pangan & Konsumsi'] += amt;
        } else if (['sewa', 'listrik', 'airpam'].includes(id)) {
          categoryTotals['Papan & Utilitas'] += amt;
        } else if (['sandang', 'kesehatan', 'pendidikan'].includes(id)) {
          categoryTotals['Keluarga & Sehat'] += amt;
        } else if (['transport', 'internet'].includes(id)) {
          categoryTotals['Mobilitas & Digital'] += amt;
        } else if (['pajak'].includes(id)) {
          categoryTotals['Pajak & Administrasi'] += amt;
        } else if (['hiburan'].includes(id)) {
          categoryTotals['Gaya Hidup & Sosial'] += amt;
        } else {
          categoryTotals['Pangan & Konsumsi'] += amt;
        }
      }
    });

    // 1. Dana Cadangan Buffer Safety
    const danaBufferSafety = (totalPokok * bufferPercent) / 100;

    // 2. Simulasi Kenaikan Harga / Inflasi (Sensitivitas terhadap Kebutuhan Pokok)
    const dampakInflasi = (totalPokok * inflationPercent) / 100;

    // 3. Total Extra Top-Up Dadakan
    const totalExtraTopups = extraTopups.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // 4. Kalkulasi Total
    const totalPengeluaranRencana = totalPokok + totalTabungan + totalLainnya + danaBufferSafety;
    const totalPengeluaranTotal = totalPengeluaranRencana + dampakInflasi + totalExtraTopups;

    const sisaUang = income - totalPengeluaranTotal;
    const isSurplus = sisaUang >= 0;
    const persentasePengeluaran = income > 0 ? (totalPengeluaranTotal / income) * 100 : 0;
    const rasioPokok = income > 0 ? (totalPokok / income) * 100 : 0;
    const rasioTabungan = income > 0 ? (totalTabungan / income) * 100 : 0;
    const rasioLifestyle = income > 0 ? (totalLainnya / income) * 100 : 0;

    // 5. Smart Financial Insights & Rekomendasi Efisiensi
    const smartInsights = [];

    if (!isSurplus) {
      smartInsights.push({
        type: 'danger',
        icon: 'fa-triangle-exclamation',
        title: 'Peringatan: Defisit Anggaran!',
        desc: `Pengeluaran Anda melebihi pemasukan bulanan sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(sisaUang))}. Pertimbangkan kurangi pos gaya hidup atau gunakan evaluasi efisiensi utilitas.`
      });
    } else {
      smartInsights.push({
        type: 'success',
        icon: 'fa-circle-check',
        title: 'Cashflow Positif (Surplus)',
        desc: `Surplus bulanan Anda sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(sisaUang)} (${(100 - persentasePengeluaran).toFixed(1)}% dari gaji). Dapat dialokasikan ke tabungan atau dana darurat.`
      });
    }

    if (rasioPokok > 60) {
      smartInsights.push({
        type: 'warning',
        icon: 'fa-chart-pie',
        title: 'Beban Kebutuhan Pokok Tinggi (>60%)',
        desc: `Kebutuhan pokok menyerap ${rasioPokok.toFixed(0)}% dari pemasukan (ideal: maks 50% aturan 50/30/20). Periksa efisiensi listrik, pemilihan paket internet, atau sewa.`
      });
    }

    if (rasioTabungan < 10) {
      smartInsights.push({
        type: 'warning',
        icon: 'fa-piggy-bank',
        title: 'Rasio Tabungan di Bawah 10%',
        desc: `Alokasi tabungan saat ini ${rasioTabungan.toFixed(1)}% dari income. Disarankan menyisihkan minimal 10% - 20% secara konsisten di awal bulan.`
      });
    } else {
      smartInsights.push({
        type: 'success',
        icon: 'fa-seedling',
        title: 'Pertumbuhan Tabungan Sehat',
        desc: `Rasio tabungan & investasi Anda mencapai ${rasioTabungan.toFixed(1)}% dari pemasukan. Pertahankan disiplin alokasi rutin.`
      });
    }

    if (highestItem) {
      smartInsights.push({
        type: 'info',
        icon: 'fa-magnifying-glass-dollar',
        title: 'Pos Pengeluaran Tertinggi',
        desc: `Pos terbesar saat ini adalah <strong>${highestItem.name}</strong> sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(highestItem.amount)}. Awasi pos ini agar tidak terjadi kebocoran anggaran.`
      });
    }

    if (inflationPercent > 0) {
      smartInsights.push({
        type: 'info',
        icon: 'fa-arrow-trend-up',
        title: `Simulasi Kenaikan Harga (+${inflationPercent}%)`,
        desc: `Jika harga kebutuhan pokok naik ${inflationPercent}%, pengeluaran bertambah ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(dampakInflasi)}/bulan. Buffer safety membantu menyerap guncangan ini.`
      });
    }

    return {
      income,
      profile,
      inflationPercent,
      dampakInflasi,
      chartMode,
      bufferPercent,
      danaBufferSafety,
      totalExtraTopups,
      totalPokok,
      totalTabungan,
      totalLainnya,
      totalPengeluaranRencana,
      totalPengeluaranTotal,
      sisaUang,
      isSurplus,
      persentasePengeluaran,
      rasioPokok,
      rasioTabungan,
      rasioLifestyle,
      categoryTotals,
      smartInsights,
      budgetsList: Object.values(budgets),
      extraTopupsList: extraTopups
    };
  }
};
