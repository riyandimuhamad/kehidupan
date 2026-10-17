/**
 * WalletStore: Data management for Wallets, Daily Transactions, Debt/Receivables,
 * Goals, Subscriptions/Recurring, and AI Financial Assistant.
 * Seamlessly integrates with BudgetStore (Saved Allocations & History).
 */

import { saveToStorage, getFromStorage, formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore, getCurrentPeriodKey } from './budgetStore.js';

const STORAGE_KEY_WALLETS = 'rb_wallets_data';
const STORAGE_KEY_TRANSACTIONS = 'rb_transactions_data';
const STORAGE_KEY_DEBTS = 'rb_debts_data';
const STORAGE_KEY_RECEIVABLES = 'rb_receivables_data';
const STORAGE_KEY_GOALS = 'rb_goals_data';
const STORAGE_KEY_SUBSCRIPTIONS = 'rb_subscriptions_data';
const STORAGE_KEY_USER_PROFILE = 'rb_user_profile_data';
const STORAGE_KEY_AI_CHAT = 'rb_ai_chat_history';

// Default starter wallets
const DEFAULT_WALLETS = [
  { id: 'bca', name: 'Bank BCA', type: 'bank', balance: 28500000, icon: 'fa-building-columns', color: '#2563eb' },
  { id: 'gopay', name: 'GoPay', type: 'ewallet', balance: 2150000, icon: 'fa-mobile-screen', color: '#00aed6' },
  { id: 'mandiri', name: 'Bank Mandiri', type: 'bank', balance: 16450000, icon: 'fa-building-columns', color: '#d97706' },
  { id: 'tunai', name: 'Dompet Tunai', type: 'cash', balance: 500000, icon: 'fa-wallet', color: '#10b981' }
];

// Default starter transactions for demonstration
const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx_1',
    title: 'Gaji Bulanan',
    amount: 14500000,
    type: 'income',
    walletId: 'bca',
    category: 'Salary',
    date: '2026-06-24',
    time: '09:00',
    notes: 'Gaji pokok bulanan'
  },
  {
    id: 'tx_2',
    title: 'Bayar Kos Juni',
    amount: 3500000,
    type: 'expense',
    walletId: 'bca',
    category: 'Housing',
    budgetId: 'sewa', // Linked to module Sewa/Kos
    date: '2026-06-23',
    time: '14:20',
    notes: 'Kamar lantai 2'
  },
  {
    id: 'tx_3',
    title: 'Makan Siang Warteg',
    amount: 45000,
    type: 'expense',
    walletId: 'tunai',
    category: 'Food & Dining',
    budgetId: 'harian',
    date: '2026-06-22',
    time: '12:30',
    notes: 'Ayam rica + tempe orek + es teh'
  },
  {
    id: 'tx_4',
    title: 'Celana Jeans Uniqlo',
    amount: 375000,
    type: 'expense',
    walletId: 'gopay',
    category: 'Shopping',
    budgetId: 'sandang',
    date: '2026-06-20',
    time: '19:45',
    notes: 'Promo akhir pekan'
  },
  {
    id: 'tx_5',
    title: 'Beli Obat Flu Batuk',
    amount: 35000,
    type: 'expense',
    walletId: 'mandiri',
    category: 'Kesehatan',
    budgetId: 'kesehatan',
    date: '2026-06-20',
    time: '21:10',
    notes: 'Apotek K-24'
  }
];

// Default starter debts (Hutang)
const DEFAULT_DEBTS = [
  {
    id: 'debt_kpr',
    name: 'KPR Bank Mandiri',
    type: 'KPR',
    totalPrincipal: 350000000,
    remainingAmount: 280000000,
    monthlyPayment: 2800000,
    paidAmount: 70000000,
    status: 'active',
    dueDate: '2026-07-10',
    icon: 'fa-house-chimney'
  },
  {
    id: 'debt_motor',
    name: 'Cicilan Motor Vario',
    type: 'Kendaraan',
    totalPrincipal: 24000000,
    remainingAmount: 8000000,
    monthlyPayment: 1000000,
    paidAmount: 16000000,
    status: 'active',
    dueDate: '2026-07-15',
    icon: 'fa-motorcycle'
  }
];

