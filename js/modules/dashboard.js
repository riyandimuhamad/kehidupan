/**
 * Modul Dashboard Keuangan & Budget Planner (Dengan Buffer Safety & Top-Up Dadakan)
 * Kehidupan App Suite
 */

import { BudgetStore } from '../services/budgetStore.js';
import { SpreadsheetService } from '../services/spreadsheetService.js';
import { formatRupiah, formatNumber } from '../utils/formatters.js';

export const DashboardModule = {
  id: 'dashboard',
  name: 'Dashboard Keuangan',
  icon: 'fa-chart-line',
  badge: 'Perencanaan Keuangan Rumah Tangga',
  title: 'Dashboard Keuangan & Alokasi Anggaran',
  subtitle: 'Integrasikan hasil kalkulasi kebutuhan dengan Pemasukan Bulanan, Dana Cadangan Buffer, Top-Up Dadakan & Google Sheets.',

  defaults: {},

  renderForm: (container, onInputChange) => {
    const summary = BudgetStore.getFinancialSummary();

    container.innerHTML = `
      <!-- Input Pemasukan Bulanan -->
      <div class="form-group">
        <label for="monthly_income_input">Pemasukan / Gaji Bulanan <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-wallet fa-solid input-icon"></i>
          <input type="number" id="monthly_income_input" class="form-control" step="100000" value="${summary.income}">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="monthly_income_input" data-val="3000000">Rp 3 Jt</button>
          <button type="button" class="option-chip active" data-target="monthly_income_input" data-val="6000000">Rp 6 Jt</button>
          <button type="button" class="option-chip" data-target="monthly_income_input" data-val="10000000">Rp 10 Jt</button>
        </div>
      </div>

      <!-- Buffer Safety Margin (% Risk Mitigation if items run out early) -->
      <div class="form-group">
        <label for="buffer_percent_input">Dana Cadangan Buffer <span class="unit">(Safety Margin % Jika Habis Awal)</span></label>
        <div class="input-wrapper">
          <i class="fa-shield-heart fa-solid input-icon"></i>
          <input type="number" id="buffer_percent_input" class="form-control" min="0" max="50" step="5" value="${summary.bufferPercent}">
        </div>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">
          *Menyisihkan <strong>${formatRupiah(summary.danaBufferSafety)}</strong> (${summary.bufferPercent}%) untuk mengantisipasi jika beras/BBM/gas habis di minggu ke-3.
        </p>
      </div>

      <!-- Catat Top-Up Dadakan / Pengeluaran Lebih (Minggu 3 / Habis Awal) -->
      <div class="add-custom-budget-box" style="background: rgba(245, 158, 11, 0.08); padding: 16px; border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.25); margin-top: 18px;">
        <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 6px; color: var(--accent-amber);">
          <i class="fa-bolt-lightning fa-solid"></i> Catat Top-Up Dadakan (Kebutuhan Habis Awal)
        </h4>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px;">
          Jika BBM/Beras/Galon habis di minggu ke-3, catat pengeluaran ekstra di sini:
        </p>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="topup_item_name" class="form-control" placeholder="Nama (misal: BBM Tambahan M3)" style="padding-left: 12px; font-size: 0.85rem;">
          <input type="number" id="topup_item_amount" class="form-control" placeholder="Nominal (Rp)" style="padding-left: 12px; font-size: 0.85rem; width: 140px;">
        </div>
        <button type="button" id="addExtraTopupBtn" class="primary-btn" style="background: linear-gradient(135deg, var(--accent-amber), #d97706); width: 100%; padding: 8px 14px; font-size: 0.82rem; justify-content: center;">
          <i class="fa-plus fa-solid"></i> Tambah Catatan Top-Up Dadakan
        </button>
      </div>

      <!-- Tambah Item Custom Pos Manual -->
      <div class="add-custom-budget-box" style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 18px;">
        <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 10px; color: var(--text-main);"><i class="fa-plus fa-solid"></i> Tambah Pos Pengeluaran Manual</h4>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="custom_name_input" class="form-control" placeholder="Nama Pos (misal: Cicilan)" style="padding-left: 12px; font-size: 0.85rem;">
          <input type="number" id="custom_amount_input" class="form-control" placeholder="Biaya (Rp)" style="padding-left: 12px; font-size: 0.85rem; width: 140px;">
        </div>
        <div style="display: flex; gap: 8px;">
          <select id="custom_cat_input" class="form-control" style="padding-left: 12px; font-size: 0.85rem;">
            <option value="Pokok">Kategori: Kebutuhan Pokok</option>
            <option value="Tabungan">Kategori: Tabungan & Darurat</option>
            <option value="Lainnya">Kategori: Lainnya / Lifestyle</option>
          </select>
          <button type="button" id="addCustomBudgetBtn" class="primary-btn" style="padding: 8px 14px; font-size: 0.82rem; white-space: nowrap;">
            <i class="fa-check fa-solid"></i> Simpan Pos
          </button>
        </div>
      </div>

      <!-- Google Sheets Webhook Configuration Box -->
      <div class="sheet-config-box" style="margin-top: 20px; padding: 16px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-sm);">
        <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 6px; color: var(--accent-emerald);">
          <i class="fa-file-excel fa-solid"></i> Spreadsheet API Integration
        </h4>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">
          Hubungkan ke Google Sheets dengan memasukkan Webhook Apps Script URL.
        </p>
        <div class="input-wrapper" style="margin-bottom: 8px;">
          <i class="fa-link fa-solid input-icon"></i>
          <input type="url" id="sheet_webhook_input" class="form-control" placeholder="https://script.google.com/macros/s/.../exec" value="${BudgetStore.getSpreadsheetUrl()}" style="font-size: 0.8rem;">
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="saveSheetUrlBtn" class="outline-btn" style="padding: 6px 12px; font-size: 0.78rem;">
            Simpan Webhook URL
          </button>
          <button type="button" id="syncSpreadsheetBtn" class="primary-btn" style="background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 6px 14px; font-size: 0.78rem;">
            <i class="fa-rotate fa-solid"></i> Sync ke Google Sheets
          </button>
        </div>
        <div id="syncStatusMsg" style="font-size: 0.75rem; margin-top: 6px;"></div>
      </div>
    `;

    // Listeners for income & buffer
    const incomeInput = container.querySelector('#monthly_income_input');
    incomeInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      BudgetStore.setIncome(val);
      onInputChange();
    });

    const bufferInput = container.querySelector('#buffer_percent_input');
    bufferInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      BudgetStore.setBufferPercent(val);
      onInputChange();
    });

    const chips = container.querySelectorAll('.option-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        incomeInput.value = val;
        BudgetStore.setIncome(parseFloat(val));
        container.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        onInputChange();
      });
    });

    // Add Extra Top-Up listener
    const addTopupBtn = container.querySelector('#addExtraTopupBtn');
    addTopupBtn.addEventListener('click', () => {
      const name = container.querySelector('#topup_item_name').value.trim();
      const amount = parseFloat(container.querySelector('#topup_item_amount').value);

      if (name && amount > 0) {
        BudgetStore.addExtraTopup({ name, amount });
        container.querySelector('#topup_item_name').value = '';
        container.querySelector('#topup_item_amount').value = '';
        onInputChange();
      }
    });

    // Add Custom Budget listener
    const addBtn = container.querySelector('#addCustomBudgetBtn');
    addBtn.addEventListener('click', () => {
      const name = container.querySelector('#custom_name_input').value.trim();
      const amount = parseFloat(container.querySelector('#custom_amount_input').value);
      const cat = container.querySelector('#custom_cat_input').value;

      if (name && amount > 0) {
        const id = 'custom_' + Date.now();
        BudgetStore.saveBudgetItem(id, { id, name, amount, category: cat, source: 'Manual User' });
        container.querySelector('#custom_name_input').value = '';
        container.querySelector('#custom_amount_input').value = '';
        onInputChange();
      }
    });

    // Spreadsheet Sync Listener
    const saveSheetBtn = container.querySelector('#saveSheetUrlBtn');
    const syncSheetBtn = container.querySelector('#syncSpreadsheetBtn');
    const sheetInput = container.querySelector('#sheet_webhook_input');
    const statusMsg = container.querySelector('#syncStatusMsg');

    saveSheetBtn.addEventListener('click', () => {
      BudgetStore.setSpreadsheetUrl(sheetInput.value.trim());
      statusMsg.innerHTML = '<span style="color: var(--accent-emerald);"><i class="fa-check fa-solid"></i> Webhook URL tersimpan!</span>';
    });

    syncSheetBtn.addEventListener('click', async () => {
      statusMsg.innerHTML = '<span style="color: var(--accent-amber);"><i class="fa-spinner fa-spin fa-solid"></i> Mengirim data ke Google Sheets...</span>';
      const res = await SpreadsheetService.syncToSpreadsheet(sheetInput.value.trim());
      if (res.success) {
        statusMsg.innerHTML = `<span style="color: var(--accent-emerald);"><i class="fa-circle-check fa-solid"></i> ${res.message}</span>`;
      } else {
        statusMsg.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-circle-xmark fa-solid"></i> ${res.message}</span>`;
      }
    });
  },

  getFormInputs: () => {
    return BudgetStore.getFinancialSummary();
  },

  calculate: () => {
    const summary = BudgetStore.getFinancialSummary();

    const isHealthy = summary.sisaUang >= 0;

    const summaryCards = [
      {
        title: 'Pemasukan Bulanan',
        value: formatRupiah(summary.income),
        note: `Total Gaji / Income`,
        icon: 'fa-money-bill-wave',
        type: 'emerald'
      },
      {
        title: 'Total Budget + Buffer Safety',
        value: formatRupiah(summary.totalPengeluaranRencana),
        note: `Termasuk Buffer Safety ${formatRupiah(summary.danaBufferSafety)} (${summary.bufferPercent}%)`,
        icon: 'fa-basket-shopping',
        type: 'sky'
      },
      {
        title: 'Sisa Uang Bulanan Net',
        value: formatRupiah(summary.sisaUang),
        note: isHealthy ? '🟢 Cashflow Sehat' : '🔴 Peringatan: Defisit Anggaran',
        icon: 'fa-piggy-bank',
        type: isHealthy ? 'emerald' : 'amber'
      }
    ];

    const tableHeaders = ['Pos Anggaran', 'Kategori', 'Sumber / Jenis', 'Jumlah Alokasi (Rp)', 'Aksi'];
    
    // Primary Budget Rows
    const tableRows = summary.budgetsList.map(b => ({
      isCurrent: false,
      cells: [
        `<strong>${b.name}</strong>`,
        `<span class="badge" style="font-size:0.7rem; padding: 2px 8px;">${b.category || 'Pokok'}</span>`,
        `${b.source || 'Kehidupan App'}`,
        `<span class="highlight">${formatRupiah(b.amount)}</span>`,
        `<button type="button" class="sm-btn delete-budget-btn" data-id="${b.id}" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3);"><i class="fa-trash fa-solid"></i> Hapus</button>`
      ]
    }));

    // Add Buffer Safety Net Row
    if (summary.danaBufferSafety > 0) {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>🛡️ Buffer Cadangan Safety (${summary.bufferPercent}%)</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(245, 158, 11, 0.15); color: var(--accent-amber);">Safety Net</span>`,
          `Cadangan Habis Awal`,
          `<span class="highlight" style="color: var(--accent-amber);">${formatRupiah(summary.danaBufferSafety)}</span>`,
          `-`
        ]
      });
    }

    // Add Extra Top-Up Rows (Habis awal & Beli Lagi)
    summary.extraTopupsList.forEach(t => {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>⚡ ${t.name} (Top-Up Dadakan)</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(244, 63, 94, 0.15); color: var(--accent-rose);">Top-Up Extra</span>`,
          `Dicatat ${t.date}`,
          `<span class="highlight" style="color: var(--accent-rose);">${formatRupiah(t.amount)}</span>`,
          `<button type="button" class="sm-btn delete-topup-btn" data-id="${t.id}" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3);"><i class="fa-trash fa-solid"></i> Hapus</button>`
        ]
      });
    });

    return {
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['Kebutuhan Pokok', 'Tabungan/Darurat', 'Buffer Safety Net', 'Top-Up Extra Dadakan'],
        datasets: [
          {
            label: 'Distribusi Anggaran & Pengeluaran',
            data: [summary.totalPokok, summary.totalTabungan, summary.danaBufferSafety, summary.totalExtraTopups],
            backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e']
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(summary.persentasePengeluaran, 0)}% Terpakai`,
        totalCost: formatRupiah(summary.sisaUang)
      }
    };
  }
};
