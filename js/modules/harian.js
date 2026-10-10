/**
 * Modul Kalkulator & Tracker Budget Harian (Daily Allowance & Surplus Tracker)
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const HarianModule = {
  id: 'harian',
  name: 'Budget Harian',
  icon: 'fa-wallet',
  badge: 'Module Uang Harian',
  title: 'Kalkulator & Tracker Budget Harian',
  subtitle: 'Kelola jatah uang saku/harian, catat pengeluaran aktual harian, dan akumulasikan sisa penghematan bulanan.',

  defaults: {
    jatah_harian: 25000,
    pengeluaran_aktual: 23000,
    hari_dalam_bulan: 30
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="jatah_harian">Jatah / Target Budget Harian <span class="unit">(Rupiah/Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-coins fa-solid input-icon"></i>
          <input type="number" id="jatah_harian" class="form-control" step="1000" value="25000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="jatah_harian" data-val="15000">Rp 15.000</button>
          <button type="button" class="option-chip active" data-target="jatah_harian" data-val="25000">Rp 25.000</button>
          <button type="button" class="option-chip" data-target="jatah_harian" data-val="50000">Rp 50.000</button>
          <button type="button" class="option-chip" data-target="jatah_harian" data-val="100000">Rp 100.000</button>
        </div>
      </div>

      <div class="form-group">
        <label for="pengeluaran_aktual">Pengeluaran Real / Terpakai Hari Ini <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-receipt fa-solid input-icon"></i>
          <input type="number" id="pengeluaran_aktual" class="form-control" step="1000" value="23000">
        </div>
      </div>

      <div class="form-group">
        <label for="hari_dalam_bulan">Jumlah Hari Aktivitas <span class="unit">(Hari/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-calendar-days fa-solid input-icon"></i>
          <input type="number" id="hari_dalam_bulan" class="form-control" min="1" max="31" value="30">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="hari_dalam_bulan" data-val="22">Hari Kerja (22 Hari)</button>
          <button type="button" class="option-chip active" data-target="hari_dalam_bulan" data-val="30">Full Bulan (30 Hari)</button>
        </div>
      </div>

      <!-- Action Sync to Budget Dashboard Button -->
      <div style="margin-top: 20px; text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669);">
          <i class="fa-bookmark fa-solid"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', () => onInputChange()));

    const chips = container.querySelectorAll('.option-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-target');
        const val = chip.getAttribute('data-val');
        const targetInput = container.querySelector(`#${targetId}`);
        if (targetInput) {
          targetInput.value = val;
          container.querySelectorAll(`.option-chip[data-target="${targetId}"]`).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          onInputChange();
        }
      });
    });

    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = HarianModule.getFormInputs(container);
      const res = HarianModule.calculate(currentInputs);
      const monthlyCost = currentInputs.jatah_harian * currentInputs.hari_dalam_bulan;

      BudgetStore.saveBudgetItem('harian', {
        id: 'harian',
        name: 'Budget Harian / Uang Saku',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Rp ${formatNumber(currentInputs.jatah_harian, 0)}/hari x ${currentInputs.hari_dalam_bulan}h`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      jatah_harian: parseFloat(container.querySelector('#jatah_harian')?.value || 0),
      pengeluaran_aktual: parseFloat(container.querySelector('#pengeluaran_aktual')?.value || 0),
      hari_dalam_bulan: parseInt(container.querySelector('#hari_dalam_bulan')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { jatah_harian, pengeluaran_aktual, hari_dalam_bulan } = inputs;

    const sisa_harian = jatah_harian - pengeluaran_aktual;
    const isHemat = sisa_harian >= 0;

    const total_jatah_bulan = jatah_harian * hari_dalam_bulan;
    const total_aktual_bulan = pengeluaran_aktual * hari_dalam_bulan;
    const estimasi_sisa_tabungan_bulan = sisa_harian * hari_dalam_bulan;

    const summaryCards = [
      {
        title: 'Status Harian Hari Ini',
        value: formatRupiah(Math.abs(sisa_harian)),
        note: isHemat ? '🟢 Hemat (Surplus Sisa Uang)' : '🔴 Overbudget (Defisit Harian)',
        icon: isHemat ? 'fa-piggy-bank' : 'fa-triangle-exclamation',
        type: isHemat ? 'emerald' : 'amber'
      },
      {
        title: 'Jatah vs Terpakai Hari Ini',
        value: formatRupiah(pengeluaran_aktual),
        note: `Jatah: ${formatRupiah(jatah_harian)} / Hari`,
        icon: 'fa-receipt',
        type: 'sky'
      },
      {
        title: 'Est. Sisa Hemat Bulanan',
        value: formatRupiah(estimasi_sisa_tabungan_bulan),
        note: `Proyeksi Sisa Hemat ${hari_dalam_bulan} Hari`,
        icon: 'fa-money-bill-trend-up',
        type: 'emerald'
      }
    ];

    const periods = [
      { label: '1 Hari', d: 1 },
      { label: '7 Hari (1 Minggu)', d: 7 },
      { label: '22 Hari (Hari Kerja)', d: 22 },
      { label: `${hari_dalam_bulan} Hari (1 Bulan)`, d: hari_dalam_bulan }
    ];

    const tableHeaders = ['Periode', 'Total Jatah (Rp)', 'Total Terpakai (Rp)', 'Selisih / Sisa (Rp)', 'Status'];
    const tableRows = periods.map(p => {
      const jatah = jatah_harian * p.d;
      const terpakai = pengeluaran_aktual * p.d;
      const sisa = jatah - terpakai;
      const statusText = sisa >= 0 ? `🟢 Surplus +${formatRupiah(sisa)}` : `🔴 Defisit ${formatRupiah(Math.abs(sisa))}`;

      return {
        isCurrent: p.d === hari_dalam_bulan,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(jatah),
          formatRupiah(terpakai),
          `<span class="highlight" style="color: ${sisa >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${formatRupiah(sisa)}</span>`,
          statusText
        ]
      };
    });

    return {
      total_biaya: total_jatah_bulan,
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['Jatah Target Harian', 'Pengeluaran Aktual', 'Sisa Hemat'],
        datasets: [
          {
            label: 'Analisis Komposisi Harian (Rp)',
            data: [jatah_harian, pengeluaran_aktual, Math.max(0, sisa_harian)],
            backgroundColor: ['#6366f1', '#f59e0b', '#10b981']
          }
        ]
      },
      quickStats: {
        totalQty: isHemat ? `+${formatRupiah(sisa_harian)} Hemat` : `-${formatRupiah(Math.abs(sisa_harian))} Over`,
        totalCost: formatRupiah(total_jatah_bulan)
      }
    };
  }
};
