/**
 * Modul Kalkulator Pajak & Administrasi Tahunan (Sinking Fund)
 * Kehidupan App Suite
 * 
 * Catatan: Pajak Kendaraan (PKB Motor & Mobil) telah dikelola secara terpisah 
 * pada modul BBM & Transportasi, sehingga modul ini fokus pada PBB, Iuran Lingkungan,
 * Administrasi Legalitas, dan Pajak Properti.
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
  subtitle: 'Hitung estimasi PBB Properti, iuran lingkungan, dan biaya administrasi tahunan, lalu alokasikan otomatis sebagai cadangan bulanan (Sinking Fund).',

  defaults: {
    pbb_rumah_tahunan: 0,    // Pajak Bumi & Bangunan (PBB) rumah/tanah
    iuran_lingkungan_bulan: 0,// Iuran RT/RW/Satpam/Sampah
    admin_kartu_tahunan: 0,  // Admin kartu bank / keanggotaan tahunan
    legalitas_tahunan: 0,    // Perpanjangan dokumen (Paspor, SIM, legalitas, meterai)
    pph_tahunan: 0,          // Pajak Penghasilan SPT / Kurang Bayar (opsional)
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
          Kewajiban Pajak Properti & Iuran Berkala
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Cegah defisit mendadak saat jatuh tempo dengan menyisihkan cicilan sinking fund bulanan.
        </p>
      </div>

      <!-- Info Banner: Pajak Kendaraan di Modul Transportasi -->
      <div style="margin-bottom: 14px; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 0.74rem; line-height: 1.45; background: rgba(99, 102, 241, 0.08); border-left: 3px solid var(--primary); color: var(--text-main);">
        <i class="fa-circle-info fa-solid" style="color: var(--primary); margin-right: 4px;"></i>
        <strong>Info Terintegrasi:</strong> Pajak Kendaraan Bermotor (PKB Motor & Mobil) dikelola secara spesifik per kendaraan di menu <strong>BBM & Transportasi</strong>.
      </div>

      <!-- Section 1: PBB & Iuran Lingkungan -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          PBB Properti & Iuran Warga Lingkungan
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>PBB Rumah & Tanah</span> <span class="unit">(Rp/Tahun)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-house-chimney fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="pbb_rumah_tahunan" class="form-control" step="50000" value="${data.pbb_rumah_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Iuran RT/RW & Sampah</span> <span class="unit">(Rp/Bulan)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-users fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="iuran_lingkungan_bulan" class="form-control" step="10000" value="${data.iuran_lingkungan_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Administrasi Bank & Dokumen Legalitas -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Administrasi Perbankan & Legalitas Dokumen
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Admin Bank & Kartu</span> <span class="unit">(Rp/Tahun)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-credit-card fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="admin_kartu_tahunan" class="form-control" step="25000" value="${data.admin_kartu_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Dokumen & Legalitas</span> <span class="unit">(Rp/Tahun)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-passport fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="legalitas_tahunan" class="form-control" step="50000" value="${data.legalitas_tahunan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>PPh / SPT Tahunan</span> <span class="unit">(Rp/Tahun - Opsional)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-file-invoice-dollar fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="pph_tahunan" class="form-control" step="50000" value="${data.pph_tahunan}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
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
        name: 'PBB & Administrasi Tahunan',
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
      pbb_rumah_tahunan: parseFloat(container.querySelector('#pbb_rumah_tahunan')?.value || 500000),
      iuran_lingkungan_bulan: parseFloat(container.querySelector('#iuran_lingkungan_bulan')?.value || 100000),
      admin_kartu_tahunan: parseFloat(container.querySelector('#admin_kartu_tahunan')?.value || 240000),
      legalitas_tahunan: parseFloat(container.querySelector('#legalitas_tahunan')?.value || 200000),
      pph_tahunan: parseFloat(container.querySelector('#pph_tahunan')?.value || 0),
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
    const { pbb_rumah_tahunan, iuran_lingkungan_bulan, admin_kartu_tahunan, legalitas_tahunan, pph_tahunan } = s;

    // 1. Akumulasi Total Tahunan (12 Bulan)
    const totalPbbTahun = pbb_rumah_tahunan;
    const totalIuranLingkunganTahun = iuran_lingkungan_bulan * 12;
    const totalAdminBankTahun = admin_kartu_tahunan;
    const totalLegalitasTahun = legalitas_tahunan;
    const totalPphTahun = pph_tahunan;

    const totalBiayaTahunan = totalPbbTahun + totalIuranLingkunganTahun + totalAdminBankTahun + totalLegalitasTahun + totalPphTahun;

    // 2. Sinking Fund Bulanan (Dibagi 12)
    const sinkingFundBulanan = totalBiayaTahunan / 12;
    const sinkingPbbBulan = totalPbbTahun / 12;
    const sinkingIuranBulan = iuran_lingkungan_bulan;
    const sinkingAdminBulan = totalAdminBankTahun / 12;
    const sinkingLegalitasBulan = totalLegalitasTahun / 12;
    const sinkingPphBulan = totalPphTahun / 12;

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
        note: `Akumulasi pos non-kendaraan`,
        icon: 'fa-calendar-check',
        type: 'sky'
      },
      {
        title: 'PBB Properti Rumah',
        value: formatRupiah(totalPbbTahun),
        note: `Pajak Bumi & Bangunan tahunan`,
        icon: 'fa-house-chimney',
        type: 'amber'
      },
      {
        title: 'Iuran Warga & Lingkungan',
        value: formatRupiah(totalIuranLingkunganTahun),
        note: `${formatRupiah(iuran_lingkungan_bulan)}/bulan (RT/RW & Sampah)`,
        icon: 'fa-users',
        type: 'emerald'
      }
    ];

    // Primary Breakdown Table
    const tableHeaders = ['Pos Kewajiban', 'Frekuensi', 'Kewajiban 1 Tahun (Rp)', 'Cadangan Bulanan (Sinking Fund)', 'Porsi (%)'];
    const tableRows = [
      {
        isCurrent: false,
        cells: [
          `<strong>PBB Properti (Rumah & Tanah)</strong>`,
          `Tahunan`,
          formatRupiah(totalPbbTahun),
          formatRupiah(sinkingPbbBulan),
          `${totalBiayaTahunan > 0 ? ((totalPbbTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>Iuran Warga (RT/RW & Kebersihan)</strong>`,
          `Bulanan`,
          formatRupiah(totalIuranLingkunganTahun),
          formatRupiah(sinkingIuranBulan),
          `${totalBiayaTahunan > 0 ? ((totalIuranLingkunganTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>Biaya Admin Bank & Kartu</strong>`,
          `Tahunan`,
          formatRupiah(totalAdminBankTahun),
          formatRupiah(sinkingAdminBulan),
          `${totalBiayaTahunan > 0 ? ((totalAdminBankTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>Dokumen Legalitas & Paspor</strong>`,
          `Tahunan`,
          formatRupiah(totalLegalitasTahun),
          formatRupiah(sinkingLegalitasBulan),
          `${totalBiayaTahunan > 0 ? ((totalLegalitasTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      }
    ];

    if (totalPphTahun > 0) {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>PPh / SPT Tahunan</strong>`,
          `Tahunan`,
          formatRupiah(totalPphTahun),
          formatRupiah(sinkingPphBulan),
          `${totalBiayaTahunan > 0 ? ((totalPphTahun / totalBiayaTahunan) * 100).toFixed(0) : 0}%`
        ]
      });
    }

    tableRows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL SINKING FUND BULANAN</strong>`,
        `-`,
        `<strong>${formatRupiah(totalBiayaTahunan)}</strong>`,
        `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.95rem;">${formatRupiah(sinkingFundBulanan)}</strong>`,
        `<strong>100%</strong>`
      ]
    });

    // Secondary Table: Proyeksi Jangka Panjang
    const secondaryTable = {
      title: 'Proyeksi Tabungan Sinking Fund Pajak & Administrasi',
      subtitle: 'Akumulasi cadangan biaya pajak agar kas rumah tangga tetap tenang saat tagihan jatuh tempo.',
      headers: [
        'Periode Proyeksi',
        'Durasi Waktu',
        'Cadangan PBB Properti',
        'Cadangan Iuran Warga',
        'Cadangan Admin & Dokumen',
        'Total Akumulasi Sinking Fund'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>Proyeksi 1 Semester</strong>`,
            `6 Bulan (Semester)`,
            formatRupiah(sinkingPbbBulan * 6),
            formatRupiah(sinkingIuranBulan * 6),
            formatRupiah((sinkingAdminBulan + sinkingLegalitasBulan) * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(sinkingFundBulanan * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>Proyeksi 1 Tahun Penuh</strong>`,
            `12 Bulan (1 Tahun Penuh)`,
            formatRupiah(totalPbbTahun),
            formatRupiah(totalIuranLingkunganTahun),
            formatRupiah(totalAdminBankTahun + totalLegalitasTahun),
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
        labels: ['PBB Properti', 'Iuran Lingkungan (RT/RW)', 'Admin Bank & Kartu', 'Dokumen Legalitas'],
        datasets: [
          {
            label: 'Alokasi Tahunan (Rp)',
            data: [
              totalPbbTahun,
              totalIuranLingkunganTahun,
              totalAdminBankTahun,
              totalLegalitasTahun
            ],
            backgroundColor: ['#06b6d4', '#10b981', '#6366f1', '#f59e0b'],
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${formatRupiah(sinkingFundBulanan)}/Bln`,
        totalCost: formatRupiah(totalBiayaTahunan)
      }
    };
  }
};
