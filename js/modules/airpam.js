/**
 * Modul Kalkulator Kebutuhan Air Bersih (PDAM / PAM & Sumur Bor Pompa Air)
 * Kehidupan App Suite
 * 
 * Mendukung pilihan sumber air rumah tangga yang fleksibel & realistis:
 * 1. PDAM / PAM Meteran (Biaya pemakaian per m³ + abonemen/administrasi meteran)
 * 2. Sumur Bor / Pompa Air Listrik (Air gratis, biaya listrik pompa + perawatan filter air & servis pompa)
 * 3. Kombinasi (PAM untuk minum/mandi + Sumur Bor untuk cuci/kebersihan)
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_AIRPAM = 'kehidupan_airpam_data';

const DEFAULT_AIRPAM_DATA = {
  sumber_air: 'pdam', // 'pdam', 'sumur', 'kombinasi'
  orang: 0,
  liter_per_hari: 150,
  hari: 30,

  // PDAM Specific
  tarif_per_m3: 4500,
  admin_fee: 0,

  // Sumur Bor Specific
  biaya_listrik_pompa: 0, // Biaya listrik operasional pompa air / bulan
  perawatan_filter_bulan: 0, // Penggantian cartridge filter air, kuras toren berkala
  dana_servis_pompa: 0, // Dana cadangan pemeliharaan pompa & pipa

  // Kombinasi Specific
  porsi_pdam_persen: 50 // 50% PDAM, 50% Sumur Bor
};

export const AirPamModule = {
  id: 'airpam',
  name: 'Air Bersih (PAM / Sumur)',
  icon: 'fa-faucet-drip',
  badge: 'Module Utilitas Air Bersih',
  title: 'Kalkulator Air Bersih (PDAM & Sumur Bor)',
  subtitle: 'Hitung estimasi pengeluaran air bersih rumah tangga: jaringan meteran PDAM/PAM, sumur bor (listrik pompa & filter), atau kombinasi keduanya.',

  defaults: DEFAULT_AIRPAM_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_AIRPAM, DEFAULT_AIRPAM_DATA);
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_AIRPAM, data);
  },

  renderForm: (container, onInputChange) => {
    const data = AirPamModule.getData();

    const isPDAM = data.sumber_air === 'pdam';
    const isSumur = data.sumber_air === 'sumur';
    const isKombinasi = data.sumber_air === 'kombinasi';

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Pengaturan Sumber & Konsumsi Air Bersih
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Pilih jenis instalasi air yang digunakan di rumah untuk kalkulasi biaya yang akurat.
        </p>
      </div>

      <!-- Section 1: Pilihan Sumber Air Utama -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Sumber Air Utama Rumah Tangga</span>
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <button type="button" class="sumber-chip option-chip ${isPDAM ? 'active' : ''}" data-val="pdam" style="justify-content: center; font-size: 0.78rem; padding: 8px 6px;">
              <i class="fa-faucet fa-solid" style="margin-right: 5px;"></i> PDAM / PAM
            </button>
            <button type="button" class="sumber-chip option-chip ${isSumur ? 'active' : ''}" data-val="sumur" style="justify-content: center; font-size: 0.78rem; padding: 8px 6px;">
              <i class="fa-bore-hole fa-solid" style="margin-right: 5px;"></i> Sumur Bor
            </button>
            <button type="button" class="sumber-chip option-chip ${isKombinasi ? 'active' : ''}" data-val="kombinasi" style="justify-content: center; font-size: 0.78rem; padding: 8px 6px;">
              <i class="fa-arrows-split-up-and-left fa-solid" style="margin-right: 5px;"></i> Kombinasi
            </button>
          </div>
          <input type="hidden" id="sumber_air" value="${data.sumber_air}">
        </div>
      </div>

      <!-- Section 2: Profil Konsumsi Air Bersih -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Konsumsi Air Bersih
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Jumlah Jiwa</span> <span class="unit">(Orang)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-users fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="orang" class="form-control" min="0" max="100" value="${data.orang}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Konsumsi Harian</span> <span class="unit">(L/Orang/Hari)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-glass-water-droplet fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="liter_per_hari" class="form-control" min="0" step="10" value="${data.liter_per_hari}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-options" style="margin-bottom: 4px;">
          <button type="button" class="option-chip ${data.liter_per_hari === 100 ? 'active' : ''}" data-target="liter_per_hari" data-val="100">Hemat (100 L/hr)</button>
          <button type="button" class="option-chip ${data.liter_per_hari === 150 ? 'active' : ''}" data-target="liter_per_hari" data-val="150">Standar (150 L/hr)</button>
          <button type="button" class="option-chip ${data.liter_per_hari === 200 ? 'active' : ''}" data-target="liter_per_hari" data-val="200">Tinggi (200 L/hr)</button>
        </div>
        <p style="font-size: 0.73rem; color: var(--text-muted); margin: 0;">*Standar pemakaian mandi, cuci baju, cuci piring & sanitasi adalah 120 - 150 liter/orang/hari.</p>
      </div>

      <!-- Section 3A: Parameter Jaringan PDAM / PAM (Jika Memilih PDAM atau Kombinasi) -->
      <div id="pdamSection" class="card" style="display: ${isSumur ? 'none' : 'block'}; margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Tagihan & Tarif Meteran PDAM
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Tarif per m³</span> <span class="unit">(Rp/1.000 L)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="tarif_per_m3" class="form-control" min="0" step="250" value="${data.tarif_per_m3}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Abonemen & Admin</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-receipt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="admin_fee" class="form-control" min="0" step="1000" value="${data.admin_fee}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-options" style="margin-bottom: 0;">
          <button type="button" class="option-chip ${data.tarif_per_m3 === 3000 ? 'active' : ''}" data-target="tarif_per_m3" data-val="3000">Subsidi (Rp 3k)</button>
          <button type="button" class="option-chip ${data.tarif_per_m3 === 4500 ? 'active' : ''}" data-target="tarif_per_m3" data-val="4500">Standar (Rp 4.5k)</button>
          <button type="button" class="option-chip ${data.tarif_per_m3 === 7500 ? 'active' : ''}" data-target="tarif_per_m3" data-val="7500">Non-Subsidi (Rp 7.5k)</button>
        </div>
      </div>

      <!-- Section 3B: Parameter Biaya Sumur Bor & Pompa Air (Jika Memilih Sumur atau Kombinasi) -->
      <div id="sumurSection" class="card" style="display: ${isPDAM ? 'none' : 'block'}; margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Biaya Operasional & Perawatan Sumur Bor
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Listrik Pompa Air</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-bolt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="biaya_listrik_pompa" class="form-control" min="0" step="5000" value="${data.biaya_listrik_pompa}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Perawatan & Filter</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-filter fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="perawatan_filter_bulan" class="form-control" min="0" step="5000" value="${data.perawatan_filter_bulan}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 6px;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Dana Servis Pompa & Pipa</span> <span class="unit">(Rp/Bln)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-screwdriver-wrench fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="dana_servis_pompa" class="form-control" min="0" step="5000" value="${data.dana_servis_pompa}" placeholder="0 (Tabungan servis pompa/kuras toren)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
        </div>
        <p style="font-size: 0.73rem; color: var(--text-muted); margin: 0;">*Sumur bor bebas biaya kubikasi air, pengeluaran utama meliputi listrik pompa, filter sedimen/karbon, dan servis pompa.</p>
      </div>

      <!-- Section 3C: Porsi Pembagian (Hanya Jika Kombinasi) -->
      <div id="kombinasiSection" class="card" style="display: ${isKombinasi ? 'block' : 'none'}; margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Porsi Penggunaan Jaringan PDAM</span> <span class="unit">(%)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-percent fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="porsi_pdam_persen" class="form-control" min="0" max="100" step="5" value="${data.porsi_pdam_persen}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
          <p style="font-size: 0.73rem; color: var(--text-muted); margin-top: 4px;">*Contoh: 50% PDAM untuk mandi & memasak, 50% Sumur Bor untuk cuci baju, siram tanaman, dan kendaraan.</p>
        </div>
      </div>

      <!-- Section 4: Durasi Waktu Perhitungan -->
      <div class="card" style="margin-bottom: 16px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Lama Waktu Perhitungan</span> <span class="unit">(Hari)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="hari" class="form-control" min="0" max="365" value="${data.hari}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
          <div class="form-options" style="margin-top: 8px; margin-bottom: 0;">
            <button type="button" class="option-chip ${data.hari === 0 ? 'active' : ''}" data-target="hari" data-val="0">0 Hari</button>
            <button type="button" class="option-chip ${data.hari === 7 ? 'active' : ''}" data-target="hari" data-val="7">1 Minggu (7h)</button>
            <button type="button" class="option-chip ${data.hari === 30 ? 'active' : ''}" data-target="hari" data-val="30">1 Bulan (30h)</button>
            <button type="button" class="option-chip ${data.hari === 90 ? 'active' : ''}" data-target="hari" data-val="90">3 Bulan (90h)</button>
          </div>
        </div>
      </div>

      <!-- Action Sync to Budget Dashboard Button -->
      <div style="text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669);">
          <i class="fa-bookmark fa-solid"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Sumber Air Chips Switcher
    const sumberChips = container.querySelectorAll('.sumber-chip');
    const pdamSec = container.querySelector('#pdamSection');
    const sumurSec = container.querySelector('#sumurSection');
    const kombiSec = container.querySelector('#kombinasiSection');
    const sumberInput = container.querySelector('#sumber_air');

    sumberChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        sumberInput.value = val;
        sumberChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        if (val === 'pdam') {
          pdamSec.style.display = 'block';
          sumurSec.style.display = 'none';
          kombiSec.style.display = 'none';
        } else if (val === 'sumur') {
          pdamSec.style.display = 'none';
          sumurSec.style.display = 'block';
          kombiSec.style.display = 'none';
        } else if (val === 'kombinasi') {
          pdamSec.style.display = 'block';
          sumurSec.style.display = 'block';
          kombiSec.style.display = 'block';
        }

        saveCurrentState();
        onInputChange();
      });
    });

    // Option Chips Handlers
    const optionChips = container.querySelectorAll('.option-chip:not(.sumber-chip)');
    optionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-target');
        const val = chip.getAttribute('data-val');
        const targetInput = container.querySelector(`#${targetId}`);
        if (targetInput) {
          targetInput.value = val;
          container.querySelectorAll(`.option-chip[data-target="${targetId}"]`).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          saveCurrentState();
          onInputChange();
        }
      });
    });

    const saveCurrentState = () => {
      const inputs = AirPamModule.getFormInputs(container);
      AirPamModule.saveData(inputs);
    };

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        saveCurrentState();
        onInputChange();
      });
    });

    // Save to Budget Dashboard
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const currentInputs = AirPamModule.getFormInputs(container);
        const res = AirPamModule.calculate({ ...currentInputs, hari: 30 });
        const monthlyCost = res.total_biaya;

        let sourceLabel = 'Air Bersih';
        if (currentInputs.sumber_air === 'sumur') {
          sourceLabel = `Sumur Bor (${currentInputs.orang} jiwa - Listrik & Perawatan)`;
        } else if (currentInputs.sumber_air === 'kombinasi') {
          sourceLabel = `Kombinasi PAM + Sumur (${currentInputs.orang} jiwa)`;
        } else {
          sourceLabel = `PDAM / PAM (${currentInputs.orang} jiwa - Meteran)`;
        }

        BudgetStore.saveBudgetItem('airpam', {
          id: 'airpam',
          name: currentInputs.sumber_air === 'sumur' ? 'Air Bersih (Sumur Bor)' : 'Air PAM / PDAM',
          amount: monthlyCost,
          category: 'Pokok',
          source: sourceLabel
        });

        notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
        setTimeout(() => notice.innerHTML = '', 4000);
      });
    }
  },

  getFormInputs: (container) => {
    const parseVal = (sel, def = 0) => {
      const el = container.querySelector(sel);
      if (!el || el.value === '') return def;
      const v = parseFloat(el.value);
      return isNaN(v) ? def : v;
    };

    return {
      sumber_air: container.querySelector('#sumber_air')?.value || 'pdam',
      orang: parseVal('#orang', 0),
      liter_per_hari: parseVal('#liter_per_hari', 0),
      hari: parseVal('#hari', 0),

      tarif_per_m3: parseVal('#tarif_per_m3', 0),
      admin_fee: parseVal('#admin_fee', 0),

      biaya_listrik_pompa: parseVal('#biaya_listrik_pompa', 0),
      perawatan_filter_bulan: parseVal('#perawatan_filter_bulan', 0),
      dana_servis_pompa: parseVal('#dana_servis_pompa', 0),

      porsi_pdam_persen: parseVal('#porsi_pdam_persen', 50)
    };
  },

  calculate: (inputs) => {
    const s = inputs || AirPamModule.getData();

    const orang = (s.orang !== undefined && s.orang !== null) ? Number(s.orang) : 0;
    const liter_per_hari = (s.liter_per_hari !== undefined && s.liter_per_hari !== null) ? Number(s.liter_per_hari) : 0;
    const hari = (s.hari !== undefined && s.hari !== null) ? Number(s.hari) : 0;
    const sumber = s.sumber_air || 'pdam';

    const tarif_per_m3 = (s.tarif_per_m3 !== undefined && s.tarif_per_m3 !== null) ? Number(s.tarif_per_m3) : 0;
    const admin_fee = (s.admin_fee !== undefined && s.admin_fee !== null) ? Number(s.admin_fee) : 0;
    const biaya_listrik_pompa = (s.biaya_listrik_pompa !== undefined && s.biaya_listrik_pompa !== null) ? Number(s.biaya_listrik_pompa) : 0;
    const perawatan_filter_bulan = (s.perawatan_filter_bulan !== undefined && s.perawatan_filter_bulan !== null) ? Number(s.perawatan_filter_bulan) : 0;
    const dana_servis_pompa = (s.dana_servis_pompa !== undefined && s.dana_servis_pompa !== null) ? Number(s.dana_servis_pompa) : 0;
    const porsi_pdam_persen = (s.porsi_pdam_persen !== undefined && s.porsi_pdam_persen !== null) ? Number(s.porsi_pdam_persen) : 50;

    const total_liter = orang * liter_per_hari * hari;
    const total_m3 = total_liter / 1000;

    let total_biaya = 0;
    let biaya_pemakaian = 0;
    let biaya_tetap_perawatan = 0;

    if (hari <= 0 || (orang <= 0 && admin_fee <= 0 && biaya_listrik_pompa <= 0 && perawatan_filter_bulan <= 0 && dana_servis_pompa <= 0)) {
      total_biaya = 0;
      biaya_pemakaian = 0;
      biaya_tetap_perawatan = 0;
    } else if (sumber === 'pdam') {
      biaya_pemakaian = total_m3 * tarif_per_m3;
      biaya_tetap_perawatan = (hari / 30) * admin_fee;
      total_biaya = biaya_pemakaian + biaya_tetap_perawatan;
    } else if (sumber === 'sumur') {
      biaya_pemakaian = (hari / 30) * biaya_listrik_pompa; // Listrik pompa
      biaya_tetap_perawatan = (hari / 30) * (perawatan_filter_bulan + dana_servis_pompa);
      total_biaya = biaya_pemakaian + biaya_tetap_perawatan;
    } else if (sumber === 'kombinasi') {
      const porsiPdam = porsi_pdam_persen / 100;
      const porsiSumur = 1 - porsiPdam;

      const m3Pdam = total_m3 * porsiPdam;
      const costPdam = (m3Pdam * tarif_per_m3) + ((hari / 30) * admin_fee);

      const costSumurListrik = ((hari / 30) * biaya_listrik_pompa) * porsiSumur;
      const costSumurPerawatan = (hari / 30) * (perawatan_filter_bulan + dana_servis_pompa);

      biaya_pemakaian = (m3Pdam * tarif_per_m3) + costSumurListrik;
      biaya_tetap_perawatan = ((hari / 30) * admin_fee) + costSumurPerawatan;
      total_biaya = costPdam + costSumurListrik + costSumurPerawatan;
    }

    // Summary Cards
    const summaryCards = [
      {
        title: 'Total Volume Air Bersih',
        value: `${formatNumber(total_m3, 1)} m³`,
        note: `Setara ${formatNumber(total_liter, 0)} Liter (${formatNumber(orang * liter_per_hari, 0)} L/hari)`,
        icon: 'fa-faucet-drip',
        type: 'emerald'
      },
      {
        title: sumber === 'sumur' ? 'Listrik Pompa Air' : 'Biaya Pemakaian Air',
        value: formatRupiah(biaya_pemakaian),
        note: sumber === 'sumur' ? 'Operasional Pompa Listrik' : `Tagihan Kubikasi Air`,
        icon: sumber === 'sumur' ? 'fa-bolt' : 'fa-file-invoice-dollar',
        type: 'sky'
      },
      {
        title: sumber === 'sumur' ? 'Perawatan & Servis Pompa' : 'Abonemen & Perawatan',
        value: formatRupiah(biaya_tetap_perawatan),
        note: sumber === 'sumur' ? 'Filter Air & Dana Servis' : `Admin Meteran PDAM`,
        icon: 'fa-screwdriver-wrench',
        type: 'amber'
      },
      {
        title: 'Grand Total Biaya Air',
        value: formatRupiah(total_biaya),
        note: `Total Pengeluaran (${hari} Hari)`,
        icon: 'fa-money-bill-wave',
        type: 'rose'
      }
    ];

    // Primary Breakdown Table
    const periods = [
      { label: '7 Hari', d: 7 },
      { label: '30 Hari (1 Bulan)', d: 30 },
      { label: '90 Hari (3 Bulan)', d: 90 },
      { label: '365 Hari (1 Tahun)', d: 365 },
      { label: `Custom (${hari} Hari)`, d: hari, isCurrent: true }
    ];

    const colPemakaianLabel = sumber === 'sumur' ? 'Listrik Pompa Air' : 'Pemakaian Air PDAM';
    const colPerawatanLabel = sumber === 'sumur' ? 'Perawatan Filter & Servis' : 'Abonemen & Admin';

    const tableHeaders = ['Periode', 'Total Volume (m³)', colPemakaianLabel, colPerawatanLabel, 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const pLiter = orang * liter_per_hari * p.d;
      const pM3 = pLiter / 1000;

      let pPemakaian = 0;
      let pPerawatan = 0;
      let pTotal = 0;

      if (p.d <= 0 || (orang <= 0 && admin_fee <= 0 && biaya_listrik_pompa <= 0 && perawatan_filter_bulan <= 0 && dana_servis_pompa <= 0)) {
        pPemakaian = 0;
        pPerawatan = 0;
        pTotal = 0;
      } else if (sumber === 'pdam') {
        pPemakaian = pM3 * tarif_per_m3;
        pPerawatan = (p.d / 30) * admin_fee;
        pTotal = pPemakaian + pPerawatan;
      } else if (sumber === 'sumur') {
        pPemakaian = (p.d / 30) * biaya_listrik_pompa;
        pPerawatan = (p.d / 30) * (perawatan_filter_bulan + dana_servis_pompa);
        pTotal = pPemakaian + pPerawatan;
      } else if (sumber === 'kombinasi') {
        const porsiPdam = porsi_pdam_persen / 100;
        const porsiSumur = 1 - porsiPdam;

        const m3Pdam = pM3 * porsiPdam;
        const costPdam = (m3Pdam * tarif_per_m3) + ((p.d / 30) * admin_fee);
        const costSumurListrik = ((p.d / 30) * biaya_listrik_pompa) * porsiSumur;
        const costSumurPerawatan = (p.d / 30) * (perawatan_filter_bulan + dana_servis_pompa);

        pPemakaian = (m3Pdam * tarif_per_m3) + costSumurListrik;
        pPerawatan = ((p.d / 30) * admin_fee) + costSumurPerawatan;
        pTotal = costPdam + costSumurListrik + costSumurPerawatan;
      }

      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(pM3, 1)} m³ (${formatNumber(pLiter, 0)} L)`,
          formatRupiah(pPemakaian),
          formatRupiah(pPerawatan),
          `<span class="highlight">${formatRupiah(pTotal)}</span>`
        ]
      };
    });

    // Secondary Table: Proyeksi Jangka Panjang
    const m3_1bln = (orang * liter_per_hari * 30) / 1000;
    const cost_1bln = hari > 0 ? (total_biaya / hari) * 30 : (orang <= 0 && admin_fee <= 0 && biaya_listrik_pompa <= 0 ? 0 : total_biaya);
    const pemakaian_1bln = hari > 0 ? (biaya_pemakaian / hari) * 30 : 0;
    const perawatan_1bln = hari > 0 ? (biaya_tetap_perawatan / hari) * 30 : 0;

    const secondaryTable = {
      title: 'Proyeksi Pengeluaran Air Bersih Jangka Panjang',
      subtitle: `Akumulasi biaya air bersih (${sumber === 'sumur' ? 'Sumur Bor' : sumber === 'kombinasi' ? 'Kombinasi PAM + Sumur' : 'PDAM / PAM'}) berdasarkan periode waktu.`,
      headers: [
        'Periode Proyeksi',
        'Estimasi Volume (m³)',
        colPemakaianLabel,
        colPerawatanLabel,
        'Total Proyeksi Air'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>1 Semester (6 Bulan)</strong>`,
            `${formatNumber(m3_1bln * 6, 1)} m³`,
            formatRupiah(pemakaian_1bln * 6),
            formatRupiah(perawatan_1bln * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(cost_1bln * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>1 Tahun Penuh (12 Bulan)</strong>`,
            `${formatNumber(m3_1bln * 12, 1)} m³`,
            formatRupiah(pemakaian_1bln * 12),
            formatRupiah(perawatan_1bln * 12),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(cost_1bln * 12)}</strong>`
          ]
        }
      ]
    };

    // Chart Data
    const chartLabels = ['7 Hari', '30 Hari (1 Bln)', '90 Hari (3 Bln)', '365 Hari (1 Thn)'];
    const chartData = [7, 30, 90, 365].map(d => {
      const liter = orang * liter_per_hari * d;
      const m3 = liter / 1000;
      if (orang <= 0 && admin_fee <= 0 && biaya_listrik_pompa <= 0 && perawatan_filter_bulan <= 0 && dana_servis_pompa <= 0) {
        return 0;
      }
      if (sumber === 'pdam') {
        return (m3 * tarif_per_m3) + ((d / 30) * admin_fee);
      } else if (sumber === 'sumur') {
        return ((d / 30) * biaya_listrik_pompa) + ((d / 30) * (perawatan_filter_bulan + dana_servis_pompa));
      } else {
        const porsiPdam = porsi_pdam_persen / 100;
        const porsiSumur = 1 - porsiPdam;
        const costPdam = (m3 * porsiPdam * tarif_per_m3) + ((d / 30) * admin_fee);
        const costSumur = ((d / 30) * (biaya_listrik_pompa + perawatan_filter_bulan + dana_servis_pompa)) * porsiSumur;
        return costPdam + costSumur;
      }
    });

    return {
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: chartLabels,
        datasets: [
          {
            label: `Biaya Air (${sumber === 'sumur' ? 'Sumur Bor' : sumber === 'kombinasi' ? 'Kombinasi' : 'PDAM'}) (Rp)`,
            data: chartData,
            backgroundColor: 'rgba(6, 182, 212, 0.65)',
            borderColor: '#06b6d4',
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(total_m3, 1)} m³ (${sumber === 'sumur' ? 'Sumur' : sumber === 'kombinasi' ? 'Kombi' : 'PDAM'})`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
