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

const STORAGE_KEY_SELECTED_PERIOD = 'selected_budget_period';
const STORAGE_KEY_BUDGET_HISTORY = 'budget_monthly_history';

// Helper to get formatted current month key: YYYY-MM (e.g. 2026-10)
export const getCurrentPeriodKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const formatPeriodLabel = (periodKey) => {
  if (!periodKey) return '-';
  const [year, month] = periodKey.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx] || month} ${year}`;
};

export const BudgetStore = {
  // Periode Aktif (Bulan & Tahun)
  getSelectedPeriod: () => {
    return getFromStorage(STORAGE_KEY_SELECTED_PERIOD, getCurrentPeriodKey());
  },

  setSelectedPeriod: (periodKey) => {
    saveToStorage(STORAGE_KEY_SELECTED_PERIOD, periodKey);
  },

  // Riwayat Catatan Bulanan (Multi-Bulan Snapshots)
  getHistory: () => {
    return getFromStorage(STORAGE_KEY_BUDGET_HISTORY, {});
  },

  saveHistorySnapshot: (periodKey, data) => {
    const history = BudgetStore.getHistory();
    history[periodKey] = {
      ...data,
      updatedAt: new Date().toISOString(),
      periodKey
    };
    saveToStorage(STORAGE_KEY_BUDGET_HISTORY, history);
    return history;
  },

  getAvailablePeriods: () => {
    const history = BudgetStore.getHistory();
    const currentPeriod = BudgetStore.getSelectedPeriod();
    const periodSet = new Set(Object.keys(history));
    periodSet.add(currentPeriod);
    periodSet.add(getCurrentPeriodKey());

    // Hitung juga 3 bulan ke belakang secara otomatis
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const pastKey = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}`;
      periodSet.add(pastKey);
    }

    return Array.from(periodSet).sort().reverse();
  },
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
      pajak: { id: 'pajak', name: 'PBB & Administrasi Tahunan', amount: 150000, category: 'Pokok', group: 'pajak', source: 'Kalkulator Pajak' },
      zakat: { id: 'zakat', name: 'Zakat & Donasi Sosial', amount: 212500, category: 'Pokok', group: 'pajak', source: 'Kalkulator Zakat BAZNAS' },
      tabungan: { id: 'tabungan', name: 'Tabungan & Dana Darurat', amount: 1000000, category: 'Tabungan', group: 'investasi', source: 'Kalkulator Tabungan' }
    });
  },

  saveBudgetItem: (id, data) => {
    const current = BudgetStore.getBudgets();
    const nowIso = new Date().toISOString();
    const periodKey = data.period || BudgetStore.getSelectedPeriod();

    current[id] = {
      ...current[id],
      ...data,
      period: periodKey,
      updatedAt: nowIso
    };
    saveToStorage(STORAGE_KEY_BUDGETS, current);

    // Otomatis sinkronkan snapshot ke Riwayat Bulanan (Monthly Ledger)
    const history = BudgetStore.getHistory();
    const periodEntry = history[periodKey] || {
      periodKey,
      income: BudgetStore.getIncome(),
      items: {},
      createdAt: nowIso
    };

    periodEntry.items = periodEntry.items || {};
    periodEntry.items[id] = {
      ...current[id]
    };
    periodEntry.updatedAt = nowIso;
    history[periodKey] = periodEntry;
    saveToStorage(STORAGE_KEY_BUDGET_HISTORY, history);

    return current;
  },

  // Mendapatkan ringkasan riwayat bulan tertentu (untuk perbandingan)
  getPeriodSummary: (targetPeriodKey) => {
    const history = BudgetStore.getHistory();
    const entry = history[targetPeriodKey];
    if (!entry || !entry.items) return null;

    let totalPokok = 0;
    let totalTabungan = 0;
    let totalLainnya = 0;

    Object.values(entry.items).forEach(b => {
      const amt = Number(b.amount) || 0;
      if (b.category === 'Tabungan') totalTabungan += amt;
      else if (b.category === 'Lainnya') totalLainnya += amt;
      else totalPokok += amt;
    });

    const income = Number(entry.income) || BudgetStore.getIncome();
    const totalPengeluaran = totalPokok + totalTabungan + totalLainnya;
    const sisaUang = income - totalPengeluaran;

    return {
      periodKey: targetPeriodKey,
      income,
      totalPokok,
      totalTabungan,
      totalLainnya,
      totalPengeluaran,
      sisaUang,
      isSurplus: sisaUang >= 0,
      items: entry.items,
      updatedAt: entry.updatedAt
    };
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
      'Pajak & Zakat': 0,
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
        } else if (['pajak', 'zakat'].includes(id)) {
          categoryTotals['Pajak & Zakat'] += amt;
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

    // Perbandingan dengan Bulan Sebelumnya (Comparison with previous month)
    const selectedPeriod = BudgetStore.getSelectedPeriod();
    const [currY, currM] = selectedPeriod.split('-').map(Number);
    const prevDate = new Date(currY, currM - 2, 1);
    const prevPeriodKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevSummary = BudgetStore.getPeriodSummary(prevPeriodKey);

    let comparison = null;
    if (prevSummary) {
      const diffPengeluaran = totalPengeluaranTotal - prevSummary.totalPengeluaran;
      const pctChange = prevSummary.totalPengeluaran > 0 
        ? ((diffPengeluaran / prevSummary.totalPengeluaran) * 100).toFixed(1)
        : 0;
      
      comparison = {
        prevPeriodKey,
        prevPeriodLabel: formatPeriodLabel(prevPeriodKey),
        prevPengeluaran: prevSummary.totalPengeluaran,
        diffPengeluaran,
        pctChange,
        isHigher: diffPengeluaran > 0
      };

      if (diffPengeluaran > 0) {
        smartInsights.push({
          type: 'warning',
          icon: 'fa-arrow-trend-up',
          title: `Pengeluaran Naik vs ${comparison.prevPeriodLabel}`,
          desc: `Total estimasi anggaran bulan ini lebih tinggi <strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(diffPengeluaran))}</strong> (+${pctChange}%) dibandingkan bulan lalu.`
        });
      } else if (diffPengeluaran < 0) {
        smartInsights.push({
          type: 'success',
          icon: 'fa-arrow-trend-down',
          title: `Pengeluaran Lebih Hemat vs ${comparison.prevPeriodLabel}`,
          desc: `Bagus! Pengeluaran berhasil ditekan hemat sebesar <strong>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(diffPengeluaran))}</strong> (${pctChange}%) dari bulan lalu.`
        });
      }
    }

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
      selectedPeriod,
      periodLabel: formatPeriodLabel(selectedPeriod),
      comparison,
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
