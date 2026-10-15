/**
 * Modul Kalkulator Uang Saku & Budget Harian (Daily Allowance & Micro-Savings)
 * Kehidupan App Suite
 * 
 * Parameter Simpel, Rasional & Bebas Pusing:
 * 1. Jumlah Hari Aktivitas: Pilihan simpel hari kerja (22 hari) atau full bulan (30 hari).
 * 2. Pos Uang Saku Realistis: Makan siang/sarapan luar, kopi/jajan, dan biaya tak terduga.
 * 3. Tabungan Celengan Harian: Menyisihkan koin receh Rp 2.000 - Rp 10.000 per hari ke celengan pribadi.
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_HARIAN = 'kehidupan_harian_data';

const DEFAULT_HARIAN_DATA = {
  hari_dalam_bulan: 30,           // 22 (Hari Kerja), 26, 30 (Full Bulan)
  makan_siang: 0,                 // Makan siang / sarapan kantor/luar
  jajan_kopi: 0,                  // Kopi, es teh, camilan, jajan santai
  dana_taktis: 0,                 // Biaya tak terduga harian (toilet, fotokopi, tips, admin)
  tabungan_harian: 0              // Tabungan celengan harian (uang disimpan ke celengan)
};

export const HarianModule = {
  id: 'harian',
  name: 'Budget Harian',
  icon: 'fa-wallet',
  badge: 'Module Anggaran Harian',
  title: 'Kalkulator Uang Saku & Budget Harian',
  subtitle: 'Estimasi alokasi uang saku harian, konsumsi makan siang, biaya tak terduga, dan tabungan celengan.',

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
      <!-- Section 1: Jumlah Hari Aktivitas -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Hari Aktivitas dalam Sebulan
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="hari_dalam_bulan">Jumlah Hari Aktivitas <span class="unit">(Hari/Bulan)</span></label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon"></i>
            <input type="number" id="hari_dalam_bulan" class="form-control" min="1" max="31" value="${data.hari_dalam_bulan}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.hari_dalam_bulan === 22 ? 'active' : ''}" data-target="hari_dalam_bulan" data-val="22">Hari Kerja (22 Hari)</button>
            <button type="button" class="option-chip ${data.hari_dalam_bulan === 26 ? 'active' : ''}" data-target="hari_dalam_bulan" data-val="26">Senin-Sabtu (26 Hari)</button>
            <button type="button" class="option-chip ${data.hari_dalam_bulan === 30 ? 'active' : ''}" data-target="hari_dalam_bulan" data-val="30">Full Bulan (30 Hari)</button>
          </div>
        </div>
      </div>

      <!-- Section 2: Pos Pengeluaran Uang Saku Harian -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Alokasi Uang Saku Harian
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
          <label for="dana_taktis">Biaya Tak Terduga (Toilet, Fotokopi, Tips) <span class="unit">(Rp/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-hand-holding-dollar fa-solid input-icon"></i>
            <input type="number" id="dana_taktis" class="form-control" step="1000" min="0" value="${data.dana_taktis}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.dana_taktis === 0 ? 'active' : ''}" data-target="dana_taktis" data-val="0">Rp 0</button>
            <button type="button" class="option-chip ${data.dana_taktis === 2000 ? 'active' : ''}" data-target="dana_taktis" data-val="2000">Rp 2k (Toilet/Print)</button>
            <button type="button" class="option-chip ${data.dana_taktis === 5000 ? 'active' : ''}" data-target="dana_taktis" data-val="5000">Rp 5k (Standar)</button>
            <button type="button" class="option-chip ${data.dana_taktis === 10000 ? 'active' : ''}" data-target="dana_taktis" data-val="10000">Rp 10k (Leluasa)</button>
          </div>
        </div>
      </div>

      <!-- Section 3: Tabungan Celengan Harian -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Tabungan Celengan (Uang Disimpan)
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="tabungan_harian">Tabungan Celengan Harian <span class="unit">(Rp/Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-piggy-bank fa-solid input-icon"></i>
            <input type="number" id="tabungan_harian" class="form-control" step="1000" min="0" value="${data.tabungan_harian}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.tabungan_harian === 0 ? 'active' : ''}" data-target="tabungan_harian" data-val="0">Rp 0 (Tanpa Celengan)</button>
            <button type="button" class="option-chip ${data.tabungan_harian === 2000 ? 'active' : ''}" data-target="tabungan_harian" data-val="2000">Rp 2k</button>
            <button type="button" class="option-chip ${data.tabungan_harian === 5000 ? 'active' : ''}" data-target="tabungan_harian" data-val="5000">Rp 5k (Koin)</button>
            <button type="button" class="option-chip ${data.tabungan_harian === 10000 ? 'active' : ''}" data-target="tabungan_harian" data-val="10000">Rp 10k</button>
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
    const inputs = container.querySelectorAll('input');
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
        source: `Rp ${formatNumber(res.totalPerHari, 0)}/hari x ${currentInputs.hari_dalam_bulan} hari`
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
      hari_dalam_bulan: parseInt(container.querySelector('#hari_dalam_bulan')?.value || '30', 10),
      makan_siang: parseFloat(container.querySelector('#makan_siang')?.value || '0'),
      jajan_kopi: parseFloat(container.querySelector('#jajan_kopi')?.value || '0'),
      dana_taktis: parseFloat(container.querySelector('#dana_taktis')?.value || '0'),
      tabungan_harian: parseFloat(container.querySelector('#tabungan_harian')?.value || '0')
    };
  },

  calculate: (inputs) => {
    const {
      hari_dalam_bulan,
      makan_siang, jajan_kopi, dana_taktis,
      tabungan_harian
    } = inputs;

    const days = Math.max(1, hari_dalam_bulan);

    // Total per hari
    const jatah_makan_jajan_hari = makan_siang + jajan_kopi;
    const jatah_operasional_hari = jatah_makan_jajan_hari + dana_taktis;
    const total_per_hari = jatah_operasional_hari + tabungan_harian;

    // Total bulanan
    const total_makan_bulan = makan_siang * days;
    const total_jajan_bulan = jajan_kopi * days;
    const total_taktis_bulan = dana_taktis * days;
    const total_tabungan_bulan = tabungan_harian * days;
    const total_biaya = total_per_hari * days;

    // 4 Kartu Ringkasan (Auto-Balanced Layout)
    const summaryCards = [
      {
        title: 'Total Budget Harian Bulanan',
        value: formatRupiah(total_biaya),
        note: `@ ${formatRupiah(total_per_hari)} / Hari x ${days} Hari`,
        icon: 'fa-wallet',
        type: 'emerald'
      },
      {
        title: 'Alokasi Makan & Jajan',
        value: formatRupiah(total_makan_bulan + total_jajan_bulan),
        note: `@ ${formatRupiah(jatah_makan_jajan_hari)} / Hari x ${days} Hari`,
        icon: 'fa-utensils',
        type: 'amber'
      },
      {
        title: 'Biaya Tak Terduga Harian',
        value: formatRupiah(total_taktis_bulan),
        note: `Toilet, Fotokopi, Tips (@ ${formatRupiah(dana_taktis)}/Hari)`,
        icon: 'fa-hand-holding-dollar',
        type: 'sky'
      },
      {
        title: 'Tabungan Celengan Harian',
        value: formatRupiah(total_tabungan_bulan),
        note: `Disimpan ke Celengan (${formatRupiah(tabungan_harian)}/Hari x ${days} Hari)`,
        icon: 'fa-piggy-bank',
        type: 'violet'
      }
    ];

    // Tabel Primer: Proyeksi Berdasarkan Periode Waktu
    const periods = [
      { label: '1 Hari', d: 1 },
      { label: '1 Minggu (7 Hari)', d: 7 },
      { label: 'Hari Kerja (22 Hari)', d: 22 },
      { label: `Pilihan (${days} Hari)`, d: days, isCurrent: true },
      { label: '1 Bulan Penuh (30 Hari)', d: 30 },
      { label: '3 Bulan (90 Hari)', d: 90 },
      { label: '1 Tahun (365 Hari)', d: 365 }
    ];

    // Filter unique periods
    const uniquePeriods = [];
    const seenDays = new Set();
    periods.forEach(p => {
      if (!seenDays.has(p.d)) {
        seenDays.add(p.d);
        uniquePeriods.push(p);
      }
    });

    const tableHeaders = ['Periode Waktu', 'Makan Siang', 'Kopi & Jajan', 'Biaya Tak Terduga', 'Tabungan Celengan', 'Total Budget'];
    const tableRows = uniquePeriods.map(p => {
      const m = makan_siang * p.d;
      const j = jajan_kopi * p.d;
      const t = dana_taktis * p.d;
      const tab = tabungan_harian * p.d;
      const total = total_per_hari * p.d;

      return {
        isCurrent: p.d === days,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(m),
          formatRupiah(j),
          formatRupiah(t),
          formatRupiah(tab),
          `<span class="highlight"><strong>${formatRupiah(total)}</strong></span>`
        ]
      };
    });

    // Tabel Sekunder: Komposisi Alokasi Uang Saku & Tabungan Harian
    const secondaryTable = {
      title: 'Komposisi Alokasi Uang Saku & Tabungan Harian',
      subtitle: `Rincian jatah biaya harian dan akumulasinya selama ${days} hari aktivitas per bulan.`,
      headers: [
        'Komponen Pengeluaran Harian',
        'Jatah per Hari',
        `Akumulasi (${days} Hari)`,
        'Keterangan & Kebiasaan Nyata'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            '<strong>Makan Siang & Sarapan</strong>',
            formatRupiah(makan_siang),
            formatRupiah(total_makan_bulan),
            `Makan siang kantor / warteg / sarapan luar harian`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Kopi, Es Teh & Jajan</strong>',
            formatRupiah(jajan_kopi),
            formatRupiah(total_jajan_bulan),
            `Minuman harian, kopi, es teh, camilan sore, atau jajan santai`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Biaya Tak Terduga Harian</strong>',
            formatRupiah(dana_taktis),
            formatRupiah(total_taktis_bulan),
            `Uang keluar tak terduga: bayar toilet umum, fotokopi, tips, atau admin e-wallet`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Tabungan Celengan Harian</strong>',
            formatRupiah(tabungan_harian),
            formatRupiah(total_tabungan_bulan),
            `Uang saku yang disisihkan dan disimpan ke celengan/tabungan pribadi (bukan dibelanjakan)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Total Proyeksi Alokasi Harian</strong>',
            `<strong>${formatRupiah(total_per_hari)} / Hari</strong>`,
            `<strong class="highlight">${formatRupiah(total_biaya)}</strong>`,
            `Total estimasi kebutuhan uang saku (${days} Hari) siap disimpan ke Dashboard Budget`
          ]
        }
      ]
    };

    return {
      total_biaya,
      totalPerHari: total_per_hari,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: [
          'Makan Siang',
          'Kopi & Jajan',
          'Biaya Tak Terduga',
          'Tabungan Celengan'
        ],
        datasets: [
          {
            label: `Alokasi Bulanan (${days} Hari)`,
            data: [
              Math.round(total_makan_bulan),
              Math.round(total_jajan_bulan),
              Math.round(total_taktis_bulan),
              Math.round(total_tabungan_bulan)
            ],
            backgroundColor: [
              '#10b981', // emerald
              '#f59e0b', // amber
              '#06b6d4', // cyan
              '#8b5cf6'  // violet
            ]
          }
        ]
      },
      quickStats: {
        hariAktif: days,
        totalQty: `${days} Hari (${formatRupiah(total_per_hari)}/Hari)`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