// Default starter receivables (Piutang)
const DEFAULT_RECEIVABLES = [
  {
    id: 'rec_warung',
    name: 'Modal Warung Kelontong',
    borrowerName: 'Budi Santoso',
    totalLoan: 5000000,
    collectedAmount: 1500000,
    remainingAmount: 3500000,
    dueDate: '2026-08-20',
    status: 'active',
    icon: 'fa-store'
  },
  {
    id: 'rec_darurat',
    name: 'Pinjaman Uang Darurat',
    borrowerName: 'Ani Suryani',
    totalLoan: 1500000,
    collectedAmount: 0,
    remainingAmount: 1500000,
    dueDate: '2026-07-05',
    status: 'active',
    icon: 'fa-hand-holding-dollar'
  }
];

// Default starter goals (Tujuan Keuangan)
const DEFAULT_GOALS = [
  {
    id: 'goal_darurat',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 60000000,
    currentAmount: 25000000,
    targetDate: '2026-12-31',
    icon: 'fa-shield-halved',
    color: '#10b981'
  },
  {
    id: 'goal_liburan',
    title: 'Liburan ke Jepang',
    targetAmount: 25000000,
    currentAmount: 8500000,
    targetDate: '2027-05-30',
    icon: 'fa-plane-departure',
    color: '#0ea5e9'
  }
];

// Default starter subscriptions
const DEFAULT_SUBSCRIPTIONS = [
  {
    id: 'sub_spotify',
    name: 'Spotify Premium',
    amount: 54990,
    category: 'Entertainment',
    walletId: 'mandiri',
    billingCycle: 'monthly',
    dueDate: '2026-08-08',
    status: 'active',
    icon: 'fa-brands fa-spotify',
    color: '#1ed760'
  },
  {
    id: 'sub_netflix',
    name: 'Netflix',
    amount: 186000,
    category: 'Entertainment',
    walletId: 'mandiri',
    billingCycle: 'monthly',
    dueDate: '2026-08-22',
    status: 'active',
    icon: 'fa-film',
    color: '#e50914'
  }
];

