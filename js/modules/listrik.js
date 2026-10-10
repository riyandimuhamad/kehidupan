/**
 * Modul Kalkulator Kebutuhan Listrik PLN
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const ListrikModule = {
  id: 'listrik',
  name: 'Listrik PLN',
  icon: 'fa-bolt',
  badge: 'Module Energi',
  title: 'Kalkulator Estimasi Listrik PLN',
  subtitle: 'Hitung estimasi pengeluaran token listrik atau tagihan bulanan berdasarkan daya terpasang dan pemakaian harian (kWh).',

  defaults: {
    daya_va: 1300,
    kwh_per_hari: 10,
    tarif_per_kwh: 1444.70,
    hari: 30
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="daya_va">Daya Listrik Terpasang <span class="unit">(VA)</span></label>
        <div class="input-wrapper">
          <i class="fa-bolt-lightning fa-solid input-icon"></i>
          <select id="daya_va" class="form-control">
            <option value="900">900 VA (Subsidi / Non-Subsidi)</option>
            <option value="1300" selected>1.300 VA (R-1/TR Standard)</option>
            <option value="2200">2.200 VA (R-1/TR)</option>
            <option value="3500">3.500 VA (R-2/TR)</option>
            <option value="5500">5.500 VA (R-2/TR)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="kwh_per_hari">Estimasi Pemakaian per Hari <span class="unit">(kWh)</span></label>
        <div class="input-wrapper">
          <i class="fa-plug fa-solid input-icon"></i>
          <input type="number" id="kwh_per_hari" class="form-control" step="0.5" value="10">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="kwh_per_hari" data-val="5">Hemat (5 kWh)</button>
          <button type="button" class="option-chip active" data-target="kwh_per_hari" data-val="10">Sedang (10 kWh)</button>
          <button type="button" class="option-chip" data-target="kwh_per_hari" data-val="20">Banyak + AC (20 kWh)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="tarif_per_kwh">Tarif PLN per kWh <span class="unit">(Rp)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="tarif_per_kwh" class="form-control" step="10" value="1444.70">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="tarif_per_kwh" data-val="1352">R1 900VA (Rp 1.352)</button>
          <button type="button" class="option-chip active" data-target="tarif_per_kwh" data-val="1444.70">R1 1300VA (Rp 1.444,7)</button>
          <button type="button" class="option-chip" data-target="tarif_per_kwh" data-val="1700">Non-Subsidi (Rp 1.700)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="hari">Lama Waktu <span class="unit">(Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-calendar-days fa-solid input-icon"></i>
          <input type="number" id="hari" class="form-control" min="1" max="365" value="30">
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
      const currentInputs = ListrikModule.getFormInputs(container);
      const monthlyKwh = currentInputs.kwh_per_hari * 30;
      const monthlyCost = monthlyKwh * currentInputs.tarif_per_kwh * 1.05;

      BudgetStore.saveBudgetItem('listrik', {
        id: 'listrik',
        name: 'Listrik PLN',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Listrik (${currentInputs.daya_va} VA)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      daya_va: parseInt(container.querySelector('#daya_va')?.value || 1300, 10),
      kwh_per_hari: parseFloat(container.querySelector('#kwh_per_hari')?.value || 10),
      tarif_per_kwh: parseFloat(container.querySelector('#tarif_per_kwh')?.value || 1444.70),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { kwh_per_hari, tarif_per_kwh, hari } = inputs;

    const total_kwh = kwh_per_hari * hari;
    const total_biaya = total_kwh * tarif_per_kwh;
    const total_biaya_dengan_pajak = total_biaya * 1.05;

    const summaryCards = [
      {
        title: 'Total Konsumsi Listrik',
        value: `${formatNumber(total_kwh, 1)} kWh`,
        note: `Rata-rata ${formatNumber(kwh_per_hari, 1)} kWh/hari`,
        icon: 'fa-bolt',
        type: 'emerald'
      },
      {
        title: 'Estimasi Biaya Token/Tagihan',
        value: formatRupiah(total_biaya_dengan_pajak),
        note: `Termasuk Est. Pajak PPJ (5%)`,
        icon: 'fa-receipt',
        type: 'amber'
      },
      {
        title: 'Rekomendasi Beli Token',
        value: formatRupiah(Math.ceil(total_biaya_dengan_pajak / 50000) * 50000),
        note: `Pilihan Denom Token PLN`,
        icon: 'fa-wallet',
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

    const tableHeaders = ['Periode', 'Total Pemakaian (kWh)', 'Estimasi Tagihan (Rp)', 'Termasuk Est. PPJ 5% (Rp)'];
    const tableRows = periods.map(p => {
      const kwh = kwh_per_hari * p.d;
      const cost = kwh * tarif_per_kwh;
      const costTax = cost * 1.05;
      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(kwh, 1)} kWh`,
          formatRupiah(cost),
          `<span class="highlight">${formatRupiah(costTax)}</span>`
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
            label: 'Estimasi Tagihan Listrik (Rp)',
            data: [7, 30, 90, 365].map(d => kwh_per_hari * d * tarif_per_kwh * 1.05),
            backgroundColor: 'rgba(245, 158, 11, 0.6)',
            borderColor: '#f59e0b',
            borderWidth: 2
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(total_kwh, 1)} kWh`,
        totalCost: formatRupiah(total_biaya_dengan_pajak)
      }
    };
  }
};
