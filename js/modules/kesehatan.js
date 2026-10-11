/**
 * Modul Kalkulator Kesehatan & BPJS (Multi-Anggota Keluarga Dinamis & Realistis)
 * Kehidupan App Suite
 * 
 * Mendukung perhitungan spesifik kebutuhan tiap anggota keluarga:
 * - Kepala Keluarga / Ayah (BPJS PPU/Mandiri, Vitamin stamina, rawat jalan/P3K)
 * - Ibu (BPJS, Vitamin wanita/kalsium, pemeriksaan berkala/ginekologi)
 * - Lansia / Kakek-Nenek (BPJS, Obat rutin kronis hipertensi/diabetes/tulang, check-up lab rutin)
 * - Anak Sekolah / Remaja (BPJS, Vitamin anak/DHA, dokter gigi/kacamata/P3K)
 * - Bayi & Balita (BPJS, Imunisasi mandiri dokter spesialis anak/DSA, vitamin & probiotik balita)
 */

import { formatRupiah, formatNumber, getFromStorage, saveToStorage } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

const STORAGE_KEY_MEMBERS = 'kehidupan_kesehatan_members';

const DEFAULT_MEMBERS = [
  {
    id: 'member_1',
    nama: 'Ayah',
    peran: 'ayah',
    usia: 42,
    kondisi: 'Sehat & Aktif Bekerja',
    bpjs_tipe: 'kelas2',
    bpjs_nominal: 100000,
    asuransi_tambahan: 0,
    vitamin_suplemen: 75000,
    obat_rutin: 0,
    checkup_rawat_jalan: 50000
  },
  {
    id: 'member_2',
    nama: 'Ibu',
    peran: 'ibu',
    usia: 39,
    kondisi: 'Sehat',
    bpjs_tipe: 'kelas2',
    bpjs_nominal: 100000,
    asuransi_tambahan: 0,
    vitamin_suplemen: 85000,
    obat_rutin: 0,
    checkup_rawat_jalan: 50000
  },
  {
    id: 'member_3',
    nama: 'Anak (Sekolah)',
    peran: 'anak',
    usia: 14,
    kondisi: 'Masa Pertumbuhan',
    bpjs_tipe: 'kelas2',
    bpjs_nominal: 100000,
    asuransi_tambahan: 0,
    vitamin_suplemen: 50000,
    obat_rutin: 0,
    checkup_rawat_jalan: 35000
  }
];

