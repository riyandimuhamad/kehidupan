/**
 * Modul Kalkulator Pendidikan & Uang Saku Anak
 * Kehidupan App Suite
 */

import { formatRupiah, formatNumber } from '../utils/formatters.js';
import { BudgetStore } from '../services/budgetStore.js';

export const PendidikanModule = {
  id: 'pendidikan',
  name: 'Pendidikan & Anak',
  icon: 'fa-graduation-cap',
  badge: 'Module Edukasi',
  title: 'Kalkulator Pendidikan & Uang Saku Anak',
  subtitle: 'Hitung pengeluaran SPP sekolah, kuliah, les/kursus, dan uang saku/jajan harian anak.',

  defaults: {
    jumlah_anak: 1,
    spp_sekolah_bulan: 350000,
    uang_saku_harian: 15000,
    hari_sekolah_bulan: 22,
    les_buku_bulan: 150000
  },

  renderForm: (container, onInputChange) => {
    container.innerHTML = `
      <div class="form-group">
        <label for="jumlah_anak">Jumlah Anak Sekolah / Kuliah</label>
        <div class="input-wrapper">
          <i class="fa-child fa-solid input-icon"></i>
          <input type="number" id="jumlah_anak" class="form-control" min="0" max="10" value="1">
        </div>
      </div>

      <div class="form-group">
        <label for="spp_sekolah_bulan">Total SPP Sekolah / Les per Bulan <span class="unit">(Rupiah)</span></label>
        <div class="input-wrapper">
          <i class="fa-school fa-solid input-icon"></i>
          <input type="number" id="spp_sekolah_bulan" class="form-control" step="50000" value="350000">
        </div>
      </div>

      <div class="form-group">
        <label for="uang_saku_harian">Uang Saku / Jajan Anak per Hari <span class="unit">(Rupiah/Anak/Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-wallet fa-solid input-icon"></i>
          <input type="number" id="uang_saku_harian" class="form-control" step="5000" value="15000">
        </div>
        <div class="form-options">
          <button type="button" class="option-chip" data-target="uang_saku_harian" data-val="10000">SD (Rp 10.000)</button>
          <button type="button" class="option-chip active" data-target="uang_saku_harian" data-val="15000">SMP (Rp 15.000)</button>
          <button type="button" class="option-chip" data-target="uang_saku_harian" data-val="25000">SMA/Kuliah (Rp 25.000)</button>
        </div>
      </div>

      <div class="form-group">
        <label for="hari_sekolah_bulan">Hari Sekolah per Bulan <span class="unit">(Hari)</span></label>
        <div class="input-wrapper">
          <i class="fa-calendar-day fa-solid input-icon"></i>
          <input type="number" id="hari_sekolah_bulan" class="form-control" min="1" max="31" value="22">
        </div>
      </div>

      <div class="form-group">
        <label for="les_buku_bulan">Tabungan Buku & Peralatan Belajar <span class="unit">(Rupiah/Bulan)</span></label>
        <div class="input-wrapper">
          <i class="fa-book fa-solid input-icon"></i>
          <input type="number" id="les_buku_bulan" class="form-control" step="25000" value="150000">
        </div>
      </div>

      <!-- Action Sync to Budget Dashboard Button -->
      <div style="margin-top: 20px; text-align: center;">
        <button type="button" id="saveToBudgetBtn" class="primary-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, var(--accent-emerald), #059669);">
          <i class="fa-bookmark fa-solid"></i> Simpan ke Dashboard Budget Bulanan
        </button>
        <span id="saveNotice" style="font-size: 0.76rem; color: var(--accent-emerald); display: block; margin-top: 6px;"></span>
      </div>
    `;

    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', () => onInputChange()));

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
          onInputChange();
        }
      });
    });

    const saveBtn = container.querySelector('#saveToBudgetBtn');
    const notice = container.querySelector('#saveNotice');

    saveBtn.addEventListener('click', () => {
      const currentInputs = PendidikanModule.getFormInputs(container);
      const res = PendidikanModule.calculate(currentInputs);
      const monthlyCost = res.total_biaya;

      BudgetStore.saveBudgetItem('pendidikan', {
        id: 'pendidikan',
        name: 'Pendidikan & Anak',
        amount: monthlyCost,
        category: 'Pokok',
        source: `SPP + Uang Saku (${currentInputs.jumlah_anak} anak)`
      });

      notice.innerHTML = `<i class="fa-circle-check fa-solid"></i> Tersimpan! Est. Bulanan ${formatRupiah(monthlyCost)} telah disinkronkan ke Dashboard Keuangan.`;
      setTimeout(() => notice.innerHTML = '', 4000);
    });
  },

  getFormInputs: (container) => {
    return {
      jumlah_anak: parseInt(container.querySelector('#jumlah_anak')?.value || 0, 10),
      spp_sekolah_bulan: parseFloat(container.querySelector('#spp_sekolah_bulan')?.value || 0),
      uang_saku_harian: parseFloat(container.querySelector('#uang_saku_harian')?.value || 0),
      hari_sekolah_bulan: parseInt(container.querySelector('#hari_sekolah_bulan')?.value || 22, 10),
      les_buku_bulan: parseFloat(container.querySelector('#les_buku_bulan')?.value || 0)
    };
  },

  calculate: (inputs) => {
    const { jumlah_anak, spp_sekolah_bulan, uang_saku_harian, hari_sekolah_bulan, les_buku_bulan } = inputs;

    const total_uang_saku = jumlah_anak * uang_saku_harian * hari_sekolah_bulan;
    const total_biaya = spp_sekolah_bulan + total_uang_saku + les_buku_bulan;

    const summaryCards = [
      {
        title: 'SPP & Les Bulanan',
        value: formatRupiah(spp_sekolah_bulan),
        note: `SPP Sekolah/Kuliah`,
        icon: 'fa-school',
        type: 'emerald'
      },
      {
        title: 'Uang Saku Anak',
        value: formatRupiah(total_uang_saku),
        note: `${jumlah_anak} Anak x ${hari_sekolah_bulan} Hari (@ ${formatRupiah(uang_saku_harian)})`,
        icon: 'fa-wallet',
        type: 'sky'
      },
      {
        title: 'Total Biaya Pendidikan',
        value: formatRupiah(total_biaya),
        note: `Total per Bulan`,
        icon: 'fa-money-bill-wave',
        type: 'amber'
      }
    ];

    const periods = [
      { label: '1 Bulan', d: 1 },
      { label: '6 Bulan (1 Semester)', d: 6 },
      { label: '12 Bulan (1 Tahun)', d: 12 }
    ];

    const tableHeaders = ['Periode', 'SPP Sekolah', 'Total Uang Saku', 'Buku & Perlengkapan', 'Total Biaya (Rp)'];
    const tableRows = periods.map(p => {
      const s = spp_sekolah_bulan * p.d;
      const u = total_uang_saku * p.d;
      const l = les_buku_bulan * p.d;
      const cost = s + u + l;
      return {
        isCurrent: p.d === 1,
        cells: [
          `<strong>${p.label}</strong>`,
          formatRupiah(s),
          formatRupiah(u),
          formatRupiah(l),
          `<span class="highlight">${formatRupiah(cost)}</span>`
        ]
      };
    });

    return {
      total_biaya,
      summaryCards,
      tableHeaders,
      tableRows,
      chartData: {
        labels: ['SPP Sekolah', 'Uang Saku Anak', 'Buku & Peralatan'],
        datasets: [
          {
            label: 'Komposisi Biaya Pendidikan',
            data: [spp_sekolah_bulan, total_uang_saku, les_buku_bulan],
            backgroundColor: ['#6366f1', '#f59e0b', '#10b981']
          }
        ]
      },
      quickStats: {
        totalQty: `${jumlah_anak} Anak Sekolah`,
        totalCost: formatRupiah(total_biaya)
      }
    };
  }
};
