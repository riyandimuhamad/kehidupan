/**
 * Modul Kalkulator Sandang & Perawatan Diri
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const SandangModule = {
  id: 'sandang',
  name: 'Sandang & Perawatan',
  icon: 'fa-shirt',
  badge: 'Module Sandang',
  title: 'Kalkulator Sandang & Perawatan Diri',
  subtitle: 'Hitung alokasi pengeluaran pakaian, sepatu, biaya cuci/laundry, dan perawatan diri (skincare/grooming).',

  defaults: {
    baju_sepatu_bulan: 200000,
    biaya_laundry: 100000,
    skincare_grooming: 150000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="baju_sepatu_bulan">Alokasi Pakaian & Sepatu <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-shirt fa-solid input-icon"></i>
          <input type="number" id="baju_sepatu_bulan" class="form-control" step="50000" value="200000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="baju_sepatu_bulan" data-val="100000">Hemat (Rp 100k)</button>
          <button type="button" class="option-chip active" data-target="baju_sepatu_bulan" data-val="200000">Sedang (Rp 200k)</button>
          <button type="button" class="option-chip" data-target="baju_sepatu_bulan" data-val="500000">Aktif (Rp 500k)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="biaya_laundry">Biaya Laundry / Cuci Setrika <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-jug-detergent fa-solid input-icon"></i>
          <input type="number" id="biaya_laundry" class="form-control" step="10000" value="100000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="biaya_laundry" data-val="0">Cuci Sendiri (Rp 0)</button>
          <button type="button" class="option-chip active" data-target="biaya_laundry" data-val="100000">Kiloan (Rp 100k)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="skincare_grooming">Skincare & Grooming Diri <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-spray-can-sparkles fa-solid input-icon"></i>
          <input type="number" id="skincare_grooming" class="form-control" step="25000" value="150000">
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
      const currentInputs = SandangModule.getFormInputs(container);
      const res = SandangModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('sandang', {
        id: 'sandang',
        name: 'Sandang & Grooming',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Pakaian, Laundry & Skincare`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      baju_sepatu_bulan: parseFloat(container.querySelector('#baju_sepatu_bulan')?.value || 0),
      biaya_laundry: parseFloat(container.querySelector('#biaya_laundry')?.value || 0),
      skincare_grooming: parseFloat(container.querySelector('#skincare_grooming')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const { baju_sepatu_bulan, biaya_laundry, skincare_grooming } = inputs;

    const total_biaya = baju_sepatu_bulan + biaya_laundry + skincare_grooming;

    const summaryCards = [
      {
        title: 'Pakaian & Sepatu',
        value: formatRupiah(baju_sepatu_bulan),
        note: `Est. Tabungan Beli Pakaian`,
        icon: 'fa-shirt',
        type: 'emerald'
      },
      {
        title: 'Biaya Laundry',
        value: formatRupiah(biaya_laundry),
        note: `Pengeluaran Cuci Kiloan`,
        icon: 'fa-jug-detergent',
        type: 'sky'
      },
      {
        title: 'Total Biaya Sandang',
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

    const tableHeaders = ['Periode', 'Pakaian & Sepatu', 'Laundry', 'Skincare & Grooming', 'Total (Rp)'];
    const tableRows = periods.map(p => {
      const b = baju_sepatu_bulan * p.d;
      const l = biaya_laundry * p.d;
      const s = skincare_grooming * p.d;
      const cost = b + l + s;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(b),
          formatRupiah(l),
          formatRupiah(s),
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
        labels: ['Pakaian/Sepatu', 'Laundry', 'Skincare/Grooming'],
        datasets: [
          {
            label: 'Komposisi Sandang',
            data: [baju_sepatu_bulan, biaya_laundry, skincare_grooming],
            backgroundColor: ['#6366f1', '#06b6d4', '#ec4899']
          }
        ]
      },
      quickStats: {
        totalQty: `Sandang & Perawatan`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