export const KesehatanModule = {
  id: 'kesehatan',
  name: 'Kesehatan & BPJS',
  icon: 'fa-heart-pulse',
  badge: 'Module Proteksi & Kesehatan',
  title: 'Kalkulator Kesehatan & Proteksi Keluarga',
  subtitle: 'Hitung pengeluaran realistis kesehatan per anggota keluarga (BPJS, asuransi, vitamin, obat kronis lansia, imunisasi balita, hingga check-up rawat jalan).',

  defaults: {},

  getMembers: () => {
    return getFromStorage(STORAGE_KEY_MEMBERS, DEFAULT_MEMBERS);
  },

  saveMembers: (members) => {
    saveToStorage(STORAGE_KEY_MEMBERS, members);
  },

  getPeranLabel: (peran) => {
    switch (peran) {
      case 'ayah': return 'Ayah (Kepala Keluarga)';
      case 'ibu': return 'Ibu Rumah Tangga / Dewasa';
      case 'lansia': return 'Lansia (Kakek/Nenek/Ortu)';
      case 'anak': return 'Anak Sekolah / Remaja';
      case 'balita': return 'Bayi & Balita (0-5 Thn)';
      default: return 'Anggota Keluarga Lain';
    }
  },

  getBPJSDefaultNominal: (tipe) => {
    switch (tipe) {
      case 'kelas1': return 150000;
      case 'kelas2': return 100000;
      case 'kelas3': return 35000;
      case 'ppu': return 0;
      case 'none': return 0;
      default: return 100000;
    }
  },

  renderForm: (container, onInputChange) => {
    const members = KesehatanModule.getMembers();

    const renderMemberFormItem = (member, index) => {
      const bpjsCost = member.bpjs_nominal || 0;
      const asuransiCost = member.asuransi_tambahan || 0;
      const vitCost = member.vitamin_suplemen || 0;
      const obatCost = member.obat_rutin || 0;
      const checkupCost = member.checkup_rawat_jalan || 0;
      const subtotalMember = bpjsCost + asuransiCost + vitCost + obatCost + checkupCost;

      const peranLabel = KesehatanModule.getPeranLabel(member.peran);
      const isLansia = member.peran === 'lansia';
      const isBalita = member.peran === 'balita';

      return `
        <div class="card member-item-card" data-mid="${member.id}" style="margin-bottom: 16px; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: var(--radius-md); padding: 14px;">
          <!-- Member Card Header: Nama, Peran & Subtotal Badge + Tombol Hapus Rapi -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
            <div>
              <span class="m-title-display" style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); display: block;">
                Anggota #${index + 1}: ${member.nama || 'Tanpa Nama'}
              </span>
              <span class="m-meta-display" style="font-size: 0.74rem; color: var(--text-muted);">
                ${peranLabel} &bull; ${member.usia || 0} Tahun
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="m-subtotal-badge" style="display: inline-flex; align-items: center; justify-content: center; height: 30px; padding: 0 10px; font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald); background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); border-radius: 8px; box-sizing: border-box; line-height: 1;">
                ${formatRupiah(subtotalMember)}/bln
              </span>
              <button type="button" class="sm-btn delete-member-btn" data-mid="${member.id}" title="Hapus anggota keluarga ini" style="display: inline-flex; align-items: center; justify-content: center; height: 30px; width: 30px; min-width: 30px; padding: 0; font-size: 0.82rem; color: var(--accent-rose); background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; box-sizing: border-box; cursor: pointer; transition: all 0.2s ease;">
                <i class="fa-trash fa-solid"></i>
              </button>
            </div>
          </div>

          <!-- Section 1: Data Diri, Peran & Kondisi Kesehatan (2 Kolom) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Nama / Panggilan</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-user fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="text" class="form-control m-input-nama" data-mid="${member.id}" value="${member.nama}" placeholder="Contoh: Ayah / Kakek" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Kategori Peran</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-people-roof fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <select class="form-control m-input-peran" data-mid="${member.id}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                  <option value="ayah" ${member.peran === 'ayah' ? 'selected' : ''}>Ayah (Kepala Keluarga)</option>
                  <option value="ibu" ${member.peran === 'ibu' ? 'selected' : ''}>Ibu Rumah Tangga / Dewasa</option>
                  <option value="lansia" ${member.peran === 'lansia' ? 'selected' : ''}>Lansia (Kakek / Nenek / Ortu)</option>
                  <option value="anak" ${member.peran === 'anak' ? 'selected' : ''}>Anak Sekolah / Remaja</option>
                  <option value="balita" ${member.peran === 'balita' ? 'selected' : ''}>Bayi & Balita (0-5 Thn)</option>
                  <option value="lainnya" ${member.peran === 'lainnya' ? 'selected' : ''}>Anggota Keluarga Lain</option>
                </select>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Usia</span> <span class="unit">(Tahun)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-cake-candles fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control m-input-usia" data-mid="${member.id}" value="${member.usia}" min="0" max="120" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Catatan Medis</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-notes-medical fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="text" class="form-control m-input-kondisi" data-mid="${member.id}" value="${member.kondisi || ''}" placeholder="Contoh: Sehat / Hipertensi / Imunisasi" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <!-- Section 2: Jaminan BPJS & Asuransi Kesehatan (2 Kolom) -->
          <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div class="form-group" style="margin-bottom: 0;">
                <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                  <span>BPJS Kesehatan</span>
                </label>
                <div class="input-wrapper">
                  <i class="fa-shield-halved fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                  <select class="form-control m-input-bpjs-tipe" data-mid="${member.id}" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                    <option value="kelas2" ${member.bpjs_tipe === 'kelas2' ? 'selected' : ''}>Kelas 2 (Rp 100.000)</option>
                    <option value="kelas1" ${member.bpjs_tipe === 'kelas1' ? 'selected' : ''}>Kelas 1 (Rp 150.000)</option>
                    <option value="kelas3" ${member.bpjs_tipe === 'kelas3' ? 'selected' : ''}>Kelas 3 (Rp 35.000)</option>
                    <option value="ppu" ${member.bpjs_tipe === 'ppu' ? 'selected' : ''}>PPU Kantor (Rp 0)</option>
                    <option value="none" ${member.bpjs_tipe === 'none' ? 'selected' : ''}>Tidak Pakai (Rp 0)</option>
                  </select>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                  <span>Iuran BPJS</span> <span class="unit">(Rp/Bln)</span>
                </label>
                <div class="input-wrapper">
                  <i class="fa-receipt fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                  <input type="number" class="form-control m-input-bpjs-nominal" data-mid="${member.id}" value="${member.bpjs_nominal}" step="5000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
                </div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span>Asuransi Swasta Tambahan</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-file-shield fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control m-input-asuransi" data-mid="${member.id}" value="${member.asuransi_tambahan || 0}" step="25000" placeholder="0 (Opsional jika ada asuransi swasta)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <!-- Section 3: Vitamin, Suplemen & Obat Rutin (2 Kolom) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span class="m-vit-title">${isBalita ? 'Vitamin & Nutrisi Bayi' : 'Vitamin & Suplemen'}</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="fa-pills fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control m-input-vitamin" data-mid="${member.id}" value="${member.vitamin_suplemen || 0}" step="10000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="m-obat-label" style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
                <span class="m-obat-title">${isLansia ? 'Obat Kronis & Terapi' : isBalita ? 'Imunisasi Mandiri / DSA' : 'Obat Rutin / Kronis'}</span> <span class="unit">(Rp/Bln)</span>
              </label>
              <div class="input-wrapper">
                <i class="m-obat-icon fa-solid ${isLansia ? 'fa-capsules' : isBalita ? 'fa-syringe' : 'fa-prescription-bottle-medical'} input-icon" style="left: 12px; font-size: 0.85rem;"></i>
                <input type="number" class="form-control m-input-obat" data-mid="${member.id}" value="${member.obat_rutin || 0}" step="15000" placeholder="0" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
              </div>
            </div>
          </div>

          <!-- Section 4: Rawat Jalan, Dokter Gigi & Checkup Rutin -->
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; min-height: 18px; line-height: 18px;">
              <span class="m-checkup-title">${isLansia ? 'Lab Bulanan, Tensi & Check-up' : isBalita ? 'Pemeriksaan Rutin Posyandu/Klinik' : 'Check-up, Dokter Gigi & Rawat Jalan'}</span> <span class="unit">(Rp/Bln)</span>
            </label>
            <div class="input-wrapper">
              <i class="fa-stethoscope fa-solid input-icon" style="left: 12px; font-size: 0.85rem;"></i>
              <input type="number" class="form-control m-input-checkup" data-mid="${member.id}" value="${member.checkup_rawat_jalan || 0}" step="15000" placeholder="0 (Anggaran jaga-jaga/P3K)" style="font-size: 0.82rem; padding: 8px 10px 8px 34px;">
            </div>
            <div style="margin-top: 5px; font-size: 0.73rem; color: var(--text-muted);">
              *Estimasi proteksi tahunan: <strong class="m-annual-calc" style="color: var(--primary);">${formatRupiah(subtotalMember * 12)}</strong> (12 bulan)
            </div>
          </div>

        </div>
      `;
    };

    container.innerHTML = `
      <!-- Section Header -->
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
          Profil Kesehatan Tiap Anggota Keluarga (${members.length} Orang)
        </h4>
        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
          Rincian biaya proteksi per orang disesuaikan dengan kebutuhan usia, BPJS, vitamin, obat kronis, hingga imunisasi.
        </p>
      </div>

      <!-- Container List Kartu Anggota -->
      <div id="membersListContainer">
        ${members.map((m, idx) => renderMemberFormItem(m, idx)).join('')}
      </div>

      <!-- Tombol Tambah Anggota Baru -->
      <button type="button" id="addMemberBtn" class="outline-btn" style="width: 100%; justify-content: center; padding: 10px; font-size: 0.84rem; margin-bottom: 16px; border-style: dashed;">
        <i class="fa-plus fa-solid"></i> Tambah Profil Anggota Keluarga Baru
      </button>

      <!-- Action Sync to Budget Dashboard Button -->
      <div style="text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669);">
          <i class="fa-bookmark fa-solid"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    // Real-Time Dynamic Input Listeners
    const attachMemberInputListeners = () => {
      container.querySelectorAll('.member-item-card').forEach(card => {
        const mid = card.getAttribute('data-mid');

        // BPJS Tipe Select auto-fills nominal
        const bpjsSelect = card.querySelector('.m-input-bpjs-tipe');
        const bpjsNominalInput = card.querySelector('.m-input-bpjs-nominal');
        if (bpjsSelect && bpjsNominalInput) {
          bpjsSelect.addEventListener('change', () => {
            const defNominal = KesehatanModule.getBPJSDefaultNominal(bpjsSelect.value);
            bpjsNominalInput.value = defNominal;
            triggerMemberUpdate();
          });
        }

        const triggerMemberUpdate = () => {
          const currentMembers = KesehatanModule.getMembers();
          const memberIdx = currentMembers.findIndex(m => m.id === mid);
          if (memberIdx === -1) return;

          const namaVal = card.querySelector('.m-input-nama')?.value || '';
          const peranVal = card.querySelector('.m-input-peran')?.value || 'ayah';
          const usiaVal = parseInt(card.querySelector('.m-input-usia')?.value || 0, 10);
          const kondisiVal = card.querySelector('.m-input-kondisi')?.value || '';
          const bpjsTipeVal = card.querySelector('.m-input-bpjs-tipe')?.value || 'kelas2';
          const bpjsNominalVal = parseFloat(card.querySelector('.m-input-bpjs-nominal')?.value || 0);
          const asuransiVal = parseFloat(card.querySelector('.m-input-asuransi')?.value || 0);
          const vitVal = parseFloat(card.querySelector('.m-input-vitamin')?.value || 0);
          const obatVal = parseFloat(card.querySelector('.m-input-obat')?.value || 0);
          const checkupVal = parseFloat(card.querySelector('.m-input-checkup')?.value || 0);

          const subtotalMember = bpjsNominalVal + asuransiVal + vitVal + obatVal + checkupVal;
          const peranLabel = KesehatanModule.getPeranLabel(peranVal);
          const isLansia = peranVal === 'lansia';
          const isBalita = peranVal === 'balita';

          // Update Card Header UI
          const subtotalBadge = card.querySelector('.m-subtotal-badge');
          if (subtotalBadge) {
            subtotalBadge.textContent = `${formatRupiah(subtotalMember)}/bln`;
          }
          const titleDisplay = card.querySelector('.m-title-display');
          if (titleDisplay) {
            titleDisplay.textContent = `Anggota #${memberIdx + 1}: ${namaVal || 'Tanpa Nama'}`;
          }
          const metaDisplay = card.querySelector('.m-meta-display');
          if (metaDisplay) {
            metaDisplay.textContent = `${peranLabel} • ${usiaVal} Tahun`;
          }
          const annualDisplay = card.querySelector('.m-annual-calc');
          if (annualDisplay) {
            annualDisplay.textContent = formatRupiah(subtotalMember * 12);
          }

          // Update Dynamic Labels per Peran
          const obatLabel = card.querySelector('.m-obat-label');
          if (obatLabel) {
            obatLabel.innerHTML = `<span class="m-obat-title">${isLansia ? 'Obat Kronis & Terapi' : isBalita ? 'Imunisasi Mandiri / DSA' : 'Obat Rutin / Kronis'}</span> <span class="unit">(Rp/Bln)</span>`;
          }
          const obatIcon = card.querySelector('.m-obat-icon');
          if (obatIcon) {
            obatIcon.className = `m-obat-icon fa-solid ${isLansia ? 'fa-capsules' : isBalita ? 'fa-syringe' : 'fa-prescription-bottle-medical'} input-icon`;
          }
          const vitTitle = card.querySelector('.m-vit-title');
          if (vitTitle) {
            vitTitle.textContent = isBalita ? 'Vitamin & Nutrisi Bayi' : 'Vitamin & Suplemen';
          }
          const checkupTitle = card.querySelector('.m-checkup-title');
          if (checkupTitle) {
            checkupTitle.textContent = isLansia ? 'Lab Bulanan, Tensi & Check-up' : isBalita ? 'Pemeriksaan Rutin Posyandu/Klinik' : 'Check-up, Dokter Gigi & Rawat Jalan';
          }

          // Save State
          currentMembers[memberIdx] = {
            ...currentMembers[memberIdx],
            nama: namaVal,
            peran: peranVal,
            usia: usiaVal,
            kondisi: kondisiVal,
            bpjs_tipe: bpjsTipeVal,
            bpjs_nominal: bpjsNominalVal,
            asuransi_tambahan: asuransiVal,
            vitamin_suplemen: vitVal,
            obat_rutin: obatVal,
            checkup_rawat_jalan: checkupVal
          };
          KesehatanModule.saveMembers(currentMembers);

          // Trigger Global Updates
          onInputChange();
        };

        card.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('input', triggerMemberUpdate);
        });

        // Delete Member Listener
        const delBtn = card.querySelector('.delete-member-btn');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            const currentMembers = KesehatanModule.getMembers();
            if (currentMembers.length <= 1) {
              alert('Minimal harus ada 1 anggota keluarga dalam daftar.');
              return;
            }
            const updated = currentMembers.filter(m => m.id !== mid);
            KesehatanModule.saveMembers(updated);
            KesehatanModule.renderForm(container, onInputChange);
            onInputChange();
          });
        }
      });
    };

    attachMemberInputListeners();

    // Add New Member Button
    const addBtn = container.querySelector('#addMemberBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const currentMembers = KesehatanModule.getMembers();
        const newIndex = currentMembers.length + 1;
        const newMember = {
          id: `member_${Date.now()}`,
          nama: `Anggota #${newIndex}`,
          peran: 'lainnya',
          usia: 25,
          kondisi: 'Sehat',
          bpjs_tipe: 'kelas2',
          bpjs_nominal: 100000,
          asuransi_tambahan: 0,
          vitamin_suplemen: 50000,
          obat_rutin: 0,
          checkup_rawat_jalan: 35000
        };
        currentMembers.push(newMember);
        KesehatanModule.saveMembers(currentMembers);
        KesehatanModule.renderForm(container, onInputChange);
        onInputChange();
      });
    }

    // Save to Budget Dashboard Listener
    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const currentMembers = KesehatanModule.getMembers();
        const res = KesehatanModule.calculate({ members: currentMembers });
        const monthlyCost = res.total_biaya;

        BudgetStore.saveBudgetItem('kesehatan', {
          id: 'kesehatan',
          name: 'Kesehatan & BPJS',
          amount: monthlyCost,
          category: 'Pokok',
          source: `Kesehatan (${currentMembers.length} Anggota Keluarga)`
        });

        notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} (${currentMembers.length} Orang) telah disinkronkan ke Dashboard Keuangan.`;
        setTimeout(() => notice.innerHTML = '', 4000);
      });
    }
  },

  getFormInputs: () => {
    return {
      members: KesehatanModule.getMembers()
    };
  },

  calculate: (inputs) => {
    const members = inputs?.members || KesehatanModule.getMembers();

    let grandTotalBPJS = 0;
    let grandTotalAsuransi = 0;
    let grandTotalVitamin = 0;
    let grandTotalObat = 0;
    let grandTotalCheckup = 0;
    let total_biaya = 0;

    const memberCalculations = members.map(m => {
      const bpjs = m.bpjs_nominal || 0;
      const asuransi = m.asuransi_tambahan || 0;
      const vit = m.vitamin_suplemen || 0;
      const obat = m.obat_rutin || 0;
      const checkup = m.checkup_rawat_jalan || 0;

      const totalPerMember = bpjs + asuransi + vit + obat + checkup;

      grandTotalBPJS += bpjs;
      grandTotalAsuransi += asuransi;
      grandTotalVitamin += vit;
      grandTotalObat += obat;
      grandTotalCheckup += checkup;
      total_biaya += totalPerMember;

      return {
        ...m,
        totalPerMember
      };
    });

    const totalBPJSAsuransi = grandTotalBPJS + grandTotalAsuransi;
    const totalKuratifCheckup = grandTotalObat + grandTotalCheckup;

    const summaryCards = [
      {
        title: 'BPJS & Asuransi',
        value: formatRupiah(totalBPJSAsuransi),
        note: `${members.length} Anggota Keluarga`,
        icon: 'fa-shield-halved',
        type: 'emerald'
      },
      {
        title: 'Vitamin & Suplemen',
        value: formatRupiah(grandTotalVitamin),
        note: `Preventif & Daya Tahan Tubuh`,
        icon: 'fa-pills',
        type: 'sky'
      },
      {
        title: 'Obat Kronis & Check-Up',
        value: formatRupiah(totalKuratifCheckup),
        note: `Kuratif, Obat Rutin & Rawat Jalan`,
        icon: 'fa-stethoscope',
        type: 'amber'
      },
      {
        title: 'Grand Total Kesehatan',
        value: formatRupiah(total_biaya),
        note: `Total Proteksi Kesehatan/Bulan`,
        icon: 'fa-heart-pulse',
        type: 'rose'
      }
    ];

    // Table Utama: Rincian per Anggota Keluarga
    const tableHeaders = ['Nama Anggota', 'Peran & Usia', 'BPJS Kesehatan', 'Asuransi Swasta', 'Vitamin & Suplemen', 'Obat & Check-Up', 'Total / Bln (Rp)'];
    const tableRows = memberCalculations.map(mc => {
      const peranLabel = KesehatanModule.getPeranLabel(mc.peran);
      return {
        isCurrent: false,
        cells: [
          `<strong>${mc.nama || 'Anggota'}</strong>`,
          `${peranLabel} (${mc.usia || 0} th)`,
          formatRupiah(mc.bpjs_nominal || 0),
          formatRupiah(mc.asuransi_tambahan || 0),
          formatRupiah(mc.vitamin_suplemen || 0),
          formatRupiah((mc.obat_rutin || 0) + (mc.checkup_rawat_jalan || 0)),
          `<span class="highlight">${formatRupiah(mc.totalPerMember)}</span>`
        ]
      };
    });

    // Baris Grand Total (Otomatis Mendapatkan Background Header via .current-row)
    tableRows.push({
      isCurrent: true,
      cells: [
        `<strong>TOTAL SEMUA ANGGOTA</strong>`,
        `<strong>${members.length} Orang</strong>`,
        `<strong>${formatRupiah(grandTotalBPJS)}</strong>`,
        `<strong>${formatRupiah(grandTotalAsuransi)}</strong>`,
        `<strong>${formatRupiah(grandTotalVitamin)}</strong>`,
        `<strong>${formatRupiah(totalKuratifCheckup)}</strong>`,
        `<strong class="highlight" style="font-size: 0.95rem; color: var(--accent-emerald);">${formatRupiah(total_biaya)}</strong>`
      ]
    });

    // Proyeksi Jangka Panjang (Semester & Tahunan) Dipisahkan dengan Kolom Spesifik
    const secondaryTable = {
      title: 'Proyeksi Anggaran Kesehatan Semester & Tahunan',
      subtitle: 'Akumulasi estimasi proteksi kesehatan seluruh anggota keluarga berdasarkan durasi jangka menengah dan panjang.',
      headers: [
        'Periode Proyeksi',
        'Durasi Waktu',
        'Akumulasi BPJS & Asuransi',
        'Akumulasi Vitamin & Suplemen',
        'Akumulasi Obat & Check-Up',
        'Total Proyeksi Kesehatan'
      ],
      rows: [
        {
          isCurrent: false,
          cells: [
            `<strong>Proyeksi 1 Semester</strong>`,
            `6 Bulan (Semester)`,
            formatRupiah(totalBPJSAsuransi * 6),
            formatRupiah(grandTotalVitamin * 6),
            formatRupiah(totalKuratifCheckup * 6),
            `<strong class="highlight" style="color: var(--primary); font-size: 0.92rem;">${formatRupiah(total_biaya * 6)}</strong>`
          ]
        },
        {
          isCurrent: true,
          cells: [
            `<strong>Proyeksi 1 Tahun Penuh</strong>`,
            `12 Bulan (1 Tahun Penuh)`,
            formatRupiah(totalBPJSAsuransi * 12),
            formatRupiah(grandTotalVitamin * 12),
            formatRupiah(totalKuratifCheckup * 12),
            `<strong class="highlight" style="color: var(--accent-emerald); font-size: 0.98rem;">${formatRupiah(total_biaya * 12)}</strong>`
          ]
        }
      ]
    };

    // Chart Data per Anggota Keluarga
    const chartLabels = memberCalculations.map(m => `${m.nama || 'Anggota'} (${KesehatanModule.getPeranLabel(m.peran)})`);
    const chartDataValues = memberCalculations.map(m => Math.round(m.totalPerMember));
    const chartColors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#6366f1', '#8b5cf6', '#3b82f6'];

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
            label: 'Alokasi Biaya Kesehatan per Orang (Rp/Bulan)',
            data: chartDataValues,
            backgroundColor: chartColors.slice(0, chartLabels.length)
          }
        ]
      },
      quickStats: {
        totalQty: `${members.length} Anggota (${members.map(m => m.nama || 'Anggota').join(', ')})`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
