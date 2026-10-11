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
  title: 'Kalkulator Sembako & Kebersihan Dapur',
  subtitle: 'Hitung kebutuhan rincian Sembako (Minyak, Gula, Telur, Bumbu), Lauk Pauk (Ayam/Daging/Ikan), serta Perlengkapan Mandi & Cuci.',

  defaults: {
    minyak_liter: 3,
    harga_minyak: 17000,
    gula_kg: 2,
    harga_gula: 17500,
    telur_kg: 2,
    harga_telur: 28000,
    bumbu_dapur: 100000,
    lauk_pauk: 450000,
    paket_kebersihan: 150000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <!-- Section 1: Sembako Utama Dapur -->
      <div style="margin-bottom: 16px; border-bottom: 1px dashed var(--border-color); padding-bottom: 12px;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 10px;">
          1. Sembako & Bahan Pokok Dapur
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="minyak_liter">Minyak Goreng <span class="unit">(Liter)</span></label>
            <div class="input-wrapper">
              <i class="fa-bottle-droplet fa-solid input-icon"></i>
              <input type="number" id="minyak_liter" class="form-control" step="1" value="3">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="harga_minyak">Harga Minyak <span class="unit">(Rp/L)</span></label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon"></i>
              <input type="number" id="harga_minyak" class="form-control" step="500" value="17000">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="gula_kg">Gula Pasir <span class="unit">(Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-cubes-stacked fa-solid input-icon"></i>
              <input type="number" id="gula_kg" class="form-control" step="0.5" value="2">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="harga_gula">Harga Gula <span class="unit">(Rp/Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon"></i>
              <input type="number" id="harga_gula" class="form-control" step="500" value="17500">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="telur_kg">Telur Ayam <span class="unit">(Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-egg fa-solid input-icon"></i>
              <input type="number" id="telur_kg" class="form-control" step="0.5" value="2">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="harga_telur">Harga Telur <span class="unit">(Rp/Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon"></i>
              <input type="number" id="harga_telur" class="form-control" step="500" value="28000">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="bumbu_dapur">Bumbu Dapur, Garam & Kecap <span class="unit">(Rp/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-pepper-hot fa-solid input-icon"></i>
            <input type="number" id="bumbu_dapur" class="form-control" step="10000" value="100000">
          </div>
        </div>
      </div>

      <!-- Section 2: Lauk Pauk & Protein -->
      <div style="margin-bottom: 16px; border-bottom: 1px dashed var(--border-color); padding-bottom: 12px;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--accent-amber); margin-bottom: 10px;">
          2. Lauk Pauk & Protein (Daging / Ayam / Ikan / Sayur)
        </h4>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="lauk_pauk">Total Belanja Lauk Pauk Bulanan <span class="unit">(Rupiah/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-drumstick-bite fa-solid input-icon"></i>
            <input type="number" id="lauk_pauk" class="form-control" step="25000" value="450000">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip" data-target="lauk_pauk" data-val="300000">Hemat (Rp 300k)</button>
            <button type="button" class="option-chip active" data-target="lauk_pauk" data-val="450000">Sedang (Rp 450k)</button>
            <button type="button" class="option-chip" data-target="lauk_pauk" data-val="750000">Lengkap (Rp 750k)</button>
          </div>
        </div>
      </div>

      <!-- Section 3: Sanitasi & Kebersihan -->
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--accent-sky); margin-bottom: 10px;">
          3. Perlengkapan Mandi & Cuci
        </h4>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="paket_kebersihan">Sabun Mandi, Detergen, Shampo & Odol <span class="unit">(Rp/Bulan)</span></label>
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
        source: `Minyak, Gula, Telur, Lauk & Kebersihan`
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
      telur_kg: parseFloat(container.querySelector('#telur_kg')?.value || 0),
      harga_telur: parseFloat(container.querySelector('#harga_telur')?.value || 0),
      bumbu_dapur: parseFloat(container.querySelector('#bumbu_dapur')?.value || 0),
      lauk_pauk: parseFloat(container.querySelector('#lauk_pauk')?.value || 0),
      paket_kebersihan: parseFloat(container.querySelector('#paket_kebersihan')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const {
      minyak_liter, harga_minyak,
      gula_kg, harga_gula,
      telur_kg, harga_telur,
      bumbu_dapur, lauk_pauk, paket_kebersihan
    } = inputs;

    const biaya_minyak = minyak_liter * harga_minyak;
    const biaya_gula = gula_kg * harga_gula;
    const biaya_telur = telur_kg * harga_telur;
    
    const total_sembako_dapur = biaya_minyak + biaya_gula + biaya_telur + bumbu_dapur;
    const total_lauk_protein = lauk_pauk;
    const total_sanitasi_cuci = paket_kebersihan;

    const total_biaya = total_sembako_dapur + total_lauk_protein + total_sanitasi_cuci;

    const summaryCards = [
      {
        title: 'Sembako & Bahan Dapur',
        value: formatRupiah(total_sembako_dapur),
        note: `Minyak, Gula, Telur & Bumbu`,
        icon: 'fa-bottle-droplet',
        type: 'emerald'
      },
      {
        title: 'Lauk Pauk & Protein',
        value: formatRupiah(total_lauk_protein),
        note: `Daging, Ayam, Ikan & Sayur`,
        icon: 'fa-drumstick-bite',
        type: 'amber'
      },
      {
        title: 'Total Belanja Dapur & Sanitasi',
        value: formatRupiah(total_biaya),
        note: `Termasuk Sabun & Detergen (${formatRupiah(total_sanitasi_cuci)})`,
        icon: 'fa-basket-shopping',
        type: 'sky'
      }
    ];

    const periods = [
      { label: '1 Bulan', d: 1 },
      { label: '3 Bulan', d: 3 },
      { label: '6 Bulan', d: 6 },
      { label: '12 Bulan (1 Tahun)', d: 12 }
    ];

    const tableHeaders = ['Periode', 'Sembako Dapur', 'Lauk Pauk & Protein', 'Mandi & Cuci', 'Total (Rp)'];
    const tableRows = periods.map(p => {
      const s = total_sembako_dapur * p.d;
      const l = total_lauk_protein * p.d;
      const c = total_sanitasi_cuci * p.d;
      const cost = s + l + c;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(s),
          formatRupiah(l),
          formatRupiah(c),
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
        labels: ['Sembako & Bumbu Dapur', 'Lauk Pauk & Protein', 'Perlengkapan Mandi & Cuci'],
        datasets: [
          {
            label: 'Rincian Belanja Sembako & Dapur',
            data: [total_sembako_dapur, total_lauk_protein, total_sanitasi_cuci],
            backgroundColor: ['#10b981', '#f59e0b', '#06b6d4']
          }
        ]
      },
      quickStats: {
        totalQty: `Sembako, Lauk & Sanitasi`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
