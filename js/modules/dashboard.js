/**
 * Modul Dashboard Keuangan & Budget Planner
 * Kehidupan App Suite
 * 
 * Dilengkapi:
 * - Analitik Proporsi Kategori (Pie/Doughnut Chart & Bar Chart)
 * - Overview Surplus / Defisit & Rasio Keuangan (50/30/20)
 * - Slider Uji Sensitivitas Kenaikan Harga (Inflasi Pangan/Utilitas)
 * - Smart Financial Insights & Rekomendasi Efisiensi
 * - Mode Profil (Single, Pasangan, Keluarga)
 * - Buffer Safety Margin & Catatan Top-Up Dadakan
 * - Integrasi Google Sheets Spreadsheet
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
  subtitle: 'Analisis surplus/defisit, proporsi kategori pengeluaran, simulasi kenaikan harga, dan rekomendasi efisiensi anggaran keluarga.',

  defaults: {},

  renderForm: (container, onInputChange) => {
    const summary = BudgetStore.getFinancialSummary();

    const isSingle = summary.profile === 'single';
    const isCouple = summary.profile === 'couple';
    const isFamilySmall = summary.profile === 'family_small';
    const isFamilyLarge = summary.profile === 'family_large';

    const isDoughnut = summary.chartMode === 'doughnut';

    container.innerHTML = `
      <!-- Section 1: Mode Profil Pengguna -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Profil Rumah Tangga</span>
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button type="button" class="profile-chip option-chip ${isSingle ? 'active' : ''}" data-val="single" style="justify-content: center; font-size: 0.75rem; padding: 6px;">
              <i class="fa-user fa-solid" style="margin-right: 4px;"></i> Lajang / Single
            </button>
            <button type="button" class="profile-chip option-chip ${isCouple ? 'active' : ''}" data-val="couple" style="justify-content: center; font-size: 0.75rem; padding: 6px;">
              <i class="fa-user-group fa-solid" style="margin-right: 4px;"></i> Pasangan (2 Jiwa)
            </button>
            <button type="button" class="profile-chip option-chip ${isFamilySmall ? 'active' : ''}" data-val="family_small" style="justify-content: center; font-size: 0.75rem; padding: 6px;">
              <i class="fa-people-roof fa-solid" style="margin-right: 4px;"></i> Keluarga (1-2 Anak)
            </button>
            <button type="button" class="profile-chip option-chip ${isFamilyLarge ? 'active' : ''}" data-val="family_large" style="justify-content: center; font-size: 0.75rem; padding: 6px;">
              <i class="fa-house-chimney-user fa-solid" style="margin-right: 4px;"></i> Keluarga Besar (3+ Anak)
            </button>
          </div>
          <input type="hidden" id="profile_input" value="${summary.profile}">
        </div>
      </div>

      <!-- Section 2: Pemasukan & Safety Buffer -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Pemasukan & Dana Cadangan
        </div>

        <div class="form-group" style="margin-bottom: 8px;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Gaji / Pemasukan Bulanan</span> <span class="unit">(Rp)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-wallet fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="monthly_income_input" class="form-control" step="100000" value="${summary.income}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
          <div class="form-options" style="margin-top: 6px; margin-bottom: 4px;">
            <button type="button" class="option-chip ${summary.income === 3500000 ? 'active' : ''}" data-target="monthly_income_input" data-val="3500000">Rp 3.5 Jt</button>
            <button type="button" class="option-chip ${summary.income === 6000000 ? 'active' : ''}" data-target="monthly_income_input" data-val="6000000">Rp 6 Jt</button>
            <button type="button" class="option-chip ${summary.income === 10000000 ? 'active' : ''}" data-target="monthly_income_input" data-val="10000000">Rp 10 Jt</button>
            <button type="button" class="option-chip ${summary.income === 15000000 ? 'active' : ''}" data-target="monthly_income_input" data-val="15000000">Rp 15 Jt</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Buffer Safety Net</span> <span class="unit">(% Kebutuhan Pokok)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-shield-heart fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="buffer_percent_input" class="form-control" min="0" max="40" step="5" value="${summary.bufferPercent}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; margin-bottom: 0;">
            *Alokasi cadangan <strong>${formatRupiah(summary.danaBufferSafety)}</strong> (${summary.bufferPercent}%) jika beras/BBM/gas habis awal di minggu ke-3.
          </p>
        </div>
      </div>

      <!-- Section 3: Uji Sensitivitas Kenaikan Harga (Slider Inflasi) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span>Simulasi Kenaikan Harga / Inflasi</span>
          <span class="badge" id="inflationBadge" style="background: ${summary.inflationPercent > 0 ? 'var(--accent-amber)' : 'var(--bg-input)'}; color: ${summary.inflationPercent > 0 ? '#ffffff' : 'var(--text-muted)'}; font-size: 0.7rem; padding: 2px 8px;">
            +${summary.inflationPercent}% Kenaikan
          </span>
        </div>
        <p style="font-size: 0.73rem; color: var(--text-muted); margin-bottom: 8px;">
          Geser untuk menguji dampak jika harga pangan, listrik & bbm naik:
        </p>
        <div style="margin-bottom: 6px;">
          <input type="range" id="inflation_slider" min="0" max="25" step="5" value="${summary.inflationPercent}" style="width: 100%; cursor: pointer;">
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 6px;">
          <span>0% Normal</span>
          <span>+5% Ringan</span>
          <span>+10% Sedang</span>
          <span>+15% Tinggi</span>
          <span>+20% Lonjakan</span>
        </div>
        <div style="font-size: 0.74rem; color: var(--text-main); background: var(--bg-input); padding: 6px 10px; border-radius: var(--radius-sm);">
          Dampak Biaya Tambahan: <strong style="color: ${summary.inflationPercent > 0 ? 'var(--accent-amber)' : 'var(--text-main)'};">${formatRupiah(summary.dampakInflasi)}</strong>/bulan
        </div>
      </div>

      <!-- Section 4: Toggle Tampilan Grafik Analisis -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Tampilan Grafik Analitik</span>
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button type="button" class="chartmode-chip option-chip ${isDoughnut ? 'active' : ''}" data-val="doughnut" style="justify-content: center; font-size: 0.75rem; padding: 7px;">
              <i class="fa-chart-pie fa-solid" style="margin-right: 5px; color: var(--primary);"></i> Pie Kategori
            </button>
            <button type="button" class="chartmode-chip option-chip ${!isDoughnut ? 'active' : ''}" data-val="bar" style="justify-content: center; font-size: 0.75rem; padding: 7px;">
              <i class="fa-chart-column fa-solid" style="margin-right: 5px; color: var(--accent-emerald);"></i> Bar Distribusi
            </button>
          </div>
          <input type="hidden" id="chart_mode_input" value="${summary.chartMode}">
        </div>
      </div>

      <!-- Section 5: Catat Top-Up Dadakan (Minggu 3 / Habis Awal) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-amber); margin-bottom: 6px;">
          <i class="fa-bolt-lightning fa-solid" style="margin-right: 4px;"></i> Catat Top-Up Dadakan (Kebutuhan Habis Awal)
        </div>
        <p style="font-size: 0.73rem; color: var(--text-muted); margin-bottom: 8px;">
          Jika beras/BBM/galon habis di minggu ke-3, catat pengeluaran tambahan:
        </p>
        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
          <input type="text" id="topup_item_name" class="form-control" placeholder="Nama pos (misal: BBM Tambahan M3)" style="padding-left: 10px; font-size: 0.8rem;">
          <input type="number" id="topup_item_amount" class="form-control" placeholder="Nominal (Rp)" style="padding-left: 10px; font-size: 0.8rem; width: 125px;">
        </div>
        <button type="button" id="addExtraTopupBtn" class="primary-btn" style="background: linear-gradient(135deg, var(--accent-amber), #d97706); width: 100%; padding: 7px 12px; font-size: 0.78rem; justify-content: center;">
          <i class="fa-plus fa-solid" style="margin-right: 4px;"></i> Tambah Catatan Top-Up
        </button>
      </div>

      <!-- Section 6: Tambah Pos Pengeluaran Manual -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">
          <i class="fa-plus fa-solid" style="margin-right: 4px;"></i> Tambah Pos Pengeluaran Manual
        </div>
        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
          <input type="text" id="custom_name_input" class="form-control" placeholder="Nama Pos (misal: Cicilan Motor)" style="padding-left: 10px; font-size: 0.8rem;">
          <input type="number" id="custom_amount_input" class="form-control" placeholder="Biaya (Rp)" style="padding-left: 10px; font-size: 0.8rem; width: 125px;">
        </div>
        <div style="display: flex; gap: 6px;">
          <select id="custom_cat_input" class="form-control" style="padding-left: 10px; font-size: 0.8rem;">
            <option value="Pokok">Kategori: Kebutuhan Pokok</option>
            <option value="Tabungan">Kategori: Tabungan & Investasi</option>
            <option value="Lainnya">Kategori: Gaya Hidup / Lifestyle</option>
          </select>
          <button type="button" id="addCustomBudgetBtn" class="primary-btn" style="padding: 7px 12px; font-size: 0.78rem; white-space: nowrap;">
            <i class="fa-check fa-solid" style="margin-right: 4px;"></i> Simpan
          </button>
        </div>
      </div>

      <!-- Section 7: Spreadsheet Sync -->
      <div class="card" style="border: 1px solid rgba(16, 185, 129, 0.25); background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 6px;">
          <i class="fa-file-excel fa-solid" style="margin-right: 4px;"></i> Google Sheets Integration
        </div>
        <p style="font-size: 0.73rem; color: var(--text-muted); margin-bottom: 8px;">
          Kirim seluruh data anggaran ke Google Spreadsheet via Apps Script.
        </p>
        <div class="input-wrapper" style="margin-bottom: 8px;">
          <i class="fa-link fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
          <input type="url" id="sheet_webhook_input" class="form-control" placeholder="https://script.google.com/macros/s/.../exec" value="${BudgetStore.getSpreadsheetUrl()}" style="font-size: 0.78rem; padding-left: 32px;">
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" id="saveSheetUrlBtn" class="outline-btn" style="padding: 6px 10px; font-size: 0.75rem;">
            Simpan URL
          </button>
          <button type="button" id="syncSpreadsheetBtn" class="primary-btn" style="background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 6px 12px; font-size: 0.75rem; flex: 1; justify-content: center;">
            <i class="fa-rotate fa-solid" style="margin-right: 4px;"></i> Sync Data
          </button>
        </div>
        <div id="syncStatusMsg" style="font-size: 0.73rem; margin-top: 6px;"></div>
      </div>
    `;

    // 1. Profile Mode Chips listener
    const profileChips = container.querySelectorAll('.profile-chip');
    profileChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        container.querySelector('#profile_input').value = val;
        profileChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        BudgetStore.setProfile(val);
        onInputChange();
      });
    });

    // 2. Chart Mode Chips listener
    const chartChips = container.querySelectorAll('.chartmode-chip');
    chartChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        container.querySelector('#chart_mode_input').value = val;
        chartChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        BudgetStore.setChartMode(val);
        onInputChange();
      });
    });

    // 3. Income & Buffer listeners
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

    // 4. Inflation Slider listener
    const inflationSlider = container.querySelector('#inflation_slider');
    const inflationBadge = container.querySelector('#inflationBadge');
    inflationSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      BudgetStore.setInflation(val);
      if (inflationBadge) {
        inflationBadge.textContent = `+${val}% Kenaikan`;
        inflationBadge.style.background = val > 0 ? 'var(--accent-amber)' : 'var(--bg-input)';
        inflationBadge.style.color = val > 0 ? '#ffffff' : 'var(--text-muted)';
      }
      onInputChange();
    });

    // 5. Option Chips for quick income
    const optionChips = container.querySelectorAll('.option-chip:not(.profile-chip):not(.chartmode-chip)');
    optionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-target');
        const val = chip.getAttribute('data-val');
        const targetInput = container.querySelector(`#${targetId}`);
        if (targetInput) {
          targetInput.value = val;
          container.querySelectorAll(`.option-chip[data-target="${targetId}"]`).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          BudgetStore.setIncome(parseFloat(val) || 0);
          onInputChange();
        }
      });
    });

    // 6. Topup Dadakan
    const addTopupBtn = container.querySelector('#addExtraTopupBtn');
    addTopupBtn.addEventListener('click', () => {
      const nameInput = container.querySelector('#topup_item_name');
      const amountInput = container.querySelector('#topup_item_amount');
      const name = nameInput.value.trim();
      const amount = parseFloat(amountInput.value) || 0;

      if (name && amount > 0) {
        BudgetStore.addExtraTopup({ name, amount });
        nameInput.value = '';
        amountInput.value = '';
        onInputChange();
      }
    });

    // 7. Custom Pos Manual
    const addCustomBtn = container.querySelector('#addCustomBudgetBtn');
    addCustomBtn.addEventListener('click', () => {
      const nameInput = container.querySelector('#custom_name_input');
      const amountInput = container.querySelector('#custom_amount_input');
      const catInput = container.querySelector('#custom_cat_input');

      const name = nameInput.value.trim();
      const amount = parseFloat(amountInput.value) || 0;
      const category = catInput.value;

      if (name && amount > 0) {
        const id = 'custom_' + Date.now();
        BudgetStore.saveBudgetItem(id, {
          id,
          name,
          amount,
          category,
          source: 'Manual Custom'
        });
        nameInput.value = '';
        amountInput.value = '';
        onInputChange();
      }
    });

    // 8. Google Sheets Actions
    const saveSheetBtn = container.querySelector('#saveSheetUrlBtn');
    const syncSheetBtn = container.querySelector('#syncSpreadsheetBtn');
    const sheetInput = container.querySelector('#sheet_webhook_input');
    const statusMsg = container.querySelector('#syncStatusMsg');

    saveSheetBtn.addEventListener('click', () => {
      BudgetStore.setSpreadsheetUrl(sheetInput.value.trim());
      statusMsg.innerHTML = '<span style="color: var(--accent-emerald);"><i class="fa-check fa-solid"></i> Webhook URL tersimpan!</span>';
      setTimeout(() => statusMsg.innerHTML = '', 3500);
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

    const isHealthy = summary.isSurplus;
    const surplusPercent = summary.income > 0 ? ((summary.sisaUang / summary.income) * 100).toFixed(1) : 0;

    // Summary Cards (4 Cards)
    const summaryCards = [
      {
        title: 'Pemasukan Bulanan',
        value: formatRupiah(summary.income),
        note: `Total Gaji / Penghasilan`,
        icon: 'fa-money-bill-wave',
        type: 'emerald'
      },
      {
        title: summary.inflationPercent > 0 ? 'Total Budget + Inflasi' : 'Total Budget + Buffer',
        value: formatRupiah(summary.totalPengeluaranTotal),
        note: summary.inflationPercent > 0 
          ? `Termasuk Buffer & Inflasi +${summary.inflationPercent}% (${formatRupiah(summary.dampakInflasi)})`
          : `Termasuk Buffer ${formatRupiah(summary.danaBufferSafety)} (${summary.bufferPercent}%)`,
        icon: 'fa-basket-shopping',
        type: 'sky'
      },
      {
        title: isHealthy ? 'Surplus Bulanan (Net)' : 'Defisit Anggaran (Net)',
        value: formatRupiah(Math.abs(summary.sisaUang)),
        note: isHealthy ? `🟢 Surplus ${surplusPercent}% dari pemasukan` : '🔴 Pengeluaran melebihi gaji!',
        icon: isHealthy ? 'fa-piggy-bank' : 'fa-triangle-exclamation',
        type: isHealthy ? 'emerald' : 'amber'
      },
      {
        title: 'Rasio Tabungan & Investasi',
        value: `${summary.rasioTabungan.toFixed(1)}%`,
        note: `${formatRupiah(summary.totalTabungan)}/bulan (Target: 10%-20%)`,
        icon: 'fa-seedling',
        type: summary.rasioTabungan >= 10 ? 'emerald' : 'amber'
      }
    ];

    // Primary Table Headers & Rows
    const tableHeaders = ['Pos Anggaran', 'Kategori', 'Sumber / Kalkulator', 'Alokasi Bulanan (Rp)', 'Aksi'];
    
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

    // Buffer Safety Net Row
    if (summary.danaBufferSafety > 0) {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>🛡️ Buffer Cadangan Safety (${summary.bufferPercent}%)</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(245, 158, 11, 0.15); color: var(--accent-amber);">Safety Net</span>`,
          `Proteksi Habis Awal`,
          `<span class="highlight" style="color: var(--accent-amber);">${formatRupiah(summary.danaBufferSafety)}</span>`,
          `-`
        ]
      });
    }

    // Dampak Inflasi Row (jika slider aktif)
    if (summary.inflationPercent > 0) {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>📈 Simulasi Inflasi Kebutuhan (+${summary.inflationPercent}%)</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(239, 68, 68, 0.15); color: var(--accent-rose);">Sensitivitas Harga</span>`,
          `Uji Kenaikan Harga`,
          `<span class="highlight" style="color: var(--accent-rose);">${formatRupiah(summary.dampakInflasi)}</span>`,
          `-`
        ]
      });
    }

    // Extra Top-Up Rows
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

    // Secondary Table: Smart Financial Insights & Rekomendasi Efisiensi
    const secondaryTable = {
      title: 'Smart Financial Insights & Rekomendasi Efisiensi',
      subtitle: 'Analisis cerdas berdasarkan perbandingan rasio anggaran, kondisi surplus/defisit, dan aturan keuangan 50/30/20.',
      headers: ['Status & Indikator', 'Rincian Analisis & Rekomendasi Aksi'],
      rows: summary.smartInsights.map(insight => {
        let badgeColor = 'var(--accent-emerald)';
        let badgeBg = 'rgba(16, 185, 129, 0.12)';
        if (insight.type === 'danger') {
          badgeColor = 'var(--accent-rose)';
          badgeBg = 'rgba(244, 63, 94, 0.12)';
        } else if (insight.type === 'warning') {
          badgeColor = 'var(--accent-amber)';
          badgeBg = 'rgba(245, 158, 11, 0.12)';
        } else if (insight.type === 'info') {
          badgeColor = 'var(--primary)';
          badgeBg = 'rgba(99, 102, 241, 0.12)';
        }

        return {
          isCurrent: false,
          cells: [
            `<div style="display: flex; align-items: center; gap: 8px;">
               <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: ${badgeBg}; color: ${badgeColor};">
                 <i class="${insight.icon} fa-solid" style="font-size: 0.8rem;"></i>
               </span>
               <strong style="color: ${badgeColor}; font-size: 0.82rem;">${insight.title}</strong>
             </div>`,
            `<span style="font-size: 0.8rem; line-height: 1.45; color: var(--text-main);">${insight.desc}</span>`
          ]
        };
      })
    };

    // Chart Data Preparation: Doughnut / Pie Kategori vs Bar Chart
    let chartData = null;
    const isDoughnut = summary.chartMode === 'doughnut';

    if (isDoughnut) {
      // Data Pie / Doughnut Kategori Pengeluaran
      const catLabels = Object.keys(summary.categoryTotals).filter(k => summary.categoryTotals[k] > 0);
      const catValues = catLabels.map(k => summary.categoryTotals[k]);
      const catColors = [
        '#6366f1', // Pangan - Indigo
        '#06b6d4', // Papan - Sky
        '#ec4899', // Keluarga - Pink
        '#f59e0b', // Mobilitas - Amber
        '#8b5cf6', // Lifestyle - Purple
        '#64748b', // Pajak - Slate
        '#10b981'  // Tabungan - Emerald
      ];

      chartData = {
        type: 'doughnut',
        labels: catLabels,
        datasets: [
          {
            label: 'Alokasi Kategori',
            data: catValues,
            backgroundColor: catColors.slice(0, catLabels.length),
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      };
    } else {
      // Data Bar Chart Distribusi
      chartData = {
        type: 'bar',
        labels: ['Kebutuhan Pokok', 'Tabungan / Investasi', 'Gaya Hidup / Lifestyle', 'Buffer Safety Net', 'Dampak Inflasi'],
        datasets: [
          {
            label: 'Alokasi Anggaran Bulanan (Rp)',
            data: [
              summary.totalPokok,
              summary.totalTabungan,
              summary.totalLainnya,
              summary.danaBufferSafety,
              summary.dampakInflasi
            ],
            backgroundColor: ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#f43f5e'],
            borderRadius: 8
          }
        ]
      };
    }

    return {
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData,
      quickStats: {
        totalQty: `${formatNumber(summary.persentasePengeluaran, 0)}% Terpakai`,
        totalCost: formatRupiah(summary.sisaUang)
      }
    };
  }
};
