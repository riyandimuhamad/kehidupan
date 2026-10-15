/**
 * Modul Kalkulator Sandang & Perawatan Diri (Modern Lifestyle Suite)
 * Kehidupan App Suite
 * 
 * Mencakup kebutuhan riil sandang & perawatan pribadi zaman sekarang:
 * 1. Pakaian & Alas Kaki: Pakaian harian/kerja/santai, pakaian dalam (underwear), sepatu/sandal/tas, busana hari raya/musiman
 * 2. Perawatan Pakaian (Fabric Care): Deterjen & softener (cuci sendiri), laundry kiloan harian/sprei, dry clean / cuci sepatu
 * 3. Kebersihan Tubuh (Personal Hygiene): Sabun mandi, sampo, pasta gigi, deodorant, sanitasi wanita (pembalut)
 * 4. Skincare & Tabir Surya (Modern Aesthetics): Sunscreen/tabir surya, facial wash, moisturizer, serum harian
 * 5. Grooming & Estetika: Barbershop/salon potong rambut, parfum/cologne, styling rambut (pomade/wax)
 * 6. Kosmetik & Rias: Kosmetik harian wanita (cushion, lipstik, bedak)
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_SANDANG = 'kehidupan_sandang_data';

const DEFAULT_SANDANG_DATA = {
  jumlah_jiwa: 0,
  gaya_hidup: 'standar', // 'hemat', 'standar', 'urban'
  
  // 1. Fashion & Alas Kaki
  pakaian_harian: 0,
  sepatu_sandal_tas: 0,
  busana_hari_raya: 0, // Amortisasi tabungan baju hari raya/kondangan
  
  // 2. Laundry & Perawatan Pakaian
  tipe_laundry: 'kombinasi', // 'mandiri', 'kombinasi', 'kiloan'
  deterjen_softener: 0,
  jasa_laundry: 0,
  cuci_sepatu_dryclean: 0,
  
  // 3. Kebersihan Tubuh (Hygiene & Toiletries)
  toiletries_mandi: 0, // Sabun, sampo, pasta gigi, sikat gigi, deodorant
  sanitasi_pembalut: 0, // Pembalut wanita & sanitasi
  
  // 4. Skincare & Kosmetik
  skincare_sunscreen: 0, // Sunscreen, facial wash, moisturizer, serum
  kosmetik_makeup: 0, // Bedak, lipstik, cushion
  
  // 5. Grooming & Perawatan Rambut
  potong_rambut_salon: 0, // Barbershop / salon
  parfum_styling: 0 // Parfum/cologne, pomade, shaving
};

export const SandangModule = {
  id: 'sandang',
  name: 'Sandang & Perawatan',
  icon: 'fa-shirt',
  badge: 'Module Sandang & Estetika',
  title: 'Kalkulator Sandang & Perawatan Diri',
  subtitle: 'Hitung alokasi pengeluaran pakaian, alas kaki, laundry, personal hygiene, skincare modern, kosmetik, hingga grooming & barbershop.',

  defaults: DEFAULT_SANDANG_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_SANDANG, DEFAULT_SANDANG_DATA);
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_SANDANG, data);
  },

  renderForm: (container, onInputChange) => {
    const data = SandangModule.getData();

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Preferensi Sandang & Perawatan Keluarga
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Sesuaikan alokasi pos pengeluaran berdasarkan jumlah anggota keluarga dan kebiasaan gaya hidup sehari-hari.
        </p>
      </div>

      <!-- Section 1: Profil Rumah Tangga & Preset Gaya Hidup -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Jumlah Jiwa</span> <span class="unit">(Orang)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-users fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="jumlah_jiwa" class="form-control" min="1" max="15" value="${data.jumlah_jiwa}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Gaya Hidup</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-wand-magic-sparkles fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <select id="preset_gaya_hidup" class="form-control" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                <option value="hemat" ${data.gaya_hidup === 'hemat' ? 'selected' : ''}>Minimalis / Hemat</option>
                <option value="standar" ${data.gaya_hidup === 'standar' ? 'selected' : ''}>Standar Keluarga Modern</option>
                <option value="urban" ${data.gaya_hidup === 'urban' ? 'selected' : ''}>Urban / Gaya Hidup Aktif</option>
                <option value="custom">Kustom Mandiri</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Pakaian, Sepatu & Alas Kaki (Fashion) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Pakaian, Sepatu & Alas Kaki
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Baju & Pakaian</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-shirt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="pakaian_harian" class="form-control" step="25000" value="${data.pakaian_harian}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Sepatu & Tas</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-shoe-prints fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="sepatu_sandal_tas" class="form-control" step="25000" value="${data.sepatu_sandal_tas}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Busana Hari Raya / Acara</span> <span class="unit">(Rp/Bln)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-gift fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="busana_hari_raya" class="form-control" step="15000" value="${data.busana_hari_raya}" placeholder="0 (Tabungan baju Lebaran/Natal/Kondangan)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
        </div>
      </div>

      <!-- Section 3: Kebersihan Pakaian & Jasa Laundry -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Perawatan Pakaian & Jasa Laundry
        </div>

        <div class="form-group" style="margin-bottom: 8px;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Metode Cuci Utama</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-jug-detergent fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <select id="tipe_laundry" class="form-control" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              <option value="mandiri" ${data.tipe_laundry === 'mandiri' ? 'selected' : ''}>Cuci Sendiri di Rumah (Hanya Beli Deterjen/Pewangi)</option>
              <option value="kombinasi" ${data.tipe_laundry === 'kombinasi' ? 'selected' : ''}>Kombinasi (Pakaian Cuci Sendiri, Sprei/Selimut Laundry)</option>
              <option value="kiloan" ${data.tipe_laundry === 'kiloan' ? 'selected' : ''}>Mayoritas Laundry Kiloan (Pakaian Harian & Berat)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Deterjen & Pewangi</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-soap fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="deterjen_softener" class="form-control" step="10000" value="${data.deterjen_softener}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Laundry Kiloan</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-boxes-packing fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="jasa_laundry" class="form-control" step="15000" value="${data.jasa_laundry}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Cuci Sepatu / Dry Clean</span> <span class="unit">(Rp/Bln)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-sparkles fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="cuci_sepatu_dryclean" class="form-control" step="10000" value="${data.cuci_sepatu_dryclean}" placeholder="0 (Sneakers, jas, bedcover tebal)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
        </div>
      </div>

      <!-- Section 4: Personal Hygiene & Mandi (Toiletries) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Kebersihan Diri & Toiletries Mandi
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Sabun & Sampo</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-pump-soap fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="toiletries_mandi" class="form-control" step="10000" value="${data.toiletries_mandi}" placeholder="0 (Sabun, sampo, pasta gigi)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Pembalut & Sanitasi</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-shield-heart fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="sanitasi_pembalut" class="form-control" step="10000" value="${data.sanitasi_pembalut}" placeholder="0 (Pembalut & pantyliner)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Section 5: Skincare, Kosmetik & Estetika Modern -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Skincare, Kosmetik & Estetika
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Skincare & Sunscreen</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-sun fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="skincare_sunscreen" class="form-control" step="15000" value="${data.skincare_sunscreen}" placeholder="0 (Sunscreen, serum, moisturizer)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Make-up & Bedak</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-wand-magic fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="kosmetik_makeup" class="form-control" step="15000" value="${data.kosmetik_makeup}" placeholder="0 (Cushion, lipstik, bedak)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Section 6: Grooming, Barbershop & Perawatan Rambut -->
      <div class="card" style="margin-bottom: 16px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Grooming, Barbershop & Parfum
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Potong Rambut</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-scissors fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="potong_rambut_salon" class="form-control" step="10000" value="${data.potong_rambut_salon}" placeholder="0 (Barbershop / salon)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Parfum & Pomade</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-spray-can-sparkles fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="parfum_styling" class="form-control" step="10000" value="${data.parfum_styling}" placeholder="0 (Pomade, cologne, shaving)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
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

    // Presets Handlers
    const presetSelect = container.querySelector('#preset_gaya_hidup');
    if (presetSelect) {
      presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        const jiwa = parseInt(container.querySelector('#jumlah_jiwa')?.value || 3, 10);
        const factor = Math.max(1, jiwa / 3);

        if (val === 'hemat') {
          container.querySelector('#pakaian_harian').value = Math.round(100000 * factor);
          container.querySelector('#sepatu_sandal_tas').value = Math.round(50000 * factor);
          container.querySelector('#busana_hari_raya').value = Math.round(40000 * factor);
          container.querySelector('#tipe_laundry').value = 'mandiri';
          container.querySelector('#deterjen_softener').value = Math.round(45000 * factor);
          container.querySelector('#jasa_laundry').value = 0;
          container.querySelector('#cuci_sepatu_dryclean').value = 0;
          container.querySelector('#toiletries_mandi').value = Math.round(50000 * factor);
          container.querySelector('#sanitasi_pembalut').value = 25000;
          container.querySelector('#skincare_sunscreen').value = 60000;
          container.querySelector('#kosmetik_makeup').value = 30000;
          container.querySelector('#potong_rambut_salon').value = 35000;
          container.querySelector('#parfum_styling').value = 25000;
        } else if (val === 'standar') {
          container.querySelector('#pakaian_harian').value = Math.round(200000 * factor);
          container.querySelector('#sepatu_sandal_tas').value = Math.round(100000 * factor);
          container.querySelector('#busana_hari_raya').value = Math.round(75000 * factor);
          container.querySelector('#tipe_laundry').value = 'kombinasi';
          container.querySelector('#deterjen_softener').value = Math.round(60000 * factor);
          container.querySelector('#jasa_laundry').value = Math.round(120000 * factor);
          container.querySelector('#cuci_sepatu_dryclean').value = 40000;
          container.querySelector('#toiletries_mandi').value = Math.round(85000 * factor);
          container.querySelector('#sanitasi_pembalut').value = 40000;
          container.querySelector('#skincare_sunscreen').value = 120000;
          container.querySelector('#kosmetik_makeup').value = 60000;
          container.querySelector('#potong_rambut_salon').value = 60000;
          container.querySelector('#parfum_styling').value = 45000;
        } else if (val === 'urban') {
          container.querySelector('#pakaian_harian').value = Math.round(400000 * factor);
          container.querySelector('#sepatu_sandal_tas').value = Math.round(200000 * factor);
          container.querySelector('#busana_hari_raya').value = Math.round(150000 * factor);
          container.querySelector('#tipe_laundry').value = 'kiloan';
          container.querySelector('#deterjen_softener').value = Math.round(40000 * factor);
          container.querySelector('#jasa_laundry').value = Math.round(250000 * factor);
          container.querySelector('#cuci_sepatu_dryclean').value = 80000;
          container.querySelector('#toiletries_mandi').value = Math.round(130000 * factor);
          container.querySelector('#sanitasi_pembalut').value = 60000;
          container.querySelector('#skincare_sunscreen').value = 250000;
          container.querySelector('#kosmetik_makeup').value = 150000;
          container.querySelector('#potong_rambut_salon').value = 120000;
          container.querySelector('#parfum_styling').value = 90000;
        }

        saveCurrentState();
        onInputChange();
      });
    }

    // Tipe Laundry change auto-suggest
    const laundrySelect = container.querySelector('#tipe_laundry');
    if (laundrySelect) {
      laundrySelect.addEventListener('change', () => {
        if (laundrySelect.value === 'mandiri') {
          container.querySelector('#jasa_laundry').value = 0;
        } else if (laundrySelect.value === 'kiloan') {
          if (parseFloat(container.querySelector('#jasa_laundry').value || 0) === 0) {
            container.querySelector('#jasa_laundry').value = 150000;
          }
        }
        saveCurrentState();
        onInputChange();
      });
    }

    const saveCurrentState = () => {
      const inputs = SandangModule.getFormInputs(container);
      SandangModule.saveData(inputs);
    };

    container.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', () => {
        saveCurrentState();
        onInputChange();
      });
    });

    // Save to Budget Dashboard
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const currentInputs = SandangModule.getFormInputs(container);
        const res = SandangModule.calculate(currentInputs);
        const monthlyCost = res.total_biaya;

        if (monthlyCost <= 0) {
          notice.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-circle-exclamation fa-solid"></i> Estimasi biaya sandang masih Rp 0. Silakan isi alokasi pakaian atau laundry terlebih dahulu.</span>`;
          setTimeout(() => notice.innerHTML = '', 4500);
          return;
        }

        BudgetStore.saveBudgetItem('sandang', {
          id: 'sandang',
          name: 'Sandang & Perawatan',
          amount: monthlyCost,
          category: 'Pokok',
          source: `Sandang, Laundry & Grooming (${currentInputs.jumlah_jiwa} Jiwa)`
        });

        notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} (${currentInputs.jumlah_jiwa} Jiwa) telah disinkronkan ke Dashboard Keuangan.`;
        setTimeout(() => notice.innerHTML = '', 4000);
      });
    }
  },

  getFormInputs: (container) => {
    return {
      jumlah_jiwa: parseInt(container.querySelector('#jumlah_jiwa')?.value || 3, 10),
      gaya_hidup: container.querySelector('#preset_gaya_hidup')?.value || 'standar',
      
      pakaian_harian: parseFloat(container.querySelector('#pakaian_harian')?.value || 0),
      sepatu_sandal_tas: parseFloat(container.querySelector('#sepatu_sandal_tas')?.value || 0),
      busana_hari_raya: parseFloat(container.querySelector('#busana_hari_raya')?.value || 0),
      
      tipe_laundry: container.querySelector('#tipe_laundry')?.value || 'kombinasi',
      deterjen_softener: parseFloat(container.querySelector('#deterjen_softener')?.value || 0),
      jasa_laundry: parseFloat(container.querySelector('#jasa_laundry')?.value || 0),
      cuci_sepatu_dryclean: parseFloat(container.querySelector('#cuci_sepatu_dryclean')?.value || 0),
      
      toiletries_mandi: parseFloat(container.querySelector('#toiletries_mandi')?.value || 0),
      sanitasi_pembalut: parseFloat(container.querySelector('#sanitasi_pembalut')?.value || 0),
      
      skincare_sunscreen: parseFloat(container.querySelector('#skincare_sunscreen')?.value || 0),
      kosmetik_makeup: parseFloat(container.querySelector('#kosmetik_makeup')?.value || 0),
      
      potong_rambut_salon: parseFloat(container.querySelector('#potong_rambut_salon')?.value || 0),
      parfum_styling: parseFloat(container.querySelector('#parfum_styling')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const s = inputs || SandangModule.getData();

    // 1. Total Fashion & Alas Kaki
    const totalFashion = (s.pakaian_harian || 0) + (s.sepatu_sandal_tas || 0) + (s.busana_hari_raya || 0);

    // 2. Total Laundry & Fabric Care
    const totalFabricCare = (s.deterjen_softener || 0) + (s.jasa_laundry || 0) + (s.cuci_sepatu_dryclean || 0);

    // 3. Total Personal Hygiene
    const totalHygiene = (s.toiletries_mandi || 0) + (s.sanitasi_pembalut || 0);

    // 4. Total Skincare, Kosmetik & Estetika
    const totalSkincareKosmetik = (s.skincare_sunscreen || 0) + (s.kosmetik_makeup || 0);

    // 5. Total Grooming & Salon
    const totalGroomingSalon = (s.potong_rambut_salon || 0) + (s.parfum_styling || 0);

    // Grand Total Bulanan
    const total_biaya = totalFashion + totalFabricCare + totalHygiene + totalSkincareKosmetik + totalGroomingSalon;

    // Summary Cards
    const summaryCards = [
      {
        title: 'Fashion & Sepatu',
        value: formatRupiah(totalFashion),
        note: `Pakaian, Sepatu & Tas`,
        icon: 'fa-shirt',
        type: 'emerald'
      },
      {
        title: 'Laundry & Fabric Care',
        value: formatRupiah(totalFabricCare),
        note: `Deterjen, Kiloan & Cuci Sepatu`,
        icon: 'fa-jug-detergent',
        type: 'sky'
      },
      {
        title: 'Hygiene & Toiletries',
        value: formatRupiah(totalHygiene),
        note: `Mandi & Sanitasi Keluarga`,
        icon: 'fa-pump-soap',
        type: 'amber'
      },
      {
        title: 'Skincare, Make-up & Grooming',
        value: formatRupiah(totalSkincareKosmetik + totalGroomingSalon),
        note: `Sunscreen, Serum, Salon & Parfum`,
        icon: 'fa-spray-can-sparkles',
        type: 'rose'
      }
    ];

    // Detailed Pos Table Rows
    const posList = [
      {
        kategori: 'Pakaian & Underwear',
        rincian: 'Pakaian harian, kerja, santai & pakaian dalam',
        bulanan: s.pakaian_harian || 0
      },
      {
        kategori: 'Sepatu, Sandal & Tas',
        rincian: 'Sepatu kerja/sekolah, sneakers, sandal & tas',
        bulanan: s.sepatu_sandal_tas || 0
      },
      {
        kategori: 'Busana Hari Raya / Musiman',
        rincian: 'Amortisasi baju Lebaran, Natal, seragam/kondangan',
        bulanan: s.busana_hari_raya || 0
      },
      {
        kategori: 'Deterjen & Pewangi (Cuci Sendiri)',
        rincian: 'Sabun cuci, pelembut (softener), pelicin setrika',
        bulanan: s.deterjen_softener || 0
      },
      {
        kategori: 'Jasa Laundry Kiloan',
        rincian: 'Laundry pakaian harian, sprei, selimut/bedcover',
        bulanan: s.jasa_laundry || 0
      },
      {
        kategori: 'Cuci Sepatu & Dry Cleaning',
        rincian: 'Laundry sneakers, tas khusus, jas/blazer',
        bulanan: s.cuci_sepatu_dryclean || 0
      },
      {
        kategori: 'Perlengkapan Mandi & Toiletries',
        rincian: 'Sabun mandi, sampo, pasta gigi, sikat gigi, deodorant',
        bulanan: s.toiletries_mandi || 0
      },
      {
        kategori: 'Sanitasi & Pembalut Wanita',
        rincian: 'Pembalut, pantyliner & produk sanitasi tubuh',
        bulanan: s.sanitasi_pembalut || 0
      },
      {
        kategori: 'Skincare Dasar & Sunscreen',
        rincian: 'Tabir surya (sunscreen), facial wash, moisturizer, serum',
        bulanan: s.skincare_sunscreen || 0
      },
      {
        kategori: 'Make-up & Kosmetik Harian',
        rincian: 'Bedak, cushion, lipstik, pensil alis',
        bulanan: s.kosmetik_makeup || 0
      },
      {
        kategori: 'Potong Rambut & Salon',
        rincian: 'Barbershop bulanan pria, salon wanita, creambath',
        bulanan: s.potong_rambut_salon || 0
      },
      {
        kategori: 'Parfum, Styling & Shaving',
        rincian: 'Parfum/cologne harian, pomade/wax, pisau cukur',
        bulanan: s.parfum_styling || 0
      }
    ];

    const tableHeaders = ['Kategori Pos Sandang', 'Rincian Kebutuhan Modern', 'Alokasi Bulanan (Rp)', 'Estimasi 1 Tahun (Rp)', 'Porsi Anggaran'];
    const tableRows = posList.map(item => {
      const tahunan = item.bulanan * 12;
      const persentase = total_biaya > 0 ? ((item.bulanan / total_biaya) * 100).toFixed(1) : 0;

      return {
        isCurrent: false,
        cells: [
          `<strong>${item.kategori}</strong>`,
          item.rincian,
          formatRupiah(item.bulanan),
          formatRupiah(tahunan),
          `<span class="highlight">${persentase}%</span>`
        ]
      };
    });

    // Grand Total Row with .current-row (gets matching header background color)
    tableRows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL SANDANG & PERAWATAN</strong>`,
        `<strong>${s.jumlah_jiwa || 3} Jiwa Anggota Keluarga</strong>`,
        `<strong class="highlight" style="font-size: 0.95rem; color: var(--accent-emerald);">${formatRupiah(total_biaya)}</strong>`,
        `<strong style="color: var(--primary);">${formatRupiah(total_biaya * 12)}</strong>`,
        `<strong>100%</strong>`
      ]
    });

    // Secondary Table: Proyeksi Jangka Panjang
    const secondaryTable = {
      title: 'Proyeksi Anggaran Sandang & Perawatan Jangka Panjang',
      subtitle: 'Akumulasi proyeksi belanja sandang, laundry, dan perawatan diri keluarga berdasarkan periode waktu.',
      headers: [
        'Periode Proyeksi',
        'Durasi Waktu',
        'Akumulasi Fashion & Sepatu',
        'Akumulasi Laundry & Hygiene',
        'Akumulasi Skincare & Grooming',
        'Total Proyeksi Sandang'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>Proyeksi 1 Semester</strong>`,
            `6 Bulan (Semester)`,
            formatRupiah(totalFashion * 6),
            formatRupiah((totalFabricCare + totalHygiene) * 6),
            formatRupiah((totalSkincareKosmetik + totalGroomingSalon) * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(total_biaya * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>Proyeksi 1 Tahun Penuh</strong>`,
            `12 Bulan (1 Tahun Penuh)`,
            formatRupiah(totalFashion * 12),
            formatRupiah((totalFabricCare + totalHygiene) * 12),
            formatRupiah((totalSkincareKosmetik + totalGroomingSalon) * 12),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(total_biaya * 12)}</strong>`
          ]
        }
      ]
    };

    // Chart Data
    const chartLabels = ['Fashion & Sepatu', 'Laundry & Fabric', 'Hygiene Mandi', 'Skincare & Sunscreen', 'Make-up & Kosmetik', 'Grooming & Salon'];
    const chartValues = [
      Math.round(totalFashion),
      Math.round(totalFabricCare),
      Math.round(totalHygiene),
      Math.round(s.skincare_sunscreen || 0),
      Math.round(s.kosmetik_makeup || 0),
      Math.round(totalGroomingSalon)
    ];

    const chartColors = ['#6366f1', '#06b6d4', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];

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
            label: 'Alokasi Sandang & Perawatan (Rp/Bln)',
            data: chartValues,
            backgroundColor: chartColors
          }
        ]
      },
      quickStats: {
        totalQty: `${s.jumlah_jiwa || 3} Jiwa (${s.gaya_hidup === 'urban' ? 'Urban' : s.gaya_hidup === 'hemat' ? 'Hemat' : 'Standar'})`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
