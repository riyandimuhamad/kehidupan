/**
 * Main Application Logic - Kehidupan Suite
 */

import { BerasModule } from './modules/beras.js';
import { AirModule } from './modules/air.js';
import { ListrikModule } from './modules/listrik.js';
import { GasModule } from './modules/gas.js';
import { TransportModule } from './modules/transport.js';
import { InternetModule } from './modules/internet.js';
import { SembakoModule } from './modules/sembako.js';
import { SewaModule } from './modules/sewa.js';
import { DashboardModule } from './modules/dashboard.js';

import { BudgetStore } from './services/budgetStore.js';
import { SpreadsheetService } from './services/spreadsheetService.js';
import { saveToStorage, getFromStorage, formatDate } from './utils/formatters.js';

class KehidupanApp {
  constructor() {
    // Registry of available modules
    this.modules = {
      beras: BerasModule,
      air: AirModule,
      listrik: ListrikModule,
      gas: GasModule,
      transport: TransportModule,
      internet: InternetModule,
      sembako: SembakoModule,
      sewa: SewaModule,
      dashboard: DashboardModule
    };

    this.activeModuleId = 'beras';
    this.chartInstance = null;
    this.history = getFromStorage('history', []);

    this.initElements();
    this.bindEvents();
    this.loadModule(this.activeModuleId);
    this.initTheme();
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

    this.addModuleModalBtn = document.getElementById('addModuleModalBtn');
    this.addModuleModal = document.getElementById('addModuleModal');
    this.closeAddModuleModal = document.getElementById('closeAddModuleModal');
    this.closeAddModuleModalBtn = document.getElementById('closeAddModuleModalBtn');
  }

  bindEvents() {
    // Navigation Tabs Switcher
    this.navTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (btn) {
        const moduleId = btn.getAttribute('data-module');
        if (moduleId && this.modules[moduleId]) {
          this.navTabs.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.loadModule(moduleId);
        }
      }
    });

    // Dynamic delete budget item listener in table
    this.breakdownTable.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.delete-budget-btn');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        if (id) {
          BudgetStore.removeBudgetItem(id);
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

    // Google Sheets Modal
    this.sheetsModalBtn.addEventListener('click', () => {
      this.appsScriptCodeSnippet.innerText = SpreadsheetService.getAppsScriptTemplate();
      this.openModal(this.sheetsModal);
    });
    this.closeSheetsModal.addEventListener('click', () => this.closeModal(this.sheetsModal));
    this.closeSheetsModalBtn.addEventListener('click', () => this.closeModal(this.sheetsModal));
    this.copyScriptBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(SpreadsheetService.getAppsScriptTemplate());
      this.copyScriptBtn.innerHTML = '<i class="fa-check fa-solid"></i> Tersalin ke Clipboard!';
      setTimeout(() => this.copyScriptBtn.innerHTML = '<i class="fa-copy fa-solid"></i> Salin Skrip Apps Script', 3000);
    });

    // Add Module Modal
    this.addModuleModalBtn.addEventListener('click', () => this.openModal(this.addModuleModal));
    this.closeAddModuleModal.addEventListener('click', () => this.closeModal(this.addModuleModal));
    this.closeAddModuleModalBtn.addEventListener('click', () => this.closeModal(this.addModuleModal));
  }

  loadModule(moduleId) {
    this.activeModuleId = moduleId;
    const activeModule = this.modules[moduleId];

    // Update Hero Metadata
    this.moduleBadge.innerHTML = `<i class="fa-solid ${activeModule.icon}"></i> ${activeModule.badge}`;
    this.moduleTitle.innerText = activeModule.title;
    this.moduleSubtitle.innerText = activeModule.subtitle;

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
    this.renderTable(result.tableHeaders, result.tableRows);

    // Render Chart
    if (result.chartData && this.analysisChartCtx) {
      this.renderChart(result.chartData);
    }

    // Auto save calculation to recent history snapshot
    if (activeModule.id !== 'dashboard') {
      this.saveHistorySnapshot(activeModule.name, result.quickStats);
    }
  }

  renderSummaryCards(cards) {
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

  renderTable(headers, rows) {
    const theadHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    const tbodyHTML = rows.map(r => `
      <tr class="${r.isCurrent ? 'current-row' : ''}">
        ${r.cells.map(c => `<td>${c}</td>`).join('')}
      </tr>
    `).join('');

    this.breakdownTable.querySelector('thead').innerHTML = theadHTML;
    this.breakdownTable.querySelector('tbody').innerHTML = tbodyHTML;
  }

  renderChart(chartData) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    this.chartInstance = new Chart(this.analysisChartCtx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
          },
          tooltip: {
            backgroundColor: isDark ? '#172033' : '#ffffff',
            titleColor: isDark ? '#ffffff' : '#000000',
            bodyColor: isDark ? '#94a3b8' : '#333333',
            borderColor: 'rgba(99,102,241,0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  saveHistorySnapshot(moduleName, quickStats) {
    if (!quickStats) return;
    const snapshot = {
      id: Date.now(),
      module: moduleName,
      qty: quickStats.totalQty,
      cost: quickStats.totalCost,
      date: formatDate(new Date())
    };

    this.history = [snapshot, ...this.history.filter(h => h.module !== moduleName)].slice(0, 10);
    saveToStorage('history', this.history);
  }

  openHistoryModal() {
    this.renderHistoryList();
    this.openModal(this.historyModal);
  }

  renderHistoryList() {
    if (this.history.length === 0) {
      this.historyListContainer.innerHTML = '<p class="sub-text">Belum ada riwayat perhitungan tersimpan.</p>';
      return;
    }

    this.historyListContainer.innerHTML = this.history.map(item => `
      <div class="history-item">
        <div class="history-info">
          <h5>${item.module}</h5>
          <p>${item.date} &bull; Total: ${item.qty}</p>
        </div>
        <div class="history-cost">${item.cost}</div>
      </div>
    `).join('');
  }

  clearHistory() {
    this.history = [];
    saveToStorage('history', []);
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
