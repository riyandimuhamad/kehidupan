/**
 * Modul Kalkulator Hiburan & Gaya Hidup (Quality of Life)
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_HIBURAN = 'hiburan_data';

export const HiburanModule = {
  id: 'hiburan',
  name: 'Hiburan & Sosial',
  icon: 'fa-gamepad',
  badge: 'Module Quality of Life',
  title: 'Kalkulator Hiburan & Gaya Hidup',
  subtitle: 'Hitung estimasi pengeluaran langganan digital, nongkrong di cafe, kuliner luar, liburan/weekend, dan kegiatan sosial.',

  defaults: {
    streaming_digital: 0, // Netflix, Spotify, Youtube, iCloud
    nongkrong_per_minggu: 0,   // Kali per minggu
    biaya_per_nongkrong: 0,    // Biaya ngopi/cafe per sesi
    kuliner_luar_bulan: 0,     // Makan di resto keluarga/weekend
    rekreasi_liburan_bulan: 0, // Bioskop, jalan-jalan, wisata bulanan
    sosial_hobi_bulan: 0,      // Kado, arisan, hobi, komunitas
    hari: 30
  },

  getData: () => {
    return getFromStorage(STORAGE_KEY_HIBURAN, { ...HiburanModule.defaults });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_HIBURAN, data);
  },

  renderForm: (container, onInputChange) => {
    const data = HiburanModule.getData();

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Alokasi Hiburan & Relaksasi Keluarga
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Seimbangkan kebutuhan hidup dengan alokasi hiburan yang terukur dan tidak berlebihan.
        </p>
      </div>

      <!-- Section 1: Langganan Streaming & Digital -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Langganan Digital & Streaming
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Total Langganan Bulanan</span> <span class="unit">(Rp/Bulan)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-tv fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="streaming_digital" class="form-control" step="25000" value="${data.streaming_digital}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
          <div class="form-options" style="margin-top: 6px;">
            <button type="button" class="option-chip ${data.streaming_digital === 55000 ? 'active' : ''}" data-target="streaming_digital" data-val="55000">Hemat (Rp 55k)</button>
            <button type="button" class="option-chip ${data.streaming_digital === 150000 ? 'active' : ''}" data-target="streaming_digital" data-val="150000">Standar (Rp 150k)</button>
            <button type="button" class="option-chip ${data.streaming_digital === 300000 ? 'active' : ''}" data-target="streaming_digital" data-val="300000">Lengkap (Rp 300k)</button>
          </div>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin: 4px 0 0 0;">*Contoh: Netflix (Rp 65k-186k), Spotify/Youtube (Rp 55k), Disney+ (Rp 65k), iCloud (Rp 15k-45k).</p>
        </div>
      </div>

      <!-- Section 2: Nongkrong & Kuliner Luar -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Nongkrong di Cafe & Kuliner Luar
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Frekuensi Nongkrong</span> <span class="unit">(Kali/Minggu)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-mug-hot fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="nongkrong_per_minggu" class="form-control" min="0" max="14" value="${data.nongkrong_per_minggu}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Biaya per Sesi</span> <span class="unit">(Rp/Sesi)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-receipt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="biaya_per_nongkrong" class="form-control" step="10000" value="${data.biaya_per_nongkrong}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Kuliner Resto / Weekend</span> <span class="unit">(Rp/Bulan)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-utensils fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="kuliner_luar_bulan" class="form-control" step="50000" value="${data.kuliner_luar_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
          </div>
        </div>
      </div>

      <!-- Section 3: Rekreasi, Liburan & Acara Sosial -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Rekreasi, Liburan & Hobi / Sosial
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Rekreasi & Bioskop</span> <span class="unit">(Rp/Bulan)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-film fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="rekreasi_liburan_bulan" class="form-control" step="50000" value="${data.rekreasi_liburan_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Sosial, Kado & Hobi</span> <span class="unit">(Rp/Bulan)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-gift fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="sosial_hobi_bulan" class="form-control" step="50000" value="${data.sosial_hobi_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
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

      <!-- Action: Simpan ke Dashboard Budget Bulanan -->
      <div style="margin-top: 18px; text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 11px;">
          <i class="fa-bookmark fa-solid" style="margin-right: 6px;"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Event Listeners for inputs
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        HiburanModule.saveFormData(container);
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
          HiburanModule.saveFormData(container);
          onInputChange();
        }
      });
    });

    // Save to Budget Dashboard Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = HiburanModule.getFormInputs(container);
      const res = HiburanModule.calculateMonthly(currentInputs);

      BudgetStore.saveBudgetItem('hiburan', {
        id: 'hiburan',
        name: 'Hiburan & Gaya Hidup',
        amount: res.total_biaya,
        category: 'Lainnya',
        source: 'Kalkulator Hiburan & Sosial'
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Alokasi bulanan ${formatRupiah(res.total_biaya)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4500);
    });
  },

  saveFormData: (container) => {
    const data = HiburanModule.getFormInputs(container);
    HiburanModule.saveData(data);
  },

  getFormInputs: (container) => {
    return {
      streaming_digital: parseFloat(container.querySelector('#streaming_digital')?.value || 150000),
      nongkrong_per_minggu: parseFloat(container.querySelector('#nongkrong_per_minggu')?.value || 2),
      biaya_per_nongkrong: parseFloat(container.querySelector('#biaya_per_nongkrong')?.value || 50000),
      kuliner_luar_bulan: parseFloat(container.querySelector('#kuliner_luar_bulan')?.value || 300000),
      rekreasi_liburan_bulan: parseFloat(container.querySelector('#rekreasi_liburan_bulan')?.value || 400000),
      sosial_hobi_bulan: parseFloat(container.querySelector('#sosial_hobi_bulan')?.value || 200000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculateMonthly: (inputs) => {
    const monthInputs = { ...inputs, hari: 30 };
    const res = HiburanModule.calculate(monthInputs);
    return {
      total_biaya: res.internalTotalBiaya || 0
    };
  },

  calculate: (inputs) => {
    const s = { ...HiburanModule.defaults, ...inputs };
    const { streaming_digital, nongkrong_per_minggu, biaya_per_nongkrong, kuliner_luar_bulan, rekreasi_liburan_bulan, sosial_hobi_bulan, hari } = s;

    // Perhitungan bulanan (30 hari)
    const biaya_nongkrong_bulan = nongkrong_per_minggu * 4.33 * biaya_per_nongkrong;
    const biaya_total_sebulan = streaming_digital + biaya_nongkrong_bulan + kuliner_luar_bulan + rekreasi_liburan_bulan + sosial_hobi_bulan;

    // Konversi proporsional ke durasi hari
    const rasioHari = hari / 30;
    const streaming_hari = streaming_digital * rasioHari;
    const nongkrong_hari = biaya_nongkrong_bulan * rasioHari;
    const kuliner_hari = kuliner_luar_bulan * rasioHari;
    const rekreasi_hari = rekreasi_liburan_bulan * rasioHari;
    const sosial_hari = sosial_hobi_bulan * rasioHari;
    const total_biaya_akhir = biaya_total_sebulan * rasioHari;

    // Summary Cards (4 Cards)
    const summaryCards = [
      {
        title: 'Total Anggaran Hiburan',
        value: formatRupiah(total_biaya_akhir),
        note: `Durasi ${hari} hari (Est. ${formatRupiah(biaya_total_sebulan)}/bulan)`,
        icon: 'fa-gamepad',
        type: 'emerald'
      },
      {
        title: 'Nongkrong & Kuliner',
        value: formatRupiah(nongkrong_hari + kuliner_hari),
        note: `Cafe (${formatRupiah(nongkrong_hari)}) + Resto (${formatRupiah(kuliner_hari)})`,
        icon: 'fa-mug-hot',
        type: 'amber'
      },
      {
        title: 'Streaming & Digital',
        value: formatRupiah(streaming_hari),
        note: 'Langganan Netflix/Spotify/Musik/Cloud',
        icon: 'fa-tv',
        type: 'sky'
      },
      {
        title: 'Liburan & Sosial/Hobi',
        value: formatRupiah(rekreasi_hari + sosial_hari),
        note: `Rekreasi (${formatRupiah(rekreasi_hari)}) + Kado/Arisan (${formatRupiah(sosial_hari)})`,
        icon: 'fa-umbrella-beach',
        type: 'emerald'
      }
    ];

    // Primary Breakdown Table
    const periods = [
      { label: '7 Hari', d: 7 },
      { label: '30 Hari (1 Bulan)', d: 30 },
      { label: '90 Hari (3 Bulan)', d: 90 },
      { label: '365 Hari (1 Tahun)', d: 365 },
      { label: `Custom (${hari} Hari)`, d: hari, isCurrent: true }
    ];

    const tableHeaders = ['Periode', 'Streaming Digital', 'Nongkrong & Cafe', 'Kuliner & Resto', 'Liburan & Sosial', 'Total Pengeluaran (Rp)'];

    const tableRows = periods.map(p => {
      const r = p.d / 30;
      const pStreaming = streaming_digital * r;
      const pNongkrong = biaya_nongkrong_bulan * r;
      const pKuliner = kuliner_luar_bulan * r;
      const pLiburan = (rekreasi_liburan_bulan + sosial_hobi_bulan) * r;
      const pTotal = pStreaming + pNongkrong + pKuliner + pLiburan;

      return {
        isCurrent: p.isCurrent || false,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(pStreaming),
          formatRupiah(pNongkrong),
          formatRupiah(pKuliner),
          formatRupiah(pLiburan),
          `<span class="highlight">${formatRupiah(pTotal)}</span>`
        ]
      };
    });

    // Secondary Table: Proyeksi Jangka Panjang (Semester & 1 Tahun Penuh)
    const secondaryTable = {
      title: 'Proyeksi Anggaran Hiburan & Gaya Hidup Jangka Panjang',
      subtitle: 'Akumulasi pengeluaran rekreasi, liburan, dan lifestyle keluarga untuk perencanaan keuangan.',
      headers: [
        'Periode Proyeksi',
        'Durasi Waktu',
        'Streaming Digital',
        'Nongkrong & Kuliner',
        'Rekreasi & Sosial',
        'Total Proyeksi Lifestyle'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>Proyeksi 1 Semester</strong>`,
            `6 Bulan (Semester)`,
            formatRupiah(streaming_digital * 6),
            formatRupiah((biaya_nongkrong_bulan + kuliner_luar_bulan) * 6),
            formatRupiah((rekreasi_liburan_bulan + sosial_hobi_bulan) * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(biaya_total_sebulan * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>Proyeksi 1 Tahun Penuh</strong>`,
            `12 Bulan (1 Tahun Penuh)`,
            formatRupiah(streaming_digital * 12),
            formatRupiah((biaya_nongkrong_bulan + kuliner_luar_bulan) * 12),
            formatRupiah((rekreasi_liburan_bulan + sosial_hobi_bulan) * 12),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(biaya_total_sebulan * 12)}</strong>`
          ]
        }
      ]
    };

    // Chart Data Komposisi
    return {
      internalTotalBiaya: total_biaya_akhir,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: ['Streaming Digital', 'Nongkrong Cafe', 'Kuliner Resto', 'Rekreasi / Liburan', 'Sosial & Hobi'],
        datasets: [
          {
            label: 'Alokasi Pengeluaran Hiburan (Rp)',
            data: [
              streaming_hari,
              nongkrong_hari,
              kuliner_hari,
              rekreasi_hari,
              sosial_hari
            ],
            backgroundColor: ['#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#10b981'],
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${nongkrong_per_minggu * 4}x Nongkrong`,
        totalCost: formatRupiah(total_biaya_akhir)
      }
    };
  }
};
