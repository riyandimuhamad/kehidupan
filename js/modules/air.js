/**
 * Modul Kalkulator Kebutuhan Air Galon
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const AirModule = {
  id: 'air',
  name: 'Air Galon & Minum',
  icon: 'fa-bottle-water',
  badge: 'Module Hidrasi & Air',
  title: 'Kalkulator Kebutuhan Air Galon',
  subtitle: 'Hitung estimasi konsumsi air minum galon harian, mingguan, dan bulanan untuk seluruh anggota keluarga.',

  defaults: {
    orang: 1,
    liter_per_hari: 2,
    harga_per_galon: 20000,
    hari: 30
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="orang">Jumlah Orang <span class="unit">(Anggota Keluarga / Jiwa)</span></label>
        <div class="input-wrapper">
          <i class="fa-users fa-solid input-icon"></i>
          <input type="number" id="orang" class="form-control" min="1" max="1000" value="1">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip active" data-target="orang" data-val="1">1 Orang</button>
          <button type="button" class="option-chip" data-target="orang" data-val="2">2 Orang</button>
          <button type="button" class="option-chip" data-target="orang" data-val="4">Keluarga (4)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="liter_per_hari">Konsumsi per Orang per Hari <span class="unit">(Liter)</span></label>
        <div class="input-wrapper">
          <i class="fa-glass-water fa-solid input-icon"></i>
          <input type="number" id="liter_per_hari" class="form-control" step="0.5" value="2">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="liter_per_hari" data-val="1.5">Sedikit (1.5 Liter)</button>
          <button type="button" class="option-chip active" data-target="liter_per_hari" data-val="2">Standar (2.0 Liter)</button>
          <button type="button" class="option-chip" data-target="liter_per_hari" data-val="2.5">Tinggi (2.5 Liter)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="harga_per_galon">Harga Refill per Galon (19 Liter) <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="harga_per_galon" class="form-control" step="1000" value="20000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="harga_per_galon" data-val="7000">ISI ULANG (Rp 7.000)</button>
          <button type="button" class="option-chip active" data-target="harga_per_galon" data-val="20000">AQUA (Rp 20.000)</button>
          <button type="button" class="option-chip" data-target="harga_per_galon" data-val="22000">Le Minerale (Rp 22.000)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="hari">Lama Waktu <span class="unit">(Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-calendar-days fa-solid input-icon"></i>
          <input type="number" id="hari" class="form-control" min="1" max="365" value="30">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="hari" data-val="7">1 Minggu (7h)</button>
          <button type="button" class="option-chip active" data-target="hari" data-val="30">1 Bulan (30h)</button>
          <button type="button" class="option-chip" data-target="hari" data-val="90">3 Bulan (90h)</button>
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
      const currentInputs = AirModule.getFormInputs(container);
      const total_liter = currentInputs.orang * currentInputs.liter_per_hari * 30;
      const galon = Math.ceil(total_liter / 19);
      const monthlyCost = galon * currentInputs.harga_per_galon;

      BudgetStore.saveBudgetItem('air', {
        id: 'air',
        name: 'Air Galon Minum',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Air Galon (${currentInputs.orang} orang)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      orang: parseInt(container.querySelector('#orang')?.value || 1, 10),
      liter_per_hari: parseFloat(container.querySelector('#liter_per_hari')?.value || 2),
      harga_per_galon: parseFloat(container.querySelector('#harga_per_galon')?.value || 20000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { orang, liter_per_hari, harga_per_galon, hari } = inputs;

    const total_liter = orang * liter_per_hari * hari;
    const total_galon = total_liter / 19;
    const total_galon_pembelian = Math.ceil(total_galon);
    const total_biaya = total_galon_pembelian * harga_per_galon;

    const summaryCards = [
      {
        title: 'Total Kebutuhan Galon',
        value: `${formatNumber(total_galon_pembelian, 0)} Galon`,
        note: `Presisi: ${formatNumber(total_galon, 2)} Galon (${formatNumber(total_liter, 0)} Liter)`,
        icon: 'fa-bottle-water',
        type: 'emerald'
      },
      {
        title: 'Total Biaya Air',
        value: formatRupiah(total_biaya),
        note: `@ ${formatRupiah(harga_per_galon)} / Galon`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      },
      {
        title: 'Habis 1 Galon Dalam',
        value: `${formatNumber(19 / (orang * liter_per_hari), 1)} Hari`,
        note: `Untuk ${orang} Orang`,
        icon: 'fa-clock',
        type: 'sky'
      }
    ];

    const periods = [
      { label: '7 Hari', d: 7 },
      { label: '30 Hari (1 Bulan)', d: 30 },
      { label: '90 Hari (3 Bulan)', d: 90 },
      { label: '365 Hari (1 Tahun)', d: 365 },
      { label: `Custom (${hari} Hari)`, d: hari, isCurrent: true }
    ];

    const tableHeaders = ['Periode', 'Total Air (Liter)', 'Kebutuhan Galon', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const liter = orang * liter_per_hari * p.d;
      const galon = Math.ceil(liter / 19);
      const cost = galon * harga_per_galon;
      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(liter, 0)} L`,
          `${galon} Galon`,
          `<span class="highlight">${formatRupiah(cost)}</span>`
        ]
      };
    });

    return {
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['7 Hari', '30 Hari', '90 Hari', '365 Hari'],
        datasets: [
          {
            label: 'Estimasi Pembelian Galon',
            data: [7, 30, 90, 365].map(d => Math.ceil((orang * liter_per_hari * d) / 19)),
            backgroundColor: 'rgba(6, 182, 212, 0.6)',
            borderColor: '#06b6d4',
            borderWidth: 2
          }
        ]
      },
      quickStats: {
        totalQty: `${total_galon_pembelian} Galon`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
