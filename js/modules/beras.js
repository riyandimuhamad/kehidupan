/**
 * Modul Kalkulator Kebutuhan Beras & Pangan Utama
 * Kehidupan App Suite
 * 
 * Dilengkapi Parameter Realistis Rumah Tangga Indonesia:
 * 1. Komposisi Keluarga: Dewasa (>12 thn) vs Anak-anak (2-12 thn, porsi 50-60%)
 * 2. Variasi Pola Konsumsi: Frekuensi makan nasi 1-3x sehari & substitusi non-nasi
 * 3. Cadangan & Waste Factor: Toleransi nasi basi, susut cuci beras, & porsi sisa (0-15%)
 * 4. Smart Karung Optimizer: Rekomendasi paket pembelian kemasan 5 kg, 10 kg, 25 kg, 50 kg
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_BERAS = 'kehidupan_beras_data';

const DEFAULT_BERAS_DATA = {
  dewasa: 0,
  anak: 0,
  makan_per_hari: 3,
  porsi_dewasa_gram: 115, // Gram beras mentah per makan dewasa (~115g = ~250g nasi matang)
  waste_percent: 5,        // Cadangan nasi basi / susut / sisa (5%)
  harga_per_kg: 15000,     // Standar beras premium (Rp 15.000/kg)
  hari: 30
};

export const BerasModule = {
  id: 'beras',
  name: 'Beras & Pangan Utama',
  icon: 'fa-bowl-rice',
  badge: 'Module Pangan Utama',
  title: 'Kalkulator Kebutuhan Beras',
  subtitle: 'Estimasi konsumsi beras realistis (dewasa vs anak), faktor waste nasi basi, dan rekomendasi paket karung paling efisien.',

  defaults: DEFAULT_BERAS_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_BERAS, { ...DEFAULT_BERAS_DATA });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_BERAS, data);
  },

  renderForm: (container, onInputChange) => {
    const data = BerasModule.getData();

    container.innerHTML = `
      <!-- Section 1: Komposisi Anggota Keluarga -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Komposisi Anggota Keluarga
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="dewasa">Dewasa (>12 Thn) <span class="unit">(Jiwa)</span></label>
            <div class="input-wrapper">
              <i class="fa-user fa-solid input-icon"></i>
              <input type="number" id="dewasa" class="form-control" min="0" max="50" value="${data.dewasa}">
            </div>
            <div class="form-options">
              <button type="button" class="option-chip ${data.dewasa === 0 ? 'active' : ''}" data-target="dewasa" data-val="0">0</button>
              <button type="button" class="option-chip ${data.dewasa === 1 ? 'active' : ''}" data-target="dewasa" data-val="1">1</button>
              <button type="button" class="option-chip ${data.dewasa === 2 ? 'active' : ''}" data-target="dewasa" data-val="2">2</button>
              <button type="button" class="option-chip ${data.dewasa === 4 ? 'active' : ''}" data-target="dewasa" data-val="4">4</button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="anak">Anak (2-12 Thn) <span class="unit">(Jiwa)</span></label>
            <div class="input-wrapper">
              <i class="fa-child fa-solid input-icon"></i>
              <input type="number" id="anak" class="form-control" min="0" max="20" value="${data.anak}">
            </div>
            <div class="form-options">
              <button type="button" class="option-chip ${data.anak === 0 ? 'active' : ''}" data-target="anak" data-val="0">0</button>
              <button type="button" class="option-chip ${data.anak === 1 ? 'active' : ''}" data-target="anak" data-val="1">1</button>
              <button type="button" class="option-chip ${data.anak === 2 ? 'active' : ''}" data-target="anak" data-val="2">2</button>
              <button type="button" class="option-chip ${data.anak === 3 ? 'active' : ''}" data-target="anak" data-val="3">3</button>
            </div>
          </div>
        </div>
        <p style="font-size: 0.74rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
          *Porsi makan anak dihitung 55% dari porsi dewasa sesuai standar gizi.
        </p>
      </div>

      <!-- Section 2: Pola Makan & Variasi Konsumsi -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Pola Makan & Variasi Konsumsi Nasi
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="makan_per_hari">Frekuensi Makan Nasi <span class="unit">(Kali / Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-utensils fa-solid input-icon"></i>
            <input type="number" id="makan_per_hari" class="form-control" min="1" max="5" step="0.5" value="${data.makan_per_hari}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.makan_per_hari === 1 ? 'active' : ''}" data-target="makan_per_hari" data-val="1">1x Sehari</button>
            <button type="button" class="option-chip ${data.makan_per_hari === 2 ? 'active' : ''}" data-target="makan_per_hari" data-val="2">2x Sehari</button>
            <button type="button" class="option-chip ${data.makan_per_hari === 3 ? 'active' : ''}" data-target="makan_per_hari" data-val="3">3x Sehari</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="porsi_dewasa_gram">Porsi Dewasa per Makan <span class="unit">(Gram Beras Mentah)</span></label>
          <div class="input-wrapper">
            <i class="fa-bowl-rice fa-solid input-icon"></i>
            <input type="number" id="porsi_dewasa_gram" class="form-control" min="50" max="250" step="5" value="${data.porsi_dewasa_gram}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.porsi_dewasa_gram === 85 ? 'active' : ''}" data-target="porsi_dewasa_gram" data-val="85">Kecil (85g)</button>
            <button type="button" class="option-chip ${data.porsi_dewasa_gram === 115 ? 'active' : ''}" data-target="porsi_dewasa_gram" data-val="115">Sedang (115g)</button>
            <button type="button" class="option-chip ${data.porsi_dewasa_gram === 145 ? 'active' : ''}" data-target="porsi_dewasa_gram" data-val="145">Besar (145g)</button>
          </div>
        </div>
      </div>

      <!-- Section 3: Cadangan & Waste Factor -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Cadangan & Waste Factor
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="waste_percent">Faktor Toleransi & Nasi Basi <span class="unit">(%)</span></label>
          <div class="input-wrapper">
            <i class="fa-shield-halved fa-solid input-icon"></i>
            <input type="number" id="waste_percent" class="form-control" min="0" max="30" step="1" value="${data.waste_percent}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.waste_percent === 0 ? 'active' : ''}" data-target="waste_percent" data-val="0">0% (Tepat Habis)</button>
            <button type="button" class="option-chip ${data.waste_percent === 5 ? 'active' : ''}" data-target="waste_percent" data-val="5">5% (Standar Wajar)</button>
            <button type="button" class="option-chip ${data.waste_percent === 10 ? 'active' : ''}" data-target="waste_percent" data-val="10">10% (Sering Sisa)</button>
            <button type="button" class="option-chip ${data.waste_percent === 15 ? 'active' : ''}" data-target="waste_percent" data-val="15">15% (Porsi Aman)</button>
          </div>
          <p style="font-size: 0.74rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
            *Mengantisipasi nasi basi di magic com, kerak menempel, susut saat cuci, dan porsi sisa piring.
          </p>
        </div>
      </div>

      <!-- Section 4: Harga Pasar & Periode Perhitungan -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Harga Pasar & Durasi Waktu
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="harga_per_kg">Harga Beras per Kg <span class="unit">(Rupiah)</span></label>
          <div class="input-wrapper">
            <i class="fa-tag fa-solid input-icon"></i>
            <input type="number" id="harga_per_kg" class="form-control" step="500" value="${data.harga_per_kg}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.harga_per_kg === 13500 ? 'active' : ''}" data-target="harga_per_kg" data-val="13500">Medium (Rp 13.500)</button>
            <button type="button" class="option-chip ${data.harga_per_kg === 15000 ? 'active' : ''}" data-target="harga_per_kg" data-val="15000">Premium (Rp 15.000)</button>
            <button type="button" class="option-chip ${data.harga_per_kg === 18000 ? 'active' : ''}" data-target="harga_per_kg" data-val="18000">Super (Rp 18.000)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="hari">Lama Kebutuhan <span class="unit">(Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon"></i>
            <input type="number" id="hari" class="form-control" min="1" max="3650" value="${data.hari}">
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

    // Event listener for all inputs
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', () => {
      const current = BerasModule.getFormInputs(container);
      BerasModule.saveData(current);
      onInputChange();
    }));

    // Event listener for chips
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
          const current = BerasModule.getFormInputs(container);
          BerasModule.saveData(current);
          onInputChange();
        }
      });
    });

    // Save to BudgetStore button listener
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = BerasModule.getFormInputs(container);
      BerasModule.saveData(currentInputs);
      const res = BerasModule.calculate(currentInputs);
      
      // Hitung normalisasi alokasi 1 bulan (30 hari)
      const dailyCostWithWaste = (res.total_biaya / (currentInputs.hari || 1));
      const monthlyBudgetCost = dailyCostWithWaste * 30;

      BudgetStore.saveBudgetItem('beras', {
        id: 'beras',
        name: 'Beras & Pangan Utama',
        amount: monthlyBudgetCost,
        category: 'Pokok',
        source: `Kalkulator Beras (${currentInputs.dewasa} Dewasa, ${currentInputs.anak} Anak, Waste ${currentInputs.waste_percent}%)`,
        details: {
          dewasa: currentInputs.dewasa,
          anak: currentInputs.anak,
          kebutuhanKgBulanan: (res.total_kg / (currentInputs.hari || 1)) * 30,
          hargaPerKg: currentInputs.harga_per_kg,
          wastePercent: currentInputs.waste_percent,
          timestamp: new Date().toISOString()
        }
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyBudgetCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      dewasa: parseInt(container.querySelector('#dewasa')?.value || 2, 10),
      anak: parseInt(container.querySelector('#anak')?.value || 0, 10),
      makan_per_hari: parseFloat(container.querySelector('#makan_per_hari')?.value || 3),
      porsi_dewasa_gram: parseFloat(container.querySelector('#porsi_dewasa_gram')?.value || 115),
      waste_percent: parseFloat(container.querySelector('#waste_percent')?.value || 5),
      harga_per_kg: parseFloat(container.querySelector('#harga_per_kg')?.value || 15000),
      hari: parseInt(container.querySelector('#hari')?.value || 30, 10)
    };
  },

  calculate: (inputs) => {
    const { dewasa, anak, makan_per_hari, porsi_dewasa_gram, waste_percent, harga_per_kg, hari } = inputs;

    // 1. Konsumsi Harian Bersih per Jiwa (Beras mentah dalam kg)
    const porsiDewasaKg = porsi_dewasa_gram / 1000;
    const porsiAnakKg = porsiDewasaKg * 0.55; // Porsi anak 55% porsi dewasa

    const konsumsiHarianDewasaSatuOrang = porsiDewasaKg * makan_per_hari;
    const konsumsiHarianAnakSatuOrang = porsiAnakKg * makan_per_hari;

    const totalHarianDewasa = konsumsiHarianDewasaSatuOrang * dewasa;
    const totalHarianAnak = konsumsiHarianAnakSatuOrang * anak;
    const totalHarianNetto = totalHarianDewasa + totalHarianAnak;

    // 2. Faktor Cadangan & Waste
    const wasteFactorMultiplier = 1 + (waste_percent / 100);
    const totalHarianBruto = totalHarianNetto * wasteFactorMultiplier;
    const wasteHarianKg = totalHarianNetto * (waste_percent / 100);

    // 3. Akumulasi untuk Periode Pilihan (Hari)
    const totalBerasNetto = totalHarianNetto * hari;
    const totalWasteKg = wasteHarianKg * hari;
    const total_beras = totalHarianBruto * hari;
    const total_biaya = total_beras * harga_per_kg;

    // Biaya masing-masing komponen untuk periode pilihan
    const biayaDewasa = (totalHarianDewasa * hari) * harga_per_kg;
    const biayaAnak = (totalHarianAnak * hari) * harga_per_kg;
    const biayaWaste = totalWasteKg * harga_per_kg;

    // 4. Smart Karung Optimizer (Rekomendasi Paket Pembelian Karung)
    // Karung standar di Indonesia: 25 kg, 10 kg, 5 kg
    const getKarungCombination = (targetKg) => {
      if (!targetKg || targetKg <= 0) {
        return { teks: '0 Karung', totalKg: 0, sisaKg: 0, biaya: 0 };
      }
      let remaining = targetKg;
      let k25 = 0;
      let k10 = 0;
      let k5 = 0;

      if (remaining >= 25) {
        k25 = Math.floor(remaining / 25);
        remaining = remaining % 25;
      }

      // Sisa di bawah 25 kg dioptimalkan dengan karung 10kg dan 5kg
      if (remaining > 20) {
        k25 += 1;
        remaining = 0;
      } else if (remaining > 15) {
        k10 += 2;
        remaining = 0;
      } else if (remaining > 10) {
        k10 += 1;
        k5 += 1;
        remaining = 0;
      } else if (remaining > 5) {
        k10 += 1;
        remaining = 0;
      } else if (remaining > 0) {
        k5 += 1;
        remaining = 0;
      }

      const totalDapat = (k25 * 25) + (k10 * 10) + (k5 * 5);
      const sisaCadangan = totalDapat - targetKg;

      const rincianTeks = [];
      if (k25 > 0) rincianTeks.push(`${k25} Karung (25kg)`);
      if (k10 > 0) rincianTeks.push(`${k10} Karung (10kg)`);
      if (k5 > 0) rincianTeks.push(`${k5} Karung (5kg)`);

      return {
        teks: rincianTeks.length > 0 ? rincianTeks.join(' + ') : '1 Karung (5kg)',
        totalKg: totalDapat,
        sisaKg: sisaCadangan,
        biaya: totalDapat * harga_per_kg
      };
    };

    const smartPack = getKarungCombination(total_beras);

    // Opsi alternatif seragam 5kg
    const pack5Count = Math.ceil(total_beras / 5);
    const pack5TotalKg = pack5Count * 5;
    const pack5Sisa = pack5TotalKg - total_beras;

    // Opsi alternatif seragam 10kg
    const pack10Count = Math.ceil(total_beras / 10);
    const pack10TotalKg = pack10Count * 10;
    const pack10Sisa = pack10TotalKg - total_beras;

    // Opsi alternatif seragam 25kg
    const pack25Count = Math.ceil(total_beras / 25);
    const pack25TotalKg = pack25Count * 25;
    const pack25Sisa = pack25TotalKg - total_beras;

    // 5. Summary Cards (4 Cards)
    const summaryCards = [
      {
        title: 'Total Kebutuhan Beras',
        value: `${formatNumber(total_beras, 1)} kg`,
        note: `Netto ${formatNumber(totalBerasNetto, 1)} kg + Waste ${formatNumber(totalWasteKg, 1)} kg (${waste_percent}%)`,
        icon: 'fa-bowl-rice',
        type: 'emerald'
      },
      {
        title: 'Estimasi Biaya Beras',
        value: formatRupiah(total_biaya),
        note: `@ ${formatRupiah(harga_per_kg)}/kg (${hari} Hari)`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      },
      {
        title: 'Konsumsi Harian Riil',
        value: `${formatNumber(totalHarianBruto, 2)} kg/hari`,
        note: `Dewasa ${formatNumber(totalHarianDewasa, 2)} kg + Anak ${formatNumber(totalHarianAnak, 2)} kg`,
        icon: 'fa-scale-balanced',
        type: 'sky'
      },
      {
        title: 'Paket Karung Paling Pas',
        value: smartPack.teks,
        note: `Dapat ${formatNumber(smartPack.totalKg, 0)} kg (Sisa cadangan: +${formatNumber(smartPack.sisaKg, 1)} kg)`,
        icon: 'fa-box-archive',
        type: 'emerald'
      }
    ];

    // 6. Primary Breakdown Table: Komponen Konsumsi
    const tableHeaders = ['Komponen Konsumsi', 'Porsi & Anggota', 'Konsumsi Harian', `Kebutuhan ${hari} Hari (kg)`, 'Total Biaya (Rp)', 'Proporsi (%)'];
    const tableRows = [
      {
        isCurrent: false,
        cells: [
          `<strong>Konsumsi Orang Dewasa</strong>`,
          `${dewasa} Jiwa × ${makan_per_hari}x makan (@${porsi_dewasa_gram} gr)`,
          `${formatNumber(totalHarianDewasa, 3)} kg/hari`,
          `${formatNumber(totalHarianDewasa * hari, 2)} kg`,
          formatRupiah(biayaDewasa),
          `${total_biaya > 0 ? ((biayaDewasa / total_biaya) * 100).toFixed(1) : 0}%`
        ]
      },
      ...(anak > 0 ? [{
        isCurrent: false,
        cells: [
          `<strong>Konsumsi Anak-Anak</strong>`,
          `${anak} Anak × ${makan_per_hari}x makan (@${(porsi_dewasa_gram * 0.55).toFixed(0)} gr - 55%)`,
          `${formatNumber(totalHarianAnak, 3)} kg/hari`,
          `${formatNumber(totalHarianAnak * hari, 2)} kg`,
          formatRupiah(biayaAnak),
          `${total_biaya > 0 ? ((biayaAnak / total_biaya) * 100).toFixed(1) : 0}%`
        ]
      }] : []),
      {
        isCurrent: false,
        cells: [
          `<strong>Cadangan & Waste Factor</strong>`,
          `Susut cuci beras, nasi basi magic com, porsi sisa (${waste_percent}%)`,
          `${formatNumber(wasteHarianKg, 3)} kg/hari`,
          `${formatNumber(totalWasteKg, 2)} kg`,
          formatRupiah(biayaWaste),
          `${total_biaya > 0 ? ((biayaWaste / total_biaya) * 100).toFixed(1) : 0}%`
        ]
      },
      {
        isCurrent: true,
        cells: [
          `<strong>TOTAL KEBUTUHAN RIIL</strong>`,
          `<strong>${dewasa + anak} Jiwa (${dewasa} Dewasa, ${anak} Anak)</strong>`,
          `<strong>${formatNumber(totalHarianBruto, 3)} kg/hari</strong>`,
          `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.95rem;">${formatNumber(total_beras, 2)} kg</strong>`,
          `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.95rem;">${formatRupiah(total_biaya)}</strong>`,
          `<strong>100%</strong>`
        ]
      }
    ];

    // 7. Secondary Table: Rekomendasi Paket Pembelian Karung
    const secondaryTable = {
      title: 'Rekomendasi Paket Pembelian Karung di Pasaran',
      subtitle: 'Analisis kombinasi kemasan (5 kg, 10 kg, 25 kg) untuk meminimalkan sisa beras dan mengoptimalkan anggaran belanja.',
      headers: [
        'Opsi Paket Pembelian',
        'Kombinasi Karung',
        'Total Beras (kg)',
        'Selisih / Sisa Stok',
        'Estimasi Biaya Paket (Rp)',
        'Karakteristik & Saran'
      ],
      rows: [
        {
          isCurrent: true,
          cells: [
            `<strong>Paket Paling Pas (Rekomendasi)</strong>`,
            `<strong>${smartPack.teks}</strong>`,
            `${formatNumber(smartPack.totalKg, 0)} kg`,
            `<span class="badge" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald);">+${formatNumber(smartPack.sisaKg, 1)} kg (Cadangan Aman)</span>`,
            `<strong class="highlight" style="color: var(--accent-emerald);">${formatRupiah(smartPack.biaya)}</strong>`,
            `Sisa minimum, efisien dan tidak menumpuk beras lama.`
          ]
        },
        {
          isCurrent: false,
          cells: [
            `<strong>Opsi Seragam Karung 5 kg</strong>`,
            `${pack5Count} Karung (5 kg)`,
            `${pack5TotalKg} kg`,
            `+${formatNumber(pack5Sisa, 1)} kg`,
            formatRupiah(pack5TotalKg * harga_per_kg),
            `Paling fleksibel dibeli bertahap/mingguan di minimarket.`
          ]
        },
        ...(total_beras >= 10 ? [{
          isCurrent: false,
          cells: [
            `<strong>Opsi Seragam Karung 10 kg</strong>`,
            `${pack10Count} Karung (10 kg)`,
            `${pack10TotalKg} kg`,
            `+${formatNumber(pack10Sisa, 1)} kg`,
            formatRupiah(pack10TotalKg * harga_per_kg),
            `Praktis untuk stok bulanan keluarga kecil & menengah.`
          ]
        }] : []),
        ...(total_beras >= 20 ? [{
          isCurrent: false,
          cells: [
            `<strong>Opsi Grosir Karung 25 kg</strong>`,
            `${pack25Count} Karung (25 kg)`,
            `${pack25TotalKg} kg`,
            `+${formatNumber(pack25Sisa, 1)} kg`,
            formatRupiah(pack25TotalKg * harga_per_kg),
            `Harga grosir lebih hemat per kg, cocok untuk stok 1-2 bulan.`
          ]
        }] : [])
      ]
    };

    // 8. Chart Data: Proyeksi Kebutuhan Beras Menurut Durasi Waktu
    const periodDays = [1, 7, 30, 90, 365];
    const periodLabels = ['1 Hari', '1 Minggu (7h)', '1 Bulan (30h)', '3 Bulan (90h)', '1 Tahun (365h)'];
    const netData = periodDays.map(d => parseFloat((totalHarianNetto * d).toFixed(2)));
    const wasteData = periodDays.map(d => parseFloat((wasteHarianKg * d).toFixed(2)));

    return {
      total_beras,
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: periodLabels,
        datasets: [
          {
            label: 'Konsumsi Bersih (kg)',
            data: netData,
            backgroundColor: '#4f46e5',
            borderRadius: 6
          },
          {
            label: `Cadangan / Waste ${waste_percent}% (kg)`,
            data: wasteData,
            backgroundColor: '#f59e0b',
            borderRadius: 6
          }
        ]
      },
      quickStats: {
        totalQty: `${formatNumber(total_beras, 1)} kg`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
