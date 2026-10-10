/**
 * Modul Kalkulator Transportasi (Multi-Kendaraan Pribadi & Transportasi Umum / Publik)
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_TRANSPORT_SETTINGS = 'transport_settings';
const STORAGE_KEY_VEHICLES = 'vehicles_list';

const DEFAULT_SETTINGS = {
  enable_pribadi: true,
  enable_umum: true,
  biaya_umum_harian: 25000,
  hari_umum_per_bulan: 22,
  langganan_umum_per_bulan: 0
};

const DEFAULT_VEHICLES = [
  {
    id: 'v_1710000000001',
    nama: 'Mobil Honda Brio',
    jenis: 'mobil',
    jenis_bbm: 'Pertamax',
    harga_bbm: 12950,
    jarak_km_per_hari: 25,
    efisiensi_km_per_liter: 14,
    pajak_tahunan: 2400000,
    pajak_5_tahunan: 1200000,
    biaya_servis_oli_bulan: 250000,
    hari_per_bulan: 30
  },
  {
    id: 'v_1710000000002',
    nama: 'Motor Honda Vario 160',
    jenis: 'motor',
    jenis_bbm: 'Pertalite',
    harga_bbm: 10000,
    jarak_km_per_hari: 20,
    efisiensi_km_per_liter: 42,
    pajak_tahunan: 350000,
    pajak_5_tahunan: 500000,
    biaya_servis_oli_bulan: 80000,
    hari_per_bulan: 30
  }
];

export const TransportModule = {
  id: 'transport',
  name: 'BBM & Transportasi',
  icon: 'fa-car-side',
  badge: 'Module Mobilitas & Transport',
  title: 'Kalkulator Transportasi (Pribadi & Publik)',
  subtitle: 'Hitung estimasi operasional Kendaraan Pribadi (BBM, Pajak STNK, Servis/Oli) dan/atau Transportasi Umum (KRL, TransJakarta, Ojol).',

  defaults: {},

  getSettings: () => {
    return getFromStorage(STORAGE_KEY_TRANSPORT_SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings: (settings) => {
    saveToStorage(STORAGE_KEY_TRANSPORT_SETTINGS, settings);
  },

  getVehicles: () => {
    return getFromStorage(STORAGE_KEY_VEHICLES, DEFAULT_VEHICLES);
  },

  saveVehicles: (vehicles) => {
    saveToStorage(STORAGE_KEY_VEHICLES, vehicles);
  },

  renderForm: (container, onInputChange) => {
    const settings = TransportModule.getSettings();
    const vehicles = TransportModule.getVehicles();

    const renderVehicleFormItem = (v, index) => {
      const isMobil = v.jenis === 'mobil';
      const icon = isMobil ? 'fa-car' : 'fa-motorcycle';

      return `
        <div class="card vehicle-item-card" data-vid="${v.id}" style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="${icon} fa-solid" style="color: var(--primary); font-size: 1rem;"></i>
              <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">Kendaraan #${index + 1}: ${v.nama || 'Tanpa Nama'}</span>
            </div>
            <button type="button" class="sm-btn delete-vehicle-btn" data-vid="${v.id}" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3); padding: 2px 8px; font-size: 0.75rem;">
              <i class="fa-trash fa-solid"></i> Hapus
            </button>
          </div>

          <!-- Line 1: Nama & Jenis Kendaraan -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Tipe / Nama Kendaraan</label>
              <input type="text" class="form-control v-input-nama" data-vid="${v.id}" value="${v.nama}" placeholder="Contoh: HR-V / NMAX" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Jenis</label>
              <select class="form-control v-input-jenis" data-vid="${v.id}" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="mobil" ${isMobil ? 'selected' : ''}>Mobil</option>
                <option value="motor" ${!isMobil ? 'selected' : ''}>Motor</option>
              </select>
            </div>
          </div>

          <!-- Line 2: Bahan Bakar & Harga per Liter -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Jenis BBM</label>
              <select class="form-control v-input-bbm-type" data-vid="${v.id}" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="Pertalite" ${v.jenis_bbm === 'Pertalite' ? 'selected' : ''}>Pertalite</option>
                <option value="Pertamax" ${v.jenis_bbm === 'Pertamax' ? 'selected' : ''}>Pertamax</option>
                <option value="Pertamax Turbo" ${v.jenis_bbm === 'Pertamax Turbo' ? 'selected' : ''}>Pertamax Turbo</option>
                <option value="Dexlite" ${v.jenis_bbm === 'Dexlite' ? 'selected' : ''}>Dexlite</option>
                <option value="Solar" ${v.jenis_bbm === 'Solar' ? 'selected' : ''}>Solar Subsidi</option>
                <option value="Custom" ${v.jenis_bbm === 'Custom' ? 'selected' : ''}>Kustom / Manual</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Harga BBM/Liter (Rp)</label>
              <input type="number" class="form-control v-input-harga-bbm" data-vid="${v.id}" value="${v.harga_bbm}" step="100" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>

          <!-- Line 3: Jarak Tempuh Harian & Konsumsi Km/L -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Jarak Tempuh (Km/Hari)</label>
              <input type="number" class="form-control v-input-jarak" data-vid="${v.id}" value="${v.jarak_km_per_hari}" step="1" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Konsumsi (Km / 1 Liter)</label>
              <input type="number" class="form-control v-input-efisiensi" data-vid="${v.id}" value="${v.efisiensi_km_per_liter}" step="1" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>

          <!-- Line 4: Biaya Pajak Tahunan & Pajak 5 Tahunan -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Pajak STNK Tahunan <span style="color: var(--text-muted);">(Rp/Thn)</span></label>
              <input type="number" class="form-control v-input-pajak-tahunan" data-vid="${v.id}" value="${v.pajak_tahunan}" step="50000" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Pajak 5-Tahunan (Plat) <span style="color: var(--text-muted);">(Rp/5Thn)</span></label>
              <input type="number" class="form-control v-input-pajak-5tahunan" data-vid="${v.id}" value="${v.pajak_5_tahunan}" step="50000" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>

          <!-- Line 5: Servis Rutin, Oli & Sparepart / Bulan -->
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.74rem;">Estimasi Servis Rutin, Oli & Sparepart <span style="color: var(--text-muted);">(Alokasi Rp/Bulan)</span></label>
            <input type="number" class="form-control v-input-servis" data-vid="${v.id}" value="${v.biaya_servis_oli_bulan}" step="10000" style="font-size: 0.8rem; padding: 6px 10px;">
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <!-- Mode Selection: Kendaraan Pribadi vs Transportasi Umum Toggles -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
        <label class="toggle-card ${settings.enable_pribadi ? 'active' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid ${settings.enable_pribadi ? 'var(--primary)' : 'var(--border-color)'}; background: ${settings.enable_pribadi ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)'}; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-car-side fa-solid" style="color: var(--primary); font-size: 1.1rem;"></i>
            <div>
              <strong style="font-size: 0.82rem; display: block; color: var(--text-main);">Kendaraan Pribadi</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">Mobil & Motor</span>
            </div>
          </div>
          <input type="checkbox" id="togglePribadi" ${settings.enable_pribadi ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;">
        </label>

        <label class="toggle-card ${settings.enable_umum ? 'active' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid ${settings.enable_umum ? 'var(--accent-emerald)' : 'var(--border-color)'}; background: ${settings.enable_umum ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)'}; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-bus fa-solid" style="color: var(--accent-emerald); font-size: 1.1rem;"></i>
            <div>
              <strong style="font-size: 0.82rem; display: block; color: var(--text-main);">Transport Umum</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">KRL, Busway, Ojol</span>
            </div>
          </div>
          <input type="checkbox" id="toggleUmum" ${settings.enable_umum ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-emerald); cursor: pointer;">
        </label>
      </div>

      <!-- Section 1: Kendaraan Pribadi (If ON) -->
      <div id="pribadiSection" style="display: ${settings.enable_pribadi ? 'block' : 'none'}; margin-bottom: 16px;">
        <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; color: var(--primary); display: flex; align-items: center; gap: 6px;">
          <i class="fa-car fa-solid"></i> Rincian Kendaraan Pribadi (${vehicles.length})
        </h4>

        <div id="vehiclesListContainer">
          ${vehicles.map((v, idx) => renderVehicleFormItem(v, idx)).join('')}
        </div>

        <button type="button" id="addVehicleBtn" class="outline-btn" style="width: 100%; justify-content: center; padding: 8px; font-size: 0.82rem;">
          <i class="fa-plus fa-solid"></i> Tambah Kendaraan Baru (Mobil / Motor)
        </button>
      </div>

      <!-- Section 2: Transportasi Umum (If ON) -->
      <div id="umumSection" style="display: ${settings.enable_umum ? 'block' : 'none'}; background: rgba(16, 185, 129, 0.05); padding: 14px; border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 16px;">
        <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; color: var(--accent-emerald); display: flex; align-items: center; gap: 6px;">
          <i class="fa-bus fa-solid"></i> Transportasi Publik / Umum (KRL, Bus, Ojol)
        </h4>

        <div class="form-group">
          <label for="biaya_umum_harian" style="font-size: 0.78rem;">Ongkos Transportasi Umum per Hari PP <span class="unit">(Rupiah/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-ticket fa-solid input-icon"></i>
            <input type="number" id="biaya_umum_harian" class="form-control" step="1000" placeholder="Ketik estimasi ongkos harian (misal: 25000)" value="${settings.biaya_umum_harian}">
          </div>
        </div>

        <div class="form-group">
          <label for="hari_umum_per_bulan" style="font-size: 0.78rem;">Jumlah Hari Bepergian per Bulan <span class="unit">(Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon"></i>
            <input type="number" id="hari_umum_per_bulan" class="form-control" min="1" max="31" value="${settings.hari_umum_per_bulan}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip" data-target="hari_umum_per_bulan" data-val="20">20 Hari</button>
            <button type="button" class="option-chip active" data-target="hari_umum_per_bulan" data-val="22">Hari Kerja (22h)</button>
            <button type="button" class="option-chip" data-target="hari_umum_per_bulan" data-val="30">Full (30h)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="langganan_umum_per_bulan" style="font-size: 0.78rem;">Biaya Kartu / Langganan Paket Bulanan <span class="unit">(Rupiah/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-id-card fa-solid input-icon"></i>
            <input type="number" id="langganan_umum_per_bulan" class="form-control" step="10000" value="${settings.langganan_umum_per_bulan}">
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div style="margin-top: 14px;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 10px;">
          <i class="fa-bookmark fa-solid"></i> Simpan Total Ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); text-align: center; display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Toggle Checkboxes Listeners
    const togglePribadi = container.querySelector('#togglePribadi');
    const toggleUmum = container.querySelector('#toggleUmum');

    togglePribadi.addEventListener('change', () => {
      const currentS = TransportModule.getSettings();
      currentS.enable_pribadi = togglePribadi.checked;
      TransportModule.saveSettings(currentS);
      TransportModule.renderForm(container, onInputChange);
      onInputChange();
    });

    toggleUmum.addEventListener('change', () => {
      const currentS = TransportModule.getSettings();
      currentS.enable_umum = toggleUmum.checked;
      TransportModule.saveSettings(currentS);
      TransportModule.renderForm(container, onInputChange);
      onInputChange();
    });

    // Bind real-time input listeners
    const bindInputs = () => {
      const currentS = TransportModule.getSettings();

      currentS.biaya_umum_harian = parseFloat(container.querySelector('#biaya_umum_harian')?.value || 0);
      currentS.hari_umum_per_bulan = parseInt(container.querySelector('#hari_umum_per_bulan')?.value || 22, 10);
      currentS.langganan_umum_per_bulan = parseFloat(container.querySelector('#langganan_umum_per_bulan')?.value || 0);

      TransportModule.saveSettings(currentS);

      // Collect vehicles
      const allVehicleCards = container.querySelectorAll('.vehicle-item-card');
      const updatedVehicles = [];

      allVehicleCards.forEach(card => {
        const id = card.getAttribute('data-vid');
        const nama = card.querySelector('.v-input-nama')?.value.trim() || '';
        const jenis = card.querySelector('.v-input-jenis')?.value || 'mobil';
        const jenis_bbm = card.querySelector('.v-input-bbm-type')?.value || 'Pertamax';
        const harga_bbm = parseFloat(card.querySelector('.v-input-harga-bbm')?.value || 10000);
        const jarak_km_per_hari = parseFloat(card.querySelector('.v-input-jarak')?.value || 0);
        const efisiensi_km_per_liter = parseFloat(card.querySelector('.v-input-efisiensi')?.value || 1);
        const pajak_tahunan = parseFloat(card.querySelector('.v-input-pajak-tahunan')?.value || 0);
        const pajak_5_tahunan = parseFloat(card.querySelector('.v-input-pajak-5tahunan')?.value || 0);
        const biaya_servis_oli_bulan = parseFloat(card.querySelector('.v-input-servis')?.value || 0);

        updatedVehicles.push({
          id,
          nama,
          jenis,
          jenis_bbm,
          harga_bbm,
          jarak_km_per_hari,
          efisiensi_km_per_liter,
          pajak_tahunan,
          pajak_5_tahunan,
          biaya_servis_oli_bulan,
          hari_per_bulan: 30
        });
      });

      TransportModule.saveVehicles(updatedVehicles);
      onInputChange();
    };

    // Attach BBM dropdown preset listener
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('v-input-bbm-type')) {
        const bbmType = e.target.value;
        const card = e.target.closest('.vehicle-item-card');
        const hargaInput = card.querySelector('.v-input-harga-bbm');

        const bbmPrices = {
          'Pertalite': 10000,
          'Pertamax': 12950,
          'Pertamax Turbo': 14400,
          'Dexlite': 14500,
          'Solar': 6800
        };

        if (bbmType === 'Custom') {
          if (hargaInput) {
            hargaInput.focus();
            hargaInput.select();
          }
        } else if (bbmPrices[bbmType] && hargaInput) {
          hargaInput.value = bbmPrices[bbmType];
        }
        bindInputs();
      }
    });

    // Attach Option Chips listener
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
          bindInputs();
        }
      });
    });

    container.querySelectorAll('input, select').forEach(elem => {
      elem.addEventListener('input', bindInputs);
    });

    // Delete Vehicle Listener
    container.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-vehicle-btn');
      if (delBtn) {
        const vid = delBtn.getAttribute('data-vid');
        const currentV = TransportModule.getVehicles();
        if (currentV.length <= 1) {
          alert('Minimal harus ada 1 kendaraan di daftar kendaraan pribadi.');
          return;
        }
        const updated = currentV.filter(v => v.id !== vid);
        TransportModule.saveVehicles(updated);
        TransportModule.renderForm(container, onInputChange);
        onInputChange();
      }
    });

    // Add Vehicle Listener
    const addBtn = container.querySelector('#addVehicleBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const currentV = TransportModule.getVehicles();
        const newV = {
          id: 'v_' + Date.now(),
          nama: `Motor/Mobil #${currentV.length + 1}`,
          jenis: 'motor',
          jenis_bbm: 'Pertalite',
          harga_bbm: 10000,
          jarak_km_per_hari: 15,
          efisiensi_km_per_liter: 40,
          pajak_tahunan: 300000,
          pajak_5_tahunan: 400000,
          biaya_servis_oli_bulan: 75000,
          hari_per_bulan: 30
        };

        const updated = [...currentV, newV];
        TransportModule.saveVehicles(updated);
        TransportModule.renderForm(container, onInputChange);
        onInputChange();
      });
    }

    // Save to Budget Dashboard Listener
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentS = TransportModule.getSettings();
      const currentV = TransportModule.getVehicles();
      const calcResult = TransportModule.calculate({ settings: currentS, vehicles: currentV });

      BudgetStore.saveBudgetItem('transport', {
        id: 'transport',
        name: 'BBM & Transportasi',
        amount: calcResult.grandTotalBiayaBulanan,
        category: 'Pokok',
        source: `Kalkulator Transport (${currentS.enable_pribadi ? currentV.length + ' Kendaraan' : ''}${currentS.enable_pribadi && currentS.enable_umum ? ' + ' : ''}${currentS.enable_umum ? 'Transport Umum' : ''})`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Total Est. ${formatRupiah(calcResult.grandTotalBiayaBulanan)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: () => {
    return {
      settings: TransportModule.getSettings(),
      vehicles: TransportModule.getVehicles()
    };
  },

  calculate: (inputs) => {
    const s = inputs?.settings || TransportModule.getSettings();
    const list = inputs?.vehicles || TransportModule.getVehicles();

    // Calculate Kendaraan Pribadi
    let grandTotalBbmBulanan = 0;
    let grandTotalLiterBulanan = 0;
    let grandTotalPajakBulanan = 0;
    let grandTotalPerawatanBulanan = 0;
    let totalPribadiBulanan = 0;

    const vehicleCalculations = list.map(v => {
      const kmBulanan = (v.jarak_km_per_hari || 0) * (v.hari_per_bulan || 30);
      const literBulanan = v.efisiensi_km_per_liter > 0 ? kmBulanan / v.efisiensi_km_per_liter : 0;
      const bbmBulanan = literBulanan * (v.harga_bbm || 0);

      const pajakTahunanBulanan = (v.pajak_tahunan || 0) / 12;
      const pajak5TahunanBulanan = (v.pajak_5_tahunan || 0) / 60;
      const totalPajakBulanan = pajakTahunanBulanan + pajak5TahunanBulanan;

      const perawatanBulanan = v.biaya_servis_oli_bulan || 0;
      const totalBiayaBulanan = bbmBulanan + totalPajakBulanan + perawatanBulanan;

      if (s.enable_pribadi) {
        grandTotalBbmBulanan += bbmBulanan;
        grandTotalLiterBulanan += literBulanan;
        grandTotalPajakBulanan += totalPajakBulanan;
        grandTotalPerawatanBulanan += perawatanBulanan;
        totalPribadiBulanan += totalBiayaBulanan;
      }

      return {
        ...v,
        kmBulanan,
        literBulanan,
        bbmBulanan,
        totalPajakBulanan,
        perawatanBulanan,
        totalBiayaBulanan
      };
    });

    // Calculate Transportasi Umum
    const totalUmumHarianBulanan = (s.biaya_umum_harian || 0) * (s.hari_umum_per_bulan || 0);
    const totalUmumBulanan = s.enable_umum ? (totalUmumHarianBulanan + (s.langganan_umum_per_bulan || 0)) : 0;

    // Grand Total Transport
    const grandTotalBiayaBulanan = (s.enable_pribadi ? totalPribadiBulanan : 0) + (s.enable_umum ? totalUmumBulanan : 0);

    const summaryCards = [
      {
        title: 'Kendaraan Pribadi',
        value: s.enable_pribadi ? formatRupiah(totalPribadiBulanan) : 'Non-Aktif',
        note: s.enable_pribadi ? `${list.length} Kendaraan (${formatNumber(grandTotalLiterBulanan, 1)} L BBM)` : 'Mode Pribadi Dimatikan',
        icon: 'fa-car-side',
        type: s.enable_pribadi ? 'emerald' : 'sky'
      },
      {
        title: 'Transportasi Umum / Publik',
        value: s.enable_umum ? formatRupiah(totalUmumBulanan) : 'Non-Aktif',
        note: s.enable_umum ? `@ ${formatRupiah(s.biaya_umum_harian)} / Hari (${s.hari_umum_per_bulan}h)` : 'Mode Umum Dimatikan',
        icon: 'fa-bus',
        type: s.enable_umum ? 'amber' : 'sky'
      },
      {
        title: 'Grand Total Transport',
        value: formatRupiah(grandTotalBiayaBulanan),
        note: `Total Operasional Transportasi / Bln`,
        icon: 'fa-route',
        type: 'emerald'
      }
    ];

    const tableHeaders = ['Kategori Transport', 'Jenis / Rincian', 'Jarak / Frekuensi', 'BBM / Ongkos Harian', 'Pajak / Langganan', 'Servis & Oli / Bln', 'Total Est. Bulanan'];
    const tableRows = [];

    // Rows for Private Vehicles (If ON)
    if (s.enable_pribadi) {
      vehicleCalculations.forEach(vc => {
        tableRows.push({
          isCurrent: false,
          cells: [
            `<strong>Pribadi</strong>`,
            `${vc.nama || 'Kendaraan'} <span class="badge" style="font-size:0.68rem;">${vc.jenis === 'mobil' ? '🚗 Mobil' : '🛵 Motor'}</span>`,
            `${formatNumber(vc.jarak_km_per_hari, 0)} km/hr`,
            `${formatRupiah(vc.bbmBulanan)} (${formatNumber(vc.literBulanan, 1)} L)`,
            `${formatRupiah(vc.totalPajakBulanan)}`,
            `${formatRupiah(vc.perawatanBulanan)}`,
            `<span class="highlight">${formatRupiah(vc.totalBiayaBulanan)}</span>`
          ]
        });
      });
    }

    // Row for Public Transport (If ON)
    if (s.enable_umum) {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>Publik / Umum</strong>`,
          `KRL / Bus / Ojol / Shuttle`,
          `${s.hari_umum_per_bulan} Hari / Bulan`,
          `${formatRupiah(s.biaya_umum_harian)} / Hari (${formatRupiah(totalUmumHarianBulanan)})`,
          `${formatRupiah(s.langganan_umum_per_bulan)} (Kartu)`,
          `-`,
          `<span class="highlight" style="color: var(--accent-amber);">${formatRupiah(totalUmumBulanan)}</span>`
        ]
      });
    }

    // Grand Total Row
    tableRows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL MOBILITAS</strong>`,
        `<strong>-</strong>`,
        `<strong>-</strong>`,
        `<strong>-</strong>`,
        `<strong>-</strong>`,
        `<strong>-</strong>`,
        `<strong class="highlight" style="font-size: 1rem; color: var(--accent-emerald);">${formatRupiah(grandTotalBiayaBulanan)}</strong>`
      ]
    });

    const chartLabels = [];
    const chartDataValues = [];
    const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    if (s.enable_pribadi) {
      vehicleCalculations.forEach(vc => {
        chartLabels.push(vc.nama || 'Kendaraan');
        chartDataValues.push(Math.round(vc.totalBiayaBulanan));
      });
    }

    if (s.enable_umum) {
      chartLabels.push('Transportasi Umum (KRL/Ojol/Bus)');
      chartDataValues.push(Math.round(totalUmumBulanan));
    }

    return {
      summaryCards,
      tableHeaders,
      tableRows,
      grandTotalBiayaBulanan,
      chartData: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Estimasi Biaya Bulanan (Rp)',
            data: chartDataValues,
            backgroundColor: chartColors.slice(0, chartLabels.length)
          }
        ]
      },
      quickStats: {
        totalQty: `${s.enable_pribadi ? list.length + ' Kendaraan ' : ''}${s.enable_pribadi && s.enable_umum ? '+' : ''}${s.enable_umum ? ' Transport Umum' : ''}`,
        totalCost: formatRupiah(grandTotalBiayaBulanan)
      }
    };
  }
};
