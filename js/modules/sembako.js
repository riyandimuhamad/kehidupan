/**
 * Modul Kalkulator Sembako & Kebersihan Mandi/Cuci
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const SembakoModule = {
  id: 'sembako',
  name: 'Sembako & Kebersihan',
  icon: 'fa-basket-shopping',
  badge: 'Module Dapur & Sanitasi',
  title: 'Kalkulator Sembako & Alat Mandi/Cuci',
  subtitle: 'Hitung kebutuhan bulanan minyak goreng, gula, bumbu dapur, sabun mandi, detergen, dan perlengkapan mandi/cuci.',

  defaults: {
    minyak_liter: 3,
    harga_minyak: 17000,
    gula_kg: 2,
    harga_gula: 17500,
    paket_kebersihan: 150000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="minyak_liter">Minyak Goreng <span class="unit">(Liter/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-bottle-droplet fa-solid input-icon"></i>
          <input type="number" id="minyak_liter" class="form-control" step="1" value="3">
        </div>
      </div>

      <div class="form-group">
        <label for="harga_minyak">Harga Minyak Goreng <span class="unit">(Rupiah/Liter)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="harga_minyak" class="form-control" step="500" value="17000">
        </div>
      </div>

      <div class="form-group">
        <label for="gula_kg">Gula Pasir & Bumbu <span class="unit">(Kg/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-cubes-stacked fa-solid input-icon"></i>
          <input type="number" id="gula_kg" class="form-control" step="0.5" value="2">
        </div>
      </div>

      <div class="form-group">
        <label for="harga_gula">Harga Gula Pasir <span class="unit">(Rupiah/Kg)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="harga_gula" class="form-control" step="500" value="17500">
        </div>
      </div>

      <div class="form-group">
        <label for="paket_kebersihan">Paket Mandi & Cuci <span class="unit">(Sabun, Detergen, Shampo, Odol - Rp/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-pump-soap fa-solid input-icon"></i>
          <input type="number" id="paket_kebersihan" class="form-control" step="10000" value="150000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="paket_kebersihan" data-val="100000">Hemat (Rp 100k)</button>
          <button type="button" class="option-chip active" data-target="paket_kebersihan" data-val="150000">Standar (Rp 150k)</button>
          <button type="button" class="option-chip" data-target="paket_kebersihan" data-val="250000">Lengkap (Rp 250k)</button>
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
      const currentInputs = SembakoModule.getFormInputs(container);
      const res = SembakoModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('sembako', {
        id: 'sembako',
        name: 'Sembako & Kebersihan',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Minyak, Gula & Sabun`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      minyak_liter: parseFloat(container.querySelector('#minyak_liter')?.value || 0),
      harga_minyak: parseFloat(container.querySelector('#harga_minyak')?.value || 0),
      gula_kg: parseFloat(container.querySelector('#gula_kg')?.value || 0),
      harga_gula: parseFloat(container.querySelector('#harga_gula')?.value || 0),
      paket_kebersihan: parseFloat(container.querySelector('#paket_kebersihan')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const { minyak_liter, harga_minyak, gula_kg, harga_gula, paket_kebersihan } = inputs;

    const biaya_minyak = minyak_liter * harga_minyak;
    const biaya_gula = gula_kg * harga_gula;
    const total_biaya = biaya_minyak + biaya_gula + paket_kebersihan;

    const summaryCards = [
      {
        title: 'Minyak Goreng',
        value: formatRupiah(biaya_minyak),
        note: `${minyak_liter} Liter @ ${formatRupiah(harga_minyak)}`,
        icon: 'fa-bottle-droplet',
        type: 'emerald'
      },
      {
        title: 'Gula & Bumbu',
        value: formatRupiah(biaya_gula),
        note: `${gula_kg} Kg @ ${formatRupiah(harga_gula)}`,
        icon: 'fa-cubes-stacked',
        type: 'sky'
      },
      {
        title: 'Total Sembako & Kebersihan',
        value: formatRupiah(total_biaya),
        note: `Est. Pengeluaran Bulanan`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      }
    ];

    const periods = [
      { label: '1 Bulan', d: 1 },
      { label: '3 Bulan', d: 3 },
      { label: '6 Bulan', d: 6 },
      { label: '12 Bulan (1 Tahun)', d: 12 }
    ];

    const tableHeaders = ['Periode', 'Minyak Goreng', 'Gula & Bumbu', 'Paket Kebersihan', 'Total (Rp)'];
    const tableRows = periods.map(p => {
      const m = biaya_minyak * p.d;
      const g = biaya_gula * p.d;
      const k = paket_kebersihan * p.d;
      const cost = m + g + k;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(m),
          formatRupiah(g),
          formatRupiah(k),
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
        labels: ['Minyak Goreng', 'Gula & Bumbu', 'Perlengkapan Mandi/Cuci'],
        datasets: [
          {
            label: 'Komposisi Pengeluaran Sembako',
            data: [biaya_minyak, biaya_gula, paket_kebersihan],
            backgroundColor: ['#f59e0b', '#10b981', '#6366f1']
          }
        ]
      },
      quickStats: {
        totalQty: `${minyak_liter}L Minyak + ${gula_kg}kg Gula`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
