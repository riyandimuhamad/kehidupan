/**
 * Main Application Logic - Kehidupan Suite
 */

import { BerasModule } from './modules/beras.js';
import { AirModule } from './modules/air.js';
import { AirPamModule } from './modules/airpam.js';
import { ListrikModule } from './modules/listrik.js';
import { GasModule } from './modules/gas.js';
import { TransportModule } from './modules/transport.js';
import { InternetModule } from './modules/internet.js';
import { SembakoModule } from './modules/sembako.js';
import { SewaModule } from './modules/sewa.js';
import { SandangModule } from './modules/sandang.js';
import { KesehatanModule } from './modules/kesehatan.js';
import { PendidikanModule } from './modules/pendidikan.js';
import { HarianModule } from './modules/harian.js';
import { HiburanModule } from './modules/hiburan.js';
import { InvestasiModule } from './modules/investasi.js';
import { PajakModule } from './modules/pajak.js';
import { ZakatModule } from './modules/zakat.js';
import { DashboardModule } from './modules/dashboard.js';
import { DompetModule } from './modules/dompet.js';

import { BudgetStore } from './services/budgetStore.js';
import { SpreadsheetService } from './services/spreadsheetService.js';
import { saveToStorage, getFromStorage, formatDate } from './utils/formatters.js';

class KehidupanApp {
  constructor() {
    // Expose app instance globally for cross-module navigation
    window.AppInstance = this;

    // Registry of available modules
    this.modules = {
      beras: BerasModule,
      air: AirModule,
      airpam: AirPamModule,
      listrik: ListrikModule,
      gas: GasModule,
      transport: TransportModule,
      internet: InternetModule,
      sembako: SembakoModule,
      sewa: SewaModule,
      sandang: SandangModule,
      kesehatan: KesehatanModule,
      pendidikan: PendidikanModule,
      harian: HarianModule,
      hiburan: HiburanModule,
      investasi: InvestasiModule,
      pajak: PajakModule,
      zakat: ZakatModule,
      dashboard: DashboardModule,
      dompet: DompetModule
    };

    this.activeModuleId = 'dashboard';
    this.chartInstance = null;
    this.history = getFromStorage('history', []);
    this.activeHistoryFilter = 'all';

    this.initElements();
    this.checkInitialCleanState();
    this.initTheme();
    this.bindEvents();
    this.loadModule(this.activeModuleId);
  }

  checkInitialCleanState() {
    const CLEAN_KEY = 'kehidupan_clean_init_v3';
    if (!localStorage.getItem(CLEAN_KEY)) {
      // List of storage keys that held dummy demo data in earlier sessions
      const keysToClean = [
        'saved_budgets',
        'monthly_income',
        'extra_topups',
        'buffer_percent',
        'budget_monthly_history',
        'kehidupan_beras_data',
        'kehidupan_air_data',
        'kehidupan_gas_data',
        'kehidupan_sembako_data',
        'kehidupan_harian_data',
        'kehidupan_sewa_data',
        'kehidupan_listrik_data',
        'kehidupan_airpam_data',
        'kehidupan_sandang_data',
        'kehidupan_kesehatan_members',
        'kehidupan_pendidikan_children',
        'transport_settings',
        'vehicles_list',
        'internet_settings',
        'hp_list',
        'hiburan_data',
        'investasi_data',
        'pajak_data',
        'zakat_data',
        'history'
      ];
      keysToClean.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(CLEAN_KEY, 'true');
    }
  }

