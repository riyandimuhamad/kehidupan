/**
 * Modul Kalkulator Sembako & Kebutuhan Dapur Rumah Tangga
 * Kehidupan App Suite
 * 
 * Parameter Realistis & Pemisahan Fungsi yang Jelas:
 * 1. Ukuran Keluarga: Jumlah anggota keluarga yang mempengaruhi kuantitas sembako & lauk.
 * 2. Bahan Pokok Dapur: Minyak goreng, gula pasir, teh/kopi/susu, telur ayam, mie instan & bumbu dapur.
 * 3. Distribusi Protein Lauk Pauk: Ayam, ikan, tahu/tempe, daging sapi/olahan dengan proporsi realistis.
 * 4. Kebersihan Dapur & Rumah Tangga (Fasilitas Umum):
 *    - Khusus cairan cuci piring, spons, pembersih lantai (karbol), tisu dapur & plastik sampah.
 *    - Kebutuhan Personal Hygiene (sabun mandi, sampo, odol, skincare) serta deterjen pakaian
 *      dikelola secara terpisah di modul Sandang & Perawatan Diri agar tidak terjadi duplikasi biaya.
 * 5. Cadangan & Waste Factor: Alokasi 5-10% untuk bahan makanan basah/segar yang rentan susut/rusak.
 * 6. Faktor Fluktuasi Musiman: Pilihan penyesuaian harga saat Peak Season (Ramadan/Lebaran/Nataru).
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_SEMBAKO = 'kehidupan_sembako_data';

const DEFAULT_SEMBAKO_DATA = {
  jumlah_anggota: 4,
  minyak_liter: 4,
  harga_minyak: 17500,
  gula_kg: 2,
  harga_gula: 18000,
  kopi_teh_susu: 50000,
  telur_kg: 3,
  harga_telur: 28500,
  mie_instan: 45000,
  bumbu_dapur: 85000,
  budget_lauk: 600000,
  profil_protein: 'seimbang',     // 'seimbang', 'hemat_nabati', 'tinggi_hewani'
  kebersihan_dapur: 75000,        // Cuci piring, spons, pembersih lantai & tisu dapur
  waste_factor: 5,                // 0, 5, 10 persen
  kondisi_musim: 0                // 0 (Normal), 15 (Peak Season +15%), 25 (Paceklik/Inflasi +25%)
};

export const SembakoModule = {
  id: 'sembako',
  name: 'Sembako & Dapur',
  icon: 'fa-basket-shopping',
  badge: 'Module Dapur & Rumah Tangga',
  title: 'Kalkulator Sembako & Kebutuhan Dapur',
  subtitle: 'Estimasi belanja sembako pokok, lauk pauk segar, bumbu dapur, serta kebersihan dapur dan sanitasi rumah.',

  defaults: DEFAULT_SEMBAKO_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_SEMBAKO, { ...DEFAULT_SEMBAKO_DATA });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_SEMBAKO, data);
  },

  renderForm: (container, onInputChange) => {
    const data = SembakoModule.getData();

    container.innerHTML = `
      <!-- Section 1: Anggota Keluarga & Dinamika Musiman -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Ukuran Keluarga & Kondisi Pasar
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="jumlah_anggota">Jumlah Anggota Keluarga <span class="unit">(Jiwa)</span></label>
          <div class="input-wrapper">
            <i class="fa-users fa-solid input-icon"></i>
            <input type="number" id="jumlah_anggota" class="form-control" min="1" max="25" value="${data.jumlah_anggota}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.jumlah_anggota === 1 ? 'active' : ''}" data-target="jumlah_anggota" data-val="1">1 Orang (Kos)</button>
            <button type="button" class="option-chip ${data.jumlah_anggota === 2 ? 'active' : ''}" data-target="jumlah_anggota" data-val="2">2 Orang</button>
            <button type="button" class="option-chip ${data.jumlah_anggota === 4 ? 'active' : ''}" data-target="jumlah_anggota" data-val="4">Keluarga (4)</button>
            <button type="button" class="option-chip ${data.jumlah_anggota === 6 ? 'active' : ''}" data-target="jumlah_anggota" data-val="6">Besar (6)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="kondisi_musim">Faktor Musim & Fluktuasi Harga</label>
          <div class="input-wrapper">
            <i class="fa-arrow-trend-up fa-solid input-icon"></i>
            <select id="kondisi_musim" class="form-control">
              <option value="0" ${data.kondisi_musim === 0 ? 'selected' : ''}>Normal / Reguler (Harga Stabil)</option>
              <option value="15" ${data.kondisi_musim === 15 ? 'selected' : ''}>Peak Season: Ramadan / Lebaran / Nataru (+15%)</option>
              <option value="25" ${data.kondisi_musim === 25 ? 'selected' : ''}>Lonjakan Tinggi / Musim Paceklik Pangan (+25%)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section 2: Bahan Pokok Kering & Bumbu Dapur -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Sembako Pokok Dapur (Dry Goods)
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="minyak_liter">Minyak Goreng <span class="unit">(Liter)</span></label>
            <div class="input-wrapper">
              <i class="fa-bottle-droplet fa-solid input-icon"></i>
              <input type="number" id="minyak_liter" class="form-control" step="0.5" min="0" value="${data.minyak_liter}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="harga_minyak">Harga Minyak <span class="unit">(Rp/L)</span></label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon"></i>
              <input type="number" id="harga_minyak" class="form-control" step="500" value="${data.harga_minyak}">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="telur_kg">Telur Ayam <span class="unit">(Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-egg fa-solid input-icon"></i>
              <input type="number" id="telur_kg" class="form-control" step="0.5" min="0" value="${data.telur_kg}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="harga_telur">Harga Telur <span class="unit">(Rp/Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon"></i>
              <input type="number" id="harga_telur" class="form-control" step="500" value="${data.harga_telur}">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="gula_kg">Gula Pasir <span class="unit">(Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-cubes-stacked fa-solid input-icon"></i>
              <input type="number" id="gula_kg" class="form-control" step="0.5" min="0" value="${data.gula_kg}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="harga_gula">Harga Gula <span class="unit">(Rp/Kg)</span></label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon"></i>
              <input type="number" id="harga_gula" class="form-control" step="500" value="${data.harga_gula}">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="kopi_teh_susu">Kopi, Teh & Susu <span class="unit">(Rp/Bulan)</span></label>
            <div class="input-wrapper">
              <i class="fa-mug-hot fa-solid input-icon"></i>
              <input type="number" id="kopi_teh_susu" class="form-control" step="5000" value="${data.kopi_teh_susu}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label for="mie_instan">Mie Instan & Pasta <span class="unit">(Rp/Bulan)</span></label>
            <div class="input-wrapper">
              <i class="fa-bowl-food fa-solid input-icon"></i>
              <input type="number" id="mie_instan" class="form-control" step="5000" value="${data.mie_instan}">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="bumbu_dapur">Bumbu Dapur, Garam, Kecap & Bawang <span class="unit">(Rp/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-pepper-hot fa-solid input-icon"></i>
            <input type="number" id="bumbu_dapur" class="form-control" step="5000" value="${data.bumbu_dapur}">
          </div>
        </div>
      </div>

      <!-- Section 3: Lauk Pauk, Protein & Cadangan Waste -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Lauk Pauk Segar & Proporsi Protein
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="budget_lauk">Alokasi Belanja Lauk Pauk Segar <span class="unit">(Rp/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-drumstick-bite fa-solid input-icon"></i>
            <input type="number" id="budget_lauk" class="form-control" step="25000" value="${data.budget_lauk}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.budget_lauk === 400000 ? 'active' : ''}" data-target="budget_lauk" data-val="400000">Hemat (Rp 400k)</button>
            <button type="button" class="option-chip ${data.budget_lauk === 600000 ? 'active' : ''}" data-target="budget_lauk" data-val="600000">Standar (Rp 600k)</button>
            <button type="button" class="option-chip ${data.budget_lauk === 950000 ? 'active' : ''}" data-target="budget_lauk" data-val="950000">Lengkap (Rp 950k)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="profil_protein">Pola & Proporsi Konsumsi Protein</label>
          <div class="input-wrapper">
            <i class="fa-chart-pie fa-solid input-icon"></i>
            <select id="profil_protein" class="form-control">
              <option value="seimbang" ${data.profil_protein === 'seimbang' ? 'selected' : ''}>Seimbang: Ayam 40%, Ikan 25%, Tahu/Tempe 25%, Daging 10%</option>
              <option value="hemat_nabati" ${data.profil_protein === 'hemat_nabati' ? 'selected' : ''}>Hemat Nabati: Tahu/Tempe 50%, Ayam/Ikan 40%, Daging 10%</option>
              <option value="tinggi_hewani" ${data.profil_protein === 'tinggi_hewani' ? 'selected' : ''}>Tinggi Hewani: Daging/Ayam 60%, Ikan Segar 25%, Tahu/Tempe 15%</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="waste_factor">Cadangan Susut / Bahan Rusak & Basi <span class="unit">(Waste Factor)</span></label>
          <div class="input-wrapper">
            <i class="fa-shield-halved fa-solid input-icon"></i>
            <select id="waste_factor" class="form-control">
              <option value="0" ${data.waste_factor === 0 ? 'selected' : ''}>0% (Tanpa Cadangan / Habis Pas)</option>
              <option value="5" ${data.waste_factor === 5 ? 'selected' : ''}>5% (Standar Cermat Rumah Tangga)</option>
              <option value="10" ${data.waste_factor === 10 ? 'selected' : ''}>10% (Porsi Aman Bahan Segar / Sayur Basi)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section 4: Kebersihan Dapur & Sanitasi Umum Rumah -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Kebersihan Dapur & Sanitasi Rumah
          </span>
        </div>

        <!-- Note pemisahan fungsi: Personal hygiene & laundry berada di Sandang -->
        <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: var(--radius-sm); padding: 9px 12px; margin-bottom: 14px; font-size: 0.73rem; color: var(--text-muted); line-height: 1.45;">
          <i class="fa-circle-info fa-solid" style="color: var(--accent-sky); margin-right: 4px;"></i>
          <strong>Pemisahan Fungsi:</strong> Pos ini khusus perlengkapan dapur & fasilitas rumah (sabun cuci piring, spons, cairan pel lantai/karbol, tisu dapur & kantong sampah). Kebutuhan pribadi (sabun mandi, sampo, odol, skincare) serta deterjen pakaian dihitung terpisah di modul <strong>Sandang & Perawatan</strong> agar tidak terjadi duplikasi pos.
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="kebersihan_dapur">Cuci Piring, Pembersih Lantai & Tisu Dapur <span class="unit">(Rp/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-spray-can-sparkles fa-solid input-icon"></i>
            <input type="number" id="kebersihan_dapur" class="form-control" step="5000" value="${data.kebersihan_dapur}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.kebersihan_dapur === 45000 ? 'active' : ''}" data-target="kebersihan_dapur" data-val="45000">Hemat (Rp 45k)</button>
            <button type="button" class="option-chip ${data.kebersihan_dapur === 75000 ? 'active' : ''}" data-target="kebersihan_dapur" data-val="75000">Standar (Rp 75k)</button>
            <button type="button" class="option-chip ${data.kebersihan_dapur === 125000 ? 'active' : ''}" data-target="kebersihan_dapur" data-val="125000">Lengkap (Rp 125k)</button>
          </div>
        </div>
      </div>

      <!-- Action Sync to Budget Dashboard Button -->
      <div style="margin-top: 24px; text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669);">
          <i class="fa-bookmark fa-solid"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Event listeners
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        SembakoModule.saveCurrentData(container);
        onInputChange();
      });
      input.addEventListener('change', () => {
        SembakoModule.saveCurrentData(container);
        onInputChange();
      });
    });

    // Auto-scaling when family size chips change
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

          // If changing family size, adjust default dry goods & lauk reasonably if user clicked family chips
          if (targetId === 'jumlah_anggota') {
            const anggota = parseInt(val, 10);
            const minyakEl = container.querySelector('#minyak_liter');
            const telurEl = container.querySelector('#telur_kg');
            const gulaEl = container.querySelector('#gula_kg');
            const laukEl = container.querySelector('#budget_lauk');

            if (anggota === 1) {
              if (minyakEl) minyakEl.value = '1.5';
              if (telurEl) telurEl.value = '1';
              if (gulaEl) gulaEl.value = '1';
              if (laukEl) laukEl.value = '250000';
            } else if (anggota === 2) {
              if (minyakEl) minyakEl.value = '2.5';
              if (telurEl) telurEl.value = '1.5';
              if (gulaEl) gulaEl.value = '1.5';
              if (laukEl) laukEl.value = '400000';
            } else if (anggota === 4) {
              if (minyakEl) minyakEl.value = '4';
              if (telurEl) telurEl.value = '3';
              if (gulaEl) gulaEl.value = '2';
              if (laukEl) laukEl.value = '600000';
            } else if (anggota === 6) {
              if (minyakEl) minyakEl.value = '6';
              if (telurEl) telurEl.value = '4.5';
              if (gulaEl) gulaEl.value = '3';
              if (laukEl) laukEl.value = '900000';
            }
          }

          SembakoModule.saveCurrentData(container);
          onInputChange();
        }
      });
    });

    // Save to BudgetStore Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = SembakoModule.getFormInputs(container);
      const res = SembakoModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('sembako', {
        id: 'sembako',
        name: 'Sembako & Dapur',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Sembako Dapur, Lauk Segar (${currentInputs.jumlah_anggota} Jiwa) & Kebersihan Dapur/Rumah`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  saveCurrentData: (container) => {
    const inputs = SembakoModule.getFormInputs(container);
    SembakoModule.saveData(inputs);
  },

  getFormInputs: (container) => {
    return {
      jumlah_anggota: parseInt(container.querySelector('#jumlah_anggota')?.value || '4', 10),
      minyak_liter: parseFloat(container.querySelector('#minyak_liter')?.value || '0'),
      harga_minyak: parseFloat(container.querySelector('#harga_minyak')?.value || '0'),
      gula_kg: parseFloat(container.querySelector('#gula_kg')?.value || '0'),
      harga_gula: parseFloat(container.querySelector('#harga_gula')?.value || '0'),
      kopi_teh_susu: parseFloat(container.querySelector('#kopi_teh_susu')?.value || '0'),
      telur_kg: parseFloat(container.querySelector('#telur_kg')?.value || '0'),
      harga_telur: parseFloat(container.querySelector('#harga_telur')?.value || '0'),
      mie_instan: parseFloat(container.querySelector('#mie_instan')?.value || '0'),
      bumbu_dapur: parseFloat(container.querySelector('#bumbu_dapur')?.value || '0'),
      budget_lauk: parseFloat(container.querySelector('#budget_lauk')?.value || '0'),
      profil_protein: container.querySelector('#profil_protein')?.value || 'seimbang',
      kebersihan_dapur: parseFloat(container.querySelector('#kebersihan_dapur')?.value || '0'),
      waste_factor: parseFloat(container.querySelector('#waste_factor')?.value || '0'),
      kondisi_musim: parseFloat(container.querySelector('#kondisi_musim')?.value || '0')
    };
  },

  calculate: (inputs) => {
    const {
      jumlah_anggota,
      minyak_liter, harga_minyak,
      gula_kg, harga_gula, kopi_teh_susu,
      telur_kg, harga_telur,
      mie_instan, bumbu_dapur,
      budget_lauk, profil_protein,
      kebersihan_dapur, waste_factor, kondisi_musim
    } = inputs;

    // Pengali musim (misal +15% untuk sembako pokok saat Ramadan/Lebaran)
    const multiplierMusim = 1 + (kondisi_musim / 100);

    // 1. Sembako Pokok Dapur
    const biaya_minyak = (minyak_liter * harga_minyak) * multiplierMusim;
    const biaya_gula = (gula_kg * harga_gula) * multiplierMusim;
    const biaya_telur = (telur_kg * harga_telur) * multiplierMusim;
    const biaya_kopi_susu = kopi_teh_susu;
    const biaya_mie = mie_instan;
    const biaya_bumbu = bumbu_dapur * multiplierMusim;

    const total_sembako_pokok = biaya_minyak + biaya_gula + biaya_telur + biaya_kopi_susu + biaya_mie + biaya_bumbu;

    // 2. Lauk Pauk Segar & Cadangan Waste
    const lauk_bersih = budget_lauk * multiplierMusim;
    const nilai_waste = lauk_bersih * (waste_factor / 100);
    const total_lauk_protein = lauk_bersih + nilai_waste;

    // Rincian proporsi protein
    let propAyam = 0.40;
    let propIkan = 0.25;
    let propNabati = 0.25;
    let propDaging = 0.10;

    if (profil_protein === 'hemat_nabati') {
      propNabati = 0.50;
      propAyam = 0.25;
      propIkan = 0.15;
      propDaging = 0.10;
    } else if (profil_protein === 'tinggi_hewani') {
      propAyam = 0.35;
      propDaging = 0.25;
      propIkan = 0.25;
      propNabati = 0.15;
    }

    const biayaAyam = lauk_bersih * propAyam;
    const biayaIkan = lauk_bersih * propIkan;
    const biayaNabati = lauk_bersih * propNabati;
    const biayaDaging = lauk_bersih * propDaging;

    // 3. Kebersihan Dapur & Sanitasi Umum Rumah (Khusus cuci piring, lantai, spons & tisu dapur)
    const total_kebersihan_dapur = kebersihan_dapur;

    // 4. Grand Total Bulanan Dapur & Rumah
    const total_biaya = total_sembako_pokok + total_lauk_protein + total_kebersihan_dapur;
    const biayaHarian = total_biaya / 30;

    // 4 Kartu Ringkasan (Auto-Balanced Layout)
    const summaryCards = [
      {
        title: 'Sembako & Bumbu Pokok',
        value: formatRupiah(total_sembako_pokok),
        note: `Minyak, Telur, Gula, Bumbu & Mie${kondisi_musim > 0 ? ` (+${kondisi_musim}% Musim)` : ''}`,
        icon: 'fa-bottle-droplet',
        type: 'emerald'
      },
      {
        title: 'Lauk Pauk & Protein Segar',
        value: formatRupiah(total_lauk_protein),
        note: `Ayam, Ikan, Tahu/Tempe${waste_factor > 0 ? ` (Cadangan +${waste_factor}%)` : ''}`,
        icon: 'fa-drumstick-bite',
        type: 'amber'
      },
      {
        title: 'Kebersihan Dapur & Lantai',
        value: formatRupiah(total_kebersihan_dapur),
        note: `Cuci Piring, Spons, Pel Lantai & Tisu Dapur`,
        icon: 'fa-spray-can-sparkles',
        type: 'sky'
      },
      {
        title: 'Total Belanja Dapur Bulanan',
        value: formatRupiah(total_biaya),
        note: `± ${formatRupiah(biayaHarian)} / Hari untuk ${jumlah_anggota} Jiwa`,
        icon: 'fa-basket-shopping',
        type: 'violet'
      }
    ];

    // Tabel Primer: Proyeksi Berdasarkan Periode Waktu
    const periods = [
      { label: '1 Minggu (7 Hari)', d: 7 / 30 },
      { label: '1 Bulan (30 Hari)', d: 1 },
      { label: '3 Bulan (90 Hari)', d: 3 },
      { label: '6 Bulan (180 Hari)', d: 6 },
      { label: '1 Tahun (12 Bulan)', d: 12 }
    ];

    const tableHeaders = ['Periode Waktu', 'Sembako Pokok', 'Lauk Pauk Segar', 'Kebersihan Dapur', 'Total Belanja'];
    const tableRows = periods.map(p => {
      const s = Math.round(total_sembako_pokok * p.d);
      const l = Math.round(total_lauk_protein * p.d);
      const c = Math.round(total_kebersihan_dapur * p.d);
      const cost = s + l + c;
      const isCurr = p.d === 1;

      return {
        isCurrent: isCurr,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(s),
          formatRupiah(l),
          formatRupiah(c),
          `<span class="highlight"><strong>${formatRupiah(cost)}</strong></span>`
        ]
      };
    });

    // Tabel Sekunder: Komposisi Belanja Dapur & Distribusi Protein
    const secondaryTable = {
      title: 'Komposisi Belanja Dapur & Distribusi Protein',
      subtitle: `Rincian alokasi sembako, proporsi protein lauk pauk, cadangan bahan makanan, dan sanitasi dapur (${jumlah_anggota} Jiwa).`,
      headers: [
        'Komponen Belanja',
        'Alokasi Bulanan',
        'Keterangan & Implikasi Rumah Tangga'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            '<strong>Minyak Goreng</strong>',
            formatRupiah(biaya_minyak),
            `${minyak_liter} Liter @ ${formatRupiah(harga_minyak)}/L (Konsumsi memasak/menggoreng)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Telur Ayam</strong>',
            formatRupiah(biaya_telur),
            `${telur_kg} Kg @ ${formatRupiah(harga_telur)}/Kg (Sumber protein harian praktis)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Gula Pasir, Kopi, Teh & Susu</strong>',
            formatRupiah(biaya_gula + biaya_kopi_susu),
            `${gula_kg} Kg Gula (${formatRupiah(biaya_gula)}) + Paket Minuman/Susu (${formatRupiah(biaya_kopi_susu)})`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Bumbu Dapur & Mie Instan</strong>',
            formatRupiah(biaya_bumbu + biaya_mie),
            `Bumbu, bawang & kecap (${formatRupiah(biaya_bumbu)}) + Mie/olahan kering (${formatRupiah(biaya_mie)})`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Lauk: Ayam & Unggas</strong>',
            formatRupiah(biayaAyam),
            `Porsi ${Math.round(propAyam * 100)}% dari belanja lauk pauk segar`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Lauk: Ikan & Seafood</strong>',
            formatRupiah(biayaIkan),
            `Porsi ${Math.round(propIkan * 100)}% dari belanja lauk pauk segar`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Lauk: Tahu, Tempe & Nabati</strong>',
            formatRupiah(biayaNabati),
            `Porsi ${Math.round(propNabati * 100)}% dari belanja lauk pauk segar`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Lauk: Daging Sapi & Olahan</strong>',
            formatRupiah(biayaDaging),
            `Porsi ${Math.round(propDaging * 100)}% dari belanja lauk pauk segar`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Cadangan Bahan Rusak / Basi</strong>',
            waste_factor > 0 ? formatRupiah(nilai_waste) : 'Rp 0',
            waste_factor > 0 ? `Buffer ${waste_factor}% untuk sayur layu, ikan susut, atau bumbu busuk` : 'Belanja pas tanpa alokasi cadangan bahan basi'
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Kebersihan Dapur & Lantai</strong>',
            formatRupiah(total_kebersihan_dapur),
            `Cairan cuci piring, spons, pembersih lantai/karbol, tisu dapur & plastik sampah (Personal hygiene & deterjen baju di modul Sandang)`
          ]
        }
      ]
    };

    return {
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: [
          'Sembako Kering & Minyak',
          'Ayam & Unggas',
          'Ikan & Seafood',
          'Tahu, Tempe & Nabati',
          'Daging Sapi & Olahan',
          'Kebersihan Dapur & Lantai'
        ],
        datasets: [
          {
            label: 'Alokasi Belanja Dapur & Rumah (Rp)',
            data: [
              Math.round(total_sembako_pokok),
              Math.round(biayaAyam),
              Math.round(biayaIkan),
              Math.round(biayaNabati),
              Math.round(biayaDaging),
              Math.round(total_kebersihan_dapur)
            ],
            backgroundColor: [
              '#10b981', // emerald
              '#f59e0b', // amber
              '#06b6d4', // cyan
              '#84cc16', // lime
              '#ef4444', // red
              '#8b5cf6'  // violet
            ]
          }
        ]
      },
      quickStats: {
        totalQty: `${jumlah_anggota} Jiwa (${formatRupiah(biayaHarian)}/Hari)`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
