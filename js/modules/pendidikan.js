/**
 * Modul Kalkulator Pendidikan & Kebutuhan Anak (Multi-Anak Dinamis)
 * Kehidupan App Suite
 * 
 * Mendukung perhitungan spesifik kebutuhan tiap anak sesuai usia & jenjang:
 * - Balita (Nutrisi, Popok, Daycare)
 * - PAUD / TK, SD, SMP, SMA (SPP, Uang Saku, Transport, Tugas Kelompok, Les)
 * - Kuliah (UKT, Kos, Praktikum, Transport)
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_CHILDREN = 'kehidupan_pendidikan_children';

const DEFAULT_CHILDREN = [
  {
    id: 'child_1',
    nama: 'Kakak (SMA)',
    usia: 16,
    jenjang: 'sma',
    kelas: 'Kelas 12 (3 SMA)',
    spp_bulan: 400000,
    uang_saku_hari: 25000,
    hari_aktif: 22,
    transport_bulan: 200000,
    tugas_kelompok_bulan: 150000,
    les_kursus_bulan: 300000,
    kebutuhan_lain: 0
  },
  {
    id: 'child_2',
    nama: 'Adik (SMP)',
    usia: 13,
    jenjang: 'smp',
    kelas: 'Kelas 7 (1 SMP)',
    spp_bulan: 300000,
    uang_saku_hari: 15000,
    hari_aktif: 22,
    transport_bulan: 150000,
    tugas_kelompok_bulan: 100000,
    les_kursus_bulan: 200000,
    kebutuhan_lain: 0
  }
];

export const PendidikanModule = {
  id: 'pendidikan',
  name: 'Pendidikan & Anak',
  icon: 'fa-graduation-cap',
  badge: 'Module Edukasi & Keluarga',
  title: 'Kalkulator Pendidikan & Kebutuhan Anak',
  subtitle: 'Hitung pengeluaran realistis setiap anak secara fleksibel (SPP, uang saku harian, ongkos transport, tugas kelompok/praktikum, hingga les dan kebutuhan balita).',

  defaults: {},

  getChildren: () => {
    return getFromStorage(STORAGE_KEY_CHILDREN, DEFAULT_CHILDREN);
  },

  saveChildren: (children) => {
    saveToStorage(STORAGE_KEY_CHILDREN, children);
  },

  getJenjangLabel: (jenjang) => {
    switch (jenjang) {
      case 'balita': return 'Balita (0-5 th)';
      case 'tk': return 'PAUD / TK';
      case 'sd': return 'SD';
      case 'smp': return 'SMP';
      case 'sma': return 'SMA / SMK';
      case 'kuliah': return 'Kuliah / PT';
      default: return 'Lainnya';
    }
  },

  renderForm: (container, onInputChange) => {
    const children = PendidikanModule.getChildren();

    const renderChildFormItem = (child, index) => {
      const uangSakuBulan = (child.uang_saku_hari || 0) * (child.hari_aktif || 0);
      const subtotalChild = (child.spp_bulan || 0) + uangSakuBulan + (child.transport_bulan || 0) + 
                            (child.tugas_kelompok_bulan || 0) + (child.les_kursus_bulan || 0) + 
                            (child.kebutuhan_lain || 0);

      const jenjangLabel = PendidikanModule.getJenjangLabel(child.jenjang);

      return `
        <div class="card child-item-card" data-cid="${child.id}" style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 14px;">
          <!-- Header Kartu Anak (Clean Text Header Tanpa Icon Depan) -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <div>
              <span style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">
                Anak #${index + 1}: ${child.nama || 'Tanpa Nama'} <span style="font-size: 0.74rem; font-weight: 600; color: var(--primary); margin-left: 4px;">(${jenjangLabel} - ${child.usia || 0} Thn)</span>
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.76rem; font-weight: 700; color: var(--accent-emerald); background: rgba(16,185,129,0.12); padding: 2px 8px; border-radius: 6px;">
                ${formatRupiah(subtotalChild)}/bln
              </span>
              <button type="button" class="sm-btn delete-child-btn" data-cid="${child.id}" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3); padding: 2px 8px; font-size: 0.75rem;">
                <i class="fa-trash fa-solid"></i> Hapus
              </button>
            </div>
          </div>

          <!-- Baris 1: Nama, Usia, Jenjang, Kelas -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr 1.5fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Nama / Panggilan</label>
              <input type="text" class="form-control c-input-nama" data-cid="${child.id}" value="${child.nama}" placeholder="Contoh: Kakak / Rian" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Usia (Thn)</label>
              <input type="number" class="form-control c-input-usia" data-cid="${child.id}" value="${child.usia}" min="0" max="35" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Tingkat / Jenjang</label>
              <select class="form-control c-input-jenjang" data-cid="${child.id}" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="balita" ${child.jenjang === 'balita' ? 'selected' : ''}>Balita (0-5 th)</option>
                <option value="tk" ${child.jenjang === 'tk' ? 'selected' : ''}>PAUD / TK</option>
                <option value="sd" ${child.jenjang === 'sd' ? 'selected' : ''}>SD</option>
                <option value="smp" ${child.jenjang === 'smp' ? 'selected' : ''}>SMP</option>
                <option value="sma" ${child.jenjang === 'sma' ? 'selected' : ''}>SMA / SMK</option>
                <option value="kuliah" ${child.jenjang === 'kuliah' ? 'selected' : ''}>Kuliah / PT</option>
                <option value="lainnya" ${child.jenjang === 'lainnya' ? 'selected' : ''}>Lainnya</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Kelas / Tingkat</label>
              <input type="text" class="form-control c-input-kelas" data-cid="${child.id}" value="${child.kelas}" placeholder="Contoh: Kelas 12 / Sem 3" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>

          <!-- Baris 2: SPP/UKT Bulanan, Uang Saku Harian & Hari Aktif Sekolah -->
          <div style="display: grid; grid-template-columns: 1.5fr 1.5fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">SPP / UKT Bulanan <span class="unit">(Rp/Bulan)</span></label>
              <input type="number" class="form-control c-input-spp" data-cid="${child.id}" value="${child.spp_bulan}" step="25000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Uang Saku / Jajan <span class="unit">(Rp/Hari)</span></label>
              <input type="number" class="form-control c-input-saku" data-cid="${child.id}" value="${child.uang_saku_hari}" step="2000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Hari Aktif <span class="unit">(Hari/Bln)</span></label>
              <input type="number" class="form-control c-input-hari" data-cid="${child.id}" value="${child.hari_aktif}" min="0" max="31" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 10px;">
            *Estimasi Uang Saku Bulanan: <strong>${formatRupiah(uangSakuBulan)}</strong> (${child.hari_aktif} hari x ${formatRupiah(child.uang_saku_hari)})
          </div>

          <!-- Baris 3: Transportasi Anak & Tugas Kelompok / Praktikum -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Transportasi / Ongkos / Bensin Anak <span class="unit">(Rp/Bulan)</span></label>
              <input type="number" class="form-control c-input-transport" data-cid="${child.id}" value="${child.transport_bulan}" step="10000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Tugas, Kerja Kelompok & Praktikum <span class="unit">(Rp/Bulan)</span></label>
              <input type="number" class="form-control c-input-tugas" data-cid="${child.id}" value="${child.tugas_kelompok_bulan}" step="10000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>

          <!-- Baris 4: Les / Bimbel & Kebutuhan Balita / Ekstra -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">Les, Bimbel & Ekskul <span class="unit">(Rp/Bulan)</span></label>
              <input type="number" class="form-control c-input-les" data-cid="${child.id}" value="${child.les_kursus_bulan}" step="25000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label style="font-size: 0.74rem;">${child.jenjang === 'balita' ? 'Susu, Popok & Nutrisi Balita' : 'Kebutuhan Buku & Ekstra'} <span class="unit">(Rp/Bulan)</span></label>
              <input type="number" class="form-control c-input-lain" data-cid="${child.id}" value="${child.kebutuhan_lain}" step="25000" placeholder="0" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <!-- Section Header (Clean Text Header Tanpa Icon Depan) -->
      <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--primary); margin: 0;">
          Daftar Rincian Kebutuhan Tiap Anak (${children.length} Anak)
        </h4>
        <span style="font-size: 0.74rem; color: var(--text-muted);">
          Kebutuhan disesuaikan per anak (usia & jenjang)
        </span>
      </div>

      <!-- Container List Anak -->
      <div id="childrenListContainer">
        ${children.map((c, idx) => renderChildFormItem(c, idx)).join('')}
      </div>

      <!-- Tombol Tambah Anak Baru -->
      <button type="button" id="addChildBtn" class="outline-btn" style="width: 100%; justify-content: center; padding: 8px; font-size: 0.82rem; margin-bottom: 16px;">
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

    // Dynamic Input Listener with State Persistence
    const attachChildInputListeners = () => {
      container.querySelectorAll('.child-item-card').forEach(card => {
        const cid = card.getAttribute('data-cid');

        card.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('input', () => {
            const currentChildren = PendidikanModule.getChildren();
            const childIdx = currentChildren.findIndex(c => c.id === cid);
            if (childIdx === -1) return;

            const namaInput = card.querySelector('.c-input-nama')?.value;
            const usiaInput = parseInt(card.querySelector('.c-input-usia')?.value || 0, 10);
            const jenjangInput = card.querySelector('.c-input-jenjang')?.value;
            const kelasInput = card.querySelector('.c-input-kelas')?.value;
            const sppInput = parseFloat(card.querySelector('.c-input-spp')?.value || 0);
            const sakuInput = parseFloat(card.querySelector('.c-input-saku')?.value || 0);
            const hariInput = parseInt(card.querySelector('.c-input-hari')?.value || 0, 10);
            const transportInput = parseFloat(card.querySelector('.c-input-transport')?.value || 0);
            const tugasInput = parseFloat(card.querySelector('.c-input-tugas')?.value || 0);
            const lesInput = parseFloat(card.querySelector('.c-input-les')?.value || 0);
            const lainInput = parseFloat(card.querySelector('.c-input-lain')?.value || 0);

            currentChildren[childIdx] = {
              ...currentChildren[childIdx],
              nama: namaInput,
              usia: usiaInput,
              jenjang: jenjangInput,
              kelas: kelasInput,
              spp_bulan: sppInput,
              uang_saku_hari: sakuInput,
              hari_aktif: hariInput,
              transport_bulan: transportInput,
              tugas_kelompok_bulan: tugasInput,
              les_kursus_bulan: lesInput,
              kebutuhan_lain: lainInput
            };

            PendidikanModule.saveChildren(currentChildren);
            onInputChange();
          });
        });

        // Delete Child Listener
        const delBtn = card.querySelector('.delete-child-btn');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            const currentChildren = PendidikanModule.getChildren();
            if (currentChildren.length <= 1) {
              alert('Minimal harus ada 1 anak dalam daftar.');
              return;
            }
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
          usia: 10,
          jenjang: 'sd',
          kelas: 'SD Kelas 4',
          spp_bulan: 200000,
          uang_saku_hari: 10000,
          hari_aktif: 22,
          transport_bulan: 100000,
          tugas_kelompok_bulan: 50000,
          les_kursus_bulan: 150000,
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
        note: `${children.length} Anak (SPP/UKT Bulanan)`,
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
        note: `Total Pengeluaran Anak per Bulan`,
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

    // Proyeksi Semester & Tahunan
    tableRows.push({
      isCurrent: false,
      cells: [
        `<em>Proyeksi 1 Semester (6 Bln)</em>`,
        `-`,
        `-`,
        `-`,
        `-`,
        `-`,
        `<em>${formatRupiah(total_biaya * 6)}</em>`
      ]
    });
    tableRows.push({
      isCurrent: false,
      cells: [
        `<em>Proyeksi 1 Tahun Ajaran (12 Bln)</em>`,
        `-`,
        `-`,
        `-`,
        `-`,
        `-`,
        `<strong style="color:var(--primary);">${formatRupiah(total_biaya * 12)}</strong>`
      ]
    });

    // Chart Data per Anak
    const chartLabels = childCalculations.map(c => `${c.nama || 'Anak'} (${PendidikanModule.getJenjangLabel(c.jenjang)})`);
    const chartDataValues = childCalculations.map(c => Math.round(c.totalPerChild));
    const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6'];

    return {
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
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