  initElements() {
    this.navTabs = document.getElementById('navTabs');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.historyBtn = document.getElementById('historyBtn');

    this.moduleBadge = document.getElementById('moduleBadge');
    this.moduleTitle = document.getElementById('moduleTitle');
    this.moduleSubtitle = document.getElementById('moduleSubtitle');

    this.quickTotalQty = document.getElementById('quickTotalQty');
    this.quickTotalCost = document.getElementById('quickTotalCost');

    this.dynamicFormFields = document.getElementById('dynamicFormFields');
    this.summaryCardsGrid = document.getElementById('summaryCardsGrid');
    this.breakdownTable = document.getElementById('breakdownTable');
    this.analysisChartCtx = document.getElementById('analysisChart')?.getContext('2d');

    this.exportCsvBtn = document.getElementById('exportCsvBtn');
    this.printBtn = document.getElementById('printBtn');

    // Modals
    this.historyModal = document.getElementById('historyModal');
    this.closeHistoryModal = document.getElementById('closeHistoryModal');
    this.closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.historyListContainer = document.getElementById('historyListContainer');

    this.sheetsModalBtn = document.getElementById('sheetsModalBtn');
    this.sheetsModal = document.getElementById('sheetsModal');
    this.closeSheetsModal = document.getElementById('closeSheetsModal');
    this.closeSheetsModalBtn = document.getElementById('closeSheetsModalBtn');
    this.copyScriptBtn = document.getElementById('copyScriptBtn');
    this.appsScriptCodeSnippet = document.getElementById('appsScriptCodeSnippet');

    // Sheets Popover & Topbar Elements
    this.sheetsPopover = document.getElementById('sheetsPopover');
    this.topbarSyncDot = document.getElementById('topbarSyncDot');
    this.popoverStatusBadge = document.getElementById('popoverStatusBadge');
    this.topbarSheetUrlInput = document.getElementById('topbarSheetUrlInput');
    this.topbarSaveUrlBtn = document.getElementById('topbarSaveUrlBtn');
    this.topbarSyncNowBtn = document.getElementById('topbarSyncNowBtn');
    this.topbarSyncStatusMsg = document.getElementById('topbarSyncStatusMsg');
    this.openGuideFromPopover = document.getElementById('openGuideFromPopover');

    // History elements
    this.historyFilterContainer = document.getElementById('historyFilterContainer');
    this.historyItemCountBadge = document.getElementById('historyItemCountBadge');

    this.addModuleModalBtn = document.getElementById('addModuleModalBtn');
    this.addModuleModal = document.getElementById('addModuleModal');
    this.closeAddModuleModal = document.getElementById('closeAddModuleModal');
    this.closeAddModuleModalBtn = document.getElementById('closeAddModuleModalBtn');

    // Sidebar & Topbar Elements
    this.appSidebar = document.getElementById('appSidebar');
    this.sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    this.sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    this.sidebarBackdrop = document.getElementById('sidebarBackdrop');
    this.topbarCategoryBadge = document.getElementById('topbarCategoryBadge');
  }

  updateSheetsStatusUI() {
    const url = BudgetStore.getSpreadsheetUrl();
    if (this.topbarSheetUrlInput) {
      this.topbarSheetUrlInput.value = url || '';
    }

    if (url && url.trim().length > 10) {
      if (this.topbarSyncDot) {
        this.topbarSyncDot.className = 'sync-status-dot connected';
        this.topbarSyncDot.title = 'Status: Terhubung ke Google Sheets';
      }
      if (this.popoverStatusBadge) {
        this.popoverStatusBadge.className = 'badge-status-connected';
        this.popoverStatusBadge.innerHTML = '<i class="fa-solid fa-check"></i> Terhubung';
      }
    } else {
      if (this.topbarSyncDot) {
        this.topbarSyncDot.className = 'sync-status-dot';
        this.topbarSyncDot.title = 'Status: Belum Terhubung';
      }
      if (this.popoverStatusBadge) {
        this.popoverStatusBadge.className = 'badge-status-disconnected';
        this.popoverStatusBadge.innerText = 'Belum Terhubung';
      }
    }
  }

