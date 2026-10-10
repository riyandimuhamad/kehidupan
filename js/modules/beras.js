/**
 * Modul Kalkulator Kebutuhan Beras
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const BerasModule = {
  id: 'beras',
  name: 'Beras & Pangan Utama',
  icon: 'fa-bowl-rice',
  badge: 'Module Pangan Utama',
  title: 'Kalkulator Kebutuhan Beras',
  subtitle: 'Hitung estimasi konsumsi beras harian, mingguan, hingga tahunan beserta estimasi paket pembelian yang efisien.',

  defaults: {
    orang: 1,
    makan_per_hari: 3,
    harga_per_kg: 15000,
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
          <button type="button" class="option-chip" data-target="orang" data-val="6">Keluarga Besar (6)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="makan_per_hari">Pola Makan per Hari <span class="unit">(kali makan)</span></label>
        <div class="input-wrapper">
          <i class="fa-utensils fa-solid input-icon"></i>
          <input type="number" id="makan_per_hari" class="form-control" min="1" max="10" value="3">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="makan_per_hari" data-val="2">2 Kali / Hari</button>
          <button type="button" class="option-chip active" data-target="makan_per_hari" data-val="3">3 Kali / Hari (Standar)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="harga_per_kg">Harga Beras per Kg <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="harga_per_kg" class="form-control" step="500" value="15000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="harga_per_kg" data-val="13500">Medium (Rp 13.500)</button>
          <button type="button" class="option-chip active" data-target="harga_per_kg" data-val="15000">Premium (Rp 15.000)</button>
          <button type="button" class="option-chip" data-target="harga_per_kg" data-val="18000">Super (Rp 18.000)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="hari">Lama Waktu <span class="unit">(Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-calendar-days fa-solid input-icon"></i>
          <input type="number" id="hari" class="form-control" min="1" max="3650" value="30">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="hari" data-val="7">1 Minggu (7h)</button>
          <button type="button" class="option-chip active" data-target="hari" data-val="30">1 Bulan (30h)</button>
          <button type="button" class="option-chip" data-target="hari" data-val="90">3 Bulan (90h)</button>
          <button type="button" class="option-chip" data-target="hari" data-val="365">1 Tahun (365h)</button>
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
      const currentInputs = BerasModule.getFormInputs(container);
      const res = BerasModule.calculate(currentInputs);
      
      // Normalize monthly cost (30 days)
      const monthlyCost = (res.total_beras / (currentInputs.hari || 1)) * 30 * currentInputs.harga_per_kg;

      BudgetStore.saveBudgetItem('beras', {
        id: 'beras',
        name: 'Beras & Pangan',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Beras (${currentInputs.orang} orang)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      orang: parseInt(container.querySelector('#orang')?.value || 1, 10),
      makan_per_hari: parseFloat(container.querySelector('#makan_per_hari')?.value || 3),
      harga_per_kg: parseFloat(container.querySelector('#harga_per_kg')?.value || 15000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { orang, makan_per_hari, harga_per_kg, hari } = inputs;

    const konsumsi_per_hari_per_orang = makan_per_hari / 6; 
    const konsumsi_per_orang = konsumsi_per_hari_per_orang * hari;
    const total_beras = konsumsi_per_orang * orang;
    const total_biaya = total_beras * harga_per_kg;
    const konsumsi_total_harian = konsumsi_per_hari_per_orang * orang;

    const summaryCards = [
      {
        title: 'Total Kebutuhan Beras',
        value: `${formatNumber(total_beras, 2)} kg`,
        note: `Setara ± ${formatNumber(total_beras * 1.25, 1)} Liter`,
        icon: 'fa-box-archive',
        type: 'emerald'
      },
      {
        title: 'Total Biaya Beras',
        value: formatRupiah(total_biaya),
        note: `@ ${formatRupiah(harga_per_kg)} / kg`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      },
      {
        title: 'Konsumsi Harian (Total)',
        value: `${formatNumber(konsumsi_total_harian, 2)} kg/hari`,
        note: `${formatNumber(konsumsi_per_hari_per_orang, 2)} kg/orang/hari`,
        icon: 'fa-scale-balanced',
        type: 'sky'
      }
    ];

    const periods = [
      { label: '1 Hari', d: 1 },
      { label: '1 Minggu (7 Hari)', d: 7 },
      { label: '1 Bulan (30 Hari)', d: 30 },
      { label: '3 Bulan (90 Hari)', d: 90 },
      { label: '1 Tahun (365 Hari)', d: 365 },
      { label: `Custom (${hari} Hari)`, d: hari, isCurrent: true }
    ];

    const tableHeaders = ['Periode', 'Total Konsumsi (kg)', 'Rata-rata / Orang (kg)', 'Estimasi Karung (5kg)', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const kgPeriodTotal = konsumsi_per_hari_per_orang * p.d * orang;
      const kgPerOrang = konsumsi_per_hari_per_orang * p.d;
      const costPeriod = kgPeriodTotal * harga_per_kg;
      const packs = Math.ceil(kgPeriodTotal / 5);

      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(kgPeriodTotal, 2)} kg`,
          `${formatNumber(kgPerOrang, 2)} kg`,
          `${packs} Karung (5kg)`,
          `<span class="highlight">${formatRupiah(costPeriod)}</span>`
        ]
      };
    });

    return {
      total_beras,
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['1 Harian', '7 Hari', '30 Hari', '90 Hari', '365 Hari'],
        datasets: [
          {
            label: 'Biaya Beras (Rp)',
            data: [1, 7, 30, 90, 365].map(d => konsumsi_per_hari_per_orang * d * orang * harga_per_kg),
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(total_beras, 2)} kg`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
