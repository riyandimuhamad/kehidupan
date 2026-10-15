/**
 * Modul Kalkulator Kebutuhan Listrik PLN & Energi Surya (PLTS Atap)
 * Kehidupan App Suite
 * 
 * Mendukung:
 * 1. Prabayar (Listrik Pintar / Token) - Bebas biaya beban / rekening minimum, perhitungan token bersih & biaya admin top-up.
 * 2. Pascabayar (Tagihan Bulanan Meteran) - Dikenakan ketentuan Rekening Minimum PLN (40 jam nyala) & biaya admin tagihan.
 * 3. PLTS Atap Mandiri (Pembangkit Listrik Tenaga Surya) - Fleksibel On/Off, kalkulasi produksi kWh solar, penghematan tagihan PLN, amortisasi modal awal (CapEx), serta biaya maintenance/OpEx.
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_LISTRIK = 'listrik_data';

// Tarif Tenaga Listrik (TTL) Rumah Tangga Resmi PLN (Permen ESDM)
const TARIF_PLN_MAP = {
  '450': 415,
  '900_sub': 605,
  '900_rtm': 1352,
  '1300': 1444.70,
  '2200': 1444.70,
  '3500': 1699.53,
  '5500': 1699.53,
  '6600': 1699.53
};

const DAYA_LABELS = {
  '450': '450 VA (R-1 Subsidi)',
  '900_sub': '900 VA (R-1 Subsidi)',
  '900_rtm': '900 VA (R-1 Non-Subsidi)',
  '1300': '1.300 VA (R-1 Non-Subsidi)',
  '2200': '2.200 VA (R-1 Non-Subsidi)',
  '3500': '3.500 VA (R-2 Non-Subsidi)',
  '5500': '5.500 VA (R-2 Non-Subsidi)',
  '6600': '6.600 VA (R-3 Non-Subsidi)'
};

const getNumericVa = (val) => {
  if (val === '900_sub' || val === '900_rtm') return 900;
  return parseInt(val, 10) || 1300;
};

export const ListrikModule = {
  id: 'listrik',
  name: 'Listrik PLN',
  icon: 'fa-bolt',
  badge: 'Module Energi',
  title: 'Kalkulator Estimasi Listrik PLN & PLTS Surya',
  subtitle: 'Kalkulasi akurat sistem Prabayar (Token), Pascabayar (Tagihan Bulanan), serta penghematan PLTS Atap Energi Terbarukan.',

  defaults: {
    sistem_listrik: 'prabayar', // 'prabayar' | 'pascabayar'
    daya_va: '1300',
    kwh_per_hari: 10,
    tarif_per_kwh: 1444.70,
    ppj_persen: 5, // Pajak Penerangan Jalan (3% - 10%, rata-rata 5%)
    admin_per_transaksi: 2500, // Biaya admin bank/top-up token atau loket tagihan
    nominal_token_pilihan: 200000, // Pilihan nominal token favorit (50k, 100k, 200k, 500k, 1jt)
    hari: 30,

    // Parameter PLTS Surya (Energi Terbarukan)
    enable_plts: false,
    plts_kapasitas_kwp: 1.5, // Kapasitas panel surya terpasang (kWp)
    plts_biaya_investasi: 18000000, // Biaya awal pengadaan + pasang (Rp)
    plts_masa_pakai_tahun: 20, // Umur ekonomis panel (Tahun)
    plts_biaya_maintenance_bulan: 50000, // Biaya pemeliharaan / servis inverter (Rp/Bulan)
    plts_sun_hours: 4.0 // Rata-rata jam terik matahari efektif (Jam/Hari di Indonesia)
  },

  getData: () => {
    return getFromStorage(STORAGE_KEY_LISTRIK, { ...ListrikModule.defaults });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_LISTRIK, data);
  },

  renderForm: (container, onInputChange) => {
    const data = ListrikModule.getData();

    const isPrabayar = data.sistem_listrik === 'prabayar';
    const isPascabayar = data.sistem_listrik === 'pascabayar';
    const isPltsEnabled = !!data.enable_plts;

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Pengaturan Sistem & Konsumsi Listrik PLN
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Pilih sistem meteran listrik rumah tangga (Prabayar Token atau Tagihan Pascabayar).
        </p>
      </div>

      <!-- Section 1: Pilihan Sistem Listrik Utama (Prabayar vs Pascabayar) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Sistem Meteran Listrik PLN</span>
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" class="sistem-chip option-chip ${isPrabayar ? 'active' : ''}" data-val="prabayar" style="justify-content: center; font-size: 0.78rem; padding: 9px 8px;">
              <i class="fa-bolt-lightning fa-solid" style="margin-right: 6px; color: var(--accent-amber);"></i> Prabayar (Token / Listrik Pintar)
            </button>
            <button type="button" class="sistem-chip option-chip ${isPascabayar ? 'active' : ''}" data-val="pascabayar" style="justify-content: center; font-size: 0.78rem; padding: 9px 8px;">
              <i class="fa-file-invoice-dollar fa-solid" style="margin-right: 6px; color: var(--accent-sky);"></i> Pascabayar (Tagihan Bulanan)
            </button>
          </div>
          <input type="hidden" id="sistem_listrik" value="${data.sistem_listrik}">
        </div>

        <!-- Info Card Sistem Terpilih -->
        <div id="systemInfoBox" style="margin-top: 10px; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.74rem; line-height: 1.45; background: ${isPrabayar ? 'rgba(245, 158, 11, 0.08)' : 'rgba(6, 182, 212, 0.08)'}; border-left: 3px solid ${isPrabayar ? 'var(--accent-amber)' : 'var(--accent-sky)'}; color: var(--text-main);">
          ${isPrabayar 
            ? '<strong>Prabayar (Token):</strong> Beli saldo stroom di awal. Bebas biaya beban / rekening minimum bulanan. Dikenakan Pajak Penerangan Jalan (PPJ) dan admin pembelian token.'
            : '<strong>Pascabayar (Meteran Bulanan):</strong> Pemakaian dicatat akhir bulan & ditagih tgl 1-20. Dikenakan ketentuan <em>Rekening Minimum PLN (40 jam nyala)</em> jika pemakaian rendah.'}
        </div>
      </div>

      <!-- Section 2: PLTS Atap Surya (Energi Terbarukan) - Opsional Toggle On/Off -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid ${isPltsEnabled ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}; background: ${isPltsEnabled ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-card)'}; border-radius: var(--radius-md); padding: 12px; transition: all 0.2s ease;">
        <label for="togglePlts" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin: 0; user-select: none;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: ${isPltsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)'}; color: ${isPltsEnabled ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-size: 0.95rem;">
              <i class="fa-solar-panel fa-solid"></i>
            </div>
            <div>
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                <span>PLTS Atap Surya (Energi Terbarukan)</span>
                <span style="font-size: 0.65rem; padding: 1px 6px; border-radius: 4px; background: ${isPltsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)'}; color: ${isPltsEnabled ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: 600;">
                  ${isPltsEnabled ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
              <p style="font-size: 0.71rem; color: var(--text-muted); margin: 0;">
                Gunakan panel surya mandiri untuk memangkas tagihan listrik PLN
              </p>
            </div>
          </div>
          <input type="checkbox" id="togglePlts" ${isPltsEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-emerald); cursor: pointer;">
        </label>

        <!-- Container Input PLTS (Tampil Jika Dinyalakan) -->
        <div id="pltsDetailContainer" style="display: ${isPltsEnabled ? 'block' : 'none'}; margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.74rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Kapasitas Panel</span> <span class="unit">(kWp)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-sun fa-solid input-icon" style="left: 12px; font-size: 0.85rem; color: var(--accent-amber);"></i>
                <input type="number" id="plts_kapasitas_kwp" class="form-control" step="0.5" min="0" value="${data.plts_kapasitas_kwp}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.74rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Jam Terik / Hari</span> <span class="unit">(Jam)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-clock fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="plts_sun_hours" class="form-control" step="0.5" min="1" max="8" value="${data.plts_sun_hours}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <div class="form-options" style="margin-bottom: 10px;">
            <button type="button" class="option-chip ${data.plts_kapasitas_kwp === 1.0 ? 'active' : ''}" data-target="plts_kapasitas_kwp" data-val="1.0">1.0 kWp (~3.5 kWh/hr)</button>
            <button type="button" class="option-chip ${data.plts_kapasitas_kwp === 1.5 ? 'active' : ''}" data-target="plts_kapasitas_kwp" data-val="1.5">1.5 kWp (~5.3 kWh/hr)</button>
            <button type="button" class="option-chip ${data.plts_kapasitas_kwp === 2.5 ? 'active' : ''}" data-target="plts_kapasitas_kwp" data-val="2.5">2.5 kWp (~8.8 kWh/hr)</button>
            <button type="button" class="option-chip ${data.plts_kapasitas_kwp === 3.5 ? 'active' : ''}" data-target="plts_kapasitas_kwp" data-val="3.5">3.5 kWp (~12.3 kWh/hr)</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.74rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Biaya Pengadaan Awal</span> <span class="unit">(Rp)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-money-bill-wave fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="plts_biaya_investasi" class="form-control" step="1000000" min="0" value="${data.plts_biaya_investasi}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.74rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Masa Pakai Panel</span> <span class="unit">(Tahun)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-hourglass-half fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="plts_masa_pakai_tahun" class="form-control" min="5" max="30" value="${data.plts_masa_pakai_tahun}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.74rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
              <span>Biaya Maintenance & Cadangan Servis Inverter</span> <span class="unit">(Rp/Bulan)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-screwdriver-wrench fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="plts_biaya_maintenance_bulan" class="form-control" step="10000" min="0" value="${data.plts_biaya_maintenance_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-options" style="margin-top: 6px; margin-bottom: 4px;">
            <button type="button" class="option-chip ${data.plts_biaya_maintenance_bulan === 0 ? 'active' : ''}" data-target="plts_biaya_maintenance_bulan" data-val="0">Rp 0 (Mandiri)</button>
            <button type="button" class="option-chip ${data.plts_biaya_maintenance_bulan === 35000 ? 'active' : ''}" data-target="plts_biaya_maintenance_bulan" data-val="35000">Rp 35k/bln</button>
            <button type="button" class="option-chip ${data.plts_biaya_maintenance_bulan === 50000 ? 'active' : ''}" data-target="plts_biaya_maintenance_bulan" data-val="50000">Rp 50k (Standar)</button>
            <button type="button" class="option-chip ${data.plts_biaya_maintenance_bulan === 100000 ? 'active' : ''}" data-target="plts_biaya_maintenance_bulan" data-val="100000">Rp 100k (Lengkap)</button>
          </div>

          <p style="font-size: 0.71rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
            *Biaya pengadaan awal (panel, inverter, bracket) diamortisasi per bulan dan biaya maintenance dicadangkan untuk pemeliharaan berkala.
          </p>
        </div>
      </div>

      <!-- Section 3: Daya Listrik & Tarif PLN -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Golongan Daya & Tarif PLN
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Daya Terpasang</span> <span class="unit">(VA)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-bolt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <select id="daya_va" class="form-control" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                <option value="450" ${data.daya_va === '450' ? 'selected' : ''}>450 VA (R-1 Subsidi - Rp 415/kWh)</option>
                <option value="900_sub" ${data.daya_va === '900_sub' ? 'selected' : ''}>900 VA (R-1 Subsidi - Rp 605/kWh)</option>
                <option value="900_rtm" ${data.daya_va === '900_rtm' ? 'selected' : ''}>900 VA (R-1 Non-Subsidi - Rp 1.352/kWh)</option>
                <option value="1300" ${data.daya_va === '1300' ? 'selected' : ''}>1.300 VA (R-1 Non-Subsidi - Rp 1.444,70/kWh)</option>
                <option value="2200" ${data.daya_va === '2200' ? 'selected' : ''}>2.200 VA (R-1 Non-Subsidi - Rp 1.444,70/kWh)</option>
                <option value="3500" ${data.daya_va === '3500' ? 'selected' : ''}>3.500 VA (R-2 Non-Subsidi - Rp 1.699,53/kWh)</option>
                <option value="5500" ${data.daya_va === '5500' ? 'selected' : ''}>5.500 VA (R-2 Non-Subsidi - Rp 1.699,53/kWh)</option>
                <option value="6600" ${data.daya_va === '6600' ? 'selected' : ''}>6.600 VA (R-3 Non-Subsidi - Rp 1.699,53/kWh)</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Tarif per kWh</span> <span class="unit">(Rp/kWh)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="tarif_per_kwh" class="form-control" step="1" value="${data.tarif_per_kwh}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>
        <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">*Tarif otomatis terisi sesuai daya yang dipilih berdasarkan ketetapan resmi tarif listrik ESDM/PLN terbaru.</p>
      </div>

      <!-- Section 4: Estimasi Pemakaian Listrik Rumah Tangga -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Estimasi Pemakaian Listrik Rumah Tangga
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Total Konsumsi Rumah</span> <span class="unit">(kWh/Hari)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-plug fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="kwh_per_hari" class="form-control" step="0.5" min="0" value="${data.kwh_per_hari}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Lama Waktu</span> <span class="unit">(Hari)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-calendar-days fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="hari" class="form-control" min="1" max="365" value="${data.hari}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-options" style="margin-bottom: 4px;">
          <button type="button" class="option-chip ${data.kwh_per_hari === 5 ? 'active' : ''}" data-target="kwh_per_hari" data-val="5">Hemat (5 kWh)</button>
          <button type="button" class="option-chip ${data.kwh_per_hari === 10 ? 'active' : ''}" data-target="kwh_per_hari" data-val="10">Sedang (10 kWh)</button>
          <button type="button" class="option-chip ${data.kwh_per_hari === 18 ? 'active' : ''}" data-target="kwh_per_hari" data-val="18">1 AC (18 kWh)</button>
          <button type="button" class="option-chip ${data.kwh_per_hari === 28 ? 'active' : ''}" data-target="kwh_per_hari" data-val="28">Multi AC (28 kWh)</button>
        </div>
        <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">*Tip: 1 AC 1/2 PK menyala 8 jam ± 3-4 kWh; kulkas 24 jam ± 1-1.5 kWh; dispenser ± 1.5 kWh/hari.</p>
      </div>


      <!-- Section 5: Pajak Daerah (PPJ) & Biaya Administrasi -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Pajak Penerangan Jalan (PPJ) & Admin
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Pajak PPJ</span> <span class="unit">(%)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-percent fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="ppj_persen" class="form-control" step="0.5" min="0" max="15" value="${data.ppj_persen}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Biaya Admin</span> <span class="unit">(Rp)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-receipt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="admin_per_transaksi" class="form-control" step="500" value="${data.admin_per_transaksi}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-options" style="margin-bottom: 4px;">
          <button type="button" class="option-chip ${data.ppj_persen === 3 ? 'active' : ''}" data-target="ppj_persen" data-val="3">DKI Jakarta (3%)</button>
          <button type="button" class="option-chip ${data.ppj_persen === 5 ? 'active' : ''}" data-target="ppj_persen" data-val="5">Jabar / Banten (5%)</button>
          <button type="button" class="option-chip ${data.ppj_persen === 7 ? 'active' : ''}" data-target="ppj_persen" data-val="7">Jateng / DIY (7%)</button>
          <button type="button" class="option-chip ${data.ppj_persen === 10 ? 'active' : ''}" data-target="ppj_persen" data-val="10">Jatim / Lainnya (10%)</button>
        </div>
      </div>

      <!-- Section 6A: Khusus Prabayar (Pilihan Denominasi Token) -->
      <div id="prabayarConfigSection" class="card" style="display: ${isPrabayar ? 'block' : 'none'}; margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Pilihan Denominasi Token Prabayar
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Denominasi Beli Token Favorit</span> <span class="unit">(Rp)</span>
          </label>
          <div class="form-options" style="margin-bottom: 6px;">
            <button type="button" class="token-chip option-chip ${data.nominal_token_pilihan === 50000 ? 'active' : ''}" data-target="nominal_token_pilihan" data-val="50000">Rp 50.000</button>
            <button type="button" class="token-chip option-chip ${data.nominal_token_pilihan === 100000 ? 'active' : ''}" data-target="nominal_token_pilihan" data-val="100000">Rp 100.000</button>
            <button type="button" class="token-chip option-chip ${data.nominal_token_pilihan === 200000 ? 'active' : ''}" data-target="nominal_token_pilihan" data-val="200000">Rp 200.000</button>
            <button type="button" class="token-chip option-chip ${data.nominal_token_pilihan === 500000 ? 'active' : ''}" data-target="nominal_token_pilihan" data-val="500000">Rp 500.000</button>
            <button type="button" class="token-chip option-chip ${data.nominal_token_pilihan === 1000000 ? 'active' : ''}" data-target="nominal_token_pilihan" data-val="1000000">Rp 1.000.000</button>
          </div>
          <input type="hidden" id="nominal_token_pilihan" value="${data.nominal_token_pilihan}">
          <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">*Digunakan untuk menyimulasikan frekuensi top-up token dan total biaya admin per bulan.</p>
        </div>
      </div>

      <!-- Section 6B: Khusus Pascabayar (Info Rekening Minimum PLN) -->
      <div id="pascabayarConfigSection" class="card" style="display: ${isPascabayar ? 'block' : 'none'}; margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Ketentuan Rekening Minimum (RM) PLN
        </div>
        <div id="rmExplanationText" style="font-size: 0.74rem; color: var(--text-muted); line-height: 1.5;">
          Perhitungan Rekening Minimum PLN = <strong>40 jam nyala × Daya (kVA) × Tarif/kWh</strong>. Jika pemakaian riil di bawah angka tersebut, tagihan bulanan tetap dikenakan tarif minimum RM.
        </div>
      </div>

      <!-- Action Button: Simpan ke Budget Dashboard -->
      <div style="margin-top: 18px; text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 11px;">
          <i class="fa-bookmark fa-solid" style="margin-right: 6px;"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Event Listeners for Inputs & Selects
    const inputs = container.querySelectorAll('input:not(#togglePlts), select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        ListrikModule.saveFormData(container);
        onInputChange();
      });
    });

    // Toggle PLTS Checkbox
    const togglePlts = container.querySelector('#togglePlts');
    const pltsContainer = container.querySelector('#pltsDetailContainer');
    togglePlts.addEventListener('change', () => {
      const isChecked = togglePlts.checked;
      pltsContainer.style.display = isChecked ? 'block' : 'none';
      ListrikModule.saveFormData(container);
      onInputChange();
    });

    // Daya VA Dropdown change: auto update tarif_per_kwh
    const dayaSelect = container.querySelector('#daya_va');
    const tarifInput = container.querySelector('#tarif_per_kwh');
    dayaSelect.addEventListener('change', () => {
      const selectedVal = dayaSelect.value;
      if (TARIF_PLN_MAP[selectedVal] !== undefined) {
        tarifInput.value = TARIF_PLN_MAP[selectedVal];
      }
      ListrikModule.saveFormData(container);
      onInputChange();
    });

    // Sistem Chips (Prabayar vs Pascabayar)
    const sistemChips = container.querySelectorAll('.sistem-chip');
    sistemChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        container.querySelector('#sistem_listrik').value = val;
        sistemChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // Toggle UI Sections
        const isPra = val === 'prabayar';
        container.querySelector('#prabayarConfigSection').style.display = isPra ? 'block' : 'none';
        container.querySelector('#pascabayarConfigSection').style.display = isPra ? 'none' : 'block';

        const infoBox = container.querySelector('#systemInfoBox');
        if (infoBox) {
          infoBox.style.background = isPra ? 'rgba(245, 158, 11, 0.08)' : 'rgba(6, 182, 212, 0.08)';
          infoBox.style.borderLeftColor = isPra ? 'var(--accent-amber)' : 'var(--accent-sky)';
          infoBox.innerHTML = isPra 
            ? '<strong>Prabayar (Token):</strong> Beli saldo stroom di awal. Bebas biaya beban / rekening minimum bulanan. Dikenakan Pajak Penerangan Jalan (PPJ) dan admin pembelian token.'
            : '<strong>Pascabayar (Meteran Bulanan):</strong> Pemakaian dicatat akhir bulan & ditagih tgl 1-20. Dikenakan ketentuan <em>Rekening Minimum PLN (40 jam nyala)</em> jika pemakaian rendah.';
        }

        ListrikModule.saveFormData(container);
        onInputChange();
      });
    });

    // General Option Chips (kwh_per_hari, ppj_persen, nominal_token_pilihan, plts)
    const optionChips = container.querySelectorAll('.option-chip:not(.sistem-chip)');
    optionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-target');
        const val = chip.getAttribute('data-val');
        const targetInput = container.querySelector(`#${targetId}`);
        if (targetInput) {
          targetInput.value = val;
          container.querySelectorAll(`.option-chip[data-target="${targetId}"]`).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          ListrikModule.saveFormData(container);
          onInputChange();
        }
      });
    });

    // Save to Budget Dashboard Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = ListrikModule.getFormInputs(container);
      const monthlyRes = ListrikModule.calculateMonthly(currentInputs);

      const sistemLabel = currentInputs.sistem_listrik === 'prabayar' ? 'Prabayar (Token)' : 'Pascabayar';
      const pltsNote = currentInputs.enable_plts ? ' + PLTS Surya' : '';
      const dayaLabel = DAYA_LABELS[currentInputs.daya_va] || `${currentInputs.daya_va} VA`;

      BudgetStore.saveBudgetItem('listrik', {
        id: 'listrik',
        name: `Listrik PLN (${sistemLabel}${pltsNote})`,
        amount: monthlyRes.total_biaya,
        category: 'Pokok',
        source: `Kalkulator Listrik (${dayaLabel})`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyRes.total_biaya)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4500);
    });
  },

  saveFormData: (container) => {
    const data = ListrikModule.getFormInputs(container);
    ListrikModule.saveData(data);
  },

  getFormInputs: (container) => {
    return {
      sistem_listrik: container.querySelector('#sistem_listrik')?.value || 'prabayar',
      daya_va: container.querySelector('#daya_va')?.value || '1300',
      kwh_per_hari: parseFloat(container.querySelector('#kwh_per_hari')?.value || 10),
      tarif_per_kwh: parseFloat(container.querySelector('#tarif_per_kwh')?.value || 1444.70),
      ppj_persen: parseFloat(container.querySelector('#ppj_persen')?.value || 5),
      admin_per_transaksi: parseFloat(container.querySelector('#admin_per_transaksi')?.value || 2500),
      nominal_token_pilihan: parseFloat(container.querySelector('#nominal_token_pilihan')?.value || 200000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10),

      // Parameter PLTS
      enable_plts: container.querySelector('#togglePlts')?.checked ?? false,
      plts_kapasitas_kwp: parseFloat(container.querySelector('#plts_kapasitas_kwp')?.value || 1.5),
      plts_biaya_investasi: parseFloat(container.querySelector('#plts_biaya_investasi')?.value || 18000000),
      plts_masa_pakai_tahun: parseInt(container.querySelector('#plts_masa_pakai_tahun')?.value || 20, 10),
      plts_biaya_maintenance_bulan: parseFloat(container.querySelector('#plts_biaya_maintenance_bulan')?.value || 50000),
      plts_sun_hours: parseFloat(container.querySelector('#plts_sun_hours')?.value || 4.0)
    };
  },

  // Helper calculation for 1 month (30 days) to sync to BudgetStore
  calculateMonthly: (inputs) => {
    const monthInputs = { ...inputs, hari: 30 };
    const res = ListrikModule.calculate(monthInputs);
    return {
      total_biaya: res.internalTotalBiaya || 0
    };
  },

  calculate: (inputs) => {
    const s = { ...ListrikModule.defaults, ...inputs };
    const { 
      sistem_listrik, daya_va, kwh_per_hari, tarif_per_kwh, ppj_persen, admin_per_transaksi, nominal_token_pilihan, hari,
      enable_plts, plts_kapasitas_kwp, plts_biaya_investasi, plts_masa_pakai_tahun, plts_biaya_maintenance_bulan, plts_sun_hours
    } = s;

    const numericVa = getNumericVa(daya_va);
    const kwh_total_rumah = kwh_per_hari * hari;
    const daya_label = DAYA_LABELS[daya_va] || `${daya_va} VA`;

    // 1. Kalkulasi PLTS Surya Mandiri (Jika Aktif)
    let kwh_solar_harian = 0;
    let kwh_solar_total = 0;
    let kwh_offset_pln = 0;
    let kwh_beli_pln = kwh_total_rumah;
    let amortisasi_plts_periode = 0;
    let maintenance_plts_periode = 0;
    let total_beban_plts_periode = 0;

    if (enable_plts && plts_kapasitas_kwp > 0) {
      // Efisiensi performa rasio sistem PV rata-rata 80% (losses suhu, debu, inverter)
      const performanceRatio = 0.80;
      kwh_solar_harian = plts_kapasitas_kwp * (plts_sun_hours || 4.0) * performanceRatio;
      kwh_solar_total = kwh_solar_harian * hari;

      // Listrik solar dipakai langsung untuk menutup kebutuhan rumah
      kwh_offset_pln = Math.min(kwh_total_rumah, kwh_solar_total);
      kwh_beli_pln = Math.max(0, kwh_total_rumah - kwh_solar_total);

      // Amortisasi modal awal pengadaan (CapEx) per hari sesuai masa pakai
      const totalBulanPakai = Math.max(1, (plts_masa_pakai_tahun || 20) * 12);
      const amortisasiPerBulan = (plts_biaya_investasi || 0) / totalBulanPakai;
      amortisasi_plts_periode = (amortisasiPerBulan / 30) * hari;

      // Biaya operasional/maintenance (OpEx) per periode
      maintenance_plts_periode = ((plts_biaya_maintenance_bulan || 0) / 30) * hari;
      total_beban_plts_periode = amortisasi_plts_periode + maintenance_plts_periode;
    }

    // 2. Perhitungan Tagihan / Token PLN (Berdasarkan sisa kWh_beli_pln)
    let biaya_energi_riil = kwh_beli_pln * tarif_per_kwh;
    let biaya_energi_tagihan = biaya_energi_riil;
    let isKenaRekeningMinimum = false;
    let kwh_min = 0;
    let rm_rupiah = 0;
    let total_admin = 0;
    let frekuensi_token = 1;

    if (sistem_listrik === 'pascabayar') {
      // Ketentuan Rekening Minimum (RM) PLN = 40 jam nyala * kVA terpasang
      kwh_min = 40 * (numericVa / 1000) * (hari / 30);
      rm_rupiah = kwh_min * tarif_per_kwh;

      if (kwh_beli_pln < kwh_min) {
        isKenaRekeningMinimum = true;
        biaya_energi_tagihan = rm_rupiah;
      } else {
        biaya_energi_tagihan = biaya_energi_riil;
      }

      total_admin = (hari / 30) * admin_per_transaksi;
    } else {
      // Prabayar: Bebas biaya beban / RM
      biaya_energi_tagihan = biaya_energi_riil;

      if (kwh_beli_pln > 0) {
        const biayaEnergiPlusPajak = biaya_energi_tagihan * (1 + (ppj_persen / 100));
        frekuensi_token = Math.max(1, Math.ceil(biayaEnergiPlusPajak / (nominal_token_pilihan || 200000)));
        total_admin = frekuensi_token * admin_per_transaksi;
      } else {
        frekuensi_token = 0;
        total_admin = 0;
      }
    }

    const biaya_ppj = biaya_energi_tagihan * (ppj_persen / 100);
    const total_tagihan_pln = biaya_energi_tagihan + biaya_ppj + total_admin;

    // Total pengeluaran energi bersih rumah tangga = Tagihan PLN + (Amortisasi & Maintenance PLTS jika aktif)
    const total_biaya_akhir = total_tagihan_pln + total_beban_plts_periode;

    // 3. Kalkulasi Penghematan & Analisis Finansial PLTS (1 Bulan & Tahunan)
    let hematPlnBulan = 0;
    let hematBersihBulan = 0;
    let paybackPeriodTahun = 0;

    if (enable_plts && plts_kapasitas_kwp > 0) {
      // Nilai listrik PLN yang dihemat per bulan
      const solarYieldBulan = kwh_solar_harian * 30;
      const kwhHematBulan = Math.min(kwh_per_hari * 30, solarYieldBulan);
      hematPlnBulan = kwhHematBulan * tarif_per_kwh * (1 + (ppj_persen / 100));

      const bebanPltsBulan = ((plts_biaya_investasi || 0) / Math.max(1, (plts_masa_pakai_tahun || 20) * 12)) + (plts_biaya_maintenance_bulan || 0);
      hematBersihBulan = hematPlnBulan - bebanPltsBulan;

      const hematPlnTahun = hematPlnBulan * 12;
      const opexTahun = (plts_biaya_maintenance_bulan || 0) * 12;
      const cashflowBersihTahun = hematPlnTahun - opexTahun;
      paybackPeriodTahun = cashflowBersihTahun > 0 ? (plts_biaya_investasi / cashflowBersihTahun) : 0;
    }

    // 4. Summary Cards (Auto-Balanced 4 Cards)
    let summaryCards = [];
    if (!enable_plts) {
      // Tampilan Standar Tanpa PLTS (Murni PLN)
      summaryCards = [
        {
          title: 'Total Konsumsi Listrik',
          value: `${formatNumber(kwh_total_rumah, 1)} kWh`,
          note: `Rata-rata ${formatNumber(kwh_per_hari, 1)} kWh/hari (${formatNumber(numericVa, 0)} VA)`,
          icon: 'fa-bolt',
          type: 'emerald'
        },
        {
          title: sistem_listrik === 'pascabayar' 
            ? (isKenaRekeningMinimum ? 'Biaya Rek. Minimum (RM)' : 'Biaya Pemakaian Riil')
            : 'Biaya Energi Murni',
          value: formatRupiah(biaya_energi_tagihan),
          note: sistem_listrik === 'pascabayar'
            ? (isKenaRekeningMinimum ? `Kena Min. 40 Jam (${formatNumber(kwh_min, 1)} kWh)` : `Normal di atas Rek. Min (${formatNumber(kwh_min, 1)} kWh)`)
            : `${formatNumber(kwh_total_rumah, 1)} kWh × ${formatRupiah(tarif_per_kwh)}`,
          icon: sistem_listrik === 'pascabayar' ? 'fa-file-invoice' : 'fa-plug-circle-bolt',
          type: isKenaRekeningMinimum ? 'amber' : 'sky'
        },
        {
          title: 'Pajak PPJ & Biaya Admin',
          value: formatRupiah(biaya_ppj + total_admin),
          note: `PPJ ${ppj_persen}% (${formatRupiah(biaya_ppj)}) + Admin (${formatRupiah(total_admin)})`,
          icon: 'fa-receipt',
          type: 'amber'
        },
        {
          title: sistem_listrik === 'prabayar' ? 'Estimasi Biaya Token' : 'Total Tagihan Pascabayar',
          value: formatRupiah(total_biaya_akhir),
          note: sistem_listrik === 'prabayar'
            ? (frekuensi_token > 0 ? `Saran: ~${frekuensi_token}x Token ${formatRupiah(nominal_token_pilihan)}` : 'Bebas pembelian token')
            : 'Jatuh tempo setiap tgl 20',
          icon: sistem_listrik === 'prabayar' ? 'fa-wallet' : 'fa-money-bill-wave',
          type: 'emerald'
        }
      ];
    } else {
      // Tampilan Cerdas dengan PLTS Aktif
      const porsiSolarPersen = kwh_total_rumah > 0 ? Math.min(100, Math.round((kwh_solar_total / kwh_total_rumah) * 100)) : 100;
      summaryCards = [
        {
          title: 'Konsumsi PLN vs Surya',
          value: `${formatNumber(kwh_beli_pln, 1)} kWh PLN`,
          note: `Surya penuhi ${formatNumber(kwh_offset_pln, 1)} kWh (${porsiSolarPersen}% mandiri)`,
          icon: 'fa-solar-panel',
          type: 'emerald'
        },
        {
          title: sistem_listrik === 'pascabayar' ? 'Tagihan Bersih PLN' : 'Beli Token PLN Bersih',
          value: formatRupiah(total_tagihan_pln),
          note: isKenaRekeningMinimum ? 'Kena batas Rekening Minimum PLN' : `Turun dari ${formatRupiah(Math.round((kwh_total_rumah * tarif_per_kwh) * (1 + ppj_persen / 100)))}`,
          icon: 'fa-file-invoice-dollar',
          type: 'sky'
        },
        {
          title: 'Beban Modal & Maintenance',
          value: formatRupiah(Math.round(total_beban_plts_periode)),
          note: `Amortisasi ${formatRupiah(Math.round(amortisasi_plts_periode))} + Maint. ${formatRupiah(Math.round(maintenance_plts_periode))}`,
          icon: 'fa-screwdriver-wrench',
          type: 'amber'
        },
        {
          title: 'Hemat Bersih & Balik Modal',
          value: hematBersihBulan > 0 ? `+${formatRupiah(Math.round(hematBersihBulan))}/bln` : `${formatRupiah(Math.round(hematBersihBulan))}/bln`,
          note: paybackPeriodTahun > 0 ? `Estimasi BEP: ~${formatNumber(paybackPeriodTahun, 1)} Tahun` : 'Penghematan optimal energi surya',
          icon: 'fa-chart-line',
          type: hematBersihBulan >= 0 ? 'emerald' : 'violet'
        }
      ];
    }

    // 5. Tabel Proyeksi Multi-Durasi
    const periods = [
      { label: '7 Hari', d: 7 },
      { label: '30 Hari (1 Bulan)', d: 30 },
      { label: '90 Hari (3 Bulan)', d: 90 },
      { label: '365 Hari (1 Tahun)', d: 365 },
      { label: `Custom (${hari} Hari)`, d: hari, isCurrent: true }
    ];

    let tableHeaders = [];
    let tableRows = [];

    if (!enable_plts) {
      const colEnergiLabel = sistem_listrik === 'pascabayar' ? 'Biaya Pemakaian / RM (Rp)' : 'Biaya Energi Token (Rp)';
      const colAdminLabel = sistem_listrik === 'pascabayar' ? 'Biaya Admin Tagihan' : 'Biaya Admin Top-Up';
      const colTotalLabel = sistem_listrik === 'pascabayar' ? 'Total Tagihan PLN (Rp)' : 'Total Pengeluaran Token (Rp)';

      tableHeaders = ['Periode', 'Konsumsi Listrik (kWh)', colEnergiLabel, `Pajak PPJ (${ppj_persen}%)`, colAdminLabel, colTotalLabel];

      tableRows = periods.map(p => {
        const pKwh = kwh_per_hari * p.d;
        let pEnergi = 0;
        let pAdmin = 0;

        if (sistem_listrik === 'pascabayar') {
          const pKwhMin = 40 * (numericVa / 1000) * (p.d / 30);
          const pRm = pKwhMin * tarif_per_kwh;
          pEnergi = pKwh < pKwhMin ? pRm : (pKwh * tarif_per_kwh);
          pAdmin = (p.d / 30) * admin_per_transaksi;
        } else {
          pEnergi = pKwh * tarif_per_kwh;
          const pEnergiPlusPajak = pEnergi * (1 + (ppj_persen / 100));
          const pFrek = Math.max(1, Math.ceil(pEnergiPlusPajak / (nominal_token_pilihan || 200000)));
          pAdmin = pFrek * admin_per_transaksi;
        }

        const pPpj = pEnergi * (ppj_persen / 100);
        const pTotal = pEnergi + pPpj + pAdmin;

        return {
          isCurrent: p.isCurrent || false,
          cells: [
            `<strong>${p.label}</strong>`,
            `${formatNumber(pKwh, 1)} kWh`,
            formatRupiah(pEnergi),
            formatRupiah(pPpj),
            formatRupiah(pAdmin),
            `<span class="highlight">${formatRupiah(pTotal)}</span>`
          ]
        };
      });
    } else {
      tableHeaders = [
        'Periode',
        'Total Beban Rumah',
        'Produksi Surya',
        'Sisa Beli PLN',
        'Tagihan Bersih PLN',
        'Beban Finansial PLTS',
        'Total Biaya Energi'
      ];

      tableRows = periods.map(p => {
        const pTotalKwh = kwh_per_hari * p.d;
        const pSolarKwh = kwh_solar_harian * p.d;
        const pSisaPlnKwh = Math.max(0, pTotalKwh - pSolarKwh);

        let pEnergiTagihan = pSisaPlnKwh * tarif_per_kwh;
        let pAdmin = 0;

        if (sistem_listrik === 'pascabayar') {
          const pKwhMin = 40 * (numericVa / 1000) * (p.d / 30);
          const pRm = pKwhMin * tarif_per_kwh;
          if (pSisaPlnKwh < pKwhMin) {
            pEnergiTagihan = pRm;
          }
          pAdmin = (p.d / 30) * admin_per_transaksi;
        } else {
          if (pSisaPlnKwh > 0) {
            const pBiayaToken = pEnergiTagihan * (1 + (ppj_persen / 100));
            const pFrek = Math.max(1, Math.ceil(pBiayaToken / (nominal_token_pilihan || 200000)));
            pAdmin = pFrek * admin_per_transaksi;
          }
        }

        const pPpj = pEnergiTagihan * (ppj_persen / 100);
        const pTagihanPln = pEnergiTagihan + pPpj + pAdmin;

        const totalBulanPakai = Math.max(1, (plts_masa_pakai_tahun || 20) * 12);
        const pAmortisasi = ((plts_biaya_investasi || 0) / totalBulanPakai / 30) * p.d;
        const pMaint = ((plts_biaya_maintenance_bulan || 0) / 30) * p.d;
        const pBebanPlts = pAmortisasi + pMaint;
        const pTotalSemua = pTagihanPln + pBebanPlts;

        return {
          isCurrent: p.isCurrent || false,
          cells: [
            `<strong>${p.label}</strong>`,
            `${formatNumber(pTotalKwh, 1)} kWh`,
            `<span style="color: var(--accent-emerald); font-weight: 600;">+${formatNumber(pSolarKwh, 1)} kWh</span>`,
            `${formatNumber(pSisaPlnKwh, 1)} kWh`,
            formatRupiah(pTagihanPln),
            formatRupiah(pBebanPlts),
            `<span class="highlight"><strong>${formatRupiah(pTotalSemua)}</strong></span>`
          ]
        };
      });
    }

    // 6. Secondary Table: Rincian Jangka Panjang & Detail PLTS
    let secondaryTable = null;
    if (!enable_plts) {
      const kwh_1bln = kwh_per_hari * 30;
      let energi_1bln = 0;
      let admin_1bln = 0;

      if (sistem_listrik === 'pascabayar') {
        const kwhMin30 = 40 * (numericVa / 1000);
        energi_1bln = kwh_1bln < kwhMin30 ? (kwhMin30 * tarif_per_kwh) : (kwh_1bln * tarif_per_kwh);
        admin_1bln = admin_per_transaksi;
      } else {
        energi_1bln = kwh_1bln * tarif_per_kwh;
        const frek30 = Math.max(1, Math.ceil((energi_1bln * (1 + ppj_persen / 100)) / (nominal_token_pilihan || 200000)));
        admin_1bln = frek30 * admin_per_transaksi;
      }

      const ppj_1bln = energi_1bln * (ppj_persen / 100);
      const cost_1bln = energi_1bln + ppj_1bln + admin_1bln;

      secondaryTable = {
        title: 'Proyeksi Pengeluaran Listrik Jangka Panjang',
        subtitle: `Akumulasi biaya listrik (${sistem_listrik === 'prabayar' ? 'Prabayar / Token' : 'Pascabayar / Tagihan'} - ${daya_label}) untuk perencanaan keuangan.`,
        headers: [
          'Periode Proyeksi',
          'Durasi Waktu',
          'Total Konsumsi (kWh)',
          sistem_listrik === 'pascabayar' ? 'Biaya Pemakaian / RM' : 'Biaya Energi Token',
          'Pajak PPJ & Admin',
          'Total Proyeksi Listrik'
        ],
        rows: [
          {
            isCurrent: false,
            cells: [
              `<strong>Proyeksi 1 Semester</strong>`,
              `6 Bulan (Semester)`,
              `${formatNumber(kwh_1bln * 6, 1)} kWh`,
              formatRupiah(energi_1bln * 6),
              formatRupiah((ppj_1bln + admin_1bln) * 6),
              `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(cost_1bln * 6)}</strong>`
            ]
          },
          {
            isCurrent: true,
            cells: [
              `<strong>Proyeksi 1 Tahun Penuh</strong>`,
              `12 Bulan (1 Tahun Penuh)`,
              `${formatNumber(kwh_1bln * 12, 1)} kWh`,
              formatRupiah(energi_1bln * 12),
              formatRupiah((ppj_1bln + admin_1bln) * 12),
              `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(cost_1bln * 12)}</strong>`
            ]
          }
        ]
      };
    } else {
      const totalBulanPakai = Math.max(1, (plts_masa_pakai_tahun || 20) * 12);
      const amortisasiBulan = (plts_biaya_investasi || 0) / totalBulanPakai;

      secondaryTable = {
        title: 'Komposisi Finansial & Analisis PLTS Mandiri',
        subtitle: 'Rincian biaya modal awal (CapEx), operasional/maintenance (OpEx), serta rasio penghematan energi terbarukan.',
        headers: [
          'Komponen Parameter',
          'Nilai / Alokasi',
          'Keterangan & Implikasi Finansial'
        ],
        rows: [
          {
            isCurrent: false,
            cells: [
              '<strong>Kapasitas & Produksi Surya</strong>',
              `${formatNumber(plts_kapasitas_kwp, 1)} kWp (~${formatNumber(kwh_solar_harian, 1)} kWh/hari)`,
              `Menghasilkan ± ${formatNumber(kwh_solar_harian * 30, 0)} kWh/bulan berdasarkan rata-rata ${plts_sun_hours} jam matahari efektif.`
            ]
          },
          {
            isCurrent: false,
            cells: [
              '<strong>Investasi Awal (CapEx)</strong>',
              formatRupiah(plts_biaya_investasi),
              `Diamortisasi selama ${plts_masa_pakai_tahun} tahun (~${formatRupiah(Math.round(amortisasiBulan))}/bulan) sebagai biaya depresiasi perangkat.`
            ]
          },
          {
            isCurrent: false,
            cells: [
              '<strong>Biaya Pemeliharaan (OpEx)</strong>',
              `${formatRupiah(plts_biaya_maintenance_bulan)} / Bulan`,
              'Cadangan berkala untuk pembersihan panel, pengecekan koneksi, dan servis/penggantian inverter.'
            ]
          },
          {
            isCurrent: false,
            cells: [
              '<strong>Penghematan Tagihan PLN</strong>',
              `${formatRupiah(Math.round(hematPlnBulan))} / Bulan`,
              `Listrik surya langsung memangkas kebutuhan beli stroom/tagihan PLN sebesar ± ${formatRupiah(Math.round(hematPlnBulan * 12))}/tahun.`
            ]
          },
          {
            isCurrent: false,
            cells: [
              '<strong>Estimasi Titik Impas (BEP)</strong>',
              paybackPeriodTahun > 0 ? `~${formatNumber(paybackPeriodTahun, 1)} Tahun` : 'Optimal Terpenuhi',
              paybackPeriodTahun > 0 
                ? `Setelah ${formatNumber(paybackPeriodTahun, 1)} tahun, sistem PLTS sepenuhnya menghasilkan listrik gratis hingga sisa masa pakai ${Math.max(0, plts_masa_pakai_tahun - Math.round(paybackPeriodTahun))} tahun ke depan.` 
                : 'Penghematan energi surya langsung terasa sejak bulan pertama instalasi.'
            ]
          }
        ]
      };
    }

    // 7. Chart Setup
    const chartLabels = ['7 Hari', '30 Hari', '90 Hari', '365 Hari'];
    const chartDurations = [7, 30, 90, 365];
    let chartDatasets = [];

    if (!enable_plts) {
      const chartEnergi = chartDurations.map(d => {
        const dKwh = kwh_per_hari * d;
        if (sistem_listrik === 'pascabayar') {
          const dMin = 40 * (numericVa / 1000) * (d / 30);
          return dKwh < dMin ? (dMin * tarif_per_kwh) : (dKwh * tarif_per_kwh);
        }
        return dKwh * tarif_per_kwh;
      });

      const chartPajakAdmin = chartDurations.map((d, idx) => {
        const e = chartEnergi[idx];
        const p = e * (ppj_persen / 100);
        let a = 0;
        if (sistem_listrik === 'pascabayar') {
          a = (d / 30) * admin_per_transaksi;
        } else {
          const frek = Math.max(1, Math.ceil((e + p) / (nominal_token_pilihan || 200000)));
          a = frek * admin_per_transaksi;
        }
        return p + a;
      });

      chartDatasets = [
        {
          label: 'Biaya Energi Listrik PLN (Rp)',
          data: chartEnergi,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderColor: '#6366f1',
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: 'Pajak PPJ & Biaya Admin (Rp)',
          data: chartPajakAdmin,
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          borderColor: '#f59e0b',
          borderWidth: 1.5,
          borderRadius: 6
        }
      ];
    } else {
      // Grafik Perbandingan Finansial dengan PLTS
      const chartTagihanPln = chartDurations.map(d => {
        const pTotalKwh = kwh_per_hari * d;
        const pSolarKwh = kwh_solar_harian * d;
        const pSisaPlnKwh = Math.max(0, pTotalKwh - pSolarKwh);

        let pEnergiTagihan = pSisaPlnKwh * tarif_per_kwh;
        let pAdmin = 0;

        if (sistem_listrik === 'pascabayar') {
          const pKwhMin = 40 * (numericVa / 1000) * (d / 30);
          const pRm = pKwhMin * tarif_per_kwh;
          if (pSisaPlnKwh < pKwhMin) pEnergiTagihan = pRm;
          pAdmin = (d / 30) * admin_per_transaksi;
        } else {
          if (pSisaPlnKwh > 0) {
            const pBiayaToken = pEnergiTagihan * (1 + (ppj_persen / 100));
            const pFrek = Math.max(1, Math.ceil(pBiayaToken / (nominal_token_pilihan || 200000)));
            pAdmin = pFrek * admin_per_transaksi;
          }
        }
        const pPpj = pEnergiTagihan * (ppj_persen / 100);
        return Math.round(pEnergiTagihan + pPpj + pAdmin);
      });

      const chartBebanPlts = chartDurations.map(d => {
        const totalBulanPakai = Math.max(1, (plts_masa_pakai_tahun || 20) * 12);
        const pAmortisasi = ((plts_biaya_investasi || 0) / totalBulanPakai / 30) * d;
        const pMaint = ((plts_biaya_maintenance_bulan || 0) / 30) * d;
        return Math.round(pAmortisasi + pMaint);
      });

      chartDatasets = [
        {
          label: 'Tagihan / Token Bersih PLN (Rp)',
          data: chartTagihanPln,
          backgroundColor: 'rgba(6, 182, 212, 0.75)',
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: 'Beban Modal & Maintenance PLTS (Rp)',
          data: chartBebanPlts,
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 6
        }
      ];
    }

    return {
      internalTotalBiaya: total_biaya_akhir,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: chartLabels,
        datasets: chartDatasets
      },
      quickStats: {
        totalQty: enable_plts 
          ? `${formatNumber(kwh_beli_pln, 1)} kWh PLN (${formatNumber(kwh_offset_pln, 1)} kWh Surya)` 
          : `${formatNumber(kwh_total_rumah, 1)} kWh`,
        totalCost: formatRupiah(total_biaya_akhir)
      }
    };
  }
};