  bindEvents() {
    // Initial sync status update
    this.updateSheetsStatusUI();

    // Navigation Tabs Switcher
    this.navTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (btn) {
        const moduleId = btn.getAttribute('data-module');
        if (moduleId && this.modules[moduleId]) {
          this.navTabs.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.loadModule(moduleId);

          // Auto close sidebar on mobile after clicking
          if (window.innerWidth <= 1024 && this.appSidebar) {
            this.appSidebar.classList.remove('open');
            this.sidebarBackdrop?.classList.remove('active');
          }
        }
      }
    });

    // Mobile Sidebar Toggle
    if (this.sidebarToggleBtn && this.appSidebar) {
      this.sidebarToggleBtn.addEventListener('click', () => {
        this.appSidebar.classList.toggle('open');
        this.sidebarBackdrop?.classList.toggle('active');
      });
    }

    if (this.sidebarCloseBtn && this.appSidebar) {
      this.sidebarCloseBtn.addEventListener('click', () => {
        this.appSidebar.classList.remove('open');
        this.sidebarBackdrop?.classList.remove('active');
      });
    }

    if (this.sidebarBackdrop && this.appSidebar) {
      this.sidebarBackdrop.addEventListener('click', () => {
        this.appSidebar.classList.remove('open');
        this.sidebarBackdrop.classList.remove('active');
      });
    }

    // Dynamic delete budget item & topup listener in table
    this.breakdownTable.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-budget-btn');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        if (id) {
          BudgetStore.removeBudgetItem(id);
          this.calculateActiveModule();
        }
      }

      const delTopupBtn = e.target.closest('.delete-topup-btn');
      if (delTopupBtn) {
        const id = delTopupBtn.getAttribute('data-id');
        if (id) {
          BudgetStore.removeExtraTopup(id);
          this.calculateActiveModule();
        }
      }
    });

    // Theme Toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Export CSV & Print
    this.exportCsvBtn.addEventListener('click', () => this.exportCsv());
    this.printBtn.addEventListener('click', () => window.print());

    // History Modal
    this.historyBtn.addEventListener('click', () => this.openHistoryModal());
    this.closeHistoryModal.addEventListener('click', () => this.closeModal(this.historyModal));
    this.closeHistoryModalBtn.addEventListener('click', () => this.closeModal(this.historyModal));
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // History filter clicks
    this.historyFilterContainer?.addEventListener('click', (e) => {
      const chip = e.target.closest('.history-filter-chip');
      if (chip) {
        this.activeHistoryFilter = chip.getAttribute('data-filter') || 'all';
        this.historyFilterContainer.querySelectorAll('.history-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.renderHistoryList();
      }
    });

    // Google Sheets Popover Toggle
    this.sheetsModalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = this.sheetsPopover.style.display === 'block';
      this.sheetsPopover.style.display = isVisible ? 'none' : 'block';
      this.updateSheetsStatusUI();
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (this.sheetsPopover && !e.target.closest('.sheets-popover-container')) {
        this.sheetsPopover.style.display = 'none';
      }
    });

    // Topbar Save URL
    this.topbarSaveUrlBtn?.addEventListener('click', () => {
      const url = this.topbarSheetUrlInput.value.trim();
      BudgetStore.setSpreadsheetUrl(url);
      this.updateSheetsStatusUI();
      this.topbarSyncStatusMsg.innerHTML = '<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-check"></i> Link URL tersimpan!</span>';
      setTimeout(() => {
        if (this.topbarSyncStatusMsg) this.topbarSyncStatusMsg.innerHTML = '';
      }, 3500);
    });

    // Topbar Sync Now
    this.topbarSyncNowBtn?.addEventListener('click', async () => {
      const url = this.topbarSheetUrlInput.value.trim();
      this.topbarSyncStatusMsg.innerHTML = '<span style="color: var(--accent-amber);"><i class="fa-solid fa-spinner fa-spin"></i> Menyinkronkan data...</span>';
      const res = await SpreadsheetService.syncToSpreadsheet(url);
      if (res.success) {
        this.updateSheetsStatusUI();
        this.topbarSyncStatusMsg.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> ${res.message}</span>`;
      } else {
        this.topbarSyncStatusMsg.innerHTML = `<span style="color: var(--accent-rose); font-weight: 600;"><i class="fa-solid fa-circle-xmark"></i> ${res.message}</span>`;
      }
    });

    // Open guide modal from popover
    this.openGuideFromPopover?.addEventListener('click', (e) => {
      e.preventDefault();
      this.sheetsPopover.style.display = 'none';
      this.appsScriptCodeSnippet.innerText = SpreadsheetService.getAppsScriptTemplate();
      this.openModal(this.sheetsModal);
    });

    // Google Sheets Modal Guide
    this.closeSheetsModal.addEventListener('click', () => this.closeModal(this.sheetsModal));
    this.closeSheetsModalBtn.addEventListener('click', () => this.closeModal(this.sheetsModal));
    this.copyScriptBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(SpreadsheetService.getAppsScriptTemplate());
      this.copyScriptBtn.innerHTML = '<i class="fa-check fa-solid"></i> Tersalin ke Clipboard!';
      setTimeout(() => this.copyScriptBtn.innerHTML = '<i class="fa-copy fa-solid"></i> Salin Skrip Apps Script', 3000);
    });

    // Add Module Modal
    this.addModuleModalBtn?.addEventListener('click', () => this.openModal(this.addModuleModal));
    this.closeAddModuleModal?.addEventListener('click', () => this.closeModal(this.addModuleModal));
    this.closeAddModuleModalBtn?.addEventListener('click', () => this.closeModal(this.addModuleModal));
  }

  loadModule(moduleId) {
    this.activeModuleId = moduleId;
    const activeModule = this.modules[moduleId];
    if (!activeModule) return;

    const heroBanner = document.querySelector('.hero-banner');
    const calcGrid = document.getElementById('calculatorGrid');
    const dompetContainer = document.getElementById('dompetContainer');

    // Update Topbar Breadcrumb
    if (this.topbarCategoryBadge && activeModule) {
      this.topbarCategoryBadge.innerHTML = `<i class="fa-solid ${activeModule.icon}"></i> ${activeModule.name}`;
    }

    // Special handler for DompetModule (Mobile-First Finance Hub)
    if (moduleId === 'dompet') {
      if (heroBanner) heroBanner.style.display = 'none';
      if (calcGrid) calcGrid.style.display = 'none';
      if (dompetContainer) {
        dompetContainer.style.display = 'block';
        activeModule.render(dompetContainer);
      }
      return;
    }

    // Normal Calculator / Dashboard Modules
    if (heroBanner) heroBanner.style.display = 'flex';
    if (calcGrid) calcGrid.style.display = 'grid';
    if (dompetContainer) {
      dompetContainer.style.display = 'none';
      dompetContainer.innerHTML = '';
    }

    // Update Hero Metadata
    this.moduleBadge.innerHTML = `<i class="fa-solid ${activeModule.icon}"></i> ${activeModule.badge}`;
    this.moduleTitle.innerText = activeModule.title;
    this.moduleSubtitle.innerText = activeModule.subtitle;

    // Update Card Section Titles & Labels
    const formCardTitle = document.getElementById('formCardTitle');
    const formCardSubText = document.getElementById('formCardSubText');
    const chartCardTitle = document.getElementById('chartCardTitle');
    const tableCardTitle = document.getElementById('tableCardTitle');
    const tableCardSubText = document.getElementById('tableCardSubText');
    const quickStatLabel1 = document.getElementById('quickStatLabel1');
    const quickStatLabel2 = document.getElementById('quickStatLabel2');

    if (moduleId === 'dashboard') {
      if (formCardTitle) formCardTitle.innerHTML = '<i class="fa-sliders fa-solid"></i> Pengaturan Anggaran & Periode';
      if (formCardSubText) formCardSubText.innerText = 'Atur pemasukan, dana cadangan & uji simulasi';
      if (chartCardTitle) chartCardTitle.innerHTML = '<i class="fa-chart-pie fa-solid"></i> Distribusi Kategori Anggaran';
      if (tableCardTitle) tableCardTitle.innerHTML = '<i class="fa-table-list fa-solid"></i> Rincian Seluruh Pos Anggaran Bulanan';
      if (tableCardSubText) tableCardSubText.innerText = 'Daftar akumulasi biaya per pos terintegrasi dari seluruh modul kalkulator';
      if (quickStatLabel1) quickStatLabel1.innerText = 'Rasio Anggaran';
      if (quickStatLabel2) quickStatLabel2.innerText = 'Surplus / Sisa Gaji';
    } else {
      if (formCardTitle) formCardTitle.innerHTML = '<i class="fa-sliders fa-solid"></i> Parameter Perhitungan';
      if (formCardSubText) formCardSubText.innerText = 'Isi data di bawah untuk estimasi akurat';
      if (chartCardTitle) chartCardTitle.innerHTML = '<i class="fa-chart-pie fa-solid"></i> Analisis & Distribusi';
      if (tableCardTitle) tableCardTitle.innerHTML = '<i class="fa-table-list fa-solid"></i> Rincian Proyeksi / Pos Anggaran';
      if (tableCardSubText) tableCardSubText.innerText = 'Tabel proyeksi otomatis berdasarkan variasi durasi & alokasi keuangan';
      if (quickStatLabel1) quickStatLabel1.innerText = 'Total Konsumsi';
      if (quickStatLabel2) quickStatLabel2.innerText = 'Total Biaya / Sisa';
    }

    // Render Form Fields
    activeModule.renderForm(this.dynamicFormFields, () => this.calculateActiveModule());

    // Execute Initial Calculation
    this.calculateActiveModule();
  }

  calculateActiveModule() {
    const activeModule = this.modules[this.activeModuleId];
    if (!activeModule) return;

    const inputs = activeModule.getFormInputs(this.dynamicFormFields);
    const result = activeModule.calculate(inputs);

    // Update Quick Stats
    if (result.quickStats) {
      this.quickTotalQty.innerText = result.quickStats.totalQty;
      this.quickTotalCost.innerText = result.quickStats.totalCost;
    }

    // Render Summary Cards
    this.renderSummaryCards(result.summaryCards);

    // Render Breakdown Table
    this.renderTable(result.tableHeaders, result.tableRows, result.secondaryTable);

    // Render Chart
    if (result.chartData && this.analysisChartCtx) {
      this.renderChart(result.chartData);
    }

    // Auto save calculation to recent history snapshot
    if (activeModule.id !== 'dashboard') {
      this.saveHistorySnapshot(activeModule.name, result.quickStats, activeModule.id);
    }
  }

  renderSummaryCards(cards) {
    if (!cards || !cards.length) {
      this.summaryCardsGrid.innerHTML = '';
      this.summaryCardsGrid.className = 'summary-cards-grid';
      delete this.summaryCardsGrid.dataset.cardsCount;
      return;
    }

    const count = cards.length;
    this.summaryCardsGrid.dataset.cardsCount = count;
    this.summaryCardsGrid.className = `summary-cards-grid cards-count-${count}`;

    this.summaryCardsGrid.innerHTML = cards.map(c => `
      <div class="result-card ${c.type || ''}">
        <div class="res-icon">
          <i class="fa-solid ${c.icon || 'fa-calculator'}"></i>
        </div>
        <div class="res-info">
          <div class="res-label">${c.title}</div>
          <div class="res-val">${c.value}</div>
          ${c.note ? `<div class="res-note">${c.note}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  renderTable(headers, rows, secondaryTable = null) {
    const theadHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const tbodyHTML = rows.map(r => `
      <tr class="${r.isCurrent ? 'current-row' : ''}">
        ${r.cells.map(c => `<td>${c}</td>`).join('')}
      </tr>
    `).join('');

    this.breakdownTable.querySelector('thead').innerHTML = theadHTML;
    this.breakdownTable.querySelector('tbody').innerHTML = tbodyHTML;

    // Standard Footnote / Keterangan Durasi Kalender (hanya khusus pada modul Hiburan & Sosial)
    let noteContainer = document.getElementById('tableCalendarFootnote');
    if (!noteContainer) {
      noteContainer = document.createElement('div');
      noteContainer.id = 'tableCalendarFootnote';
      this.breakdownTable.closest('.table-wrapper')?.after(noteContainer);
    }

    if (this.activeModuleId === 'hiburan') {
      noteContainer.style.display = 'block';
      noteContainer.innerHTML = `
        <div style="margin-top: 10px; padding: 8px 12px; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.18); border-radius: 8px; display: flex; align-items: flex-start; gap: 8px;">
          <i class="fa-circle-info fa-solid" style="color: var(--primary); font-size: 0.85rem; margin-top: 2px;"></i>
          <div style="font-size: 0.74rem; color: var(--text-muted); line-height: 1.45;">
            <strong style="color: var(--text-main);">Catatan Standar Kalender:</strong> 
            1 Bulan dinormalisasi <strong>30 Hari</strong> (atau rata-rata <strong>4,33 Minggu</strong> = 52 minggu / 12 bulan). 
            Jika Anda mengisi frekuensi mingguan (misal 1x/minggu), total 1 bulan mencakup 4 minggu penuh (28 hari) ditambah selisih 2 hari kalender secara proporsional. 
            Baris <strong>7 Hari</strong> menghitung murni 1 minggu pas tanpa selisih kalender.
          </div>
        </div>
      `;
    } else {
      noteContainer.style.display = 'none';
      noteContainer.innerHTML = '';
    }

    // Handle secondary projection table if provided
    let secContainer = document.getElementById('secondaryTableContainer');
    if (!secContainer) {
      secContainer = document.createElement('div');
      secContainer.id = 'secondaryTableContainer';
      noteContainer.after(secContainer);
    }

    if (secondaryTable) {
      secContainer.style.display = 'block';
      secContainer.innerHTML = `
        <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid var(--border-color);">
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">
              ${secondaryTable.title}
            </h4>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">
              ${secondaryTable.subtitle}
            </p>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>${secondaryTable.headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${secondaryTable.rows.map(r => `
                  <tr class="${r.isCurrent ? 'current-row' : ''}">
                    ${r.cells.map(c => `<td>${c}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      secContainer.style.display = 'none';
      secContainer.innerHTML = '';
    }
  }

  renderChart(chartData) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const axisBorderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';

    // Color conversion helper for unified design consistency
    const colorToRgba = (color, alpha = 0.65) => {
      if (!color) return `rgba(99, 102, 241, ${alpha})`;
      if (color.startsWith('rgba')) {
        return color.replace(/[\d\.]+\)$/g, `${alpha})`);
      }
      if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
      }
      if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return color;
    };

    const colorToSolid = (color) => {
      if (!color) return '#6366f1';
      if (color.startsWith('rgba(')) {
        const parts = color.replace('rgba(', '').replace(')', '').split(',').map(s => s.trim());
        return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`;
      }
      return color;
    };

    const DEFAULT_PRIMARY = '#6366f1';

    // Standardize Dataset Styling for All Charts
    if (chartData && chartData.datasets) {
      chartData.datasets.forEach(ds => {
        ds.borderRadius = 8;
        ds.borderSkipped = false;
        ds.borderWidth = 2;
        ds.maxBarThickness = 48;
        ds.barPercentage = 0.7;
        ds.categoryPercentage = 0.8;

        if (Array.isArray(ds.backgroundColor)) {
          // Multi-color dataset
          ds.borderColor = ds.backgroundColor.map(c => colorToSolid(c));
          ds.backgroundColor = ds.backgroundColor.map(c => colorToRgba(c, 0.65));
        } else {
          // Single-color dataset
          const baseColor = ds.borderColor || ds.backgroundColor || DEFAULT_PRIMARY;
          ds.borderColor = colorToSolid(baseColor);
          ds.backgroundColor = colorToRgba(baseColor, 0.65);
        }
      });
    }

    const firstDataset = chartData?.datasets?.[0];
    const isMultiColorBar = firstDataset?.backgroundColor && Array.isArray(firstDataset.backgroundColor) && firstDataset.backgroundColor.length > 1;
    const isRadial = chartData?.type === 'doughnut' || chartData?.type === 'pie';

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: isRadial ? true : !isMultiColorBar,
          position: isRadial ? 'bottom' : 'top',
          labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' }, boxWidth: 14 }
        },
        tooltip: {
          backgroundColor: isDark ? '#172033' : '#ffffff',
          titleColor: isDark ? '#ffffff' : '#000000',
          bodyColor: isDark ? '#94a3b8' : '#333333',
          borderColor: 'rgba(99,102,241,0.3)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              let label = context.label || context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              const val = (context.parsed?.y !== undefined && context.parsed?.y !== null) ? context.parsed.y : context.parsed;
              if (val !== null && val !== undefined) {
                label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
              }
              return label;
            }
          }
        }
      }
    };

    if (!isRadial) {
      let maxVal = 0;
      if (chartData && chartData.datasets) {
        chartData.datasets.forEach(ds => {
          if (Array.isArray(ds.data)) {
            ds.data.forEach(v => {
              const num = typeof v === 'number' ? v : (v?.y || 0);
              if (num > maxVal) maxVal = num;
            });
          }
        });
      }

      chartOptions.scales = {
        x: {
          ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } },
          grid: {
            color: gridColor,
            drawOnChartArea: true
          },
          border: {
            display: true,
            color: axisBorderColor
          }
        },
        y: {
          beginAtZero: true,
          suggestedMin: 0,
          suggestedMax: maxVal > 0 ? undefined : 100000,
          ticks: {
            color: textColor,
            font: { family: 'Plus Jakarta Sans' },
            precision: 0,
            callback: function(value) {
              if (value === 0) return 'Rp 0';
              if (value >= 1000000) {
                return 'Rp ' + (value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
              }
              if (value >= 1000) {
                return 'Rp ' + (value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + 'k';
              }
              return 'Rp ' + Math.round(value).toLocaleString('id-ID');
            }
          },
          grid: {
            color: gridColor,
            drawOnChartArea: true
          },
          border: {
            display: true,
            color: axisBorderColor
          }
        }
      };
    }

    this.chartInstance = new Chart(this.analysisChartCtx, {
      type: chartData.type || 'bar',
      data: chartData,
      options: chartOptions
    });
  }

  saveHistorySnapshot(moduleName, quickStats, activeModuleId) {
    if (!quickStats) return;
    const moduleId = activeModuleId || this.activeModuleId;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const snapshot = {
      id: Date.now(),
      moduleId: moduleId,
      module: moduleName,
      qty: quickStats.totalQty,
      cost: quickStats.totalCost,
      date: `${formatDate(now)} pukul ${timeStr}`,
      timestamp: now.getTime()
    };

    // Keep chronological history up to 30 items
    this.history = [snapshot, ...this.history.filter(h => h.moduleId !== moduleId || (Date.now() - h.timestamp > 3000))].slice(0, 30);
    saveToStorage('history', this.history);
  }

  openHistoryModal() {
    this.renderHistoryFilters();
    this.renderHistoryList();
    this.openModal(this.historyModal);
  }

  renderHistoryFilters() {
    if (!this.historyFilterContainer) return;
    const uniqueModules = [{ id: 'all', name: 'Semua Modul' }];
    const seen = new Set();
    this.history.forEach(item => {
      if (item.moduleId && !seen.has(item.moduleId)) {
        seen.add(item.moduleId);
        uniqueModules.push({ id: item.moduleId, name: item.module });
      }
    });

    this.historyFilterContainer.innerHTML = uniqueModules.map(m => `
      <button type="button" class="history-filter-chip ${this.activeHistoryFilter === m.id ? 'active' : ''}" data-filter="${m.id}">
        ${m.name}
      </button>
    `).join('');
  }

  renderHistoryList() {
    if (!this.historyListContainer) return;

    let filtered = this.history;
    if (this.activeHistoryFilter && this.activeHistoryFilter !== 'all') {
      filtered = this.history.filter(h => h.moduleId === this.activeHistoryFilter);
    }

    if (this.historyItemCountBadge) {
      this.historyItemCountBadge.innerText = `${filtered.length} Catatan`;
    }

    if (filtered.length === 0) {
      this.historyListContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 2rem; opacity: 0.35; margin-bottom: 10px; display: block;"></i>
          <p style="font-size: 0.9rem; font-weight: 600; margin: 0 0 4px;">Belum ada riwayat tercatat</p>
          <span style="font-size: 0.78rem;">Ubah input atau parameter pada kalkulator untuk mulai mencatat riwayat perubahan.</span>
        </div>
      `;
      return;
    }

    this.historyListContainer.innerHTML = filtered.map(item => `
      <div class="history-item" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; margin-bottom: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <div class="history-info" style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <h5 style="margin: 0; font-size: 0.88rem; font-weight: 700; color: var(--text-main);">${item.module}</h5>
            <span class="badge" style="font-size: 0.65rem; padding: 2px 6px; margin: 0;">${item.qty || 'Hasil Hitung'}</span>
          </div>
          <p style="margin: 0; font-size: 0.74rem; color: var(--text-muted); display: flex; align-items: center; gap: 5px;">
            <i class="fa-regular fa-clock" style="font-size: 0.7rem;"></i> ${item.date}
          </p>
        </div>
        <div class="history-cost" style="text-align: right; font-family: var(--font-heading); font-size: 1rem; font-weight: 800; color: var(--accent-emerald); white-space: nowrap;">
          ${item.cost}
        </div>
      </div>
    `).join('');
  }

  clearHistory() {
    this.history = [];
    saveToStorage('history', []);
    this.renderHistoryFilters();
    this.renderHistoryList();
  }

  exportCsv() {
    const activeModule = this.modules[this.activeModuleId];
    if (!activeModule) return;

    const inputs = activeModule.getFormInputs(this.dynamicFormFields);
    const result = activeModule.calculate(inputs);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Laporan Kebutuhan - ${activeModule.name}\n`;
    csvContent += `Tanggal,${formatDate(new Date())}\n\n`;
    csvContent += result.tableHeaders.join(",") + "\n";

    result.tableRows.forEach(row => {
      const cleanCells = row.cells.map(c => `"${c.replace(/<[^>]*>?/gm, '')}"`);
      csvContent += cleanCells.join(",") + "\n";
    });

    if (result.secondaryTable) {
      csvContent += `\n"${result.secondaryTable.title}"\n`;
      csvContent += result.secondaryTable.headers.map(h => `"${h}"`).join(",") + "\n";
      result.secondaryTable.rows.forEach(row => {
        const cleanCells = row.cells.map(c => `"${c.replace(/<[^>]*>?/gm, '')}"`);
        csvContent += cleanCells.join(",") + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_kebutuhan_${this.activeModuleId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  initTheme() {
    const savedTheme = getFromStorage('theme', 'dark');
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      this.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      this.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      saveToStorage('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      this.themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      saveToStorage('theme', 'dark');
    }
    this.calculateActiveModule();
  }

  openModal(modal) {
    modal.classList.add('active');
  }

  closeModal(modal) {
    modal.classList.remove('active');
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new KehidupanApp();
});
