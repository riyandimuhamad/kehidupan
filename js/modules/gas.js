/**
 * Modul Kalkulator Kebutuhan Gas LPG Rumah Tangga
 * Kehidupan App Suite
 * 
 * Parameter Realistis & Masuk Akal:
 * 1. Pilihan Tipe Gas: 3kg (Melon Subsidi), 5.5kg (Bright Gas), 12kg (Bright Gas)
 * 2. Ukuran Keluarga & Kebiasaan Masak: Jumlah anggota & pola masak (Ringan 1 jam, Sedang 2 jam, Intensif 3.5 jam)
 * 3. Variasi Harga Pasar: Harga pangkalan resmi vs warung pengecer lokal
 * 4. Siklus & Prediksi: Estimasi presisi berapa hari 1 tabung bertahan dan rekomendasi stok cadangan
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_GAS = 'kehidupan_gas_data';

const DEFAULT_GAS_DATA = {
  tipe_gas: '3kg',
  jumlah_anggota: 0,
  intensitas_masak: 0,   // Jam nyala kompor per hari
  harga_per_tabung: 22000, // Harga refill
  hari: 30                 // Periode perhitungan (hari)
};

export const GasModule = {
  id: 'gas',
  name: 'Gas LPG',
  icon: 'fa-fire-burner',
  badge: 'Module Bahan Bakar Dapur',
  title: 'Kalkulator Kebutuhan Gas LPG',
  subtitle: 'Estimasi konsumsi tabung gas LPG realistis berdasarkan kebiasaan masak, ukuran keluarga, dan harga pangkalan.',

  defaults: DEFAULT_GAS_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_GAS, { ...DEFAULT_GAS_DATA });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_GAS, data);
  },

  renderForm: (container, onInputChange) => {
    const data = GasModule.getData();

    container.innerHTML = `
      <!-- Section 1: Tipe Tabung Gas & Ukuran Keluarga -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Tipe Tabung & Anggota Keluarga
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="tipe_gas">Tipe Tabung Gas LPG</label>
          <div class="input-wrapper">
            <i class="fa-database fa-solid input-icon"></i>
            <select id="tipe_gas" class="form-control">
              <option value="3kg" ${data.tipe_gas === '3kg' ? 'selected' : ''}>Gas Melon 3kg (Subsidi)</option>
              <option value="5.5kg" ${data.tipe_gas === '5.5kg' ? 'selected' : ''}>Bright Gas 5.5kg</option>
              <option value="12kg" ${data.tipe_gas === '12kg' ? 'selected' : ''}>Bright Gas 12kg</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="jumlah_anggota">Jumlah Anggota Keluarga <span class="unit">(Jiwa)</span></label>
          <div class="input-wrapper">
            <i class="fa-users fa-solid input-icon"></i>
            <input type="number" id="jumlah_anggota" class="form-control" min="1" max="50" value="${data.jumlah_anggota}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.jumlah_anggota === 1 ? 'active' : ''}" data-target="jumlah_anggota" data-val="1">1 Orang (Kos)</button>
            <button type="button" class="option-chip ${data.jumlah_anggota === 2 ? 'active' : ''}" data-target="jumlah_anggota" data-val="2">2 Orang</button>
            <button type="button" class="option-chip ${data.jumlah_anggota === 4 ? 'active' : ''}" data-target="jumlah_anggota" data-val="4">Keluarga (4)</button>
            <button type="button" class="option-chip ${data.jumlah_anggota === 6 ? 'active' : ''}" data-target="jumlah_anggota" data-val="6">Besar (6)</button>
          </div>
        </div>
      </div>

      <!-- Section 2: Kebiasaan & Jam Nyala Kompor -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Intensitas & Jam Nyala Kompor
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="intensitas_masak">Estimasi Nyala Kompor per Hari <span class="unit">(Jam / Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-clock fa-solid input-icon"></i>
            <input type="number" id="intensitas_masak" class="form-control" min="0.5" max="15" step="0.5" value="${data.intensitas_masak}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.intensitas_masak === 1.0 ? 'active' : ''}" data-target="intensitas_masak" data-val="1">Ringan (1 jam)</button>
            <button type="button" class="option-chip ${data.intensitas_masak === 2.0 ? 'active' : ''}" data-target="intensitas_masak" data-val="2">Sedang (2 jam)</button>
            <button type="button" class="option-chip ${data.intensitas_masak === 3.5 ? 'active' : ''}" data-target="intensitas_masak" data-val="3.5">Aktif (3.5 jam)</button>
          </div>
          <p style="font-size: 0.74rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
            *Total akumulasi api menyala untuk memasak lauk, menumis, menggoreng, dan merebus air harian.
          </p>
        </div>
      </div>

      <!-- Section 3: Harga Refill & Durasi Waktu -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Harga Refill & Durasi Waktu
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="harga_per_tabung">Harga Refill per Tabung <span class="unit">(Rupiah)</span></label>
          <div class="input-wrapper">
            <i class="fa-tag fa-solid input-icon"></i>
            <input type="number" id="harga_per_tabung" class="form-control" step="1000" value="${data.harga_per_tabung}">
          </div>
          <div class="form-options" id="gasPriceOptions">
            <button type="button" class="option-chip ${data.harga_per_tabung === 19000 ? 'active' : ''}" data-target="harga_per_tabung" data-val="19000">3kg Pangkalan (19k)</button>
            <button type="button" class="option-chip ${data.harga_per_tabung === 22000 ? 'active' : ''}" data-target="harga_per_tabung" data-val="22000">3kg Warung (22k)</button>
            <button type="button" class="option-chip ${data.harga_per_tabung === 105000 ? 'active' : ''}" data-target="harga_per_tabung" data-val="105000">5.5kg (105k)</button>
            <button type="button" class="option-chip ${data.harga_per_tabung === 215000 ? 'active' : ''}" data-target="harga_per_tabung" data-val="215000">12kg (215k)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="hari">Lama Waktu <span class="unit">(Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon"></i>
            <input type="number" id="hari" class="form-control" min="1" max="365" value="${data.hari}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.hari === 7 ? 'active' : ''}" data-target="hari" data-val="7">1 Minggu (7h)</button>
            <button type="button" class="option-chip ${data.hari === 30 ? 'active' : ''}" data-target="hari" data-val="30">1 Bulan (30h)</button>
            <button type="button" class="option-chip ${data.hari === 90 ? 'active' : ''}" data-target="hari" data-val="90">3 Bulan (90h)</button>
            <button type="button" class="option-chip ${data.hari === 365 ? 'active' : ''}" data-target="hari" data-val="365">1 Tahun (365h)</button>
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

    // Dropdown change auto adjusts default price only if user hasn't typed custom
    const tipeSelect = container.querySelector('#tipe_gas');
    tipeSelect.addEventListener('change', () => {
      const val = tipeSelect.value;
      const hargaInput = container.querySelector('#harga_per_tabung');
      if (val === '3kg' && hargaInput) hargaInput.value = 22000;
      if (val === '5.5kg' && hargaInput) hargaInput.value = 105000;
      if (val === '12kg' && hargaInput) hargaInput.value = 215000;

      const current = GasModule.getFormInputs(container);
      GasModule.saveData(current);
      onInputChange();
    });

    // Input listeners
    const inputs = container.querySelectorAll('input, select');
    inputs.forEach(input => input.addEventListener('input', () => {
      const current = GasModule.getFormInputs(container);
      GasModule.saveData(current);
      onInputChange();
    }));

    // Chip listeners
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
          const current = GasModule.getFormInputs(container);
          GasModule.saveData(current);
          onInputChange();
        }
      });
    });

    // Save to Budget Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const current = GasModule.getFormInputs(container);
      const res = GasModule.calculate(current);
      const monthlyCost = res.monthlyCost;

      BudgetStore.saveBudgetItem('gas', {
        id: 'gas',
        name: 'Gas LPG Dapur',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Gas LPG (${current.tipe_gas}, ${current.jumlah_anggota} orang)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      tipe_gas: container.querySelector('#tipe_gas')?.value || '3kg',
      jumlah_anggota: Math.max(1, parseInt(container.querySelector('#jumlah_anggota')?.value || 3, 10)),
      intensitas_masak: Math.max(0.5, parseFloat(container.querySelector('#intensitas_masak')?.value || 2.0)),
      harga_per_tabung: Math.max(0, parseFloat(container.querySelector('#harga_per_tabung')?.value || 22000)),
      hari: Math.max(1, parseInt(container.querySelector('#hari')?.value || 30, 10))
    };
  },

  calculate: (inputs) => {
    const data = inputs || GasModule.getData();
    const { tipe_gas, jumlah_anggota, intensitas_masak, harga_per_tabung, hari } = data;

    // Kapasitas daya tahan standar tabung LPG (jam nyala api sedang):
    // 3kg: ~36 jam | 5.5kg: ~66 jam | 12kg: ~144 jam
    let jamKapasitasTabung = 36;
    let beratKg = 3;
    if (tipe_gas === '5.5kg') {
      jamKapasitasTabung = 66;
      beratKg = 5.5;
    } else if (tipe_gas === '12kg') {
      jamKapasitasTabung = 144;
      beratKg = 12;
    }

    // Konsumsi gas harian (kg/jam = berat / jamKapasitasTabung)
    const kgPerJam = beratKg / jamKapasitasTabung;
    const kgPerHari = kgPerJam * intensitas_masak;

    // Masa pakai 1 tabung dalam hari
    const masaPakaiHari = intensitas_masak > 0 ? jamKapasitasTabung / intensitas_masak : 0;

    // Akumulasi jam dan tabung untuk periode pilihan
    const totalJamPeriode = intensitas_masak * hari;
    const totalTabungPeriode = totalJamPeriode / jamKapasitasTabung;
    const totalTabungPembelian = Math.ceil(totalTabungPeriode);
    const totalBiayaPeriode = totalTabungPembelian * harga_per_tabung;

    // Estimasi standar bulanan 30 hari untuk Budget Store
    const totalJamBulanan = intensitas_masak * 30;
    const totalTabungBulanan = Math.ceil(totalJamBulanan / jamKapasitasTabung);
    const monthlyCost = totalTabungBulanan * harga_per_tabung;

    // Biaya pemakaian harian (est.)
    const biayaHarian = kgPerHari * (harga_per_tabung / beratKg);

    // 4 Kartu Ringkasan (Auto-Balanced Layout)
    const summaryCards = [
      {
        title: 'Estimasi Tabung Refill',
        value: `${totalTabungPembelian} Tabung (${tipe_gas})`,
        note: `Presisi: ${formatNumber(totalTabungPeriode, 1)} Tabung (${formatNumber(totalJamPeriode, 0)} Jam Nyala)`,
        icon: 'fa-fire-burner',
        type: 'emerald'
      },
      {
        title: 'Total Biaya Gas',
        value: formatRupiah(totalBiayaPeriode),
        note: `@ ${formatRupiah(harga_per_tabung)} / Tabung Refill`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      },
      {
        title: 'Daya Tahan 1 Tabung',
        value: `± ${formatNumber(masaPakaiHari, 1)} Hari`,
        note: `Bertahan ~${formatNumber(masaPakaiHari / 7, 1)} Minggu (${intensitas_masak} Jam/Hari)`,
        icon: 'fa-hourglass-half',
        type: 'sky'
      },
      {
        title: 'Rekomendasi Cadangan',
        value: '1 Tabung Cadangan',
        note: `Sedia 1 stok cadangan agar aman tanpa kehabisan`,
        icon: 'fa-shield-halved',
        type: 'emerald'
      }
    ];

    // Tabel Primer: Proyeksi Berdasarkan Periode Waktu
    const periods = [
      { label: '1 Minggu (7 Hari)', d: 7 },
      { label: '1 Bulan (30 Hari)', d: 30 },
      { label: '3 Bulan (90 Hari)', d: 90 },
      { label: '1 Tahun (365 Hari)', d: 365 },
      ...(hari !== 7 && hari !== 30 && hari !== 90 && hari !== 365 ? [{ label: `Kustom (${hari} Hari)`, d: hari, isCurrent: true }] : [])
    ];

    const tableHeaders = ['Periode Waktu', 'Total Nyala Kompor', 'Estimasi Tabung', 'Biaya Riil Gas'];
    const tableRows = periods.map(p => {
      const jam = intensitas_masak * p.d;
      const tabung = Math.ceil(jam / jamKapasitasTabung);
      const cost = tabung * harga_per_tabung;
      const isCurr = p.d === hari;

      return {
        isCurrent: isCurr,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(jam, 1)} Jam`,
          `${tabung} Tabung (${tipe_gas}) <span style="font-size:0.72rem; color:var(--text-muted);">(${formatNumber(jam / jamKapasitasTabung, 1)})</span>`,
          `<strong class="highlight">${formatRupiah(cost)}</strong>`
        ]
      };
    });

    // Tabel Sekunder: Profil Konsumsi & Efisiensi Dapur
    const secondaryTable = {
      title: 'Profil Konsumsi & Efisiensi Dapur',
      subtitle: 'Rincian durasi nyala kompor, efisiensi konsumsi harian, dan rekomendasi perputaran stok tabung gas.',
      headers: [
        'Parameter Operasional',
        'Nilai Estimasi',
        'Keterangan & Implikasi Rumah Tangga'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            '<strong>Intensitas Nyala Kompor</strong>',
            `${formatNumber(intensitas_masak, 1)} Jam / Hari`,
            `Akumulasi memasak harian keluarga (${jumlah_anggota} Jiwa)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Konsumsi Gas Harian</strong>',
            `± ${formatNumber(kgPerHari, 2)} kg LPG / Hari`,
            `Laju pembakaran kompor api sedang (~0.083 kg/jam)`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Siklus Habis 1 Tabung</strong>',
            `± ${formatNumber(masaPakaiHari, 1)} Hari`,
            `1 tabung ${tipe_gas} habis setiap ~${formatNumber(masaPakaiHari / 7, 1)} minggu`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Estimasi Biaya Masak Harian</strong>',
            formatRupiah(Math.round(biayaHarian)),
            `Rata-rata biaya bahan bakar memasak per hari`
          ]
        },
        {
          isCurrent: false,
          cells: [
            '<strong>Rekomendasi Safety Stock</strong>',
            'Sedia 1 Tabung Cadangan',
            'Menghindari kompor padam mendadak saat memasak di jam sibuk'
          ]
        }
      ]
    };

    // Chart Data
    const chartLabels = ['1 Minggu', '1 Bulan (30h)', '3 Bulan (90h)', '1 Tahun'];
    const chartDays = [7, 30, 90, 365];
    const chartDataValues = chartDays.map(d => Math.ceil((intensitas_masak * d) / jamKapasitasTabung) * harga_per_tabung);

    return {
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      monthlyCost,
      chartData: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Biaya Gas LPG (Rp)',
            data: chartDataValues,
            backgroundColor: 'rgba(245, 158, 11, 0.65)',
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${totalTabungPembelian} Tabung`,
        totalCost: formatRupiah(totalBiayaPeriode)
      }
    };
  }
};
