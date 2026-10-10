/**
 * Modul Dashboard Keuangan & Budget Planner
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
  subtitle: 'Integrasikan hasil kalkulasi kebutuhan (Beras, Air, Listrik, Gas) dengan Pemasukan Bulanan & Sinkronisasi ke Google Sheets.',

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
          <button type="button" class="option-chip active" data-target="monthly_income_input" data-val="5000000">Rp 5 Jt</button>
          <button type="button" class="option-chip" data-target="monthly_income_input" data-val="10000000">Rp 10 Jt</button>
          <button type="button" class="option-chip" data-target="monthly_income_input" data-val="15000000">Rp 15 Jt</button>
        </div>
      </div>

      <!-- Tambah Item Custom Manual -->
      <div class="add-custom-budget-box" style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: 18px;">
        <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 10px; color: var(--text-main);"><i class="fa-plus fa-solid"></i> Tambah Pos Pengeluaran Lain</h4>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="custom_name_input" class="form-control" placeholder="Nama Pos (misal: Transportasi)" style="padding-left: 12px; font-size: 0.85rem;">
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

    // Listeners for inputs
    const incomeInput = container.querySelector('#monthly_income_input');
    incomeInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      BudgetStore.setIncome(val);
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
    const isPokokOver = summary.totalPokok > summary.targetPokok;

    const summaryCards = [
      {
        title: 'Pemasukan Bulanan',
        value: formatRupiah(summary.income),
        note: `Total Gaji / Income`,
        icon: 'fa-money-bill-wave',
        type: 'emerald'
      },
      {
        title: 'Total Pengeluaran Alokasi',
        value: formatRupiah(summary.totalPengeluaran),
        note: `${formatNumber(summary.persentasePengeluaran, 1)}% dari Pemasukan`,
        icon: 'fa-basket-shopping',
        type: isPokokOver ? 'amber' : 'sky'
      },
      {
        title: 'Sisa Uang Bulanan',
        value: formatRupiah(summary.sisaUang),
        note: isHealthy ? '🟢 Cashflow Sehat & Positif' : '🔴 Peringatan: Defisit Anggaran',
        icon: 'fa-piggy-bank',
        type: isHealthy ? 'emerald' : 'amber'
      }
    ];

    const tableHeaders = ['Pos Anggaran', 'Kategori', 'Sumber / Kalkulator', 'Jumlah Alokasi (Rp)', 'Aksi'];
    
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

    return {
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: summary.budgetsList.map(b => b.name),
        datasets: [
          {
            label: 'Alokasi Pengeluaran (Rp)',
            data: summary.budgetsList.map(b => b.amount),
            backgroundColor: [
              '#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'
            ],
            borderWidth: 1
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
