/**
 * Modul Kalkulator Kesehatan & Asuransi
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const KesehatanModule = {
  id: 'kesehatan',
  name: 'Kesehatan & BPJS',
  icon: 'fa-heart-pulse',
  badge: 'Module Kesehatan',
  title: 'Kalkulator BPJS, Obat & Kesehatan',
  subtitle: 'Hitung pengeluaran BPJS Kesehatan, asuransi, suplemen/vitamin, dan dana proteksi kesehatan keluarga.',

  defaults: {
    bpjs_jiwa: 2,
    iuran_bpjs_per_jiwa: 100000, // Kelas 2 BPJS / Mandiri
    vitamin_obat_bulan: 150000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="bpjs_jiwa">Jumlah Anggota Keluarga Tertanggung BPJS</label>
        <div class="input-wrapper">
          <i class="fa-users-between-lines fa-solid input-icon"></i>
          <input type="number" id="bpjs_jiwa" class="form-control" min="0" max="10" value="2">
        </div>
      </div>

      <div class="form-group">
        <label for="iuran_bpjs_per_jiwa">Iuran BPJS / Asuransi per Jiwa <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-notes-medical fa-solid input-icon"></i>
          <input type="number" id="iuran_bpjs_per_jiwa" class="form-control" step="5000" value="100000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="iuran_bpjs_per_jiwa" data-val="35000">Kelas 3 (Rp 35.000)</button>
          <button type="button" class="option-chip active" data-target="iuran_bpjs_per_jiwa" data-val="100000">Kelas 2 (Rp 100.000)</button>
          <button type="button" class="option-chip" data-target="iuran_bpjs_per_jiwa" data-val="150000">Kelas 1 (Rp 150.000)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="vitamin_obat_bulan">Vitamin, Obat & Checkup Rutin <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-pills fa-solid input-icon"></i>
          <input type="number" id="vitamin_obat_bulan" class="form-control" step="25000" value="150000">
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
      const currentInputs = KesehatanModule.getFormInputs(container);
      const res = KesehatanModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('kesehatan', {
        id: 'kesehatan',
        name: 'Kesehatan & BPJS',
        amount: monthlyCost,
        category: 'Pokok',
        source: `BPJS (${currentInputs.bpjs_jiwa} jiwa) + Vitamin`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      bpjs_jiwa: parseInt(container.querySelector('#bpjs_jiwa')?.value || 0, 10),
      iuran_bpjs_per_jiwa: parseFloat(container.querySelector('#iuran_bpjs_per_jiwa')?.value || 0),
      vitamin_obat_bulan: parseFloat(container.querySelector('#vitamin_obat_bulan')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const { bpjs_jiwa, iuran_bpjs_per_jiwa, vitamin_obat_bulan } = inputs;

    const total_bpjs = bpjs_jiwa * iuran_bpjs_per_jiwa;
    const total_biaya = total_bpjs + vitamin_obat_bulan;

    const summaryCards = [
      {
        title: 'Iuran BPJS / Asuransi',
        value: formatRupiah(total_bpjs),
        note: `Untuk ${bpjs_jiwa} Jiwa`,
        icon: 'fa-heart-pulse',
        type: 'emerald'
      },
      {
        title: 'Vitamin & Obat Rutin',
        value: formatRupiah(vitamin_obat_bulan),
        note: `Suplemen & Kesehatan`,
        icon: 'fa-pills',
        type: 'sky'
      },
      {
        title: 'Total Biaya Kesehatan',
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

    const tableHeaders = ['Periode', 'Total Iuran BPJS', 'Vitamin & Obat', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const b = total_bpjs * p.d;
      const v = vitamin_obat_bulan * p.d;
      const cost = b + v;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(b),
          formatRupiah(v),
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
        labels: ['BPJS / Asuransi', 'Vitamin & Obat'],
        datasets: [
          {
            label: 'Komposisi Biaya Kesehatan',
            data: [total_bpjs, vitamin_obat_bulan],
            backgroundColor: ['#10b981', '#06b6d4']
          }
        ]
      },
      quickStats: {
        totalQty: `BPJS (${bpjs_jiwa} Jiwa)`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
