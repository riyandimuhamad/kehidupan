/**
 * Modul Kalkulator Internet & Paket Data (Multi-HP & WiFi Rumah)
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber, saveToStorage, getFromStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_INTERNET_SETTINGS = 'internet_settings';
const STORAGE_KEY_HP_LIST = 'hp_list';

const DEFAULT_SETTINGS = {
  enable_wifi: false,
  enable_hp: false,
  provider_wifi: 'IndiHome / Biznet',
  biaya_wifi: 0
};

const DEFAULT_HP_LIST = [];

export const InternetModule = {
  id: 'internet',
  name: 'Internet & Data',
  icon: 'fa-wifi',
  badge: 'Module Komunikasi & Data',
  title: 'Kalkulator Internet & Paket Data HP Keluarga',
  subtitle: 'Hitung pengeluaran bulanan langganan WiFi Rumah dan/atau paket data seluler multi-HP keluarga secara fleksibel.',

  defaults: {},

  getSettings: () => {
    return getFromStorage(STORAGE_KEY_INTERNET_SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings: (settings) => {
    saveToStorage(STORAGE_KEY_INTERNET_SETTINGS, settings);
  },

  getHpList: () => {
    return getFromStorage(STORAGE_KEY_HP_LIST, DEFAULT_HP_LIST);
  },

  saveHpList: (hpList) => {
    saveToStorage(STORAGE_KEY_HP_LIST, hpList);
  },

  renderForm: (container, onInputChange) => {
    const settings = InternetModule.getSettings();
    const hpList = InternetModule.getHpList();

    const renderHpItem = (hp, index) => {
      return `
        <div class="card hp-item-card" data-hpid="${hp.id}" style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <div>
              <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">Nomor / HP #${index + 1}: ${hp.nama || 'Tanpa Nama'}</span>
            </div>
            <button type="button" class="sm-btn delete-hp-btn" data-hpid="${hp.id}" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3); padding: 2px 8px; font-size: 0.75rem;">
              <i class="fa-trash fa-solid"></i> Hapus
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Label / Pemilik HP</label>
              <input type="text" class="form-control hp-input-nama" data-hpid="${hp.id}" value="${hp.nama}" placeholder="Contoh: HP Ayah" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Provider / Kartu</label>
              <select class="form-control hp-input-provider" data-hpid="${hp.id}" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="Telkomsel / by.U" ${hp.provider === 'Telkomsel / by.U' || hp.provider === 'Telkomsel' || hp.provider === 'By.U' ? 'selected' : ''}>Telkomsel / by.U</option>
                <option value="Indosat IM3 / Tri (3)" ${hp.provider === 'Indosat IM3 / Tri (3)' || hp.provider === 'Indosat' || hp.provider === 'Tri (3)' ? 'selected' : ''}>Indosat IM3 / Tri (3)</option>
                <option value="XL / Axis / Smartfren" ${hp.provider === 'XL / Axis / Smartfren' || hp.provider === 'XL Axiata' || hp.provider === 'Smartfren' ? 'selected' : ''}>XL / Axis / Smartfren</option>
                <option value="Lainnya" ${hp.provider === 'Lainnya' ? 'selected' : ''}>Lainnya / Provider Lain</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 4px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Masa Aktif Paket</label>
              <select class="form-control hp-input-siklus" data-hpid="${hp.id}" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="30" ${(!hp.masa_aktif_hari || hp.masa_aktif_hari == 30) ? 'selected' : ''}>Bulanan (30 Hari)</option>
                <option value="7" ${hp.masa_aktif_hari == 7 ? 'selected' : ''}>Mingguan (7 Hari)</option>
                <option value="14" ${hp.masa_aktif_hari == 14 ? 'selected' : ''}>2 Minggu (14 Hari)</option>
                <option value="custom" ${hp.masa_aktif_hari != 30 && hp.masa_aktif_hari != 7 && hp.masa_aktif_hari != 14 && hp.masa_aktif_hari ? 'selected' : ''}>Custom Hari</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Harga Beli per Paket <span style="color: var(--text-muted);">(Rp)</span></label>
              <input type="number" class="form-control hp-input-nominal" data-hpid="${hp.id}" value="${hp.nominal}" step="1000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>

          <div class="hp-custom-hari-box" style="display: ${(hp.masa_aktif_hari && hp.masa_aktif_hari != 30 && hp.masa_aktif_hari != 7 && hp.masa_aktif_hari != 14) ? 'block' : 'none'}; margin-top: 6px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.72rem;">Jumlah Hari Masa Aktif Paket</label>
              <input type="number" class="form-control hp-input-custom-hari" data-hpid="${hp.id}" value="${hp.masa_aktif_hari || 30}" min="1" max="365" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <!-- Mode Selection: WiFi Rumah & Paket Data HP Toggles -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
        <label class="toggle-card ${settings.enable_wifi ? 'active' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid ${settings.enable_wifi ? 'var(--primary)' : 'var(--border-color)'}; background: ${settings.enable_wifi ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)'}; cursor: pointer;">
          <div>
            <strong style="font-size: 0.82rem; display: block; color: var(--text-main);">WiFi Rumah</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">IndiHome, Biznet, dll</span>
          </div>
          <input type="checkbox" id="toggleWifi" ${settings.enable_wifi ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;">
        </label>

        <label class="toggle-card ${settings.enable_hp ? 'active' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid ${settings.enable_hp ? 'var(--accent-emerald)' : 'var(--border-color)'}; background: ${settings.enable_hp ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)'}; cursor: pointer;">
          <div>
            <strong style="font-size: 0.82rem; display: block; color: var(--text-main);">Paket Data HP</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Multi-Nomor HP</span>
          </div>
          <input type="checkbox" id="toggleHp" ${settings.enable_hp ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-emerald); cursor: pointer;">
        </label>
      </div>

      <!-- Section 1: WiFi Rumah (If ON) -->
      <div id="wifiSection" style="display: ${settings.enable_wifi ? 'block' : 'none'}; background: rgba(99, 102, 241, 0.05); padding: 14px; border-radius: var(--radius-md); border: 1px solid rgba(99, 102, 241, 0.25); margin-bottom: 16px;">
        <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; color: var(--primary);">
          Langganan WiFi Rumah / Fixed Broadband
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="provider_wifi" style="font-size: 0.76rem;">Nama Provider WiFi</label>
            <input type="text" id="provider_wifi" class="form-control" placeholder="IndiHome / Biznet / Iconnet" value="${settings.provider_wifi || ''}" style="font-size: 0.8rem; padding: 6px 10px;">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label for="biaya_wifi" style="font-size: 0.76rem;">Biaya Langganan <span class="unit">(Rp/Bulan)</span></label>
            <input type="number" id="biaya_wifi" class="form-control" step="10000" placeholder="Ketik tagihan bulanan" value="${settings.biaya_wifi}" style="font-size: 0.8rem; padding: 6px 10px;">
          </div>
        </div>
      </div>

      <!-- Section 2: Paket Data HP Seluler (If ON) -->
      <div id="hpSection" style="display: ${settings.enable_hp ? 'block' : 'none'}; margin-bottom: 16px;">
        <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; color: var(--accent-emerald);">
          Rincian Paket Data Seluler (${hpList.length} HP / Nomor)
        </h4>

        <div id="hpListContainer">
          ${hpList.length > 0 ? hpList.map((hp, idx) => renderHpItem(hp, idx)).join('') : `
            <div style="text-align: center; padding: 18px 12px; background: var(--bg-body); border-radius: var(--radius-md); border: 1px dashed var(--border-color); margin-bottom: 14px;">
              <i class="fa-mobile-screen-button fa-solid" style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 6px; display: inline-block;"></i>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 4px 0;">Belum ada nomor HP yang didaftarkan.</p>
              <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">Klik tombol di bawah untuk menambahkan nomor pertama.</p>
            </div>
          `}
        </div>

        <button type="button" id="addHpBtn" class="outline-btn" style="width: 100%; justify-content: center; padding: 8px; font-size: 0.82rem;">
          <i class="fa-plus fa-solid"></i> Tambah Nomor HP / Paket Data Baru
        </button>
      </div>

      <!-- Save Button -->
      <div style="margin-top: 14px;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669); padding: 10px;">
          <i class="fa-bookmark fa-solid"></i> Simpan Total Ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); text-align: center; display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Toggle Checkboxes Listeners
    const toggleWifi = container.querySelector('#toggleWifi');
    const toggleHp = container.querySelector('#toggleHp');

    toggleWifi.addEventListener('change', () => {
      const currentS = InternetModule.getSettings();
      currentS.enable_wifi = toggleWifi.checked;
      InternetModule.saveSettings(currentS);
      InternetModule.renderForm(container, onInputChange);
      onInputChange();
    });

    toggleHp.addEventListener('change', () => {
      const currentS = InternetModule.getSettings();
      currentS.enable_hp = toggleHp.checked;
      InternetModule.saveSettings(currentS);
      InternetModule.renderForm(container, onInputChange);
      onInputChange();
    });

    // Bind real-time input listeners
    const bindInputs = () => {
      const currentS = InternetModule.getSettings();

      currentS.provider_wifi = container.querySelector('#provider_wifi')?.value.trim() || '';
      currentS.biaya_wifi = parseFloat(container.querySelector('#biaya_wifi')?.value || 0);

      InternetModule.saveSettings(currentS);

      // Collect HP items
      const allHpCards = container.querySelectorAll('.hp-item-card');
      const updatedHpList = [];

      allHpCards.forEach(card => {
        const id = card.getAttribute('data-hpid');
        const nama = card.querySelector('.hp-input-nama')?.value.trim() || '';
        const provider = card.querySelector('.hp-input-provider')?.value || 'Telkomsel';
        const siklus = card.querySelector('.hp-input-siklus')?.value || '30';
        const customHariVal = parseFloat(card.querySelector('.hp-input-custom-hari')?.value || 30);
        const masa_aktif_hari = siklus === 'custom' ? customHariVal : parseFloat(siklus);
        const nominal = parseFloat(card.querySelector('.hp-input-nominal')?.value || 0);

        updatedHpList.push({
          id,
          nama,
          provider,
          masa_aktif_hari,
          nominal
        });
      });

      InternetModule.saveHpList(updatedHpList);
      onInputChange();
    };

    // Toggle custom hari listener
    container.addEventListener('change', (e) => {
      if (e.target.classList.contains('hp-input-siklus')) {
        const card = e.target.closest('.hp-item-card');
        const customBox = card?.querySelector('.hp-custom-hari-box');
        if (customBox) {
          customBox.style.display = e.target.value === 'custom' ? 'block' : 'none';
        }
        bindInputs();
      }
    });

    container.querySelectorAll('input, select').forEach(elem => {
      elem.addEventListener('input', bindInputs);
    });

    // Delete HP Listener
    container.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-hp-btn');
      if (delBtn) {
        const hpid = delBtn.getAttribute('data-hpid');
        const currentHp = InternetModule.getHpList();
        const updated = currentHp.filter(h => h.id !== hpid);
        InternetModule.saveHpList(updated);
        InternetModule.renderForm(container, onInputChange);
        onInputChange();
      }
    });

    // Add HP Listener
    const addHpBtn = container.querySelector('#addHpBtn');
    if (addHpBtn) {
      addHpBtn.addEventListener('click', () => {
        const currentHp = InternetModule.getHpList();
        const newHp = {
          id: 'hp_' + Date.now(),
          nama: `HP Tambahan #${currentHp.length + 1}`,
          provider: 'Telkomsel',
          nominal: 50000
        };

        const updated = [...currentHp, newHp];
        InternetModule.saveHpList(updated);
        InternetModule.renderForm(container, onInputChange);
        onInputChange();
      });
    }

    // Save to Budget Dashboard Listener
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentS = InternetModule.getSettings();
      const currentHp = InternetModule.getHpList();
      const calcResult = InternetModule.calculate({ settings: currentS, hpList: currentHp });

      BudgetStore.saveBudgetItem('internet', {
        id: 'internet',
        name: 'Internet & Paket Data',
        amount: calcResult.total_biaya,
        category: 'Pokok',
        source: `Kalkulator Internet (${currentS.enable_wifi ? 'WiFi' : ''}${currentS.enable_wifi && currentS.enable_hp ? ' + ' : ''}${currentS.enable_hp ? currentHp.length + ' HP' : ''})`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Total Est. ${formatRupiah(calcResult.total_biaya)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: () => {
    return {
      settings: InternetModule.getSettings(),
      hpList: InternetModule.getHpList()
    };
  },

  calculate: (inputs) => {
    const s = inputs?.settings || InternetModule.getSettings();
    const hpList = inputs?.hpList || InternetModule.getHpList();

    const total_wifi = s.enable_wifi ? (s.biaya_wifi || 0) : 0;
    
    let total_hp_data_bulanan = 0;
    const hpCalculations = [];

    if (s.enable_hp) {
      hpList.forEach(hp => {
        const masaAktif = hp.masa_aktif_hari > 0 ? hp.masa_aktif_hari : 30;
        const hargaBeli = hp.nominal || 0;
        // Normalisasi biaya sebulan (30 hari)
        const biayaBulanan = masaAktif > 0 ? (hargaBeli / masaAktif) * 30 : hargaBeli;
        total_hp_data_bulanan += biayaBulanan;

        hpCalculations.push({
          ...hp,
          masaAktif,
          hargaBeli,
          biayaBulanan
        });
      });
    }

    const total_biaya = total_wifi + total_hp_data_bulanan;

    const summaryCards = [
      {
        title: 'WiFi Rumah',
        value: s.enable_wifi ? formatRupiah(total_wifi) : 'Non-Aktif',
        note: s.enable_wifi ? (s.provider_wifi || 'Fixed Broadband') : 'Mode WiFi Dimatikan',
        icon: 'fa-wifi',
        type: s.enable_wifi ? 'emerald' : 'sky'
      },
      {
        title: 'Total Paket Data Seluler',
        value: s.enable_hp ? formatRupiah(total_hp_data_bulanan) : 'Non-Aktif',
        note: s.enable_hp ? `${hpList.length} Nomor HP Active (Est. Bulanan)` : 'Mode HP Dimatikan',
        icon: 'fa-mobile-screen',
        type: s.enable_hp ? 'amber' : 'sky'
      },
      {
        title: 'Total Biaya Komunikasi',
        value: formatRupiah(total_biaya),
        note: `Pengeluaran Normalisasi 1 Bulan`,
        icon: 'fa-money-bill-wave',
        type: 'emerald'
      }
    ];

    // Primary Breakdown Table: Rincian per Komponen
    const tableHeaders = ['Komponen / Nomor', 'Provider / Paket', 'Siklus Beli', 'Nominal Beli', 'Alokasi Bulanan (Rp)'];
    const tableRows = [];

    if (s.enable_wifi) {
      tableRows.push({
        isCurrent: false,
        cells: [
          `<strong>WiFi Rumah</strong>`,
          `${s.provider_wifi || 'Fixed Broadband'}`,
          `Bulanan (30h)`,
          `${formatRupiah(total_wifi)}`,
          `${formatRupiah(total_wifi)}`
        ]
      });
    }

    if (s.enable_hp) {
      hpCalculations.forEach(hp => {
        const siklusLabel = hp.masaAktif == 7 ? 'Mingguan (7h)' : hp.masaAktif == 14 ? '2 Minggu (14h)' : hp.masaAktif == 30 ? 'Bulanan (30h)' : `${hp.masaAktif} Hari`;
        tableRows.push({
          isCurrent: false,
          cells: [
            `<strong>${hp.nama || 'HP'}</strong>`,
            `<span class="badge" style="font-size:0.68rem;">${hp.provider || 'Seluler'}</span>`,
            `${siklusLabel}`,
            `${formatRupiah(hp.hargaBeli)}`,
            `<span class="highlight">${formatRupiah(hp.biayaBulanan)}</span>`
          ]
        });
      });
    }

    // Total Row
    tableRows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL BIAYA KOMUNIKASI</strong>`,
        `<strong>-</strong>`,
        `<strong>-</strong>`,
        `<strong>-</strong>`,
        `<strong class="highlight" style="font-size: 1rem; color: var(--accent-emerald);">${formatRupiah(total_biaya)}</strong>`
      ]
    });

    // Secondary Projection Table: Proyeksi Berdasarkan Periode Waktu (3 Bulan, 6 Bulan, 1 Tahun)
    const secondaryTable = {
      title: 'Proyeksi Anggaran Komunikasi & Internet Jangka Panjang',
      subtitle: 'Akumulasi estimasi langganan WiFi dan paket data seluler berdasarkan periode waktu keuangan.',
      headers: [
        'Periode Waktu',
        'WiFi Rumah',
        'Paket Data Seluler',
        'Total Proyeksi Komunikasi'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>3 Bulan (Kuartal)</strong>`,
            formatRupiah(total_wifi * 3),
            formatRupiah(total_hp_data_bulanan * 3),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(total_biaya * 3)}</strong>`
          ]
        },
        {
          isCurrent: false,
          cells: [
            `<strong>6 Bulan (Semester)</strong>`,
            formatRupiah(total_wifi * 6),
            formatRupiah(total_hp_data_bulanan * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(total_biaya * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>1 Tahun Penuh (12 Bulan)</strong>`,
            formatRupiah(total_wifi * 12),
            formatRupiah(total_hp_data_bulanan * 12),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(total_biaya * 12)}</strong>`
          ]
        }
      ]
    };

    const chartLabels = [];
    const chartDataValues = [];
    const chartColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

    if (s.enable_wifi) {
      chartLabels.push(`WiFi (${s.provider_wifi || 'Rumah'})`);
      chartDataValues.push(Math.round(total_wifi));
    }

    if (s.enable_hp) {
      hpList.forEach(hp => {
        chartLabels.push(hp.nama || 'HP');
        chartDataValues.push(Math.round(hp.nominal || 0));
      });
    }

    return {
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      secondaryTable,
      chartData: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Alokasi Biaya Internet (Rp/Bulan)',
            data: chartDataValues,
            backgroundColor: chartColors.slice(0, chartLabels.length)
          }
        ]
      },
      quickStats: {
        totalQty: `${s.enable_wifi ? 'WiFi' : ''}${s.enable_wifi && s.enable_hp ? ' + ' : ''}${s.enable_hp ? hpList.length + ' HP' : ''}`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
