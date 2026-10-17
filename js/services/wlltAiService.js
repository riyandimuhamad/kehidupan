/**
 * WlltAiService: Financial Assistant that parses transactions from natural language,
 * generates humorous roasting or weekly financial audits, and answers money questions.
 */

import { WalletStore } from './walletStore.js';
import { formatRupiah } from '../utils/formatters.js';

export const WlltAiService = {
  // Parse natural language input like "Beli obat flu batuk 35rb di apotek pakai mandiri"
  parseTransactionInput: (text) => {
    if (!text || typeof text !== 'string') return null;

    const lower = text.toLowerCase().trim();

    // Check if it's an expense or income
    const isIncome = /gaji|bonus|terima|dapat|masuk|jual|freelance|transferan/i.test(lower);
    const type = isIncome ? 'income' : 'expense';

    // Parse amount: support "35rb", "35k", "35000", "1.5jt", "2 juta", "500 ribu"
    let amount = 0;
    const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i);
    const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)\b/i);
    const numMatch = lower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/i);

    if (jtMatch) {
      amount = parseFloat(jtMatch[1].replace(',', '.')) * 1000000;
    } else if (rbMatch) {
      amount = parseFloat(rbMatch[1].replace(',', '.')) * 1000;
    } else if (numMatch) {
      const cleaned = numMatch[1].replace(/\./g, '');
      amount = parseInt(cleaned, 10);
    }

    // Determine category
    let category = 'Lain-lain';
    if (/makan|warteg|kopi|nasi|resto|ayam|sate|food|cafe|minum/i.test(lower)) {
      category = 'Food & Dining';
    } else if (/obat|dokter|flu|batuk|apotek|vitamin|klinik|rs|kesehatan/i.test(lower)) {
      category = 'Kesehatan';
    } else if (/kos|kontrakan|sewa|kpr|rumah|housing|ipl/i.test(lower)) {
      category = 'Housing';
    } else if (/baju|celana|kaos|uniqlo|zara|sepatu|fashion|shopping/i.test(lower)) {
      category = 'Shopping';
    } else if (/bensin|bbm|pertalite|pertamax|ojol|grab|gojek|parkir|tol/i.test(lower)) {
      category = 'Transport';
    } else if (/pulsa|kuota|wifi|internet|indihome|telkomsel/i.test(lower)) {
      category = 'Internet & Pulsa';
    } else if (/gaji|salary|honor|upah/i.test(lower)) {
      category = 'Salary';
    } else if (/freelance|proyek|jual aplikasi|client/i.test(lower)) {
      category = 'Freelance';
    }

    // Determine wallet
    let walletId = 'bca';
    if (/mandiri/i.test(lower)) walletId = 'mandiri';
    else if (/gopay/i.test(lower)) walletId = 'gopay';
    else if (/tunai|cash|dompet/i.test(lower)) walletId = 'tunai';
    else if (/bca/i.test(lower)) walletId = 'bca';

    // Title / Note
    let title = text.replace(/(?:pakai|pake|via|di)\s*(?:mandiri|bca|gopay|tunai)/gi, '').trim();
    if (title.length > 40) title = title.substring(0, 40) + '...';
    if (!title) title = isIncome ? 'Pemasukan Baru' : 'Pengeluaran Baru';

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      amount,
      type,
      walletId,
      category,
      date: new Date().toISOString().split('T')[0]
    };
  },

  // Generate humorous roast or weekly audit
  generateRoastAnalysis: () => {
    const overview = WalletStore.calculateOverview();
    const transactions = WalletStore.getTransactions();
    const profile = WalletStore.getUserProfile();

    const topExpenses = Object.entries(overview.categoryExpenses || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    let topExpensesText = '';
    topExpenses.forEach(([cat, val], idx) => {
      topExpensesText += `\n${idx + 1}. **${cat}** (${formatRupiah(val)})\n`;
      if (cat.toLowerCase().includes('shop') || cat.toLowerCase().includes('fashion')) {
        topExpensesText += `Katanya promo diskon, tapi yang ada saldo kamu yang boncos! Sepatu & pakaian emang keren, tapi kalau dipakai jalan ke tanggal tua nanti kerasa berat karena perut lapar 😭.`;
      } else if (cat.toLowerCase().includes('food') || cat.toLowerCase().includes('makan')) {
        topExpensesText += `Makan enak setiap hari, kopi kekinian jalan terus. Ingat, lidah cuma merasakan sedap 5 detik di tenggorokan, tapi dompet nahan tangis sebulan penuh! ☕`;
      } else if (cat.toLowerCase().includes('hous') || cat.toLowerCase().includes('kos')) {
        topExpensesText += `Pengeluaran tempat tinggal emang wajib dan mulia, tapi pastikan sisa budget masih aman buat makan ya! 🏠`;
      } else {
        topExpensesText += `Pos ini lumayan memakan porsi kas kamu. Perlu dipantau sebelum jadi kebiasaan boros! ⚡`;
      }
    });

    const percentUsed = overview.totalPlannedBudget > 0 ? Math.round((overview.totalPengeluaranBulan / overview.totalPlannedBudget) * 100) : 40;

    return `Baru juga awal/tengah siklus, dompet kamu sekarang udah mulai **kejang-kejang**! 😭💀\n\n` +
      `Kamu udah berhasil mengeluarkan uang sebanyak **${formatRupiah(overview.totalPengeluaranBulan)}** dari alokasi budget bulanan **${formatRupiah(overview.totalPlannedBudget)}**. ` +
      `Itu artinya sekitar **${percentUsed}% budget** kamu udah terserap! 🚀🔥\n\n` +
      `Berikut rincian pos pengeluaran terbesar kamu:\n${topExpensesText}\n\n` +
      `💡 **Saran WLLT-Ai**: Sisa batas aman harian kamu sekarang adalah **~${formatRupiah(overview.sisaBatasAmanHarian)}/hari** sampai akhir bulan. Tahan diri dulu dari godaan checkout e-commerce ya! 😉`;
  },

  // General assistant response logic
  respond: (userMessage) => {
    const lower = userMessage.toLowerCase().trim();

    // Check if user is asking for analysis / roast
    if (/analisa|review|roast|evaluasi|pengeluaran saya|minggu ini|audit/i.test(lower)) {
      return {
        type: 'text',
        text: WlltAiService.generateRoastAnalysis()
      };
    }

    // Check if user is inputting a transaction: e.g. "beli obat flu 35rb" or "gaji 15jt"
    const parsed = WlltAiService.parseTransactionInput(userMessage);
    if (parsed && parsed.amount > 0) {
      return {
        type: 'confirm_transaction',
        parsed,
        text: `Baik! Saya mendeteksi transaksi baru. Silakan konfirmasi rinciannya di bawah ini:`
      };
    }

    // Default conversational reply
    const overview = WalletStore.calculateOverview();
    return {
      type: 'text',
      text: `Saldo total dompet aktifmu saat ini adalah **${formatRupiah(overview.totalSaldo)}** dengan sisa batas aman belanja harian **~${formatRupiah(overview.sisaBatasAmanHarian)}/hari**.\n\nKamu bisa mengetik hal seperti:\n• *"Beli kopi susu 22rb via gopay"*\n• *"Makan malam sate 45rb tunai"*\n• *"Analisa pengeluaran saya minggu ini"*`
    };
  }
};