export const WalletStore = {
  // --- WALLETS ---
  getWallets: () => {
    return getFromStorage(STORAGE_KEY_WALLETS, DEFAULT_WALLETS);
  },

  saveWallets: (wallets) => {
    saveToStorage(STORAGE_KEY_WALLETS, wallets);
  },

  addWallet: (wallet) => {
    const wallets = WalletStore.getWallets();
    const newWallet = {
      id: 'w_' + Date.now(),
      balance: 0,
      icon: 'fa-wallet',
      color: '#6366f1',
      ...wallet
    };
    wallets.push(newWallet);
    WalletStore.saveWallets(wallets);
    return newWallet;
  },

  updateWalletBalance: (walletId, amountChange) => {
    const wallets = WalletStore.getWallets();
    const idx = wallets.findIndex(w => w.id === walletId);
    if (idx !== -1) {
      wallets[idx].balance = (wallets[idx].balance || 0) + amountChange;
      WalletStore.saveWallets(wallets);
    }
  },

  getTotalWalletBalance: () => {
    const wallets = WalletStore.getWallets();
    return wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  },

  // --- TRANSACTIONS ---
  getTransactions: () => {
    return getFromStorage(STORAGE_KEY_TRANSACTIONS, DEFAULT_TRANSACTIONS);
  },

  saveTransactions: (txs) => {
    saveToStorage(STORAGE_KEY_TRANSACTIONS, txs);
  },

  addTransaction: (tx) => {
    const txs = WalletStore.getTransactions();
    const newTx = {
      id: 'tx_' + Date.now(),
      date: tx.date || new Date().toISOString().split('T')[0],
      time: tx.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      ...tx
    };
    
    // Auto adjust wallet balance
    const amt = Number(newTx.amount) || 0;
    if (newTx.type === 'income') {
      WalletStore.updateWalletBalance(newTx.walletId, amt);
    } else if (newTx.type === 'expense') {
      WalletStore.updateWalletBalance(newTx.walletId, -amt);
    } else if (newTx.type === 'transfer' && newTx.targetWalletId) {
      WalletStore.updateWalletBalance(newTx.walletId, -amt);
      WalletStore.updateWalletBalance(newTx.targetWalletId, amt);
    }

    txs.unshift(newTx);
    WalletStore.saveTransactions(txs);
    return newTx;
  },

  deleteTransaction: (id) => {
    const txs = WalletStore.getTransactions();
    const target = txs.find(t => t.id === id);
    if (target) {
      // Revert wallet balance
      const amt = Number(target.amount) || 0;
      if (target.type === 'income') {
        WalletStore.updateWalletBalance(target.walletId, -amt);
      } else if (target.type === 'expense') {
        WalletStore.updateWalletBalance(target.walletId, amt);
      } else if (target.type === 'transfer' && target.targetWalletId) {
        WalletStore.updateWalletBalance(target.walletId, amt);
        WalletStore.updateWalletBalance(target.targetWalletId, -amt);
      }
    }
    const filtered = txs.filter(t => t.id !== id);
    WalletStore.saveTransactions(filtered);
    return filtered;
  },

  // --- DEBTS (HUTANG) ---
  getDebts: () => {
    return getFromStorage(STORAGE_KEY_DEBTS, DEFAULT_DEBTS);
  },

  saveDebts: (debts) => {
    saveToStorage(STORAGE_KEY_DEBTS, debts);
  },

  addDebt: (debt) => {
    const debts = WalletStore.getDebts();
    const newDebt = {
      id: 'debt_' + Date.now(),
      paidAmount: 0,
      status: 'active',
      icon: 'fa-file-invoice-dollar',
      ...debt
    };
    debts.push(newDebt);
    WalletStore.saveDebts(debts);
    return newDebt;
  },

  payDebtInstallment: (debtId, payAmount, walletId = 'bca') => {
    const debts = WalletStore.getDebts();
    const idx = debts.findIndex(d => d.id === debtId);
    if (idx === -1) return null;

    const amt = Number(payAmount) || 0;
    debts[idx].paidAmount = (debts[idx].paidAmount || 0) + amt;
    debts[idx].remainingAmount = Math.max(0, (debts[idx].remainingAmount || 0) - amt);
    if (debts[idx].remainingAmount <= 0) {
      debts[idx].status = 'lunas';
    }
    WalletStore.saveDebts(debts);

    // Record as transaction
    WalletStore.addTransaction({
      title: `Bayar Cicilan: ${debts[idx].name}`,
      amount: amt,
      type: 'expense',
      walletId,
      category: 'Hutang & Cicilan',
      notes: `Pembayaran angsuran sisa hutang ${formatRupiah(debts[idx].remainingAmount)}`
    });

    return debts[idx];
  },

  // --- RECEIVABLES (PIUTANG) ---
  getReceivables: () => {
    return getFromStorage(STORAGE_KEY_RECEIVABLES, DEFAULT_RECEIVABLES);
  },

  saveReceivables: (recs) => {
    saveToStorage(STORAGE_KEY_RECEIVABLES, recs);
  },

  addReceivable: (rec) => {
    const recs = WalletStore.getReceivables();
    const newRec = {
      id: 'rec_' + Date.now(),
      collectedAmount: 0,
      status: 'active',
      icon: 'fa-handshake',
      ...rec
    };
    recs.push(newRec);
    WalletStore.saveReceivables(recs);
    return newRec;
  },

  collectReceivable: (recId, collectAmount, walletId = 'bca') => {
    const recs = WalletStore.getReceivables();
    const idx = recs.findIndex(r => r.id === recId);
    if (idx === -1) return null;

    const amt = Number(collectAmount) || 0;
    recs[idx].collectedAmount = (recs[idx].collectedAmount || 0) + amt;
    recs[idx].remainingAmount = Math.max(0, (recs[idx].remainingAmount || 0) - amt);
    if (recs[idx].remainingAmount <= 0) {
      recs[idx].status = 'lunas';
    }
    WalletStore.saveReceivables(recs);

    // Record as income transaction
    WalletStore.addTransaction({
      title: `Terima Bayar: ${recs[idx].name} (${recs[idx].borrowerName})`,
      amount: amt,
      type: 'income',
      walletId,
      category: 'Piutang',
      notes: `Pelunasan/cicilan piutang dari ${recs[idx].borrowerName}`
    });

    return recs[idx];
  },

  // --- GOALS (TUJUAN KEUANGAN) ---
  getGoals: () => {
    return getFromStorage(STORAGE_KEY_GOALS, DEFAULT_GOALS);
  },

  saveGoals: (goals) => {
    saveToStorage(STORAGE_KEY_GOALS, goals);
  },

  addGoal: (goal) => {
    const goals = WalletStore.getGoals();
    const newGoal = {
      id: 'goal_' + Date.now(),
      currentAmount: 0,
      icon: 'fa-bullseye',
      color: '#8b5cf6',
      ...goal
    };
    goals.push(newGoal);
    WalletStore.saveGoals(goals);
    return newGoal;
  },

  topupGoal: (goalId, amount, walletId = 'bca') => {
    const goals = WalletStore.getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) return null;

    const amt = Number(amount) || 0;
    goals[idx].currentAmount = (goals[idx].currentAmount || 0) + amt;
    WalletStore.saveGoals(goals);

    WalletStore.addTransaction({
      title: `Setor Goal: ${goals[idx].title}`,
      amount: amt,
      type: 'expense',
      walletId,
      category: 'Tabungan & Goals',
      notes: `Alokasi tabungan untuk ${goals[idx].title}`
    });

    return goals[idx];
  },

  // --- SUBSCRIPTIONS (BERULANG & LANGGANAN) ---
  getSubscriptions: () => {
    return getFromStorage(STORAGE_KEY_SUBSCRIPTIONS, DEFAULT_SUBSCRIPTIONS);
  },

  saveSubscriptions: (subs) => {
    saveToStorage(STORAGE_KEY_SUBSCRIPTIONS, subs);
  },

  addSubscription: (sub) => {
    const subs = WalletStore.getSubscriptions();
    const newSub = {
      id: 'sub_' + Date.now(),
      status: 'active',
      icon: 'fa-arrows-rotate',
      color: '#6366f1',
      ...sub
    };
    subs.push(newSub);
    WalletStore.saveSubscriptions(subs);
    return newSub;
  },

  deleteSubscription: (id) => {
    const subs = WalletStore.getSubscriptions();
    const filtered = subs.filter(s => s.id !== id);
    WalletStore.saveSubscriptions(filtered);
    return filtered;
  },

  // --- USER PROFILE & USERNAME ---
  getUserProfile: () => {
    const hr = new Date().getHours();
    let dynamicGreeting = 'Selamat Pagi';
    if (hr >= 11 && hr < 15) dynamicGreeting = 'Selamat Siang';
    else if (hr >= 15 && hr < 18) dynamicGreeting = 'Selamat Sore';
    else if (hr >= 18 || hr < 4) dynamicGreeting = 'Selamat Malam';

    return getFromStorage(STORAGE_KEY_USER_PROFILE, {
      name: 'Riyandi',
      greeting: dynamicGreeting,
      avatarUrl: ''
    });
  },

  saveUserProfile: (profile) => {
    saveToStorage(STORAGE_KEY_USER_PROFILE, profile);
  },

  // --- AI CHAT HISTORY ---
  getAiChatHistory: () => {
    return getFromStorage(STORAGE_KEY_AI_CHAT, [
      {
        sender: 'ai',
        text: 'Halo! Saya WLLT-Ai, asisten keuangan pribadimu 🤖✨. Mau catat transaksi cepat, konsultasi budget, atau minta roasting pengeluaran minggu ini?',
        time: 'Baru saja'
      }
    ]);
  },

  saveAiChatHistory: (history) => {
    saveToStorage(STORAGE_KEY_AI_CHAT, history);
  },

  // --- AGGREGATION & METRICS CALCULATIONS ---
  calculateOverview: () => {
    const wallets = WalletStore.getWallets();
    const transactions = WalletStore.getTransactions();
    const debts = WalletStore.getDebts();
    const receivables = WalletStore.getReceivables();
    const savedBudgets = BudgetStore.getBudgets(); // Integrated with RumahBudget module calculations!

    const totalSaldo = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

    // Filter current month transactions
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalPemasukanBulan = 0;
    let totalPengeluaranBulan = 0;
    const categoryExpenses = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.date && t.date.startsWith(currentMonthPrefix)) {
        if (t.type === 'income') {
          totalPemasukanBulan += amt;
        } else if (t.type === 'expense') {
          totalPengeluaranBulan += amt;
          categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + amt;
        }
      }
    });

    // Total Monthly Budget Planned from Household Calculators + BudgetStore
    let totalPlannedBudget = 0;
    Object.values(savedBudgets).forEach(b => {
      totalPlannedBudget += (Number(b.amount) || 0);
    });

    // Fallback if planned budget not set yet: use income or reasonable baseline
    if (totalPlannedBudget === 0) {
      totalPlannedBudget = BudgetStore.getIncome() || 47100000;
    }

    const sisaBudgetBisaDipakai = Math.max(0, totalPlannedBudget - totalPengeluaranBulan);

    // Days remaining in month calculation
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysLeft = Math.max(1, daysInMonth - currentDay + 1);
    const sisaBatasAmanHarian = Math.round(sisaBudgetBisaDipakai / daysLeft);

    // Debt aggregates
    const activeDebts = debts.filter(d => d.status === 'active');
    const totalSisaHutang = activeDebts.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0);
    const totalTerbayarHutang = debts.reduce((sum, d) => sum + (Number(d.paidAmount) || 0), 0);
    const totalPokokHutang = debts.reduce((sum, d) => sum + (Number(d.totalPrincipal) || (Number(d.remainingAmount) + Number(d.paidAmount))), 0);
    const totalCicilanBulan = activeDebts.reduce((sum, d) => sum + (Number(d.monthlyPayment) || 0), 0);
    const debtProgressPercent = totalPokokHutang > 0 ? Math.round((totalTerbayarHutang / totalPokokHutang) * 100) : 0;

    // Receivables aggregates
    const activeRecs = receivables.filter(r => r.status === 'active');
    const totalPiutangAktif = activeRecs.reduce((sum, r) => sum + (Number(r.remainingAmount) || 0), 0);
    const totalPiutangTerkumpul = receivables.reduce((sum, r) => sum + (Number(r.collectedAmount) || 0), 0);
    const totalPiutangDipinjamkan = receivables.reduce((sum, r) => sum + (Number(r.totalLoan) || 0), 0);

    // Health score calculations (0 - 100)
    // 1. Rasio Tabungan: (Pemasukan - Pengeluaran) / Pemasukan
    const savingsRatio = totalPemasukanBulan > 0 ? Math.max(0, ((totalPemasukanBulan - totalPengeluaranBulan) / totalPemasukanBulan) * 100) : 0;
    
    // 2. Disiplin Anggaran: 100 - (Pengeluaran / PlannedBudget)
    const budgetUsageRatio = totalPlannedBudget > 0 ? (totalPengeluaranBulan / totalPlannedBudget) : 0;
    const budgetDiscipline = Math.max(0, Math.min(100, Math.round((1 - (budgetUsageRatio > 1 ? (budgetUsageRatio - 1) : 0)) * 100)));

    // 3. Emergency Runway (Bulan): Saldo / Pengeluaran Bulanan
    const avgMonthlySpend = totalPengeluaranBulan > 0 ? totalPengeluaranBulan : (totalPlannedBudget || 3000000);
    const runwayMonths = (totalSaldo / avgMonthlySpend).toFixed(1);

    // 4. Beban Utang (DSR - Debt Service Ratio): Cicilan / Pemasukan
    const dsrRatio = totalPemasukanBulan > 0 ? Math.min(100, Math.round((totalCicilanBulan / totalPemasukanBulan) * 100)) : 0;

    // Weighted Financial Health Score
    // Ideal: Savings >= 20% (weight 25), Discipline >= 80% (weight 30), Runway >= 6bln (weight 25), DSR <= 30% (weight 20)
    let score = 0;
    score += Math.min(25, (savingsRatio / 20) * 25);
    score += (budgetDiscipline / 100) * 30;
    score += Math.min(25, (parseFloat(runwayMonths) / 6) * 25);
    score += Math.max(0, (1 - (dsrRatio / 50)) * 20);
    const healthScore = Math.min(100, Math.max(10, Math.round(score)));

    let healthStatus = 'Kurang Sehat';
    if (healthScore >= 80) healthStatus = 'Sangat Sehat';
    else if (healthScore >= 65) healthStatus = 'Cukup Sehat';
    else if (healthScore >= 50) healthStatus = 'Kurang Sehat';
    else healthStatus = 'Kritis / Waspada';

    return {
      totalSaldo,
      totalPemasukanBulan,
      totalPengeluaranBulan,
      totalPlannedBudget,
      sisaBudgetBisaDipakai,
      sisaBatasAmanHarian,
      daysInMonth,
      currentDay,
      daysLeft,
      totalSisaHutang,
      totalTerbayarHutang,
      totalPokokHutang,
      totalCicilanBulan,
      debtProgressPercent,
      totalPiutangAktif,
      totalPiutangTerkumpul,
      totalPiutangDipinjamkan,
      healthScore,
      healthStatus,
      savingsRatio: Math.round(savingsRatio),
      budgetDiscipline,
      runwayMonths,
      dsrRatio,
      categoryExpenses
    };
  }
};
