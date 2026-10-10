/**
 * Modul Kalkulator Sewa / Tempat Tinggal / KPR
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const SewaModule = {
  id: 'sewa',
  name: 'Hunian / KPR',
  icon: 'fa-house-user',
  badge: 'Module Tempat Tinggal',
  title: 'Kalkulator Sewa / KPR Tempat Tinggal',
  subtitle: 'Hitung pengeluaran tempat tinggal (Kos, Kontrakan, Cicilan KPR) beserta iuran kebersihan & lingkungan.',

  defaults: {
    tipe_hunian: 'kontrakan',
    biaya_bulanan: 1500000,
    iuran_ipl: 50000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="tipe_hunian">Tipe Tempat Tinggal</label>
        <div class="input-wrapper">
          <i class="fa-building-user fa-solid input-icon"></i>
          <select id="tipe_hunian" class="form-control">
            <option value="kos">Kamar Kos</option>
            <option value="kontrakan" selected>Rumah Kontrakan</option>
            <option value="kpr">Cicilan KPR / Rumah</option>
            <option value="sendiri">Rumah Sendiri (Hanya IPL/PBB)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="biaya_bulanan">Biaya Bulanan Sewa / KPR <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-money-bill-wave fa-solid input-icon"></i>
          <input type="number" id="biaya_bulanan" class="form-control" step="100000" value="1500000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="biaya_bulanan" data-val="750000">Kos (Rp 750k)</button>
          <button type="button" class="option-chip active" data-target="biaya_bulanan" data-val="1500000">Kontrakan (Rp 1.5 Jt)</button>
          <button type="button" class="option-chip" data-target="biaya_bulanan" data-val="3000000">KPR (Rp 3.0 Jt)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="iuran_ipl">Iuran Kebersihan / Keamanan (IPL) <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-shield-halved fa-solid input-icon"></i>
          <input type="number" id="iuran_ipl" class="form-control" step="5000" value="50000">
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

    const inputs = container.querySelectorAll('input, select');
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
      const currentInputs = SewaModule.getFormInputs(container);
      const res = SewaModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('sewa', {
        id: 'sewa',
        name: 'Hunian & Tempat Tinggal',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Sewa / KPR (${currentInputs.tipe_hunian})`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      tipe_hunian: container.querySelector('#tipe_hunian')?.value || 'kontrakan',
      biaya_bulanan: parseFloat(container.querySelector('#biaya_bulanan')?.value || 0),
      iuran_ipl: parseFloat(container.querySelector('#iuran_ipl')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const { tipe_hunian, biaya_bulanan, iuran_ipl } = inputs;

    const total_biaya = biaya_bulanan + iuran_ipl;

    const summaryCards = [
      {
        title: 'Sewa / Cicilan KPR',
        value: formatRupiah(biaya_bulanan),
        note: `Tipe: ${tipe_hunian.toUpperCase()}`,
        icon: 'fa-house',
        type: 'emerald'
      },
      {
        title: 'Iuran IPL & Kebersihan',
        value: formatRupiah(iuran_ipl),
        note: `Pengeluaran Rutin RT/RW`,
        icon: 'fa-shield-halved',
        type: 'sky'
      },
      {
        title: 'Total Biaya Hunian',
        value: formatRupiah(total_biaya),
        note: `Total per Bulan`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      }
    ];

    const periods = [
      { label: '1 Bulan', d: 1 },
      { label: '6 Bulan', d: 6 },
      { label: '12 Bulan (1 Tahun)', d: 12 }
    ];

    const tableHeaders = ['Periode', 'Biaya Hunian', 'Iuran Kebersihan/IPL', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const b = biaya_bulanan * p.d;
      const i = iuran_ipl * p.d;
      const cost = b + i;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(b),
          formatRupiah(i),
          `<span class="highlight">${formatRupiah(cost)}</span>`
        ]
      };
    });

    return {
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['Sewa / KPR', 'Iuran IPL'],
        datasets: [
          {
            label: 'Komposisi Biaya Hunian',
            data: [biaya_bulanan, iuran_ipl],
            backgroundColor: ['#6366f1', '#10b981']
          }
        ]
      },
      quickStats: {
        totalQty: `${tipe_hunian.toUpperCase()}`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
