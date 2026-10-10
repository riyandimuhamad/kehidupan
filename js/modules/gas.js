/**
 * Modul Kalkulator Kebutuhan Gas LPG
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const GasModule = {
  id: 'gas',
  name: 'Gas LPG',
  icon: 'fa-fire-burner',
  badge: 'Module Bahan Bakar Dapur',
  title: 'Kalkulator Kebutuhan Gas LPG',
  subtitle: 'Hitung kebutuhan tabung gas LPG (3kg Melon / 12kg Bright Gas) berdasarkan frekuensi memasak harian keluarga.',

  defaults: {
    tipe_gas: '3kg',
    intensitas_masak: 2,
    harga_per_tabung: 22000,
    hari: 30
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="tipe_gas">Tipe Tabung Gas LPG</label>
        <div class="input-wrapper">
          <i class="fa-database fa-solid input-icon"></i>
          <select id="tipe_gas" class="form-control">
            <option value="3kg" selected>Gas Melon 3kg (Subsidi)</option>
            <option value="5.5kg">Bright Gas 5.5kg</option>
            <option value="12kg">Bright Gas 12kg</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="intensitas_masak">Intensitas Memasak per Hari <span class="unit">(Jam Nyala Kompor/Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-clock fa-solid input-icon"></i>
          <input type="number" id="intensitas_masak" class="form-control" step="0.5" value="2">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="intensitas_masak" data-val="1">Ringan (1 jam)</button>
          <button type="button" class="option-chip active" data-target="intensitas_masak" data-val="2">Sedang (2 jam)</button>
          <button type="button" class="option-chip" data-target="intensitas_masak" data-val="3.5">Aktif (3.5 jam)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="harga_per_tabung">Harga per Tabung Refill <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="harga_per_tabung" class="form-control" step="1000" value="22000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip active" data-target="harga_per_tabung" data-val="22000">3kg (Rp 22.000)</button>
          <button type="button" class="option-chip" data-target="harga_per_tabung" data-val="105000">5.5kg (Rp 105.000)</button>
          <button type="button" class="option-chip" data-target="harga_per_tabung" data-val="215000">12kg (Rp 215.000)</button>
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
      const currentInputs = GasModule.getFormInputs(container);
      let jam_per_tabung = 35;
      if (currentInputs.tipe_gas === '5.5kg') jam_per_tabung = 65;
      if (currentInputs.tipe_gas === '12kg') jam_per_tabung = 140;

      const total_jam_bulan = currentInputs.intensitas_masak * 30;
      const tabung_bulan = Math.ceil(total_jam_bulan / jam_per_tabung);
      const monthlyCost = tabung_bulan * currentInputs.harga_per_tabung;

      BudgetStore.saveBudgetItem('gas', {
        id: 'gas',
        name: 'Gas LPG Dapur',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Gas LPG (${currentInputs.tipe_gas})`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      tipe_gas: container.querySelector('#tipe_gas')?.value || '3kg',
      intensitas_masak: parseFloat(container.querySelector('#intensitas_masak')?.value || 2),
      harga_per_tabung: parseFloat(container.querySelector('#harga_per_tabung')?.value || 22000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { tipe_gas, intensitas_masak, harga_per_tabung, hari } = inputs;

    let jam_per_tabung = 35;
    if (tipe_gas === '5.5kg') jam_per_tabung = 65;
    if (tipe_gas === '12kg') jam_per_tabung = 140;

    const total_jam = intensitas_masak * hari;
    const total_tabung = total_jam / jam_per_tabung;
    const total_tabung_pembelian = Math.ceil(total_tabung);
    const total_biaya = total_tabung_pembelian * harga_per_tabung;

    const masa_pakai_1_tabung = jam_per_tabung / (intensitas_masak || 1);

    const summaryCards = [
      {
        title: 'Estimasi Tabung LPG',
        value: `${total_tabung_pembelian} Tabung (${tipe_gas})`,
        note: `Presisi: ${formatNumber(total_tabung, 1)} Tabung`,
        icon: 'fa-fire-burner',
        type: 'emerald'
      },
      {
        title: 'Total Biaya Gas',
        value: formatRupiah(total_biaya),
        note: `@ ${formatRupiah(harga_per_tabung)} / tabung`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      },
      {
        title: 'Daya Tahan 1 Tabung',
        value: `± ${formatNumber(masa_pakai_1_tabung, 1)} Hari`,
        note: `Untuk ${intensitas_masak} jam nyala kompor/hari`,
        icon: 'fa-hourglass-half',
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

    const tableHeaders = ['Periode', 'Total Jam Masak', 'Estimasi Tabung', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const jam = intensitas_masak * p.d;
      const tabung = Math.ceil(jam / jam_per_tabung);
      const cost = tabung * harga_per_tabung;
      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(jam, 1)} Jam`,
          `${tabung} Tabung`,
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
            label: 'Estimasi Kebutuhan Tabung LPG',
            data: [7, 30, 90, 365].map(d => Math.ceil((intensitas_masak * d) / jam_per_tabung)),
            backgroundColor: 'rgba(244, 63, 94, 0.6)',
            borderColor: '#f43f5e',
            borderWidth: 2
          }
        ]
      },
      quickStats: {
        totalQty: `${total_tabung_pembelian} Tabung`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
