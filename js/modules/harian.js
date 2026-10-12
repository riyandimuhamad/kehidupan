/**
 * Modul Kalkulator & Tracker Budget Harian (Daily Allowance & Micro-Savings)
 * Kehidupan App Suite
 * 
 * Parameter Realistis & Bebas Duplikasi:
 * 1. Fokus Uang Saku Personal: Khusus konsumsi makan siang/sarapan luar, kopi/jajan, dan dana taktis receh harian.
 * 2. Tanpa Duplikasi Transport: Biaya BBM/bensin, parkir bulanan, tol, dan tiket transport umum
 *    sudah sepenuhnya dikelola di modul BBM & Transportasi.
 * 3. Pola Hari Kerja vs Hari Libur (Weekend): Membedakan kebutuhan harian saat hari aktif kerja/kuliah dan akhir pekan.
 * 4. Celengan Tabungan Harian: Menyisihkan koin receh Rp 2.000 - Rp 10.000 per hari menjadi tabungan mikro bulanan.
 * 5. Tracking Realistis Hari Ini: Evaluasi target jatah harian vs pengeluaran aktual yang terpakai hari ini.
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_HARIAN = 'kehidupan_harian_data';

const DEFAULT_HARIAN_DATA = {
  pola_hari: 'split',             // 'split' (22 kerja + 8 libur), 'penuh' (30 hari sama), 'kerja_saja' (22 hari)
  hari_kerja: 22,
  hari_libur: 8,
  makan_siang: 20000,             // Makan siang / sarapan kantor/luar
  jajan_kopi: 10000,              // Kopi, es teh, camilan, jajan santai
  dana_taktis: 5000,              // Dana taktis / uang receh keperluan kecil harian
  budget_hari_libur: 25000,       // Pengeluaran jajan/santai hari libur akhir pekan
  tabungan_harian: 5000,          // Celengan / sisihan koin tabungan per hari
  aktual_hari_ini: 30000          // Realisasi pengeluaran terpakai hari ini
};

export const HarianModule = {
  id: 'harian',
  name: 'Budget Harian',
  icon: 'fa-wallet',
  badge: 'Module Uang Harian',
  title: 'Kalkulator & Tracker Budget Harian',
  subtitle: 'Estimasi alokasi uang saku harian, konsumsi makan siang, dana taktis, dan celengan tabungan receh.',

  defaults: DEFAULT_HARIAN_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_HARIAN, { ...DEFAULT_HARIAN_DATA });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_HARIAN, data);
  },

  renderForm: (container, onInputChange) => {
    const data = HarianModule.getData();

    container.innerHTML = `
      <!-- Section 1: Pola Hari Aktivitas -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Pola Hari & Jadwal Aktivitas
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="pola_hari">Distribusi Hari dalam Sebulan</label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon"></i>
            <select id="pola_hari" class="form-control">
              <option value="split" ${data.pola_hari === 'split' ? 'selected' : ''}>Pemisahan Hari Kerja & Hari Libur (Rekomendasi)</option>
              <option value="penuh" ${data.pola_hari === 'penuh' ? 'selected' : ''}>Penuh 30 Hari Sama Rata</option>
              <option value="kerja_saja" ${data.pola_hari === 'kerja_saja' ? 'selected' : ''}>Hari Kerja Saja (22 Hari Aktif)</option>
            </select>
          </div>
        </div>

        <div id="wrapper_hari_split" style="display: ${data.pola_hari === 'split' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 0;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="hari_kerja">Hari Kerja <span class="unit">(Hari)</span></label>
            <div class="input-wrapper">
              <i class="fa-briefcase fa-solid input-icon"></i>
              <input type="number" id="hari_kerja" class="form-control" min="1" max="31" value="${data.hari_kerja}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label for="hari_libur">Hari Libur <span class="unit">(Hari)</span></label>
            <div class="input-wrapper">
              <i class="fa-mug-saucer fa-solid input-icon"></i>
              <input type="number" id="hari_libur" class="form-control" min="0" max="31" value="${data.hari_libur}">
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Pos Pengeluaran Hari Kerja / Utama -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Alokasi Pengeluaran Harian (Hari Aktif)
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="makan_siang">Makan Siang & Sarapan Luar <span class="unit">(Rp/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-utensils fa-solid input-icon"></i>
            <input type="number" id="makan_siang" class="form-control" step="1000" min="0" value="${data.makan_siang}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.makan_siang === 15000 ? 'active' : ''}" data-target="makan_siang" data-val="15000">Rp 15k</button>
            <button type="button" class="option-chip ${data.makan_siang === 20000 ? 'active' : ''}" data-target="makan_siang" data-val="20000">Rp 20k (Warteg)</button>
            <button type="button" class="option-chip ${data.makan_siang === 35000 ? 'active' : ''}" data-target="makan_siang" data-val="35000">Rp 35k (Resto)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="jajan_kopi">Kopi, Camilan & Jajan <span class="unit">(Rp/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-mug-hot fa-solid input-icon"></i>
            <input type="number" id="jajan_kopi" class="form-control" step="1000" min="0" value="${data.jajan_kopi}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.jajan_kopi === 5000 ? 'active' : ''}" data-target="jajan_kopi" data-val="5000">Rp 5k (Es Teh)</button>
            <button type="button" class="option-chip ${data.jajan_kopi === 10000 ? 'active' : ''}" data-target="jajan_kopi" data-val="10000">Rp 10k (Kopi)</button>
            <button type="button" class="option-chip ${data.jajan_kopi === 20000 ? 'active' : ''}" data-target="jajan_kopi" data-val="20000">Rp 20k (Kafe)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="dana_taktis">Dana Taktis / Receh Harian <span class="unit">(Rp/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-coins fa-solid input-icon"></i>
            <input type="number" id="dana_taktis" class="form-control" step="1000" min="0" value="${data.dana_taktis}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.dana_taktis === 0 ? 'active' : ''}" data-target="dana_taktis" data-val="0">Rp 0</button>
            <button type="button" class="option-chip ${data.dana_taktis === 2000 ? 'active' : ''}" data-target="dana_taktis" data-val="2000">Rp 2k</button>
            <button type="button" class="option-chip ${data.dana_taktis === 5000 ? 'active' : ''}" data-target="dana_taktis" data-val="5000">Rp 5k (Standar)</button>
            <button type="button" class="option-chip ${data.dana_taktis === 10000 ? 'active' : ''}" data-target="dana_taktis" data-val="10000">Rp 10k</button>
          </div>
        </div>
      </div>

      <!-- Section 3: Budget Hari Libur & Tabungan Celengan -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Hari Libur & Celengan Harian
          </span>
        </div>

        <div id="wrapper_budget_libur" class="form-group" style="margin-bottom: 12px; display: ${data.pola_hari === 'split' ? 'block' : 'none'};">
          <label for="budget_hari_libur">Jatah Uang Santai Hari Libur / Weekend <span class="unit">(Rp/Hari Libur)</span></label>
          <div class="input-wrapper">
            <i class="fa-couch fa-solid input-icon"></i>
            <input type="number" id="budget_hari_libur" class="form-control" step="5000" min="0" value="${data.budget_hari_libur}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.budget_hari_libur === 15000 ? 'active' : ''}" data-target="budget_hari_libur" data-val="15000">Rp 15k</button>
            <button type="button" class="option-chip ${data.budget_hari_libur === 25000 ? 'active' : ''}" data-target="budget_hari_libur" data-val="25000">Rp 25k (Standar)</button>
            <button type="button" class="option-chip ${data.budget_hari_libur === 50000 ? 'active' : ''}" data-target="budget_hari_libur" data-val="50000">Rp 50k (Santai)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="tabungan_harian">Celengan / Tabungan Receh Harian <span class="unit">(Rp/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-piggy-bank fa-solid input-icon"></i>
            <input type="number" id="tabungan_harian" class="form-control" step="1000" min="0" value="${data.tabungan_harian}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.tabungan_harian === 0 ? 'active' : ''}" data-target="tabungan_harian" data-val="0">Rp 0</button>
            <button type="button" class="option-chip ${data.tabungan_harian === 2000 ? 'active' : ''}" data-target="tabungan_harian" data-val="2000">Rp 2k</button>
            <button type="button" class="option-chip ${data.tabungan_harian === 5000 ? 'active' : ''}" data-target="tabungan_harian" data-val="5000">Rp 5k (Koin)</button>
            <button type="button" class="option-chip ${data.tabungan_harian === 10000 ? 'active' : ''}" data-target="tabungan_harian" data-val="10000">Rp 10k</button>
          </div>
        </div>
      </div>

      <!-- Section 4: Evaluasi Realisasi Hari Ini -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Tracking Realisasi Hari Ini
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="aktual_hari_ini">Pengeluaran Riil Terpakai Hari Ini <span class="unit">(Rupiah)</span></label>
          <div class="input-wrapper">
            <i class="fa-receipt fa-solid input-icon"></i>
            <input type="number" id="aktual_hari_ini" class="form-control" step="1000" min="0" value="${data.aktual_hari_ini}">
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

    // Dynamic UI toggling when pola_hari changes
    const polaSelect = container.querySelector('#pola_hari');
    const splitWrapper = container.querySelector('#wrapper_hari_split');
    const liburWrapper = container.querySelector('#wrapper_budget_libur');

    polaSelect.addEventListener('change', () => {
      const mode = polaSelect.value;
      if (mode === 'split') {
        if (splitWrapper) splitWrapper.style.display = 'grid';
        if (liburWrapper) liburWrapper.style.display = 'block';
      } else {
        if (splitWrapper) splitWrapper.style.display = 'none';
        if (liburWrapper) liburWrapper.style.display = 'none';
      }
      HarianModule.saveCurrentData(container);
      onInputChange();
    });

    // Event listeners
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        HarianModule.saveCurrentData(container);
        onInputChange();
      });
      input.addEventListener('change', () => {
        HarianModule.saveCurrentData(container);
        onInputChange();
      });
    });

    // Chips
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
          HarianModule.saveCurrentData(container);
          onInputChange();
        }
      });
    });

    // Save to BudgetStore Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = HarianModule.getFormInputs(container);
      const res = HarianModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('harian', {
        id: 'harian',
        name: 'Budget Harian / Uang Saku',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Jatah Harian & Tabungan Receh (${res.quickStats.hariAktif} Hari)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  saveCurrentData: (container) => {
    const inputs = HarianModule.getFormInputs(container);
    HarianModule.saveData(inputs);
  },

  getFormInputs: (container) => {
    return {
      pola_hari: container.querySelector('#pola_hari')?.value || 'split',
      hari_kerja: parseInt(container.querySelector('#hari_kerja')?.value || '22', 10),
      hari_libur: parseInt(container.querySelector('#hari_libur')?.value || '8', 10),
      makan_siang: parseFloat(container.querySelector('#makan_siang')?.value || '0'),
      jajan_kopi: parseFloat(container.querySelector('#jajan_kopi')?.value || '0'),
      dana_taktis: parseFloat(container.querySelector('#dana_taktis')?.value || '0'),
      budget_hari_libur: parseFloat(container.querySelector('#budget_hari_libur')?.value || '0'),
      tabungan_harian: parseFloat(container.querySelector('#tabungan_harian')?.value || '0'),
      aktual_hari_ini: parseFloat(container.querySelector('#aktual_hari_ini')?.value || '0')
    };
  },

  calculate: (inputs) => {
    const {
      pola_hari,
      hari_kerja, hari_libur,
      makan_siang, jajan_kopi, dana_taktis,
      budget_hari_libur, tabungan_harian, aktual_hari_ini
    } = inputs;

    // 1. Hitung jatah per hari kerja (operasional)
    const jatah_harian_kerja = makan_siang + jajan_kopi + dana_taktis;
    const jatah_total_kerja_dengan_tabungan = jatah_harian_kerja + tabungan_harian;

    // 2. Tentukan jumlah hari berdasarkan mode
    let countHariKerja = 22;
    let countHariLibur = 8;
    let totalHariSebulan = 30;

    if (pola_hari === 'split') {
      countHariKerja = hari_kerja;
      countHariLibur = hari_libur;
      totalHariSebulan = countHariKerja + countHariLibur;
    } else if (pola_hari === 'penuh') {
      countHariKerja = 30;
      countHariLibur = 0;
      totalHariSebulan = 30;
    } else if (pola_hari === 'kerja_saja') {
      countHariKerja = hari_kerja;
      countHariLibur = 0;
      totalHariSebulan = countHariKerja;
    }

    // 3. Akumulasi Biaya Bulanan
    const total_makan_bulan = makan_siang * countHariKerja;
    const total_jajan_bulan = jajan_kopi * countHariKerja;
    const total_taktis_bulan = dana_taktis * countHariKerja;
    const total_operasional_kerja = total_makan_bulan + total_jajan_bulan + total_taktis_bulan;

    const total_libur_bulan = pola_hari === 'split' ? budget_hari_libur * countHariLibur : 0;
    const total_tabungan_bulan = tabungan_harian * totalHariSebulan;

    const total_biaya = total_operasional_kerja + total_libur_bulan + total_tabungan_bulan;
    const rataRataPerHari = totalHariSebulan > 0 ? total_biaya / totalHariSebulan : 0;

    // 4. Evaluasi Hari Ini
    const targetHariIni = jatah_total_kerja_dengan_tabungan;
    const selisihHariIni = targetHariIni - aktual_hari_ini;
    const isSurplusHariIni = selisihHariIni >= 0;

    // 4 Kartu Ringkasan (Auto-Balanced Layout)
    const summaryCards = [
      {
        title: 'Total Budget Harian Bulanan',
        value: formatRupiah(total_biaya),
        note: `± ${formatRupiah(rataRataPerHari)} / Hari (${totalHariSebulan} Hari Aktivitas)`,
        icon: 'fa-wallet',
        type: 'emerald'
      },
      {
        title: 'Alokasi Makan & Jajan',
        value: formatRupiah(total_makan_bulan + total_jajan_bulan),
        note: `@ ${formatRupiah(makan_siang + jajan_kopi)} / Hari Kerja`,
        icon: 'fa-utensils',
        type: 'amber'
      },
      {
        title: 'Dana Taktis & Receh Harian',
        value: formatRupiah(total_taktis_bulan),
        note: `@ ${formatRupiah(dana_taktis)} / Hari (${countHariKerja} Hari Kerja)`,
        icon: 'fa-coins',
        type: 'sky'
      },
      {
        title: 'Celengan Tabungan Harian',
        value: formatRupiah(total_tabungan_bulan),
        note: `Sisihan ${formatRupiah(tabungan_harian)} / Hari x ${totalHariSebulan} Hari`,
        icon: 'fa-piggy-bank',
        type: 'violet'
      }
    ];

    // Tabel Primer: Proyeksi Berdasarkan Periode Waktu
    const periods = [
      { label: '1 Hari Kerja', dKerja: 1, dLibur: 0 },
      { label: '1 Minggu (5 Kerja + 2 Libur)', dKerja: 5, dLibur: 2 },
      { label: `1 Bulan (${totalHariSebulan} Hari)`, dKerja: countHariKerja, dLibur: countHariLibur, isCurrent: true },
      { label: '3 Bulan (Kuartal)', dKerja: countHariKerja * 3, dLibur: countHariLibur * 3 },
      { label: '1 Tahun (12 Bulan)', dKerja: countHariKerja * 12, dLibur: countHariLibur * 12 }
    ];

    const tableHeaders = ['Periode Waktu', 'Makan Siang', 'Kopi & Jajan', 'Dana Taktis', 'Uang Libur', 'Celengan Tabungan', 'Total Budget'];
    const tableRows = periods.map(p => {
      const m = makan_siang * p.dKerja;
      const j = jajan_kopi * p.dKerja;
      const t = dana_taktis * p.dKerja;
      const l = pola_hari === 'split' ? budget_hari_libur * p.dLibur : 0;
      const tab = tabungan_harian * (p.dKerja + p.dLibur);
      const total = m + j + t + l + tab;

      return {
        isCurrent: !!p.isCurrent,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(m),
          formatRupiah(j),
          formatRupiah(t),
          l > 0 ? formatRupiah(l) : '-',
          formatRupiah(tab),
          `<span class="highlight"><strong>${formatRupiah(total)}</strong></span>`
        ]
      };
    });

    // Tabel Sekunder: Komposisi Alokasi Uang Saku & Tabungan Harian
    const secondaryTable = {
      title: 'Komposisi Alokasi Uang Saku & Tabungan Harian',
      subtitle: `Rincian alokasi biaya per hari kerja, hari libur, dan akumulasi celengan tabungan receh bulanan.`,
      headers: [
        'Komponen Pengeluaran Harian',
        'Jatah Harian',
        'Akumulasi Sebulan',
        'Keterangan & Kebiasaan Nyata'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            '<strong>Makan Siang & Sarapan</strong>',
            formatRupiah(makan_siang),
            formatRupiah(total_makan_bulan),
            `Makan siang kantor / warteg / sarapan luar (${countHariKerja} Hari Kerja)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Kopi, Es Teh & Jajan</strong>',
            formatRupiah(jajan_kopi),
            formatRupiah(total_jajan_bulan),
            `Minuman harian, camilan sore, atau jajan santai (${countHariKerja} Hari Kerja)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Dana Taktis & Keperluan Receh</strong>',
            formatRupiah(dana_taktis),
            formatRupiah(total_taktis_bulan),
            `Uang receh tak terduga harian (tips, fotokopi, toilet umum, atau sumbangan kecil)`
          ]
        },
        ...(pola_hari === 'split' ? [
          {
            isCurrent: false,
            cells: [
              '<strong>Jatah Santai Hari Libur</strong>',
              formatRupiah(budget_hari_libur),
              formatRupiah(total_libur_bulan),
              `Uang jajan santai/keluar rumah akhir pekan (${countHariLibur} Hari Libur)`
            ]
          }
        ] : []),
        {
          isCurrent: false,
          cells: [
            '<strong>Celengan Tabungan Receh</strong>',
            formatRupiah(tabungan_harian),
            formatRupiah(total_tabungan_bulan),
            `Disisihkan setiap hari sebagai dana cadangan mikro / tabungan koin`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Evaluasi Realisasi Hari Ini</strong>',
            formatRupiah(aktual_hari_ini),
            `<span style="color: ${isSurplusHariIni ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 700;">${isSurplusHariIni ? `Surplus +${formatRupiah(selisihHariIni)}` : `Overbudget -${formatRupiah(Math.abs(selisihHariIni))}`}</span>`,
            `Target harian ${formatRupiah(targetHariIni)} vs terpakai ${formatRupiah(aktual_hari_ini)}`
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
          'Makan Siang',
          'Kopi & Jajan',
          'Dana Taktis Harian',
          ...(pola_hari === 'split' ? ['Hari Libur'] : []),
          'Celengan Tabungan'
        ],
        datasets: [
          {
            label: 'Alokasi Pengeluaran Bulanan (Rp)',
            data: [
              Math.round(total_makan_bulan),
              Math.round(total_jajan_bulan),
              Math.round(total_taktis_bulan),
              ...(pola_hari === 'split' ? [Math.round(total_libur_bulan)] : []),
              Math.round(total_tabungan_bulan)
            ],
            backgroundColor: [
              '#10b981', // emerald
              '#f59e0b', // amber
              '#06b6d4', // cyan
              ...(pola_hari === 'split' ? ['#ec4899'] : []), // pink
              '#8b5cf6'  // violet
            ]
          }
        ]
      },
      quickStats: {
        hariAktif: totalHariSebulan,
        totalQty: `${totalHariSebulan} Hari (${formatRupiah(rataRataPerHari)}/Hari)`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
