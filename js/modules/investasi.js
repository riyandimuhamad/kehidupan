/**
 * Modul Kalkulator Tabungan, Investasi & Dana Darurat
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_INVESTASI = 'investasi_data';

export const InvestasiModule = {
  id: 'investasi',
  name: 'Tabungan & Investasi',
  icon: 'fa-vault',
  badge: 'Module Pertumbuhan Kekayaan',
  title: 'Kalkulator Tabungan & Dana Darurat',
  subtitle: 'Rencanakan target dana darurat (3-6x pengeluaran bulanan), tabungan rencana, dan simulasi investasi rutin masa depan.',

  defaults: {
    pengeluaran_bulanan_dasar: 0, // Basis pengeluaran sebulan
    multiplier_darurat: 6,         // Target 3, 6, 9, 12 bulan
    darurat_terkumpul: 0,         // Saldo darurat saat ini
    alokasi_darurat_bulan: 0,     // Sisihan bulanan menuju target
    tabungan_rencana_bulan: 0,    // Tabungan bank/tujuan jangka pendek
    investasi_rutin_bulan: 0,     // Reksa dana, SBN, emas, saham
    estimasi_return_persen: 7,     // 7% p.a rata-rata reksa dana/SBN
    hari: 30
  },

  getData: () => {
    return getFromStorage(STORAGE_KEY_INVESTASI, { ...InvestasiModule.defaults });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_INVESTASI, data);
  },

  renderForm: (container, onInputChange) => {
    const data = InvestasiModule.getData();

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Perencanaan Proteksi Finansial & Aset
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Bangun fondasi dana darurat yang kokoh dan tumbuhkan aset melalui investasi teratur.
        </p>
      </div>

      <!-- Section 1: Target Dana Darurat -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Proteksi Dana Darurat (Emergency Fund)
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Pengeluaran Bulanan</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-money-bill-transfer fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="pengeluaran_bulanan_dasar" class="form-control" step="100000" value="${data.pengeluaran_bulanan_dasar}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Target Durasi Aman</span> <span class="unit">(Bulan)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-shield-halved fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <select id="multiplier_darurat" class="form-control" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                <option value="3" ${data.multiplier_darurat === 3 ? 'selected' : ''}>3 Bulan (Lajang / Single)</option>
                <option value="6" ${data.multiplier_darurat === 6 ? 'selected' : ''}>6 Bulan (Keluarga / Menikah)</option>
                <option value="9" ${data.multiplier_darurat === 9 ? 'selected' : ''}>9 Bulan (Freelancer / Wirausaha)</option>
                <option value="12" ${data.multiplier_darurat === 12 ? 'selected' : ''}>12 Bulan (Maksimal Proteksi)</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Saldo Darurat Saat Ini</span> <span class="unit">(Rp)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-piggy-bank fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="darurat_terkumpul" class="form-control" step="500000" value="${data.darurat_terkumpul}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Sisihan Rutin Darurat</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-hand-holding-dollar fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="alokasi_darurat_bulan" class="form-control" step="100000" value="${data.alokasi_darurat_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Tabungan Rencana & Investasi Rutin -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Tabungan Rencana & Investasi Masa Depan
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Tabungan Rencana Bank</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-landmark fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="tabungan_rencana_bulan" class="form-control" step="50000" value="${data.tabungan_rencana_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Investasi Rutin (DCA)</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-chart-line fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="investasi_rutin_bulan" class="form-control" step="100000" value="${data.investasi_rutin_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Estimasi Imbal Hasil Investasi</span> <span class="unit">(% / Tahun)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-percent fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="estimasi_return_persen" class="form-control" min="1" max="25" step="0.5" value="${data.estimasi_return_persen}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
          <div class="form-options" style="margin-top: 6px;">
            <button type="button" class="option-chip ${data.estimasi_return_persen === 4 ? 'active' : ''}" data-target="estimasi_return_persen" data-val="4">Deposito (4%)</button>
            <button type="button" class="option-chip ${data.estimasi_return_persen === 7 ? 'active' : ''}" data-target="estimasi_return_persen" data-val="7">Reksa Dana / SBN (7%)</button>
            <button type="button" class="option-chip ${data.estimasi_return_persen === 11 ? 'active' : ''}" data-target="estimasi_return_persen" data-val="11">Indeks Saham (11%)</button>
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
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        InvestasiModule.saveFormData(container);
        onInputChange();
      });
    });

    // Option chips listener
    const optionChips = container.querySelectorAll('.option-chip');
    optionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-target');
        const val = chip.getAttribute('data-val');
        const targetInput = container.querySelector(`#${targetId}`);
        if (targetInput) {
          targetInput.value = val;
          container.querySelectorAll(`.option-chip[data-target="${targetId}"]`).forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          InvestasiModule.saveFormData(container);
          onInputChange();
        }
      });
    });

    // Save to Budget Dashboard Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = InvestasiModule.getFormInputs(container);
      const res = InvestasiModule.calculateMonthly(currentInputs);

      BudgetStore.saveBudgetItem('tabungan', {
        id: 'tabungan',
        name: 'Tabungan, Darurat & Investasi',
        amount: res.total_biaya,
        category: 'Tabungan',
        source: 'Kalkulator Investasi & Darurat'
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Alokasi simpanan bulanan ${formatRupiah(res.total_biaya)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4500);
    });
  },

  saveFormData: (container) => {
    const data = InvestasiModule.getFormInputs(container);
    InvestasiModule.saveData(data);
  },

  getFormInputs: (container) => {
    return {
      pengeluaran_bulanan_dasar: parseFloat(container.querySelector('#pengeluaran_bulanan_dasar')?.value || 4500000),
      multiplier_darurat: parseInt(container.querySelector('#multiplier_darurat')?.value || 6, 10),
      darurat_terkumpul: parseFloat(container.querySelector('#darurat_terkumpul')?.value || 5000000),
      alokasi_darurat_bulan: parseFloat(container.querySelector('#alokasi_darurat_bulan')?.value || 500000),
      tabungan_rencana_bulan: parseFloat(container.querySelector('#tabungan_rencana_bulan')?.value || 300000),
      investasi_rutin_bulan: parseFloat(container.querySelector('#investasi_rutin_bulan')?.value || 500000),
      estimasi_return_persen: parseFloat(container.querySelector('#estimasi_return_persen')?.value || 7),
      hari: 30
    };
  },

  calculateMonthly: (inputs) => {
    const res = InvestasiModule.calculate(inputs);
    return {
      total_biaya: res.internalTotalBiaya || 0
    };
  },

  calculate: (inputs) => {
    const s = { ...InvestasiModule.defaults, ...inputs };
    const { pengeluaran_bulanan_dasar, multiplier_darurat, darurat_terkumpul, alokasi_darurat_bulan, tabungan_rencana_bulan, investasi_rutin_bulan, estimasi_return_persen } = s;

    // 1. Analisis Target Dana Darurat
    const targetDanaDarurat = pengeluaran_bulanan_dasar * multiplier_darurat;
    const sisaKebutuhanDarurat = Math.max(0, targetDanaDarurat - darurat_terkumpul);
    const persenDaruratTercapai = targetDanaDarurat > 0 ? Math.min(100, (darurat_terkumpul / targetDanaDarurat) * 100) : 0;
    const estimasiBulanDarurat = alokasi_darurat_bulan > 0 ? Math.ceil(sisaKebutuhanDarurat / alokasi_darurat_bulan) : 0;

    // 2. Total Alokasi Tabungan Bulanan
    const totalSimpananBulanan = alokasi_darurat_bulan + tabungan_rencana_bulan + investasi_rutin_bulan;

    // 3. Proyeksi Pertumbuhan Dana Majemuk (Compound Interest) untuk Investasi Rutin
    // Rumus Future Value anuitas bulanan: FV = PMT * [((1 + r)^n - 1) / r]
    const rBulanan = (estimasi_return_persen / 100) / 12;
    const calcFutureValue = (pmt, months, r) => {
      if (r <= 0) return pmt * months;
      return pmt * ((Math.pow(1 + r, months) - 1) / r);
    };

    // Summary Cards (4 Cards)
    const summaryCards = [
      {
        title: 'Total Alokasi Simpanan',
        value: formatRupiah(totalSimpananBulanan),
        note: `Disisihkan rutin per bulan`,
        icon: 'fa-vault',
        type: 'emerald'
      },
      {
        title: 'Target Dana Darurat',
        value: formatRupiah(targetDanaDarurat),
        note: `${persenDaruratTercapai.toFixed(0)}% Tercapai (${formatRupiah(darurat_terkumpul)})`,
        icon: 'fa-shield-halved',
        type: persenDaruratTercapai >= 100 ? 'emerald' : 'sky'
      },
      {
        title: 'Estimasi Capai Target',
        value: sisaKebutuhanDarurat === 0 ? 'Target Terpenuhi!' : `±${estimasiBulanDarurat} Bulan Lagi`,
        note: sisaKebutuhanDarurat === 0 ? 'Fondasi finansial sangat aman' : `Sisa ${formatRupiah(sisaKebutuhanDarurat)}`,
        icon: 'fa-hourglass-half',
        type: sisaKebutuhanDarurat === 0 ? 'emerald' : 'amber'
      },
      {
        title: 'Investasi Bulanan (DCA)',
        value: formatRupiah(investasi_rutin_bulan),
        note: `Asumsi Return ${estimasi_return_persen}% p.a`,
        icon: 'fa-chart-line',
        type: 'emerald'
      }
    ];

    // Primary Breakdown Table: Komposisi Alokasi Simpanan
    const tableHeaders = ['Instrumen Simpanan', 'Kategori', 'Tujuan Finansial', 'Alokasi Bulanan (Rp)', 'Porsi (%)'];
    const tableRows = [
      {
        isCurrent: false,
        cells: [
          `<strong>🛡️ Alokasi Dana Darurat</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(6,182,212,0.15); color: var(--accent-sky);">Proteksi</span>`,
          `Target ${multiplier_darurat} Bulan (${formatRupiah(targetDanaDarurat)})`,
          formatRupiah(alokasi_darurat_bulan),
          `${totalSimpananBulanan > 0 ? ((alokasi_darurat_bulan / totalSimpananBulanan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>🏦 Tabungan Rencana Bank</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(245,158,11,0.15); color: var(--accent-amber);">Likuid</span>`,
          `Tujuan Jangka Pendek (1-2 Tahun)`,
          formatRupiah(tabungan_rencana_bulan),
          `${totalSimpananBulanan > 0 ? ((tabungan_rencana_bulan / totalSimpananBulanan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>📈 Investasi Rutin (DCA)</strong>`,
          `<span class="badge" style="font-size:0.7rem; padding: 2px 8px; background: rgba(16,185,129,0.15); color: var(--accent-emerald);">Growth</span>`,
          `Pertumbuhan Aset (Reksa Dana/SBN/Emas)`,
          formatRupiah(investasi_rutin_bulan),
          `${totalSimpananBulanan > 0 ? ((investasi_rutin_bulan / totalSimpananBulanan) * 100).toFixed(0) : 0}%`
        ]
      },
      {
        isCurrent: true,
        cells: [
          `<strong>TOTAL ALOKASI SIMPANAN</strong>`,
          `-`,
          `Total Pertumbuhan Aset Bulanan`,
          `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.95rem;">${formatRupiah(totalSimpananBulanan)}</strong>`,
          `<strong>100%</strong>`
        ]
      }
    ];

    // Secondary Table: Proyeksi Akumulasi Aset Masa Depan (Dengan Compound Interest)
    const horizons = [
      { label: 'Proyeksi 6 Bulan', months: 6 },
      { label: 'Proyeksi 1 Tahun (12 Bulan)', months: 12 },
      { label: 'Proyeksi 3 Tahun (36 Bulan)', months: 36 },
      { label: 'Proyeksi 5 Tahun (60 Bulan)', months: 60 }
    ];

    const secondaryTable = {
      title: 'Simulasi Akumulasi & Pertumbuhan Aset Masa Depan',
      subtitle: `Pertumbuhan modal pokok simpanan ditambah potensi imbal hasil investasi (${estimasi_return_persen}% p.a).`,
      headers: [
        'Horison Waktu',
        'Durasi',
        'Total Modal Disimpan (Pokok)',
        'Potensi Imbal Hasil',
        'Total Akumulasi Aset'
      ],
      rows: horizons.map((h, idx) => {
        const modalPokok = totalSimpananBulanan * h.months;
        // Hanya porsi investasi yang mendapat compound return
        const fvInvestasi = calcFutureValue(investasi_rutin_bulan, h.months, rBulanan);
        const modalInvestasi = investasi_rutin_bulan * h.months;
        const imbalHasil = Math.max(0, fvInvestasi - modalInvestasi);
        const totalAset = modalPokok + imbalHasil;

        return {
          isCurrent: idx === 1 || idx === 3,
          cells: [
            `<strong>${h.label}</strong>`,
            `${h.months} Bulan`,
            formatRupiah(modalPokok),
            `<span style="color: var(--accent-emerald); font-weight: 600;">+${formatRupiah(imbalHasil)}</span>`,
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(totalAset)}</strong>`
          ]
        };
      })
    };

    // Chart: Multi-Year Asset Accumulation
    const chartLabels = ['6 Bulan', '1 Tahun', '3 Tahun', '5 Tahun'];
    const chartPokok = horizons.map(h => totalSimpananBulanan * h.months);
    const chartTotal = horizons.map(h => {
      const modalPokok = totalSimpananBulanan * h.months;
      const fvInvestasi = calcFutureValue(investasi_rutin_bulan, h.months, rBulanan);
      const modalInvestasi = investasi_rutin_bulan * h.months;
      return modalPokok + Math.max(0, fvInvestasi - modalInvestasi);
    });

    return {
      internalTotalBiaya: totalSimpananBulanan,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Total Modal Pokok Disimpan (Rp)',
            data: chartPokok,
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderColor: '#6366f1',
            borderRadius: 8
          },
          {
            label: 'Total Nilai Aset + Imbal Hasil (Rp)',
            data: chartTotal,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            borderColor: '#10b981',
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${persenDaruratTercapai.toFixed(0)}% Darurat Terkumpul`,
        totalCost: formatRupiah(totalSimpananBulanan)
      }
    };
  }
};
