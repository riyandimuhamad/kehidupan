/**
 * Modul Kalkulator Pendidikan & Kebutuhan Anak (Multi-Anak Dinamis & Realistis)
 * Kehidupan App Suite
 * 
 * Mendukung perhitungan spesifik kebutuhan tiap anak sesuai usia & jenjang:
 * - Balita (Nutrisi, Popok, Daycare)
 * - PAUD / TK, SD, SMP, SMA (SPP, Uang Saku Harian x Hari Aktif, Transport, Tugas Kelompok/Praktikum, Les)
 * - Kuliah (UKT, Kos/Transport, Praktikum, Uang Saku)
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_CHILDREN = 'kehidupan_pendidikan_children';

const DEFAULT_CHILDREN = [];

export const PendidikanModule = {
  id: 'pendidikan',
  name: 'Pendidikan & Anak',
  icon: 'fa-graduation-cap',
  badge: 'Module Edukasi & Keluarga',
  title: 'Kalkulator Pendidikan & Kebutuhan Anak',
  subtitle: 'Hitung pengeluaran realistis setiap anak secara fleksibel (SPP, uang saku harian, ongkos transport, tugas kelompok/praktikum, les, hingga kebutuhan balita).',

  defaults: {},

  getChildren: () => {
    return getFromStorage(STORAGE_KEY_CHILDREN, DEFAULT_CHILDREN);
  },

  saveChildren: (children) => {
    saveToStorage(STORAGE_KEY_CHILDREN, children);
  },

  getJenjangLabel: (jenjang) => {
    switch (jenjang) {
      case 'balita': return 'Balita (0-5 Thn)';
      case 'tk': return 'PAUD / TK';
      case 'sd': return 'SD (Sekolah Dasar)';
      case 'smp': return 'SMP';
      case 'sma': return 'SMA / SMK';
      case 'kuliah': return 'Kuliah / Perguruan Tinggi';
      default: return 'Lainnya / Kursus';
    }
  },

  renderForm: (container, onInputChange) => {
    const children = PendidikanModule.getChildren();

    const renderChildFormItem = (child, index) => {
      const sakuHari = child.uang_saku_hari || 0;
      const hariAktif = child.hari_aktif || 0;
      const uangSakuBulan = sakuHari * hariAktif;
      const subtotalChild = (child.spp_bulan || 0) + uangSakuBulan + (child.transport_bulan || 0) + 
                            (child.tugas_kelompok_bulan || 0) + (child.les_kursus_bulan || 0) + 
                            (child.kebutuhan_lain || 0);

      const jenjangLabel = PendidikanModule.getJenjangLabel(child.jenjang);
      const isBalita = child.jenjang === 'balita';

      return `
        <div class="card child-item-card" data-cid="${child.id}" style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px; box-shadow: var(--shadow-sm);">
          
          <!-- Header Kartu Anak (Clean Text Header Tanpa Icon Depan) -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
            <div>
              <span class="c-title-display" style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); display: block;">
                Anak #${index + 1}: ${child.nama || 'Tanpa Nama'}
              </span>
              <span class="c-meta-display" style="font-size: 0.74rem; color: var(--text-muted);">
                ${jenjangLabel} &bull; ${child.usia || 0} Tahun
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="c-subtotal-badge" style="display: inline-flex; align-items: center; justify-content: center; height: 30px; padding: 0 10px; font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald); background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); border-radius: 8px; box-sizing: border-box; line-height: 1;">
                ${formatRupiah(subtotalChild)}/bln
              </span>
              <button type="button" class="sm-btn delete-child-btn" data-cid="${child.id}" title="Hapus profil anak ini" style="display: inline-flex; align-items: center; justify-content: center; height: 30px; width: 30px; min-width: 30px; padding: 0; font-size: 0.82rem; color: var(--accent-rose); background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; box-sizing: border-box; cursor: pointer; transition: all 0.2s ease;">
                <i class="fa-trash fa-solid"></i>
              </button>
            </div>
          </div>

          <!-- Section 1: Data Diri & Jenjang Pendidikan (2 Kolom Lapang) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Nama / Panggilan</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-user fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="text" class="form-control c-input-nama" data-cid="${child.id}" value="${child.nama}" placeholder="Contoh: Kakak / Rian" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Usia</span> <span class="unit">(Tahun)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-cake-candles fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control c-input-usia" data-cid="${child.id}" value="${child.usia}" min="0" max="35" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Jenjang</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-graduation-cap fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <select class="form-control c-input-jenjang" data-cid="${child.id}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                  <option value="balita" ${child.jenjang === 'balita' ? 'selected' : ''}>Balita (0-5 Thn)</option>
                  <option value="tk" ${child.jenjang === 'tk' ? 'selected' : ''}>PAUD / TK</option>
                  <option value="sd" ${child.jenjang === 'sd' ? 'selected' : ''}>SD</option>
                  <option value="smp" ${child.jenjang === 'smp' ? 'selected' : ''}>SMP</option>
                  <option value="sma" ${child.jenjang === 'sma' ? 'selected' : ''}>SMA / SMK</option>
                  <option value="kuliah" ${child.jenjang === 'kuliah' ? 'selected' : ''}>Kuliah / PT</option>
                  <option value="lainnya" ${child.jenjang === 'lainnya' ? 'selected' : ''}>Lainnya</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Kelas / Tingkat</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-chalkboard-user fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="text" class="form-control c-input-kelas" data-cid="${child.id}" value="${child.kelas}" placeholder="Contoh: 3 SMA / Sem 4" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <!-- Section 2: SPP / UKT Bulanan & Uang Saku (Kalkulasi Dinamis Nyata) -->
          <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                  <span>SPP / UKT</span> <span class="unit">(Rp/Bln)</span>
                </label>
                <div class="input-wrapper">
                  <i class="fa-receipt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                  <input type="number" class="form-control c-input-spp" data-cid="${child.id}" value="${child.spp_bulan}" step="25000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                  <span>Hari Aktif</span> <span class="unit">(Hari/Bln)</span>
                </label>
                <div class="input-wrapper">
                  <i class="fa-calendar-days fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                  <input type="number" class="form-control c-input-hari" data-cid="${child.id}" value="${child.hari_aktif}" min="0" max="31" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                </div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 8px;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Uang Saku & Jajan</span> <span class="unit">(Rp/Hari)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-wallet fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control c-input-saku" data-cid="${child.id}" value="${child.uang_saku_hari}" step="2000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <!-- Perhitungan Dinamis Uang Saku Real-Time (Otomatis Berubah Saat Input Diketik) -->
            <div class="c-saku-calc-box" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: rgba(99, 102, 241, 0.08); border-radius: var(--radius-sm); border: 1px dashed rgba(99, 102, 241, 0.3);">
              <span style="font-size: 0.73rem; color: var(--text-muted);">
                Estimasi Uang Saku Bulanan <span class="c-saku-formula" style="font-size: 0.68rem; color: var(--text-muted);">(${hariAktif} hari x ${formatRupiah(sakuHari)})</span>:
              </span>
              <strong class="c-saku-total-display" style="font-size: 0.82rem; color: var(--primary);">
                ${formatRupiah(uangSakuBulan)}
              </strong>
            </div>
          </div>

          <!-- Section 3: Transportasi & Tugas Kelompok / Praktikum (2 Kolom) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Transport / Bensin</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-bus fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control c-input-transport" data-cid="${child.id}" value="${child.transport_bulan}" step="10000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Tugas & Praktikum</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-book-open fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control c-input-tugas" data-cid="${child.id}" value="${child.tugas_kelompok_bulan}" step="10000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <!-- Section 4: Les / Bimbel & Kebutuhan Balita / Ekstra (2 Kolom) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Les & Ekskul</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-chalkboard fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control c-input-les" data-cid="${child.id}" value="${child.les_kursus_bulan}" step="25000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="c-extra-label" style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span class="c-extra-title">${isBalita ? 'Susu & Popok' : 'Buku & Ekstra'}</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="c-extra-icon fa-solid ${isBalita ? 'fa-baby' : 'fa-pen-ruler'} input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control c-input-lain" data-cid="${child.id}" value="${child.kebutuhan_lain}" step="25000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

        </div>
      `;
    };

    container.innerHTML = `
      <!-- Section Header (Clean Header Tanpa Icon Depan) -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Daftar Kebutuhan Tiap Anak (${children.length} Anak)
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Rincian biaya spesifik per anak berdasarkan usia, jenjang, dan kebutuhan operasional.
        </p>
      </div>

      <!-- Container List Kartu Anak -->
      <div id="childrenListContainer">
        ${children.length > 0 ? children.map((c, idx) => renderChildFormItem(c, idx)).join('') : `
          <div style="text-align: center; padding: 24px 12px; background: var(--bg-body); border-radius: var(--radius-md); border: 1px dashed var(--border-color); margin-bottom: 16px;">
            <i class="fa-graduation-cap fa-solid" style="font-size: 1.8rem; color: var(--text-muted); margin-bottom: 8px; display: inline-block;"></i>
            <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0 0 4px 0;">Belum ada profil anak yang didaftarkan.</p>
            <p style="font-size: 0.74rem; color: var(--text-muted); margin: 0;">Klik tombol di bawah untuk menambahkan anak pertama.</p>
          </div>
        `}
      </div>

      <!-- Tombol Tambah Anak Baru -->
      <button type="button" id="addChildBtn" class="outline-btn" style="width: 100%; justify-content: center; padding: 10px; font-size: 0.84rem; margin-bottom: 16px; border-style: dashed;">
        <i class="fa-plus fa-solid"></i> Tambah Profil Anak Baru
      </button>

      <!-- Action Sync to Budget Dashboard Button -->
      <div style="text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669);">
          <i class="fa-bookmark fa-solid"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Real-Time Dynamic Input Listener (100% Responsif & Live-Update di Form)
    const attachChildInputListeners = () => {
      container.querySelectorAll('.child-item-card').forEach(card => {
        const cid = card.getAttribute('data-cid');

        card.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('input', () => {
            const currentChildren = PendidikanModule.getChildren();
            const childIdx = currentChildren.findIndex(c => c.id === cid);
            if (childIdx === -1) return;

            // Ambil seluruh nilai terupdate dari DOM kartu saat ini
            const namaVal = card.querySelector('.c-input-nama')?.value || '';
            const usiaVal = parseInt(card.querySelector('.c-input-usia')?.value || 0, 10);
            const jenjangVal = card.querySelector('.c-input-jenjang')?.value || 'sd';
            const kelasVal = card.querySelector('.c-input-kelas')?.value || '';
            const sppVal = parseFloat(card.querySelector('.c-input-spp')?.value || 0);
            const sakuHariVal = parseFloat(card.querySelector('.c-input-saku')?.value || 0);
            const hariVal = parseInt(card.querySelector('.c-input-hari')?.value || 0, 10);
            const transportVal = parseFloat(card.querySelector('.c-input-transport')?.value || 0);
            const tugasVal = parseFloat(card.querySelector('.c-input-tugas')?.value || 0);
            const lesVal = parseFloat(card.querySelector('.c-input-les')?.value || 0);
            const lainVal = parseFloat(card.querySelector('.c-input-lain')?.value || 0);

            // Perhitungan Dinamis Real-Time
            const uangSakuBulanDinamis = sakuHariVal * hariVal;
            const subtotalChildDinamis = sppVal + uangSakuBulanDinamis + transportVal + tugasVal + lesVal + lainVal;
            const jenjangLabel = PendidikanModule.getJenjangLabel(jenjangVal);
            const isBalita = jenjangVal === 'balita';

            // 1. Update Teks Uang Saku Real-Time di DOM
            const formulaElem = card.querySelector('.c-saku-formula');
            if (formulaElem) {
              formulaElem.textContent = `(${hariVal} hari x ${formatRupiah(sakuHariVal)})`;
            }
            const sakuDisplayElem = card.querySelector('.c-saku-total-display');
            if (sakuDisplayElem) {
              sakuDisplayElem.textContent = formatRupiah(uangSakuBulanDinamis);
            }

            // 2. Update Badge Subtotal di Header Kartu Real-Time
            const subtotalBadge = card.querySelector('.c-subtotal-badge');
            if (subtotalBadge) {
              subtotalBadge.textContent = `${formatRupiah(subtotalChildDinamis)}/bln`;
            }

            // 3. Update Header Info Kartu Real-Time
            const titleDisplay = card.querySelector('.c-title-display');
            if (titleDisplay) {
              titleDisplay.textContent = `Anak #${childIdx + 1}: ${namaVal || 'Tanpa Nama'}`;
            }
            const metaDisplay = card.querySelector('.c-meta-display');
            if (metaDisplay) {
              metaDisplay.textContent = `${jenjangLabel} • ${usiaVal} Tahun`;
            }

            // 4. Update Label & Icon Kebutuhan Balita vs Sekolah
            const extraLabel = card.querySelector('.c-extra-label');
            if (extraLabel) {
              extraLabel.innerHTML = `<span class="c-extra-title">${isBalita ? 'Susu & Popok' : 'Buku & Ekstra'}</span> <span class="unit">(Rp/Bln)</span>`;
            }
            const extraIcon = card.querySelector('.c-extra-icon');
            if (extraIcon) {
              extraIcon.className = `c-extra-icon fa-solid ${isBalita ? 'fa-baby' : 'fa-pen-ruler'} input-icon`;
            }

            // 5. Simpan ke LocalStorage State
            currentChildren[childIdx] = {
              ...currentChildren[childIdx],
              nama: namaVal,
              usia: usiaVal,
              jenjang: jenjangVal,
              kelas: kelasVal,
              spp_bulan: sppVal,
              uang_saku_hari: sakuHariVal,
              hari_aktif: hariVal,
              transport_bulan: transportVal,
              tugas_kelompok_bulan: tugasVal,
              les_kursus_bulan: lesVal,
              kebutuhan_lain: lainVal
            };
            PendidikanModule.saveChildren(currentChildren);

            // 6. Trigger Perhitungan Global (Summary Card, Tabel, Grafik)
            onInputChange();
          });
        });

        // Delete Child Listener
        const delBtn = card.querySelector('.delete-child-btn');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            const currentChildren = PendidikanModule.getChildren();
            const updated = currentChildren.filter(c => c.id !== cid);
            PendidikanModule.saveChildren(updated);
            PendidikanModule.renderForm(container, onInputChange);
            onInputChange();
          });
        }
      });
    };

    attachChildInputListeners();

    // Add Child Listener
    const addBtn = container.querySelector('#addChildBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const currentChildren = PendidikanModule.getChildren();
        const nextNum = currentChildren.length + 1;
        const newChild = {
          id: `child_${Date.now()}`,
          nama: `Anak ke-${nextNum}`,
          usia: 7,
          jenjang: 'sd',
          kelas: 'Kelas 1 SD',
          spp_bulan: 200000,
          uang_saku_hari: 10000,
          hari_aktif: 22,
          transport_bulan: 100000,
          tugas_kelompok_bulan: 50000,
          les_kursus_bulan: 100000,
          kebutuhan_lain: 0
        };

        const updated = [...currentChildren, newChild];
        PendidikanModule.saveChildren(updated);
        PendidikanModule.renderForm(container, onInputChange);
        onInputChange();
      });
    }

    // Save to Budget Dashboard Listener
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const currentChildren = PendidikanModule.getChildren();
        const calcResult = PendidikanModule.calculate({ children: currentChildren });

        BudgetStore.saveBudgetItem('pendidikan', {
          id: 'pendidikan',
          name: 'Pendidikan & Anak',
          amount: calcResult.total_biaya,
          category: 'Pokok',
          source: `Kebutuhan ${currentChildren.length} Anak (${currentChildren.map(c => c.nama || 'Anak').join(', ')})`
        });

        notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Total Est. ${formatRupiah(calcResult.total_biaya)} telah disinkronkan ke Dashboard Keuangan.`;
        setTimeout(() => notice.innerHTML = '', 4000);
      });
    }
  },

  getFormInputs: () => {
    return {
      children: PendidikanModule.getChildren()
    };
  },

  calculate: (inputs) => {
    const children = inputs?.children || PendidikanModule.getChildren();

    let grandTotalSPP = 0;
    let grandTotalUangSaku = 0;
    let grandTotalTransport = 0;
    let grandTotalTugas = 0;
    let grandTotalLes = 0;
    let grandTotalLain = 0;
    let total_biaya = 0;

    const childCalculations = children.map(c => {
      const spp = c.spp_bulan || 0;
      const sakuHarian = c.uang_saku_hari || 0;
      const hariAktif = c.hari_aktif || 0;
      const sakuBulanan = sakuHarian * hariAktif;
      const transport = c.transport_bulan || 0;
      const tugas = c.tugas_kelompok_bulan || 0;
      const les = c.les_kursus_bulan || 0;
      const lain = c.kebutuhan_lain || 0;

      const totalPerChild = spp + sakuBulanan + transport + tugas + les + lain;

      grandTotalSPP += spp;
      grandTotalUangSaku += sakuBulanan;
      grandTotalTransport += transport;
      grandTotalTugas += tugas;
      grandTotalLes += les;
      grandTotalLain += lain;
      total_biaya += totalPerChild;

      return {
        ...c,
        sakuBulanan,
        totalPerChild
      };
    });

    const totalOperasionalTugasLes = grandTotalTransport + grandTotalTugas + grandTotalLes + grandTotalLain;

    const summaryCards = [
      {
        title: 'Total SPP & UKT',
        value: formatRupiah(grandTotalSPP),
        note: `${children.length} Anak (SPP Bulanan)`,
        icon: 'fa-school',
        type: 'emerald'
      },
      {
        title: 'Total Uang Saku & Jajan',
        value: formatRupiah(grandTotalUangSaku),
        note: `Akumulasi Uang Saku Semua Anak`,
        icon: 'fa-wallet',
        type: 'sky'
      },
      {
        title: 'Transport, Tugas & Les',
        value: formatRupiah(totalOperasionalTugasLes),
        note: `Bensin, Praktikum, Tugas & Bimbel`,
        icon: 'fa-book-open-reader',
        type: 'amber'
      },
      {
        title: 'Grand Total Biaya Anak',
        value: formatRupiah(total_biaya),
        note: `Total Pengeluaran Seluruh Anak`,
        icon: 'fa-children',
        type: 'rose'
      }
    ];

    // Table: Rincian per Anak
    const tableHeaders = ['Nama Anak', 'Jenjang & Usia', 'SPP / UKT', 'Uang Saku (Bln)', 'Transport & Tugas', 'Les & Ekstra', 'Total / Bln (Rp)'];
    const tableRows = childCalculations.map(cc => {
      const jenjangLabel = PendidikanModule.getJenjangLabel(cc.jenjang);
      return {
        isCurrent: false,
        cells: [
          `<strong>${cc.nama || 'Anak'}</strong>`,
          `${jenjangLabel} (${cc.usia} th) - ${cc.kelas || '-'}`,
          formatRupiah(cc.spp_bulan || 0),
          `${formatRupiah(cc.sakuBulanan)} <span style="font-size:0.68rem; color:var(--text-muted);">(@ ${formatRupiah(cc.uang_saku_hari || 0)}/hr)</span>`,
          formatRupiah((cc.transport_bulan || 0) + (cc.tugas_kelompok_bulan || 0)),
          formatRupiah((cc.les_kursus_bulan || 0) + (cc.kebutuhan_lain || 0)),
          `<span class="highlight">${formatRupiah(cc.totalPerChild)}</span>`
        ]
      };
    });

    // Baris Grand Total
    tableRows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL SEMUA ANAK</strong>`,
        `<strong>${children.length} Anak</strong>`,
        `<strong>${formatRupiah(grandTotalSPP)}</strong>`,
        `<strong>${formatRupiah(grandTotalUangSaku)}</strong>`,
        `<strong>${formatRupiah(grandTotalTransport + grandTotalTugas)}</strong>`,
        `<strong>${formatRupiah(grandTotalLes + grandTotalLain)}</strong>`,
        `<strong class="highlight" style="font-size: 0.95rem; color: var(--accent-emerald);">${formatRupiah(total_biaya)}</strong>`
      ]
    });

    // Proyeksi Jangka Panjang (Semester & Tahun Ajaran) Dipisahkan dengan Kolom Khusus
    const totalOperasionalSemuaAnak = grandTotalTransport + grandTotalTugas + grandTotalLes + grandTotalLain;
    const secondaryTable = {
      title: 'Proyeksi Anggaran Semester & Tahun Ajaran',
      subtitle: 'Akumulasi estimasi anggaran seluruh anak berdasarkan durasi masa studi.',
      headers: [
        'Periode Proyeksi',
        'Akumulasi SPP / UKT',
        'Akumulasi Uang Saku',
        'Transport, Tugas & Les',
        'Total Proyeksi Anggaran'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>1 Semester (6 Bulan)</strong>`,
            formatRupiah(grandTotalSPP * 6),
            formatRupiah(grandTotalUangSaku * 6),
            formatRupiah(totalOperasionalSemuaAnak * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(total_biaya * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>1 Tahun Ajaran (12 Bulan)</strong>`,
            formatRupiah(grandTotalSPP * 12),
            formatRupiah(grandTotalUangSaku * 12),
            formatRupiah(totalOperasionalSemuaAnak * 12),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(total_biaya * 12)}</strong>`
          ]
        }
      ]
    };

    // Chart Data per Anak
    const chartLabels = childCalculations.map(c => `${c.nama || 'Anak'} (${PendidikanModule.getJenjangLabel(c.jenjang)})`);
    const chartDataValues = childCalculations.map(c => Math.round(c.totalPerChild));
    const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6'];

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
            label: 'Alokasi Biaya per Anak (Rp/Bulan)',
            data: chartDataValues,
            backgroundColor: chartColors.slice(0, chartLabels.length)
          }
        ]
      },
      quickStats: {
        totalQty: `${children.length} Anak (${children.map(c => PendidikanModule.getJenjangLabel(c.jenjang)).join(', ')})`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
