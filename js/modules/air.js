/**
 * Modul Kalkulator Kebutuhan Air Galon & Minum Rumah Tangga
 * Kehidupan App Suite
 * 
 * Parameter Realistis & Masuk Akal:
 * 1. Komposisi Keluarga: Dewasa (>12 thn, ~2.0 L/hari) vs Anak-anak (2-12 thn, ~1.1 L/hari)
 * 2. Alokasi Masak & Dapur: Air galon untuk masak nasi (magic com), sayur, sop, kopi & teh
 * 3. Faktor Cadangan & Tumpahan: Toleransi tumpah & sisa air di dasar galon yang tidak tersedot dispenser (0-10%)
 * 4. Jenis Galon & Biaya Antar: Pilihan depot isi ulang vs brand bermerek (Aqua/Le Minerale) + ongkir delivery
 * 5. Siklus & Prediksi Penggunaan: Estimasi berapa hari 1 galon akan habis
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_AIR = 'kehidupan_air_data';

const DEFAULT_AIR_DATA = {
  dewasa: 0,
  anak: 0,
  liter_dewasa: 2.0,      // Liter air minum per orang dewasa per hari
  liter_anak: 1.1,        // Liter air minum per anak per hari
  air_masak_liter: 0,     // Liter air galon untuk masak nasi & dapur per hari
  cadangan_percent: 5,    // Cadangan tumpah & sisa dasar dispenser (5%)
  harga_per_galon: 20000, // Harga refill per galon (19 Liter)
  ongkir_per_galon: 0,    // Ongkos delivery antar abang galon per galon
  hari: 30                // Periode perhitungan
};

export const AirModule = {
  id: 'air',
  name: 'Air Galon & Minum',
  icon: 'fa-bottle-water',
  badge: 'Module Hidrasi & Air',
  title: 'Kalkulator Kebutuhan Air Galon',
  subtitle: 'Estimasi konsumsi air galon realistis (dewasa vs anak), alokasi masak dapur, jenis galon, dan ongkos antar.',

  defaults: DEFAULT_AIR_DATA,

  getData: () => {
    return getFromStorage(STORAGE_KEY_AIR, { ...DEFAULT_AIR_DATA });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_AIR, data);
  },

  renderForm: (container, onInputChange) => {
    const data = AirModule.getData();

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
            <div class="form-options" style="margin-top: 6px;">
              <button type="button" class="option-chip ${data.dewasa === 0 ? 'active' : ''}" data-target="dewasa" data-val="0">0</button>
              <button type="button" class="option-chip ${data.dewasa === 1 ? 'active' : ''}" data-target="dewasa" data-val="1">1</button>
              <button type="button" class="option-chip ${data.dewasa === 2 ? 'active' : ''}" data-target="dewasa" data-val="2">2</button>
              <button type="button" class="option-chip ${data.dewasa === 3 ? 'active' : ''}" data-target="dewasa" data-val="3">3</button>
              <button type="button" class="option-chip ${data.dewasa === 4 ? 'active' : ''}" data-target="dewasa" data-val="4">4</button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="anak">Anak (2–12 Thn) <span class="unit">(Jiwa)</span></label>
            <div class="input-wrapper">
              <i class="fa-child fa-solid input-icon"></i>
              <input type="number" id="anak" class="form-control" min="0" max="50" value="${data.anak}">
            </div>
            <div class="form-options" style="margin-top: 6px;">
              <button type="button" class="option-chip ${data.anak === 0 ? 'active' : ''}" data-target="anak" data-val="0">0</button>
              <button type="button" class="option-chip ${data.anak === 1 ? 'active' : ''}" data-target="anak" data-val="1">1</button>
              <button type="button" class="option-chip ${data.anak === 2 ? 'active' : ''}" data-target="anak" data-val="2">2</button>
              <button type="button" class="option-chip ${data.anak === 3 ? 'active' : ''}" data-target="anak" data-val="3">3</button>
            </div>
          </div>
        </div>
        <p style="font-size: 0.74rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
          *Anak-anak minum rata-rata ~1.1 Liter/hari (standar hidrasi medis balita & anak).
        </p>
      </div>

      <!-- Section 2: Pola Konsumsi & Kebutuhan Dapur -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Pola Konsumsi Minum & Alokasi Dapur
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label for="liter_dewasa">Konsumsi Minum Dewasa <span class="unit">(Liter / Jiwa / Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-glass-water fa-solid input-icon"></i>
            <input type="number" id="liter_dewasa" class="form-control" min="1" max="5" step="0.5" value="${data.liter_dewasa}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.liter_dewasa === 1.5 ? 'active' : ''}" data-target="liter_dewasa" data-val="1.5">1.5 L (Cukup)</button>
            <button type="button" class="option-chip ${data.liter_dewasa === 2.0 ? 'active' : ''}" data-target="liter_dewasa" data-val="2">2.0 L (Standar)</button>
            <button type="button" class="option-chip ${data.liter_dewasa === 2.5 ? 'active' : ''}" data-target="liter_dewasa" data-val="2.5">2.5 L (Aktif)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="air_masak_liter">Alokasi Masak Nasi & Kebutuhan Dapur <span class="unit">(Liter / Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-kitchen-set fa-solid input-icon"></i>
            <input type="number" id="air_masak_liter" class="form-control" min="0" max="10" step="0.5" value="${data.air_masak_liter}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.air_masak_liter === 0 ? 'active' : ''}" data-target="air_masak_liter" data-val="0">0 L (Hanya Minum)</button>
            <button type="button" class="option-chip ${data.air_masak_liter === 1.5 ? 'active' : ''}" data-target="air_masak_liter" data-val="1.5">1.5 L (Masak Nasi & Kopi)</button>
            <button type="button" class="option-chip ${data.air_masak_liter === 3.0 ? 'active' : ''}" data-target="air_masak_liter" data-val="3">3.0 L (Masak Sayur/Sop)</button>
          </div>
          <p style="font-size: 0.74rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
            *Banyak keluarga menggunakan air galon untuk menanak nasi, seduh kopi/teh, dan kuah masakan.
          </p>
        </div>
      </div>

      <!-- Section 3: Cadangan & Sisa Dispenser -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Faktor Cadangan & Sisa Galon
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="cadangan_percent">Cadangan Tumpah & Sisa Dasar Galon <span class="unit">(%)</span></label>
          <div class="input-wrapper">
            <i class="fa-shield-halved fa-solid input-icon"></i>
            <input type="number" id="cadangan_percent" class="form-control" min="0" max="25" step="1" value="${data.cadangan_percent}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.cadangan_percent === 0 ? 'active' : ''}" data-target="cadangan_percent" data-val="0">0% (Tepat Habis)</button>
            <button type="button" class="option-chip ${data.cadangan_percent === 5 ? 'active' : ''}" data-target="cadangan_percent" data-val="5">5% (Standar Wajar)</button>
            <button type="button" class="option-chip ${data.cadangan_percent === 10 ? 'active' : ''}" data-target="cadangan_percent" data-val="10">10% (Porsi Aman)</button>
          </div>
          <p style="font-size: 0.74rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4;">
            *Mengantisipasi air tumpah dan sisa air di dasar galon yang tidak terpompa dispenser bawah.
          </p>
        </div>
      </div>

      <!-- Section 4: Harga Refill, Ongkos Antar & Durasi -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color);">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
            Harga Galon, Ongkos Antar & Durasi
          </span>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="harga_per_galon">Harga Refill per Galon (19 Liter) <span class="unit">(Rupiah)</span></label>
          <div class="input-wrapper">
            <i class="fa-tag fa-solid input-icon"></i>
            <input type="number" id="harga_per_galon" class="form-control" step="1000" value="${data.harga_per_galon}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.harga_per_galon === 7000 ? 'active' : ''}" data-target="harga_per_galon" data-val="7000">Depot Isi Ulang (7k)</button>
            <button type="button" class="option-chip ${data.harga_per_galon === 20000 ? 'active' : ''}" data-target="harga_per_galon" data-val="20000">Aqua / Vit (20k)</button>
            <button type="button" class="option-chip ${data.harga_per_galon === 22000 ? 'active' : ''}" data-target="harga_per_galon" data-val="22000">Le Minerale (22k)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label for="ongkir_per_galon">Ongkos Antar / Delivery per Galon <span class="unit">(Rupiah)</span></label>
          <div class="input-wrapper">
            <i class="fa-truck-fast fa-solid input-icon"></i>
            <input type="number" id="ongkir_per_galon" class="form-control" step="500" value="${data.ongkir_per_galon}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.ongkir_per_galon === 0 ? 'active' : ''}" data-target="ongkir_per_galon" data-val="0">Rp 0 (Bawa Sendiri)</button>
            <button type="button" class="option-chip ${data.ongkir_per_galon === 2000 ? 'active' : ''}" data-target="ongkir_per_galon" data-val="2000">2k (Reguler)</button>
            <button type="button" class="option-chip ${data.ongkir_per_galon === 4000 ? 'active' : ''}" data-target="ongkir_per_galon" data-val="4000">4k (Apartemen/Lt. Atas)</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label for="hari">Lama Waktu <span class="unit">(Hari)</span></label>
          <div class="input-wrapper">
            <i class="fa-calendar-days fa-solid input-icon"></i>
            <input type="number" id="hari" class="form-control" min="0" max="365" value="${data.hari}">
          </div>
          <div class="form-options">
            <button type="button" class="option-chip ${data.hari === 0 ? 'active' : ''}" data-target="hari" data-val="0">0 Hari</button>
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

    // Input listeners
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', () => {
      const current = AirModule.getFormInputs(container);
      AirModule.saveData(current);
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
          const current = AirModule.getFormInputs(container);
          AirModule.saveData(current);
          onInputChange();
        }
      });
    });

    // Save to Budget Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const current = AirModule.getFormInputs(container);
      const res = AirModule.calculate(current);
      const monthlyCost = res.monthlyCost;

      if (monthlyCost <= 0 || (current.dewasa === 0 && current.anak === 0 && current.air_masak_liter === 0)) {
        notice.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-circle-exclamation fa-solid"></i> Parameter air masih 0. Silakan isi jumlah anggota keluarga atau liter masak terlebih dahulu.</span>`;
        setTimeout(() => notice.innerHTML = '', 4500);
        return;
      }

      BudgetStore.saveBudgetItem('air', {
        id: 'air',
        name: 'Air Galon Minum',
        amount: monthlyCost,
        category: 'Pokok',
        source: `Kalkulator Air Galon (${current.dewasa} Dewasa + ${current.anak} Anak)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      dewasa: Math.max(0, parseInt(container.querySelector('#dewasa')?.value || 0, 10)),
      anak: Math.max(0, parseInt(container.querySelector('#anak')?.value || 0, 10)),
      liter_dewasa: Math.max(0, parseFloat(container.querySelector('#liter_dewasa')?.value || 0)),
      liter_anak: 1.1,
      air_masak_liter: Math.max(0, parseFloat(container.querySelector('#air_masak_liter')?.value || 0)),
      cadangan_percent: Math.max(0, parseFloat(container.querySelector('#cadangan_percent')?.value || 0)),
      harga_per_galon: Math.max(0, parseFloat(container.querySelector('#harga_per_galon')?.value || 0)),
      ongkir_per_galon: Math.max(0, parseFloat(container.querySelector('#ongkir_per_galon')?.value || 0)),
      hari: Math.max(0, parseInt(container.querySelector('#hari')?.value || 0, 10))
    };
  },

  calculate: (inputs) => {
    const data = inputs || AirModule.getData();
    const { dewasa, anak, liter_dewasa, liter_anak, air_masak_liter, cadangan_percent, harga_per_galon, ongkir_per_galon, hari } = data;

    // 1. Perhitungan Konsumsi Harian
    const literMinumDewasa = dewasa * liter_dewasa;
    const literMinumAnak = anak * (liter_anak || 1.1);
    const literMasak = air_masak_liter || 0;
    const totalMinumBersih = literMinumDewasa + literMinumAnak;
    const totalKonsumsiHarianNetto = totalMinumBersih + literMasak;

    // 2. Faktor Cadangan Tumpah & Sisa Dasar Galon
    const cadanganMultiplier = 1 + (cadangan_percent / 100);
    const totalHarianBruto = totalKonsumsiHarianNetto * cadanganMultiplier;
    const cadanganHarianLiter = totalKonsumsiHarianNetto * (cadangan_percent / 100);

    // 3. Konversi Galon & Biaya (Kapasitas Galon Standar = 19 Liter)
    const biayaPerGalonTotal = harga_per_galon + ongkir_per_galon;
    const totalLiterPeriode = totalHarianBruto * hari;
    const totalGalonPeriode = totalLiterPeriode / 19;
    const totalGalonPembelian = totalLiterPeriode > 0 ? Math.ceil(totalGalonPeriode) : 0;
    const totalBiayaPeriode = totalGalonPembelian * biayaPerGalonTotal;

    // Siklus ketahanan 1 galon (berapa hari 1 galon bertahan)
    const hariHabisPerGalon = totalHarianBruto > 0 ? 19 / totalHarianBruto : 0;

    // Estimasi standar bulanan 30 hari untuk Budget Store
    const totalLiterBulanan = totalHarianBruto * 30;
    const totalGalonBulanan = Math.ceil(totalLiterBulanan / 19);
    const monthlyCost = totalGalonBulanan * biayaPerGalonTotal;

    // 4. Empat Kartu Ringkasan (Layout Seimbang & Autofit)
    const summaryCards = [
      {
        title: 'Total Kebutuhan Galon',
        value: `${formatNumber(totalGalonPembelian, 0)} Galon`,
        note: `Presisi: ${formatNumber(totalGalonPeriode, 1)} Galon (${formatNumber(totalLiterPeriode, 0)} L)`,
        icon: 'fa-bottle-water',
        type: 'emerald'
      },
      {
        title: 'Estimasi Biaya Air',
        value: formatRupiah(totalBiayaPeriode),
        note: `@ ${formatRupiah(biayaPerGalonTotal)} / Galon ${ongkir_per_galon > 0 ? `(+Antar ${formatRupiah(ongkir_per_galon)})` : ''}`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      },
      {
        title: 'Konsumsi Harian Riil',
        value: `${formatNumber(totalHarianBruto, 1)} L / Hari`,
        note: `Minum ${formatNumber(totalMinumBersih, 1)}L + Masak ${formatNumber(literMasak, 1)}L`,
        icon: 'fa-glass-water',
        type: 'sky'
      },
      {
        title: 'Siklus Habis 1 Galon',
        value: `Tiap ${formatNumber(hariHabisPerGalon, 1)} Hari`,
        note: `Est. ${totalGalonBulanan} Galon per Bulan (30h)`,
        icon: 'fa-clock',
        type: 'emerald'
      }
    ];

    // 5. Tabel Primer: Proyeksi Waktu
    const periods = [
      { label: '1 Minggu (7 Hari)', d: 7 },
      { label: '1 Bulan (30 Hari)', d: 30 },
      { label: '3 Bulan (90 Hari)', d: 90 },
      { label: '1 Tahun (365 Hari)', d: 365 },
      ...(hari !== 7 && hari !== 30 && hari !== 90 && hari !== 365 ? [{ label: `Kustom (${hari} Hari)`, d: hari, isCurrent: true }] : [])
    ];

    const tableHeaders = ['Periode', 'Minum Keluarga', 'Masak & Cadangan', 'Total Air (Liter)', 'Kebutuhan Galon', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const literMinum = totalMinumBersih * p.d;
      const literMasakCadangan = (literMasak + cadanganHarianLiter) * p.d;
      const totalL = totalHarianBruto * p.d;
      const galon = Math.ceil(totalL / 19);
      const cost = galon * biayaPerGalonTotal;
      const isCurr = p.d === hari;

      return {
        isCurrent: isCurr,
        cells: [
          `<strong>${p.label}</strong>`,
          `${formatNumber(literMinum, 1)} L`,
          `${formatNumber(literMasakCadangan, 1)} L`,
          `<strong>${formatNumber(totalL, 0)} L</strong>`,
          `${galon} Galon <span style="font-size:0.72rem; color:var(--text-muted);">(${formatNumber(totalL / 19, 1)})</span>`,
          `<strong class="highlight">${formatRupiah(cost)}</strong>`
        ]
      };
    });

    // 6. Tabel Sekunder: Struktur Penggunaan & Biaya Air Galon
    const total30HariL = totalHarianBruto * 30;
    const biaya30Hari = totalGalonBulanan * biayaPerGalonTotal;

    const hitungPorsi = (literHarian) => {
      const porsiLiter = literHarian * 30;
      const persen = total30HariL > 0 ? (porsiLiter / total30HariL) * 100 : 0;
      const porsiGalon = porsiLiter / 19;
      const estimasiBiaya = (persen / 100) * biaya30Hari;
      return { porsiLiter, persen, porsiGalon, estimasiBiaya };
    };

    const breakdownItems = [
      { nama: `Minum Orang Dewasa (${dewasa} Jiwa)`, liter: literMinumDewasa },
      { nama: `Minum Anak-Anak (${anak} Jiwa)`, liter: literMinumAnak },
      { nama: 'Masak Nasi & Kebutuhan Dapur', liter: literMasak },
      { nama: `Cadangan Tumpah & Sisa Dasar Galon (${cadangan_percent}%)`, liter: cadanganHarianLiter }
    ];

    const secondaryTable = {
      title: 'Struktur Penggunaan & Biaya Air Galon',
      subtitle: 'Rincian alokasi air minum per anggota keluarga, kebutuhan masak dapur, dan faktor cadangan tumpah.',
      headers: [
        'Komponen Alokasi',
        'Konsumsi (L/Hari)',
        'Volume 30 Hari',
        'Porsi Galon/Bln',
        'Estimasi Biaya/Bln',
        'Proporsi (%)'
      ],
      rows: breakdownItems.map(item => {
        const h = hitungPorsi(item.liter);
        return {
          isCurrent: false,
          cells: [
            `<strong>${item.nama}</strong>`,
            `${formatNumber(item.liter, 2)} L`,
            `${formatNumber(h.porsiLiter, 1)} L`,
            `${formatNumber(h.porsiGalon, 1)} Galon`,
            formatRupiah(Math.round(h.estimasiBiaya)),
            `<span class="badge" style="font-size:0.7rem;">${formatNumber(h.persen, 1)}%</span>`
          ]
        };
      })
    };

    // Row total untuk secondary table
    secondaryTable.rows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL PENGGUNAAN</strong>`,
        `<strong>${formatNumber(totalHarianBruto, 2)} L</strong>`,
        `<strong>${formatNumber(total30HariL, 1)} L</strong>`,
        `<strong>${totalGalonBulanan} Galon</strong>`,
        `<strong class="highlight" style="color:var(--accent-emerald);">${formatRupiah(biaya30Hari)}</strong>`,
        `<strong>100%</strong>`
      ]
    });

    // 7. Visual Chart Data
    const chartLabels = ['1 Minggu', '1 Bulan (30h)', '3 Bulan (90h)', '1 Tahun'];
    const chartDays = [7, 30, 90, 365];
    const chartDataValues = chartDays.map(d => Math.ceil((totalHarianBruto * d) / 19) * biayaPerGalonTotal);

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
            label: 'Biaya Air Galon (Rp)',
            data: chartDataValues,
            backgroundColor: 'rgba(6, 182, 212, 0.65)',
            borderColor: '#06b6d4',
            borderWidth: 2,
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${totalGalonPembelian} Galon`,
        totalCost: formatRupiah(totalBiayaPeriode)
      }
    };
  }
};
