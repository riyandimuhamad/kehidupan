/**
 * Modul Kalkulator BBM & Transportasi
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const TransportModule = {
  id: 'transport',
  name: 'BBM & Transportasi',
  icon: 'fa-car',
  badge: 'Module Mobilitas',
  title: 'Kalkulator BBM & Transportasi Harian',
  subtitle: 'Hitung kebutuhan bahan bakar minyak (BBM) harian hingga bulanan berdasarkan jarak tempuh dan efisiensi kendaraan.',

  defaults: {
    jarak_km_per_hari: 20,
    efisiensi_km_per_liter: 40, // Standar motor matic
    harga_bbm_per_liter: 10000, // Pertalite
    hari: 30
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="jarak_km_per_hari">Jarak Tempuh PP per Hari <span class="unit">(Km/Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-route fa-solid input-icon"></i>
          <input type="number" id="jarak_km_per_hari" class="form-control" step="1" value="20">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="jarak_km_per_hari" data-val="10">Dekat (10 km)</button>
          <button type="button" class="option-chip active" data-target="jarak_km_per_hari" data-val="20">Sedang (20 km)</button>
          <button type="button" class="option-chip" data-target="jarak_km_per_hari" data-val="40">Jauh (40 km)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="efisiensi_km_per_liter">Konsumsi Kendaraan <span class="unit">(Km per 1 Liter)</span></label>
        <div class="input-wrapper">
          <i class="fa-gauge-high fa-solid input-icon"></i>
          <input type="number" id="efisiensi_km_per_liter" class="form-control" step="1" value="40">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip active" data-target="efisiensi_km_per_liter" data-val="40">Motor Matic (40 km/L)</button>
          <button type="button" class="option-chip" data-target="efisiensi_km_per_liter" data-val="50">Motor Bebek (50 km/L)</button>
          <button type="button" class="option-chip" data-target="efisiensi_km_per_liter" data-val="12">Mobil City Car (12 km/L)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="harga_bbm_per_liter">Harga BBM per Liter <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-gas-pump fa-solid input-icon"></i>
          <input type="number" id="harga_bbm_per_liter" class="form-control" step="100" value="10000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip active" data-target="harga_bbm_per_liter" data-val="10000">Pertalite (Rp 10.000)</button>
          <button type="button" class="option-chip" data-target="harga_bbm_per_liter" data-val="12950">Pertamax (Rp 12.950)</button>
          <button type="button" class="option-chip" data-target="harga_bbm_per_liter" data-val="6800">Solar Subs. (Rp 6.800)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="hari">Lama Waktu Hari Kerja <span class="unit">(Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-calendar-days fa-solid input-icon"></i>
          <input type="number" id="hari" class="form-control" min="1" max="365" value="30">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="hari" data-val="22">Hari Kerja (22h)</button>
          <button type="button" class="option-chip active" data-target="hari" data-val="30">1 Bulan (30h)</button>
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
      const currentInputs = TransportModule.getFormInputs(container);
      const res = TransportModule.calculate(currentInputs);
      const monthlyCost = (res.total_liter / (currentInputs.hari || 1)) * 30 * currentInputs.harga_bbm_per_liter;

      BudgetStore.saveBudgetItem('transport', {
        id: 'transport',
        name: 'BBM & Transportasi',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Transport (${currentInputs.jarak_km_per_hari} km/hari)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      jarak_km_per_hari: parseFloat(container.querySelector('#jarak_km_per_hari')?.value || 20),
      efisiensi_km_per_liter: parseFloat(container.querySelector('#efisiensi_km_per_liter')?.value || 40),
      harga_bbm_per_liter: parseFloat(container.querySelector('#harga_bbm_per_liter')?.value || 10000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { jarak_km_per_hari, efisiensi_km_per_liter, harga_bbm_per_liter, hari } = inputs;

    const total_km = jarak_km_per_hari * hari;
    const total_liter = efisiensi_km_per_liter > 0 ? total_km / efisiensi_km_per_liter : 0;
    const total_biaya = total_liter * harga_bbm_per_liter;

    const summaryCards = [
      {
        title: 'Total Jarak Tempuh',
        value: `${formatNumber(total_km, 0)} Km`,
        note: `Rata-rata ${formatNumber(jarak_km_per_hari, 0)} Km/Hari`,
        icon: 'fa-route',
        type: 'emerald'
      },
      {
        title: 'Estimasi Kebutuhan BBM',
        value: `${formatNumber(total_liter, 1)} Liter`,
        note: `@ ${formatRupiah(harga_bbm_per_liter)} / Liter`,
        icon: 'fa-gas-pump',
        type: 'sky'
      },
      {
        title: 'Total Biaya Transportasi',
        value: formatRupiah(total_biaya),
        note: `Untuk ${hari} Hari`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      }
    ];

    const periods = [
      { label: '7 Hari', d: 7 },
      { label: '22 Hari (Hari Kerja)', d: 22 },
      { label: '30 Hari (1 Bulan)', d: 30 },
      { label: '365 Hari (1 Tahun)', d: 365 },
      { label: `Custom (${hari} Hari)`, d: hari, isCurrent: true }
    ];

    const tableHeaders = ['Periode', 'Total Jarak (Km)', 'BBM Dibutuhkan (Liter)', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const km = jarak_km_per_hari * p.d;
      const liter = efisiensi_km_per_liter > 0 ? km / efisiensi_km_per_liter : 0;
      const cost = liter * harga_bbm_per_liter;
      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(km, 0)} Km`,
          `${formatNumber(liter, 1)} Liter`,
          `<span class="highlight">${formatRupiah(cost)}</span>`
        ]
      };
    });

    return {
      total_liter,
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['7 Hari', '22 Hari', '30 Hari', '365 Hari'],
        datasets: [
          {
            label: 'Estimasi Pengeluaran BBM (Rp)',
            data: [7, 22, 30, 365].map(d => (jarak_km_per_hari * d / (efisiensi_km_per_liter || 1)) * harga_bbm_per_liter),
            backgroundColor: 'rgba(6, 182, 212, 0.6)',
            borderColor: '#06b6d4',
            borderWidth: 2
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(total_liter, 1)} L`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
