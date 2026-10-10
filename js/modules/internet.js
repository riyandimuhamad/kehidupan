/**
 * Modul Kalkulator Internet & Paket Data
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const InternetModule = {
  id: 'internet',
  name: 'Internet & Data',
  icon: 'fa-wifi',
  badge: 'Module Komunikasi',
  title: 'Kalkulator Internet & Paket Data',
  subtitle: 'Hitung estimasi pengeluaran langganan WiFi rumah dan paket data seluler bulanan keluarga.',

  defaults: {
    tipe_layanan: 'wifi',
    paket_wifi: 275000,
    jumlah_hp: 2,
    harga_paket_data: 75000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="paket_wifi">Biaya Langganan WiFi Rumah <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-house-signal fa-solid input-icon"></i>
          <input type="number" id="paket_wifi" class="form-control" step="10000" value="275000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="paket_wifi" data-val="0">Tanpa WiFi (Rp 0)</button>
          <button type="button" class="option-chip active" data-target="paket_wifi" data-val="275000">IndiHome/Iconnet (Rp 275k)</button>
          <button type="button" class="option-chip" data-target="paket_wifi" data-val="385000">Biznet/FirstMedia (Rp 385k)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="jumlah_hp">Jumlah HP / Nomor Seluler Aktiv</label>
        <div class="input-wrapper">
          <i class="fa-mobile-screen-button fa-solid input-icon"></i>
          <input type="number" id="jumlah_hp" class="form-control" min="0" max="20" value="2">
        </div>
      </div>

      <div class="form-group">
        <label for="harga_paket_data">Rata-rata Paket Data per HP <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-sim-card fa-solid input-icon"></i>
          <input type="number" id="harga_paket_data" class="form-control" step="5000" value="75000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="harga_paket_data" data-val="50000">Hemat (Rp 50.000)</button>
          <button type="button" class="option-chip active" data-target="harga_paket_data" data-val="75000">Standar (Rp 75.000)</button>
          <button type="button" class="option-chip" data-target="harga_paket_data" data-val="125000">Kuota Besar (Rp 125.000)</button>
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
      const currentInputs = InternetModule.getFormInputs(container);
      const res = InternetModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('internet', {
        id: 'internet',
        name: 'Internet & Paket Data',
        amount: monthlyCost,
        category: 'Pokok',
        source: `WiFi + ${currentInputs.jumlah_hp} HP`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      paket_wifi: parseFloat(container.querySelector('#paket_wifi')?.value || 0),
      jumlah_hp: parseInt(container.querySelector('#jumlah_hp')?.value || 0, 10),
      harga_paket_data: parseFloat(container.querySelector('#harga_paket_data')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const { paket_wifi, jumlah_hp, harga_paket_data } = inputs;

    const total_paket_data = jumlah_hp * harga_paket_data;
    const total_biaya = paket_wifi + total_paket_data;

    const summaryCards = [
      {
        title: 'WiFi Rumah',
        value: formatRupiah(paket_wifi),
        note: `Langganan Bulanan`,
        icon: 'fa-wifi',
        type: 'emerald'
      },
      {
        title: 'Total Paket Data Seluler',
        value: formatRupiah(total_paket_data),
        note: `Untuk ${jumlah_hp} HP (@ ${formatRupiah(harga_paket_data)})`,
        icon: 'fa-mobile-screen',
        type: 'sky'
      },
      {
        title: 'Total Biaya Komunikasi',
        value: formatRupiah(total_biaya),
        note: `Pengeluaran Bulanan`,
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

    const tableHeaders = ['Periode', 'Biaya WiFi (Rp)', 'Biaya Paket Data (Rp)', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const wifi = paket_wifi * p.d;
      const data = total_paket_data * p.d;
      const cost = wifi + data;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(wifi),
          formatRupiah(data),
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
        labels: ['WiFi Rumah', 'Paket Data HP'],
        datasets: [
          {
            label: 'Komposisi Biaya Internet',
            data: [paket_wifi, total_paket_data],
            backgroundColor: ['#6366f1', '#06b6d4']
          }
        ]
      },
      quickStats: {
        totalQty: `WiFi + ${jumlah_hp} HP`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
