/**
 * Modul Kalkulator Pajak & Administrasi Tahunan (Sinking Fund)
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_PAJAK = 'pajak_data';

export const PajakModule = {
  id: 'pajak',
  name: 'Pajak & Administrasi',
  icon: 'fa-landmark-dome',
  badge: 'Module Kewajiban Finansial',
  title: 'Kalkulator Pajak & Administrasi Tahunan',
  subtitle: 'Hitung total Pajak Kendaraan (PKB), PBB Rumah, dan iuran tahunan, lalu konversikan otomatis menjadi alokasi cadangan bulanan (Sinking Fund).',

  defaults: {
    pkb_motor_tahunan: 350000,    // Pajak 1 unit motor
    jumlah_motor: 1,
    pkb_mobil_tahunan: 3000000,   // Pajak 1 unit mobil
    jumlah_mobil: 1,
    pbb_rumah_tahunan: 450000,    // Pajak Bumi & Bangunan
    iuran_lingkungan_bulan: 75000,// Iuran RT/RW/Satpam/Sampah
    admin_kartu_tahunan: 240000,  // Admin kartu bank / keanggotaan tahunan
    hari: 30
  },

  getData: () => {
    return getFromStorage(STORAGE_KEY_PAJAK, { ...PajakModule.defaults });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_PAJAK, data);
  },

  renderForm: (container, onInputChange) => {
    const data = PajakModule.getData();

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Kewajiban Pajak & Iuran Berkala
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Cegah defisit mendadak saat jatuh tempo dengan menyisihkan cicilan sinking fund bulanan.
        </p>
      </div>

      <!-- Section 1: Pajak Kendaraan Bermotor (PKB) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Pajak Kendaraan Bermotor (PKB Tahunan)
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Jumlah Motor</span> <span class="unit">(Unit)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-motorcycle fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="jumlah_motor" class="form-control" min="0" max="10" value="${data.jumlah_motor}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>PKB Motor / Unit</span> <span class="unit">(Rp/Tahun)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="pkb_motor_tahunan" class="form-control" step="25000" value="${data.pkb_motor_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Jumlah Mobil</span> <span class="unit">(Unit)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-car fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="jumlah_mobil" class="form-control" min="0" max="10" value="${data.jumlah_mobil}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>PKB Mobil / Unit</span> <span class="unit">(Rp/Tahun)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-receipt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="pkb_mobil_tahunan" class="form-control" step="250000" value="${data.pkb_mobil_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: PBB & Iuran Warga Lingkungan -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          PBB Properti & Iuran Warga
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>PBB Rumah / Tanah</span> <span class="unit">(Rp/Tahun)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-house-chimney fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="pbb_rumah_tahunan" class="form-control" step="50000" value="${data.pbb_rumah_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Iuran RT/RW/Sampah</span> <span class="unit">(Rp/Bulan)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-users fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="iuran_lingkungan_bulan" class="form-control" step="10000" value="${data.iuran_lingkungan_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Admin Bank / Kartu Tahunan</span> <span class="unit">(Rp/Tahun)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-credit-card fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="admin_kartu_tahunan" class="form-control" step="25000" value="${data.admin_kartu_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
        </div>
      </div>

      <!-- Action: Simpan ke Dashboard Budget Bulanan -->
      <div style="margin-top: 18px; text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 11px;">
          <i class="fa-bookmark fa-solid" style="margin-right: 6px;"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Input listeners
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        PajakModule.saveFormData(container);
        onInputChange();
      });
    });

    // Save to Budget Dashboard Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = PajakModule.getFormInputs(container);
      const res = PajakModule.calculateMonthly(currentInputs);

      BudgetStore.saveBudgetItem('pajak', {
        id: 'pajak',
        name: 'Pajak & Administrasi Tahunan',
        amount: res.total_biaya,
        category: 'Pokok',
        source: 'Kalkulator Pajak (Sinking Fund)'
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Sinking fund bulanan ${formatRupiah(res.total_biaya)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4500);
    });
  },

  saveFormData: (container) => {
    const data = PajakModule.getFormInputs(container);
    PajakModule.saveData(data);
  },

  getFormInputs: (container) => {
    return {
      pkb_motor_tahunan: parseFloat(container.querySelector('#pkb_motor_tahunan')?.value || 350000),
      jumlah_motor: parseInt(container.querySelector('#jumlah_motor')?.value || 1, 10),
      pkb_mobil_tahunan: parseFloat(container.querySelector('#pkb_mobil_tahunan')?.value || 3000000),
      jumlah_mobil: parseInt(container.querySelector('#jumlah_mobil')?.value || 1, 10),
      pbb_rumah_tahunan: parseFloat(container.querySelector('#pbb_rumah_tahunan')?.value || 450000),
      iuran_lingkungan_bulan: parseFloat(container.querySelector('#iuran_lingkungan_bulan')?.value || 75000),
      admin_kartu_tahunan: parseFloat(container.querySelector('#admin_kartu_tahunan')?.value || 240000),
      hari: 30
    };
  },

  calculateMonthly: (inputs) => {
    const res = PajakModule.calculate(inputs);
    return {
      total_biaya: res.internalTotalBiaya || 0
    };
  },

  calculate: (inputs) => {
    const s = { ...PajakModule.defaults, ...inputs };
    const { pkb_motor_tahunan, jumlah_motor, pkb_mobil_tahunan, jumlah_mobil, pbb_rumah_tahunan, iuran_lingkungan_bulan, admin_kartu_tahunan } = s;

    // 1. Akumulasi Total Tahunan (12 Bulan)
    const totalPkbMotorTahun = pkb_motor_tahunan * jumlah_motor;
    const totalPkbMobilTahun = pkb_mobil_tahunan * jumlah_mobil;
    const totalPkbKendaraanTahun = totalPkbMotorTahun + totalPkbMobilTahun;
    const totalPbbTahun = pbb_rumah_tahunan;
    const totalIuranLingkunganTahun = iuran_lingkungan_bulan * 12;
    const totalAdminBankTahun = admin_kartu_tahunan;

    const totalBiayaTahunan = totalPkbKendaraanTahun + totalPbbTahun + totalIuranLingkunganTahun + totalAdminBankTahun;

    // 2. Sinking Fund Bulanan (Dibagi 12)
    const sinkingFundBulanan = totalBiayaTahunan / 12;
    const sinkingPkbBulan = totalPkbKendaraanTahun / 12;
    const sinkingPbbBulan = totalPbbTahun / 12;
    const sinkingIuranBulan = iuran_lingkungan_bulan;
    const sinkingAdminBulan = totalAdminBankTahun / 12;

    // Summary Cards (4 Cards)
    const summaryCards = [
      {
        title: 'Sinking Fund Bulanan',
        value: formatRupiah(sinkingFundBulanan),
        note: `Disisihkan rutin per bulan`,
        icon: 'fa-landmark-dome',
        type: 'emerald'
      },
      {
        title: 'Total Kewajiban 1 Tahun',
        value: formatRupiah(totalBiayaTahunan),
        note: `Akumulasi seluruh pos tahunan`,
        icon: 'fa-calendar-check',
        type: 'sky'
      },
      {
        title: 'Pajak Kendaraan (PKB)',
        value: formatRupiah(totalPkbKendaraanTahun),
        note: `${jumlah_motor} Motor & ${jumlah_mobil} Mobil/Tahun`,
        icon: 'fa-car',
        type: 'amber'
      },
      {
        title: 'PBB & Iuran Warga',
        value: formatRupiah(totalPbbTahun + totalIuranLingkunganTahun),
        note: `PBB (${formatRupiah(totalPbbTahun)}) + RT/RW (${formatRupiah(totalIuranLingkunganTahun)})`,
        icon: 'fa-house-user',
        type: 'emerald'
      }
    ];

    // Primary Breakdown Table
    const tableHeaders = ['Pos Kewajiban', 'Frekuensi', 'Kewajiban 1 Tahun (Rp)', 'Cadangan Bulanan (Sinking Fund)', 'Porsi (%)'];
    const tableRows = [
      {
        isCurrent: false,
        cells: [
          `<strong>🏍️ PKB Motor (${jumlah_motor} Unit)</strong>`,
          `Tahunan`,
          formatRupiah(totalPkbMotorTahun),
          formatRupiah(totalPkbMotorTahun / 12),
          `${totalBiayaTahunan > 0 ? ((totalPkbMotorTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>🚗 PKB Mobil (${jumlah_mobil} Unit)</strong>`,
          `Tahunan`,
          formatRupiah(totalPkbMobilTahun),
          formatRupiah(totalPkbMobilTahun / 12),
          `${totalBiayaTahunan > 0 ? ((totalPkbMobilTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>🏡 PBB Properti Rumah</strong>`,
          `Tahunan`,
          formatRupiah(totalPbbTahun),
          formatRupiah(totalPbbTahun / 12),
          `${totalBiayaTahunan > 0 ? ((totalPbbTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>🏘️ Iuran Warga (RT/RW/Sampah)</strong>`,
          `Bulanan`,
          formatRupiah(totalIuranLingkunganTahun),
          formatRupiah(sinkingIuranBulan),
          `${totalBiayaTahunan > 0 ? ((totalIuranLingkunganTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>💳 Biaya Admin Bank / Kartu</strong>`,
          `Tahunan`,
          formatRupiah(totalAdminBankTahun),
          formatRupiah(totalAdminBankTahun / 12),
          `${totalBiayaTahunan > 0 ? ((totalAdminBankTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: true,
        cells: [
          `<strong>TOTAL SINKING FUND BULANAN</strong>`,
          `-`,
          `<strong>${formatRupiah(totalBiayaTahunan)}</strong>`,
          `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.95rem;">${formatRupiah(sinkingFundBulanan)}</strong>`,
          `<strong>100%</strong>`
        ]
      }
    ];

    // Secondary Table: Proyeksi Jangka Panjang
    const secondaryTable = {
      title: 'Proyeksi Tabungan Sinking Fund Pajak & Administrasi',
      subtitle: 'Akumulasi cadangan biaya pajak agar kas rumah tangga tetap tenang saat tagihan jatuh tempo.',
      headers: [
        'Periode Proyeksi',
        'Durasi Waktu',
        'Cadangan PKB Kendaraan',
        'Cadangan PBB & Lingkungan',
        'Cadangan Admin Bank',
        'Total Akumulasi Sinking Fund'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>Proyeksi 1 Semester</strong>`,
            `6 Bulan (Semester)`,
            formatRupiah(sinkingPkbBulan * 6),
            formatRupiah((sinkingPbbBulan + sinkingIuranBulan) * 6),
            formatRupiah(sinkingAdminBulan * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(sinkingFundBulanan * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>Proyeksi 1 Tahun Penuh</strong>`,
            `12 Bulan (1 Tahun Penuh)`,
            formatRupiah(totalPkbKendaraanTahun),
            formatRupiah(totalPbbTahun + totalIuranLingkunganTahun),
            formatRupiah(totalAdminBankTahun),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(totalBiayaTahunan)}</strong>`
          ]
        }
      ]
    };

    // Chart Komposisi Pajak
    return {
      internalTotalBiaya: sinkingFundBulanan,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: ['PKB Motor', 'PKB Mobil', 'PBB Rumah', 'Iuran Lingkungan', 'Admin Bank/Kartu'],
        datasets: [
          {
            label: 'Alokasi Tahunan (Rp)',
            data: [
              totalPkbMotorTahun,
              totalPkbMobilTahun,
              totalPbbTahun,
              totalIuranLingkunganTahun,
              totalAdminBankTahun
            ],
            backgroundColor: ['#f59e0b', '#ef4444', '#06b6d4', '#10b981', '#6366f1'],
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${jumlah_motor + jumlah_mobil} Kendaraan`,
        totalCost: formatRupiah(sinkingFundBulanan)
      }
    };
  }
};
