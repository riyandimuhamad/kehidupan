/**
 * Modul Kalkulator Zakat & Donasi Sosial
 * Kehidupan App Suite
 * 
 * Sesuai Standar Resmi BAZNAS (Badan Amil Zakat Nasional) & Fatwa MUI:
 * 1. Zakat Penghasilan / Profesi (2,5% jika mencapai nisab 85 gr emas / bulan)
 * 2. Zakat Maal (Harta Simpanan / Tabungan / Emas 2,5% per tahun jika mencapai nisab & haul)
 * 3. Zakat Fitrah (2,5 kg beras atau Rp 45.000 - Rp 55.000 per jiwa saat Ramadan)
 * 4. Infak & Sedekah Rutin Bulanan
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_ZAKAT = 'zakat_data';

export const ZakatModule = {
  id: 'zakat',
  name: 'Zakat & Donasi',
  icon: 'fa-hand-holding-heart',
  badge: 'Module Kewajiban Finansial',
  title: 'Kalkulator Zakat & Donasi Sosial',
  subtitle: 'Kalkulasi Zakat Penghasilan, Zakat Maal (Tabungan/Emas), Zakat Fitrah, dan Sedekah sesuai standar nisab BAZNAS & regulasi fiqih.',

  defaults: {
    // 1. Zakat Penghasilan
    enable_penghasilan: true,
    penghasilan_pokok_bulan: 0,
    pendapatan_lain_bulan: 0,
    harga_emas_per_gram: 1400000, // Harga emas acuan BAZNAS (Rp 1.400.000/gram)
    nisab_bulanan_override: 7640144, // SK BAZNAS terbaru: Rp 7.640.144/bulan

    // 2. Zakat Maal (Tabungan & Emas Simpanan Haul 1 Tahun)
    enable_maal: true,
    tabungan_deposito: 0,
    emas_simpanan_gram: 0,
    utang_jatuh_tempo: 0,

    // 3. Zakat Fitrah (Ramadan Tahunan)
    enable_fitrah: true,
    jumlah_jiwa: 0,
    tarif_fitrah_per_jiwa: 50000, // Standar SK BAZNAS per jiwa (Rp 45k - Rp 55k)

    // 4. Infak & Sedekah Rutin
    enable_infak: true,
    infak_sedekah_bulan: 0,

    hari: 30
  },

  getData: () => {
    return getFromStorage(STORAGE_KEY_ZAKAT, { ...ZakatModule.defaults });
  },

  saveData: (data) => {
    saveToStorage(STORAGE_KEY_ZAKAT, data);
  },

  renderForm: (container, onInputChange) => {
    const data = ZakatModule.getData();

    const nisabTahunan = 85 * data.harga_emas_per_gram;
    const nisabBulanan = data.nisab_bulanan_override || ((85 * data.harga_emas_per_gram) / 12);

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Kewajiban Zakat & Donasi Sosial
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Ketentuan nisab 85 gram emas resmi BAZNAS (Nisab Bulanan: ${formatRupiah(nisabBulanan)}).
        </p>
      </div>

      <!-- Section 1: Zakat Penghasilan / Profesi -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">
            Zakat Penghasilan / Profesi
          </span>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer; margin: 0;">
            <input type="checkbox" id="enable_penghasilan" ${data.enable_penghasilan ? 'checked' : ''}>
            <span>Aktifkan</span>
          </label>
        </div>

        <div id="penghasilanFields" style="display: ${data.enable_penghasilan ? 'block' : 'none'};">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
                <span>Gaji Pokok / Bulan</span> <span class="unit">(Rp)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-wallet fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="penghasilan_pokok_bulan" class="form-control" step="100000" value="${data.penghasilan_pokok_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
                <span>Bonus / Pendapatan Lain</span> <span class="unit">(Rp)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-money-bill-wave fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="pendapatan_lain_bulan" class="form-control" step="100000" value="${data.pendapatan_lain_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
                <span>Harga Emas BAZNAS</span> <span class="unit">(Rp/Gram)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-coins fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="harga_emas_per_gram" class="form-control" step="10000" value="${data.harga_emas_per_gram}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
                <span>Nisab Bulanan SK</span> <span class="unit">(Rp/Bulan)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-scale-balanced fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="nisab_bulanan_override" class="form-control" step="10000" value="${data.nisab_bulanan_override}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Zakat Maal (Tabungan, Deposito, Emas Simpanan Haul 1 Tahun) -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">
            Zakat Maal (Harta Simpanan 1 Tahun)
          </span>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer; margin: 0;">
            <input type="checkbox" id="enable_maal" ${data.enable_maal ? 'checked' : ''}>
            <span>Aktifkan</span>
          </label>
        </div>

        <div id="maalFields" style="display: ${data.enable_maal ? 'block' : 'none'};">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
                <span>Tabungan & Deposito</span> <span class="unit">(Rp)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-landmark fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="tabungan_deposito" class="form-control" step="1000000" value="${data.tabungan_deposito}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
                <span>Emas Batangan</span> <span class="unit">(Gram)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-gem fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" id="emas_simpanan_gram" class="form-control" step="5" value="${data.emas_simpanan_gram}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Utang Jatuh Tempo</span> <span class="unit">(Rp - Pengurang)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-hand-holding-dollar fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="utang_jatuh_tempo" class="form-control" step="500000" value="${data.utang_jatuh_tempo}" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin: 4px 0 0 0;">*Nisab zakat maal tahunan: 85 gram emas = ${formatRupiah(nisabTahunan)} (Haul 1 tahun tersimpan).</p>
        </div>
      </div>

      <!-- Section 3: Zakat Fitrah (Ramadan) & Infak -->
      <div class="card" style="margin-bottom: 14px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 12px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          Zakat Fitrah & Sedekah Rutin
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Jumlah Jiwa</span> <span class="unit">(Orang)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-users fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="jumlah_jiwa" class="form-control" min="1" max="20" value="${data.jumlah_jiwa}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
              <span>Tarif Fitrah / Jiwa</span> <span class="unit">(Rp)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-tag fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" id="tarif_fitrah_per_jiwa" class="form-control" step="5000" value="${data.tarif_fitrah_per_jiwa}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px; white-space: nowrap;">
            <span>Infak & Sedekah Rutin</span> <span class="unit">(Rp/Bulan)</span>
          </label>
          <div class="input-wrapper">
            <i class="fa-hand-holding-heart fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
            <input type="number" id="infak_sedekah_bulan" class="form-control" step="25000" value="${data.infak_sedekah_bulan}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
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
        ZakatModule.saveFormData(container);
        onInputChange();
      });
    });

    // Checkbox toggles
    const toggleSections = () => {
      const pCheck = container.querySelector('#enable_penghasilan');
      const mCheck = container.querySelector('#enable_maal');
      container.querySelector('#penghasilanFields').style.display = pCheck.checked ? 'block' : 'none';
      container.querySelector('#maalFields').style.display = mCheck.checked ? 'block' : 'none';
    };

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        toggleSections();
        ZakatModule.saveFormData(container);
        onInputChange();
      });
    });

    // Save to Budget Dashboard Button
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = ZakatModule.getFormInputs(container);
      const res = ZakatModule.calculateMonthly(currentInputs);

      if (!res.total_biaya || res.total_biaya <= 0) {
        notice.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-circle-exclamation fa-solid"></i> Nominal zakat/donasi masih Rp 0. Aktifkan zakat penghasilan/maal atau masukkan nilai sedekah.</span>`;
        setTimeout(() => notice.innerHTML = '', 4000);
        return;
      }

      BudgetStore.saveBudgetItem('zakat', {
        id: 'zakat',
        name: 'Zakat & Donasi Sosial',
        amount: res.total_biaya,
        category: 'Pokok',
        source: 'Kalkulator Zakat BAZNAS'
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Alokasi zakat & donasi ${formatRupiah(res.total_biaya)}/bln telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4500);
    });
  },

  saveFormData: (container) => {
    const data = ZakatModule.getFormInputs(container);
    ZakatModule.saveData(data);
  },

  getFormInputs: (container) => {
    return {
      enable_penghasilan: container.querySelector('#enable_penghasilan')?.checked ?? true,
      penghasilan_pokok_bulan: parseFloat(container.querySelector('#penghasilan_pokok_bulan')?.value || 8500000),
      pendapatan_lain_bulan: parseFloat(container.querySelector('#pendapatan_lain_bulan')?.value || 0),
      harga_emas_per_gram: parseFloat(container.querySelector('#harga_emas_per_gram')?.value || 1400000),
      nisab_bulanan_override: parseFloat(container.querySelector('#nisab_bulanan_override')?.value || 7640144),

      enable_maal: container.querySelector('#enable_maal')?.checked ?? true,
      tabungan_deposito: parseFloat(container.querySelector('#tabungan_deposito')?.value || 25000000),
      emas_simpanan_gram: parseFloat(container.querySelector('#emas_simpanan_gram')?.value || 0),
      utang_jatuh_tempo: parseFloat(container.querySelector('#utang_jatuh_tempo')?.value || 0),

      enable_fitrah: true,
      jumlah_jiwa: parseInt(container.querySelector('#jumlah_jiwa')?.value || 3, 10),
      tarif_fitrah_per_jiwa: parseFloat(container.querySelector('#tarif_fitrah_per_jiwa')?.value || 50000),

      enable_infak: true,
      infak_sedekah_bulan: parseFloat(container.querySelector('#infak_sedekah_bulan')?.value || 100000),

      hari: 30
    };
  },

  calculateMonthly: (inputs) => {
    const res = ZakatModule.calculate(inputs);
    return {
      total_biaya: res.internalTotalBiaya || 0
    };
  },

  calculate: (inputs) => {
    const s = { ...ZakatModule.defaults, ...inputs };
    const {
      enable_penghasilan, penghasilan_pokok_bulan, pendapatan_lain_bulan, harga_emas_per_gram, nisab_bulanan_override,
      enable_maal, tabungan_deposito, emas_simpanan_gram, utang_jatuh_tempo,
      enable_fitrah, jumlah_jiwa, tarif_fitrah_per_jiwa,
      enable_infak, infak_sedekah_bulan
    } = s;

    // 1. Zakat Penghasilan
    const totalPenghasilanBulan = penghasilan_pokok_bulan + pendapatan_lain_bulan;
    const nisabBulanan = nisab_bulanan_override || ((85 * harga_emas_per_gram) / 12);
    const wajibZakatProfesi = enable_penghasilan && (totalPenghasilanBulan >= nisabBulanan);
    const zakatProfesiBulan = wajibZakatProfesi ? (totalPenghasilanBulan * 0.025) : 0;

    // 2. Zakat Maal (Harta Simpanan)
    const nisabTahunan = 85 * harga_emas_per_gram;
    const nilaiEmas = emas_simpanan_gram * harga_emas_per_gram;
    const totalHartaMaal = Math.max(0, (tabungan_deposito + nilaiEmas) - utang_jatuh_tempo);
    const wajibZakatMaal = enable_maal && (totalHartaMaal >= nisabTahunan);
    const zakatMaalTahun = wajibZakatMaal ? (totalHartaMaal * 0.025) : 0;
    const zakatMaalSinkingBulan = zakatMaalTahun / 12;

    // 3. Zakat Fitrah
    const totalFitrahTahun = enable_fitrah ? (jumlah_jiwa * tarif_fitrah_per_jiwa) : 0;
    const fitrahSinkingBulan = totalFitrahTahun / 12;

    // 4. Infak & Sedekah
    const infakBulan = enable_infak ? infak_sedekah_bulan : 0;

    // 5. Total Alokasi Bulanan
    const totalAlokasiZakatBulan = zakatProfesiBulan + zakatMaalSinkingBulan + fitrahSinkingBulan + infakBulan;
    const totalAlokasiTahunan = (zakatProfesiBulan * 12) + zakatMaalTahun + totalFitrahTahun + (infakBulan * 12);

    // Summary Cards (4 Cards)
    const summaryCards = [
      {
        title: 'Alokasi Zakat & Donasi',
        value: formatRupiah(totalAlokasiZakatBulan),
        note: `Total disisihkan per bulan`,
        icon: 'fa-hand-holding-heart',
        type: 'emerald'
      },
      {
        title: 'Zakat Penghasilan / Bln',
        value: formatRupiah(zakatProfesiBulan),
        note: wajibZakatProfesi 
          ? `Wajib Zakat 2.5% (Gaji >= Nisab ${formatRupiah(nisabBulanan)})` 
          : `Belum Nisab (${formatRupiah(totalPenghasilanBulan)} < ${formatRupiah(nisabBulanan)})`,
        icon: 'fa-briefcase',
        type: wajibZakatProfesi ? 'emerald' : 'sky'
      },
      {
        title: 'Zakat Maal (Tahunan)',
        value: formatRupiah(zakatMaalTahun),
        note: wajibZakatMaal 
          ? `Wajib Zakat Maal (Cadangan ${formatRupiah(zakatMaalSinkingBulan)}/bln)` 
          : `Belum Capai Nisab (${formatRupiah(totalHartaMaal)} < ${formatRupiah(nisabTahunan)})`,
        icon: 'fa-vault',
        type: wajibZakatMaal ? 'emerald' : 'amber'
      },
      {
        title: 'Fitrah & Infak Rutin',
        value: formatRupiah(totalFitrahTahun + (infakBulan * 12)),
        note: `Fitrah ${jumlah_jiwa} Jiwa (${formatRupiah(totalFitrahTahun)}) + Infak ${formatRupiah(infakBulan)}/bln`,
        icon: 'fa-bowl-rice',
        type: 'emerald'
      }
    ];

    // Primary Breakdown Table
    const tableHeaders = ['Jenis Ibadah Zakat', 'Ketentuan Nisab', 'Dasar Perhitungan (Rp)', 'Kewajiban 1 Tahun', 'Alokasi Bulanan (Sinking Fund)', 'Status'];
    const tableRows = [
      {
        isCurrent: false,
        cells: [
          `<strong>Zakat Penghasilan (Profesi)</strong>`,
          `${formatRupiah(nisabBulanan)}/Bulan (85 gr Emas)`,
          formatRupiah(totalPenghasilanBulan),
          formatRupiah(zakatProfesiBulan * 12),
          formatRupiah(zakatProfesiBulan),
          wajibZakatProfesi 
            ? `<span class="badge" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald);">Wajib 2.5%</span>`
            : `<span class="badge" style="background: var(--bg-input); color: var(--text-muted);">Di Bawah Nisab</span>`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>Zakat Maal (Harta Simpanan)</strong>`,
          `${formatRupiah(nisabTahunan)} (85 gr Emas Haul 1 Thn)`,
          formatRupiah(totalHartaMaal),
          formatRupiah(zakatMaalTahun),
          formatRupiah(zakatMaalSinkingBulan),
          wajibZakatMaal 
            ? `<span class="badge" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald);">Wajib 2.5%</span>`
            : `<span class="badge" style="background: var(--bg-input); color: var(--text-muted);">Di Bawah Nisab</span>`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>Zakat Fitrah (${jumlah_jiwa} Jiwa)</strong>`,
          `2.5 kg Beras / Jiwa (Ramadan)`,
          `${jumlah_jiwa} Jiwa × ${formatRupiah(tarif_fitrah_per_jiwa)}`,
          formatRupiah(totalFitrahTahun),
          formatRupiah(fitrahSinkingBulan),
          `<span class="badge" style="background: rgba(6,182,212,0.15); color: var(--accent-sky);">Wajib Jiwa</span>`
        ]
      },
      {
        isCurrent: false,
        cells: [
          `<strong>Infak & Sedekah Rutin</strong>`,
          `Sukarela Tanpa Batas Nisab`,
          formatRupiah(infakBulan),
          formatRupiah(infakBulan * 12),
          formatRupiah(infakBulan),
          `<span class="badge" style="background: rgba(245,158,11,0.15); color: var(--accent-amber);">Sunnah Berkah</span>`
        ]
      },
      {
        isCurrent: true,
        cells: [
          `<strong>TOTAL ALOKASI ZAKAT & DONASI</strong>`,
          `-`,
          `-`,
          `<strong>${formatRupiah(totalAlokasiTahunan)}</strong>`,
          `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.95rem;">${formatRupiah(totalAlokasiZakatBulan)}</strong>`,
          `<strong>100%</strong>`
        ]
      }
    ];

    // Secondary Table: Proyeksi Jangka Panjang
    const secondaryTable = {
      title: 'Proyeksi Tabungan & Distribusi Zakat Jangka Panjang',
      subtitle: 'Akumulasi dana pembersih harta dan penyempurna ibadah untuk muzakki & mustahik.',
      headers: [
        'Periode Proyeksi',
        'Durasi Waktu',
        'Zakat Profesi',
        'Cadangan Zakat Maal',
        'Cadangan Fitrah & Infak',
        'Total Akumulasi Zakat'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>Proyeksi 1 Semester</strong>`,
            `6 Bulan (Semester)`,
            formatRupiah(zakatProfesiBulan * 6),
            formatRupiah(zakatMaalSinkingBulan * 6),
            formatRupiah((fitrahSinkingBulan + infakBulan) * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(totalAlokasiZakatBulan * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>Proyeksi 1 Tahun Penuh</strong>`,
            `12 Bulan (1 Tahun Penuh)`,
            formatRupiah(zakatProfesiBulan * 12),
            formatRupiah(zakatMaalTahun),
            formatRupiah(totalFitrahTahun + (infakBulan * 12)),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(totalAlokasiTahunan)}</strong>`
          ]
        }
      ]
    };

    // Chart Data
    return {
      internalTotalBiaya: totalAlokasiZakatBulan,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: ['Zakat Penghasilan', 'Zakat Maal (Cadangan/Bln)', 'Zakat Fitrah (Cadangan/Bln)', 'Infak & Sedekah'],
        datasets: [
          {
            label: 'Alokasi Bulanan (Rp)',
            data: [
              zakatProfesiBulan,
              zakatMaalSinkingBulan,
              fitrahSinkingBulan,
              infakBulan
            ],
            backgroundColor: ['#6366f1', '#f59e0b', '#06b6d4', '#10b981'],
            borderRadius: 8
          }
        ]
      },
      quickStats: {
        totalQty: `${wajibZakatProfesi ? 'Wajib Profesi' : 'Non-Nisab'}`,
        totalCost: formatRupiah(totalAlokasiZakatBulan)
      }
    };
  }
};
