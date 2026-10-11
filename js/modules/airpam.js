/**
 * Modul Kalkulator Kebutuhan Air PAM / PDAM
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const AirPamModule = {
  id: 'airpam',
  name: 'Air PAM / PDAM',
  icon: 'fa-faucet-drip',
  badge: 'Module Utilitas Air',
  title: 'Kalkulator Tagihan Air PAM / PDAM',
  subtitle: 'Hitung estimasi konsumsi air bersih harian, bulanan (m³) dan proyeksi tagihan PDAM / PAM rumah tangga.',

  defaults: {
    orang: 4,
    liter_per_hari: 150,
    tarif_per_m3: 4500,
    admin_fee: 15000,
    hari: 30
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="orang">Jumlah Orang <span class="unit">(Anggota Keluarga / Jiwa)</span></label>
        <div class="input-wrapper">
          <i class="fa-users fa-solid input-icon"></i>
          <input type="number" id="orang" class="form-control" min="1" max="1000" value="4">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="orang" data-val="1">1 Orang</button>
          <button type="button" class="option-chip" data-target="orang" data-val="2">2 Orang</button>
          <button type="button" class="option-chip active" data-target="orang" data-val="4">Keluarga (4)</button>
          <button type="button" class="option-chip" data-target="orang" data-val="6">Besar (6)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="liter_per_hari">Konsumsi per Orang per Hari <span class="unit">(Liter)</span></label>
        <div class="input-wrapper">
          <i class="fa-faucet fa-solid input-icon"></i>
          <input type="number" id="liter_per_hari" class="form-control" step="10" value="150">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="liter_per_hari" data-val="100">Hemat (100 L/hari)</button>
          <button type="button" class="option-chip active" data-target="liter_per_hari" data-val="150">Standar (150 L/hari)</button>
          <button type="button" class="option-chip" data-target="liter_per_hari" data-val="200">Tinggi (200 L/hari)</button>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">*Standar pemakaian air mandi, cuci pakaian/piring, dan kebersihan adalah 120 - 150 Liter/jiwa/hari.</p>
      </div>

      <div class="form-group">
        <label for="tarif_per_m3">Tarif Air PAM per m³ (1.000 Liter) <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-tag fa-solid input-icon"></i>
          <input type="number" id="tarif_per_m3" class="form-control" step="500" value="4500">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="tarif_per_m3" data-val="3000">Subsidi / Desa (Rp 3.000)</button>
          <button type="button" class="option-chip active" data-target="tarif_per_m3" data-val="4500">Standar PDAM (Rp 4.500)</button>
          <button type="button" class="option-chip" data-target="tarif_per_m3" data-val="7500">Kota / Non-Subsidi (Rp 7.500)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="admin_fee">Biaya Administrasi & Pemeliharaan Meteran / Bulan <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-receipt fa-solid input-icon"></i>
          <input type="number" id="admin_fee" class="form-control" step="1000" value="15000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="admin_fee" data-val="0">Bebas Admin (Rp 0)</button>
          <button type="button" class="option-chip active" data-target="admin_fee" data-val="15000">Standar (Rp 15.000)</button>
          <button type="button" class="option-chip" data-target="admin_fee" data-val="25000">Tinggi (Rp 25.000)</button>
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
      const currentInputs = AirPamModule.getFormInputs(container);
      const monthlyLiter = currentInputs.orang * currentInputs.liter_per_hari * 30;
      const monthlyM3 = monthlyLiter / 1000;
      const monthlyCost = (monthlyM3 * currentInputs.tarif_per_m3) + currentInputs.admin_fee;

      BudgetStore.saveBudgetItem('airpam', {
        id: 'airpam',
        name: 'Air PAM / PDAM',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Air PAM (${currentInputs.orang} orang)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      orang: parseInt(container.querySelector('#orang')?.value || 4, 10),
      liter_per_hari: parseFloat(container.querySelector('#liter_per_hari')?.value || 150),
      tarif_per_m3: parseFloat(container.querySelector('#tarif_per_m3')?.value || 4500),
      admin_fee: parseFloat(container.querySelector('#admin_fee')?.value || 15000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { orang, liter_per_hari, tarif_per_m3, admin_fee, hari } = inputs;

    const total_liter = orang * liter_per_hari * hari;
    const total_m3 = total_liter / 1000;
    const biaya_air = total_m3 * tarif_per_m3;
    const biaya_admin = (hari / 30) * admin_fee;
    const total_biaya = biaya_air + biaya_admin;

    const summaryCards = [
      {
        title: 'Total Pemakaian Air',
        value: `${formatNumber(total_m3, 1)} m³`,
        note: `Setara ${formatNumber(total_liter, 0)} Liter (${formatNumber(orang * liter_per_hari, 0)} L/hari)`,
        icon: 'fa-faucet-drip',
        type: 'emerald'
      },
      {
        title: 'Estimasi Tagihan PAM',
        value: formatRupiah(total_biaya),
        note: `Air: ${formatRupiah(biaya_air)} + Adm: ${formatRupiah(biaya_admin)}`,
        icon: 'fa-file-invoice-dollar',
        type: 'amber'
      },
      {
        title: 'Rata-rata Biaya Harian',
        value: `${formatRupiah(total_biaya / hari)} / Hari`,
        note: `Untuk ${orang} Orang (${formatNumber((orang * liter_per_hari) / 1000, 2)} m³/hari)`,
        icon: 'fa-chart-line',
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

    const tableHeaders = ['Periode', 'Total Pemakaian (m³)', 'Biaya Pemakaian Air', 'Biaya Administrasi', 'Total Tagihan (Rp)'];
    const tableRows = periods.map(p => {
      const liter = orang * liter_per_hari * p.d;
      const m3 = liter / 1000;
      const airCost = m3 * tarif_per_m3;
      const admCost = (p.d / 30) * admin_fee;
      const cost = airCost + admCost;

      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(m3, 1)} m³ (${formatNumber(liter, 0)} L)`,
          `${formatRupiah(airCost)}`,
          `${formatRupiah(admCost)}`,
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
            label: 'Estimasi Tagihan Air PAM',
            data: [
              ((orang * liter_per_hari * 7 / 1000) * tarif_per_m3) + ((7 / 30) * admin_fee),
              ((orang * liter_per_hari * 30 / 1000) * tarif_per_m3) + admin_fee,
              ((orang * liter_per_hari * 90 / 1000) * tarif_per_m3) + (3 * admin_fee),
              ((orang * liter_per_hari * 365 / 1000) * tarif_per_m3) + (12 * admin_fee)
            ],
            backgroundColor: 'rgba(99, 102, 241, 0.65)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(total_m3, 1)} m³`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
