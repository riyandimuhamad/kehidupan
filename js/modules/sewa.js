/**
 * Modul Kalkulator Hunian & Tempat Tinggal (Sewa, Kos, Kontrakan, KPR, Rumah Sendiri)
 * Kehidupan App Suite
 * 
 * Parameter Realistis & Bebas Duplikasi:
 * 1. Tipe Tempat Tinggal & Siklus Pembayaran: Kos, Kontrakan, KPR, Rumah Pribadi (Siklus Bulanan vs Tahunan).
 * 2. Sistem Patungan (Sharing Cost): Pembagian beban sewa jika tinggal bersama teman/keluarga (50:50, 33%, 25%).
 * 3. Biaya Awal / Deposit Jaminan: Uang jaminan sewa (deposit kerusakan/kunci) yang disiapkan di awal.
 * 4. Cadangan Perawatan & Pemeliharaan Rumah: Sinking fund servis AC, cat, genteng, pompa, dan perbaikan berkala.
 * 5. Status Utilitas Terkait: Opsi paket sewa All-In (listrik/air termasuk) vs bayar terpisah di modul masing-masing.
 * 6. Kenaikan Sewa Tahunan: Proyeksi inflasi biaya sewa saat perpanjangan tahun berikutnya (+0%, +5%, +10%).
 * 7. Bebas Duplikasi PBB: Pajak Bumi & Bangunan tetap dikelola terpusat di Modul Pajak & Administrasi.
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_SEWA = 'kehidupan_sewa_data';

const DEFAULT_SEWA_DATA = {
  tipe_hunian: 'kontrakan',        // 'kos', 'kontrakan', 'kpr', 'sendiri'
  siklus_bayar: 'bulanan',          // 'bulanan', 'tahunan'
  biaya_nominal: 1500000,          // Nominal sewa/KPR sesuai siklus
  jumlah_sharing: 1,               // 1 (Sendiri), 2 (50:50), 3, 4 orang
  deposit_awal: 500000,            // Uang jaminan / DP awal (satu kali)
  iuran_ipl: 50000,                // Iuran sampah/keamanan/RT per bulan
  biaya_perawatan: 100000,         // Sinking fund perawatan/servis rumah per bulan
  status_utilitas: 'pisah',        // 'pisah' (bayar mandiri di modul listrik/air), 'all_in' (sudah termasuk)
  kenaikan_tahunan_persen: 5       // 0%, 5%, 10% inflasi sewa
};

export const SewaModule = {
  id: 'sewa',
  name: 'Hunian & Tempat Tinggal',
  icon: 'fa-house-user',
  badge: 'Module Tempat Tinggal',
  title: 'Kalkulator Hunian & Tempat Tinggal',
  subtitle: 'Estimasi biaya tempat tinggal (sewa kos, kontrakan, KPR, rumah sendiri), iuran IPL, perawatan, dan sistem patungan.',

  defaults: DEFAULT_SEWA_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_SEWA, { ...DEFAULT_SEWA_DATA });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_SEWA, data);
  },

  renderForm: (container, onInputChange) => {
    const data = SewaModule.getData();

    container.innerHTML = `
      <!-- Section 1: Tipe Hunian & Siklus Pembayaran -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Tipe Tempat Tinggal & Siklus Sewa
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="tipe_hunian">Tipe Tempat Tinggal</label>
          <div class="input-wrapper">
            <i class="fa-building-user fa-solid input-icon"></i>
            <select id="tipe_hunian" class="form-control">
              <option value="kos" ${data.tipe_hunian === 'kos' ? 'selected' : ''}>Kamar Kos / Co-Living</option>
              <option value="kontrakan" ${data.tipe_hunian === 'kontrakan' ? 'selected' : ''}>Rumah Kontrakan / Paviliun</option>
              <option value="kpr" ${data.tipe_hunian === 'kpr' ? 'selected' : ''}>Cicilan KPR / Apartemen</option>
              <option value="sendiri" ${data.tipe_hunian === 'sendiri' ? 'selected' : ''}>Rumah Sendiri (Lunas / Bebas Sewa)</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="siklus_bayar">Siklus Bayar</label>
            <div class="input-wrapper">
              <i class="fa-calendar-check fa-solid input-icon"></i>
              <select id="siklus_bayar" class="form-control">
                <option value="bulanan" ${data.siklus_bayar === 'bulanan' ? 'selected' : ''}>Per Bulan</option>
                <option value="tahunan" ${data.siklus_bayar === 'tahunan' ? 'selected' : ''}>Per Tahun</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="biaya_nominal">Nominal Sewa / KPR <span class="unit">(Rp)</span></label>
            <div class="input-wrapper">
              <i class="fa-money-bill-wave fa-solid input-icon"></i>
              <input type="number" id="biaya_nominal" class="form-control" step="50000" min="0" value="${data.biaya_nominal}">
            </div>
          </div>
        </div>

        <div id="sewa_presets_wrapper" class="form-options" style="margin-top: 0;">
          <!-- Dynamically populated or default chips based on tipe_hunian -->
          <button type="button" class="option-chip" data-target="biaya_nominal" data-val="850000">Kos (Rp 850k)</button>
          <button type="button" class="option-chip active" data-target="biaya_nominal" data-val="1500000">Kontrakan (Rp 1.5 Jt)</button>
          <button type="button" class="option-chip" data-target="biaya_nominal" data-val="3000000">KPR (Rp 3.0 Jt)</button>
          <button type="button" class="option-chip" data-target="biaya_nominal" data-val="18000000">Tahunan (Rp 18 Jt)</button>
        </div>
      </div>

      <!-- Section 2: Sistem Patungan & Uang Jaminan / Deposit -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Sistem Patungan & Uang Jaminan (Deposit)
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="jumlah_sharing">Patungan Biaya Sewa (Sharing Cost) <span class="unit">(Orang)</span></label>
          <div class="input-wrapper">
            <i class="fa-users fa-solid input-icon"></i>
            <input type="number" id="jumlah_sharing" class="form-control" min="1" max="10" value="${data.jumlah_sharing}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.jumlah_sharing === 1 ? 'active' : ''}" data-target="jumlah_sharing" data-val="1">1 Orang (Sendiri)</button>
            <button type="button" class="option-chip ${data.jumlah_sharing === 2 ? 'active' : ''}" data-target="jumlah_sharing" data-val="2">2 Orang (50:50)</button>
            <button type="button" class="option-chip ${data.jumlah_sharing === 3 ? 'active' : ''}" data-target="jumlah_sharing" data-val="3">3 Orang</button>
            <button type="button" class="option-chip ${data.jumlah_sharing === 4 ? 'active' : ''}" data-target="jumlah_sharing" data-val="4">4 Orang</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="deposit_awal">Uang Jaminan / Deposit Awal Sewa <span class="unit">(Satu Kali)</span></label>
          <div class="input-wrapper">
            <i class="fa-vault fa-solid input-icon"></i>
            <input type="number" id="deposit_awal" class="form-control" step="100000" min="0" value="${data.deposit_awal}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.deposit_awal === 0 ? 'active' : ''}" data-target="deposit_awal" data-val="0">Rp 0 (Tanpa Deposit)</button>
            <button type="button" class="option-chip ${data.deposit_awal === 500000 ? 'active' : ''}" data-target="deposit_awal" data-val="500000">Rp 500k</button>
            <button type="button" class="option-chip ${data.deposit_awal === 1000000 ? 'active' : ''}" data-target="deposit_awal" data-val="1000000">Rp 1.0 Jt</button>
            <button type="button" class="option-chip ${data.deposit_awal === 2000000 ? 'active' : ''}" data-target="deposit_awal" data-val="2000000">Rp 2.0 Jt</button>
          </div>
        </div>
      </div>

      <!-- Section 3: Iuran Lingkungan & Cadangan Perawatan Rumah -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Iuran Lingkungan & Perawatan Rumah
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="iuran_ipl">Iuran Kebersihan, Keamanan & RT/RW (IPL) <span class="unit">(Rp/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-shield-halved fa-solid input-icon"></i>
            <input type="number" id="iuran_ipl" class="form-control" step="5000" min="0" value="${data.iuran_ipl}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.iuran_ipl === 25000 ? 'active' : ''}" data-target="iuran_ipl" data-val="25000">Rp 25k (Kos/RT)</button>
            <button type="button" class="option-chip ${data.iuran_ipl === 50000 ? 'active' : ''}" data-target="iuran_ipl" data-val="50000">Rp 50k (Standar)</button>
            <button type="button" class="option-chip ${data.iuran_ipl === 150000 ? 'active' : ''}" data-target="iuran_ipl" data-val="150000">Rp 150k (Cluster)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="biaya_perawatan">Cadangan Perawatan Rumah (Maintenance) <span class="unit">(Rp/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-screwdriver-wrench fa-solid input-icon"></i>
            <input type="number" id="biaya_perawatan" class="form-control" step="10000" min="0" value="${data.biaya_perawatan}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.biaya_perawatan === 0 ? 'active' : ''}" data-target="biaya_perawatan" data-val="0">Rp 0</button>
            <button type="button" class="option-chip ${data.biaya_perawatan === 50000 ? 'active' : ''}" data-target="biaya_perawatan" data-val="50000">Rp 50k (Ringan)</button>
            <button type="button" class="option-chip ${data.biaya_perawatan === 100000 ? 'active' : ''}" data-target="biaya_perawatan" data-val="100000">Rp 100k (Standar)</button>
            <button type="button" class="option-chip ${data.biaya_perawatan === 250000 ? 'active' : ''}" data-target="biaya_perawatan" data-val="250000">Rp 250k (AC/Lengkap)</button>
          </div>
        </div>
      </div>

      <!-- Section 4: Status Utilitas & Estimasi Kenaikan Sewa -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Status Utilitas & Kenaikan Tahunan
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="status_utilitas">Status Listrik & Air</label>
            <div class="input-wrapper">
              <i class="fa-bolt fa-solid input-icon"></i>
              <select id="status_utilitas" class="form-control">
                <option value="pisah" ${data.status_utilitas === 'pisah' ? 'selected' : ''}>Pisah (Bayar Mandiri)</option>
                <option value="all_in" ${data.status_utilitas === 'all_in' ? 'selected' : ''}>Paket All-In (Termasuk)</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="kenaikan_tahunan_persen">Kenaikan Sewa / Thn <span class="unit">(%)</span></label>
            <div class="input-wrapper">
              <i class="fa-arrow-trend-up fa-solid input-icon"></i>
              <select id="kenaikan_tahunan_persen" class="form-control">
                <option value="0" ${data.kenaikan_tahunan_persen === 0 ? 'selected' : ''}>0% (Harga Tetap)</option>
                <option value="5" ${data.kenaikan_tahunan_persen === 5 ? 'selected' : ''}>5% (Standar Wajar)</option>
                <option value="10" ${data.kenaikan_tahunan_persen === 10 ? 'selected' : ''}>10% (Area Favorit)</option>
              </select>
            </div>
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

    // Dynamic adjustment when tipe_hunian changes
    const tipeSelect = container.querySelector('#tipe_hunian');
    const nominalInput = container.querySelector('#biaya_nominal');
    const siklusSelect = container.querySelector('#siklus_bayar');

    tipeSelect.addEventListener('change', () => {
      const val = tipeSelect.value;
      if (val === 'kos') {
        if (nominalInput) nominalInput.value = '850000';
        if (siklusSelect) siklusSelect.value = 'bulanan';
      } else if (val === 'kontrakan') {
        if (nominalInput) nominalInput.value = '1500000';
        if (siklusSelect) siklusSelect.value = 'bulanan';
      } else if (val === 'kpr') {
        if (nominalInput) nominalInput.value = '3000000';
        if (siklusSelect) siklusSelect.value = 'bulanan';
      } else if (val === 'sendiri') {
        if (nominalInput) nominalInput.value = '0';
      }
      SewaModule.saveCurrentData(container);
      onInputChange();
    });

    // Event listeners for inputs
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        SewaModule.saveCurrentData(container);
        onInputChange();
      });
      input.addEventListener('change', () => {
        SewaModule.saveCurrentData(container);
        onInputChange();
      });
    });

    // Chip buttons
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

          if (targetId === 'biaya_nominal' && parseFloat(val) > 5000000) {
            if (siklusSelect) siklusSelect.value = 'tahunan';
          }

          SewaModule.saveCurrentData(container);
          onInputChange();
        }
      });
    });

    // Save to BudgetStore Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = SewaModule.getFormInputs(container);
      const res = SewaModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      const sharingInfo = currentInputs.jumlah_sharing > 1 ? ` (Patungan ${currentInputs.jumlah_sharing} Orang)` : '';

      BudgetStore.saveBudgetItem('sewa', {
        id: 'sewa',
        name: 'Hunian & Tempat Tinggal',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Tempat Tinggal: ${currentInputs.tipe_hunian.toUpperCase()}${sharingInfo}`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  saveCurrentData: (container) => {
    const inputs = SewaModule.getFormInputs(container);
    SewaModule.saveData(inputs);
  },

  getFormInputs: (container) => {
    return {
      tipe_hunian: container.querySelector('#tipe_hunian')?.value || 'kontrakan',
      siklus_bayar: container.querySelector('#siklus_bayar')?.value || 'bulanan',
      biaya_nominal: parseFloat(container.querySelector('#biaya_nominal')?.value || '0'),
      jumlah_sharing: parseInt(container.querySelector('#jumlah_sharing')?.value || '1', 10),
      deposit_awal: parseFloat(container.querySelector('#deposit_awal')?.value || '0'),
      iuran_ipl: parseFloat(container.querySelector('#iuran_ipl')?.value || '0'),
      biaya_perawatan: parseFloat(container.querySelector('#biaya_perawatan')?.value || '0'),
      status_utilitas: container.querySelector('#status_utilitas')?.value || 'pisah',
      kenaikan_tahunan_persen: parseFloat(container.querySelector('#kenaikan_tahunan_persen')?.value || '5')
    };
  },

  calculate: (inputs) => {
    const {
      tipe_hunian,
      siklus_bayar,
      biaya_nominal,
      jumlah_sharing,
      deposit_awal,
      iuran_ipl,
      biaya_perawatan,
      status_utilitas,
      kenaikan_tahunan_persen
    } = inputs;

    const sharing = Math.max(1, jumlah_sharing);

    // 1. Hitung biaya sewa bruto per bulan (amortisasi jika tahunan)
    const sewa_bruto_bulan = siklus_bayar === 'tahunan' ? (biaya_nominal / 12) : biaya_nominal;

    // 2. Beban sewa dan IPL yang ditanggung pribadi setelah patungan
    const sewa_pribadi_bulan = sewa_bruto_bulan / sharing;
    const ipl_pribadi_bulan = iuran_ipl / sharing;
    const perawatan_bulan = biaya_perawatan;

    // 3. Total beban bulanan reguler untuk budgeting
    const total_biaya = Math.round(sewa_pribadi_bulan + ipl_pribadi_bulan + perawatan_bulan);
    const biayaHarian = total_biaya / 30;

    // Format tipe label
    let tipeLabel = 'Kontrakan';
    if (tipe_hunian === 'kos') tipeLabel = 'Kamar Kos';
    if (tipe_hunian === 'kpr') tipeLabel = 'Cicilan KPR';
    if (tipe_hunian === 'sendiri') tipeLabel = 'Rumah Pribadi';

    // 4 Kartu Ringkasan (Auto-Balanced Layout)
    const summaryCards = [
      {
        title: 'Sewa / KPR (Porsi Pribadi)',
        value: formatRupiah(Math.round(sewa_pribadi_bulan)),
        note: sharing > 1 ? `Patungan ${sharing} Orang (Total ${formatRupiah(Math.round(sewa_bruto_bulan))}/bln)` : `${tipeLabel} (${siklus_bayar === 'tahunan' ? 'Amortisasi Tahunan' : 'Bulanan'})`,
        icon: 'fa-house-user',
        type: 'emerald'
      },
      {
        title: 'Iuran Lingkungan & IPL',
        value: formatRupiah(Math.round(ipl_pribadi_bulan)),
        note: `Keamanan, Sampah & RT/RW${sharing > 1 ? ` (Bagi ${sharing})` : ''}`,
        icon: 'fa-shield-halved',
        type: 'sky'
      },
      {
        title: 'Cadangan Perawatan Rumah',
        value: formatRupiah(perawatan_bulan),
        note: `Maintenance AC, Cat, Pompa & Perbaikan`,
        icon: 'fa-screwdriver-wrench',
        type: 'amber'
      },
      {
        title: 'Total Beban Hunian Bulanan',
        value: formatRupiah(total_biaya),
        note: `± ${formatRupiah(Math.round(biayaHarian))} / Hari siap dianggarkan`,
        icon: 'fa-money-bill-wave',
        type: 'violet'
      }
    ];

    // Faktor kenaikan sewa tahunan
    const multiplierKenaikan = 1 + (kenaikan_tahunan_persen / 100);

    // Tabel Primer: Proyeksi Berdasarkan Periode Waktu
    const periods = [
      { label: '1 Bulan', m: 1, multiplier: 1, isCurrent: true },
      { label: '3 Bulan (Kuartal)', m: 3, multiplier: 1 },
      { label: '6 Bulan (Semester)', m: 6, multiplier: 1 },
      { label: '1 Tahun (12 Bulan)', m: 12, multiplier: 1 },
      { label: `3 Tahun (Est. +${kenaikan_tahunan_persen}%/Thn)`, m: 36, multiplier: (1 + multiplierKenaikan + (multiplierKenaikan * multiplierKenaikan)) / 3 }
    ];

    const tableHeaders = ['Periode Waktu', 'Sewa / KPR (Pribadi)', 'Iuran IPL', 'Perawatan Rumah', 'Total Beban Hunian'];
    const tableRows = periods.map(p => {
      const s = Math.round(sewa_pribadi_bulan * p.m * p.multiplier);
      const i = Math.round(ipl_pribadi_bulan * p.m);
      const r = Math.round(perawatan_bulan * p.m);
      const cost = s + i + r;

      return {
        isCurrent: !!p.isCurrent,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(s),
          formatRupiah(i),
          formatRupiah(r),
          `<span class="highlight"><strong>${formatRupiah(cost)}</strong></span>`
        ]
      };
    });

    // Tabel Sekunder: Komposisi & Struktur Hunian
    const secondaryTable = {
      title: 'Komposisi & Struktur Hunian Rumah Tangga',
      subtitle: 'Rincian pembagian patungan, amortisasi sewa, cadangan perawatan, deposit awal, dan status utilitas.',
      headers: [
        'Komponen Hunian',
        'Alokasi Riil',
        'Keterangan & Implikasi Keuangan'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            '<strong>Tipe & Siklus Pembayaran</strong>',
            `${tipeLabel} (${siklus_bayar === 'tahunan' ? 'Bayar Tahunan' : 'Bayar Bulanan'})`,
            siklus_bayar === 'tahunan' ? `Sewa bruto ${formatRupiah(biaya_nominal)} / tahun diamortisasi menjadi ${formatRupiah(Math.round(sewa_bruto_bulan))} / bulan` : `Pembayaran reguler per bulan sebesar ${formatRupiah(biaya_nominal)}`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Sistem Patungan (Sharing Cost)</strong>',
            sharing > 1 ? `Dibagi ${sharing} Orang (${formatNumber(100 / sharing, 0)}%)` : 'Dibiayai Mandiri (100%)',
            sharing > 1 ? `Beban sewa pribadi menjadi ${formatRupiah(Math.round(sewa_pribadi_bulan))} / bulan (hemat ${formatRupiah(Math.round(sewa_bruto_bulan - sewa_pribadi_bulan))})` : 'Seluruh biaya sewa dan iuran ditanggung sendiri tanpa pembagian beban'
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Uang Jaminan / Deposit Awal</strong>',
            deposit_awal > 0 ? formatRupiah(deposit_awal) : 'Rp 0 (Tanpa Deposit)',
            deposit_awal > 0 ? 'Dana jaminan kunci/kerusakan satu kali di awal sewa (bersifat refundable/dapat kembali)' : 'Bebas uang jaminan di awal sewa'
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Iuran Lingkungan & IPL</strong>',
            formatRupiah(Math.round(ipl_pribadi_bulan)),
            `Iuran kebersihan sampah, keamanan satpam, dan kas RT/RW per bulan`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Cadangan Perawatan Rumah</strong>',
            formatRupiah(perawatan_bulan),
            perawatan_bulan > 0 ? 'Sinking fund bulanan untuk antisipasi servis AC berkala, atap bocor, pompa air, dan perbaikan kecil' : 'Tanpa alokasi dana perbaikan rumah rutin'
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Status Utilitas (Listrik & Air)</strong>',
            status_utilitas === 'all_in' ? 'Paket All-In (Termasuk Sewa)' : 'Pisah (Bayar Mandiri)',
            status_utilitas === 'all_in' ? 'Biaya sewa sudah termasuk pemakaian listrik & air bersih' : 'Pemakaian listrik PLN dan air PAM dihitung terpisah di modul Listrik & Air Bersih'
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Pajak Bumi & Bangunan (PBB)</strong>',
            'Modul Pajak & Administrasi',
            'Kewajiban PBB rumah & tanah dikelola terpusat di menu Pajak agar tidak terhitung ganda di dashboard'
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
          'Sewa / KPR Pribadi',
          'Iuran IPL Lingkungan',
          'Cadangan Perawatan'
        ],
        datasets: [
          {
            label: 'Alokasi Biaya Hunian Bulanan (Rp)',
            data: [
              Math.round(sewa_pribadi_bulan),
              Math.round(ipl_pribadi_bulan),
              Math.round(perawatan_bulan)
            ],
            backgroundColor: [
              '#10b981', // emerald
              '#06b6d4', // sky
              '#f59e0b'  // amber
            ]
          }
        ]
      },
      quickStats: {
        totalQty: `${tipeLabel}${sharing > 1 ? ` (${sharing} org)` : ''}`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
