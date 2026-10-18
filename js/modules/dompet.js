/**
 * DompetModule: Mobile-first Personal Expense Tracker, Wallets,
 * Debts, Receivables, Financial Health Score, Goals, Subscriptions, and AI Assistant.
 * Fully integrated with RumahBudget Budget Planning.
 */

import { WalletStore } from '../services/walletStore.js';
import { BudgetStore } from '../services/budgetStore.js';
import { WlltAiService } from '../services/wlltAiService.js';
import { formatRupiah, formatNumber } from '../utils/formatters.js';

export const DompetModule = {
  id: 'dompet',
  name: 'Dompet & Transaksi Harian',
  icon: 'fa-wallet',
  badge: 'Mobile Finance Hub',
  title: 'Dompet & Arus Kas Pribadi (WLLT)',
  subtitle: 'Pencatatan transaksi harian, tracking hutang & piutang, tujuan keuangan, dan AI Financial Assistant terintegrasi.',

  currentSubTab: 'beranda', // 'beranda' | 'transaksi' | 'hutang' | 'piutang' | 'goals' | 'laporan' | 'langganan'

  render: (container) => {
    container.innerHTML = `
      <div class="wllt-container" id="wlltAppContainer">
        <!-- Dynamic Sub Tab View Content -->
        <div id="wlltViewContent"></div>

        <!-- Bottom Floating Navigation -->
        <nav class="wllt-bottom-nav">
          <button class="wllt-nav-item active" data-tab="beranda">
            <i class="fa-solid fa-house"></i>
            <span>Beranda</span>
          </button>
          <button class="wllt-nav-item" data-tab="transaksi">
            <i class="fa-solid fa-receipt"></i>
            <span>Transaksi</span>
          </button>
          <button class="wllt-fab-btn" id="wlltFabAddBtn" title="Tambah Transaksi">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button class="wllt-nav-item" data-tab="laporan">
            <i class="fa-solid fa-chart-simple"></i>
            <span>Laporan</span>
          </button>
          <button class="wllt-nav-item" data-tab="langganan">
            <i class="fa-solid fa-sliders"></i>
            <span>Rutin</span>
          </button>
        </nav>

        <!-- WLLT-Ai Floating Avatar Button -->
        <div class="wllt-ai-badge" id="wlltAiOpenBtn" title="Tanya WLLT-Ai">
          <div class="wllt-ai-avatar">
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.4rem;">
              <i class="fa-solid fa-robot"></i>
            </div>
          </div>
        </div>

        <!-- Modal Tambah Transaksi -->
        <div class="modal-overlay" id="wlltTxModal">
          <div class="modal-card" style="max-width: 480px; border-radius: 28px;">
            <div class="modal-header" style="border: none; padding-bottom: 0;">
              <div>
                <h3 style="margin: 0; font-size: 1.25rem;"><i class="fa-plus fa-solid" style="color: var(--primary);"></i> Transaksi Baru</h3>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin: 2px 0 0;">Catat pemasukan, pengeluaran, atau transfer</p>
              </div>
              <button class="modal-close" id="closeWlltTxModal">&times;</button>
            </div>
            <div class="modal-body" style="padding-top: 10px;">
              <form id="wlltTxForm">
                <!-- Type Toggle: Pengeluaran / Pemasukan / Transfer -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                  <button type="button" class="wllt-type-toggle active" data-type="expense" style="padding: 10px; border-radius: 14px; border: 1px solid var(--border-color); background: #ef4444; color: #fff; font-weight: 700; cursor: pointer;">
                    <i class="fa-arrow-down fa-solid"></i> Keluar
                  </button>
                  <button type="button" class="wllt-type-toggle" data-type="income" style="padding: 10px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-muted); font-weight: 700; cursor: pointer;">
                    <i class="fa-arrow-up fa-solid"></i> Masuk
                  </button>
                  <button type="button" class="wllt-type-toggle" data-type="transfer" style="padding: 10px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-muted); font-weight: 700; cursor: pointer;">
                    <i class="fa-right-left fa-solid"></i> Transfer
                  </button>
                </div>

                <!-- Nominal Besar -->
                <div style="text-align: center; margin-bottom: 14px;">
                  <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">NOMINAL TRANSAKSI</span>
                  <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">Rp</span>
                    <input type="number" id="txAmountInput" placeholder="0" required style="font-size: 1.8rem; font-weight: 800; width: 70%; text-align: center; border: none; border-bottom: 2px solid var(--primary); background: transparent; color: var(--text-main); font-family: var(--font-heading);" />
                  </div>
                </div>

                <!-- Quick Amount Chips -->
                <div style="display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                  <button type="button" class="quick-chip" data-add="50000">+50rb</button>
                  <button type="button" class="quick-chip" data-add="100000">+100rb</button>
                  <button type="button" class="quick-chip" data-add="500000">+500rb</button>
                  <button type="button" class="quick-chip" data-add="1000000">+1jt</button>
                  <button type="button" class="quick-chip" data-add="2000000">+2jt</button>
                </div>

                <!-- Title / Notes -->
                <div class="form-group" style="margin-bottom: 12px;">
                  <label>Deskripsi / Keterangan</label>
                  <input type="text" id="txTitleInput" class="form-control" placeholder="Contoh: Makan siang, bayar kos, dll" required />
                </div>

                <!-- Wallet & Category -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                  <div class="form-group">
                    <label>Sumber Dompet</label>
                    <select id="txWalletSelect" class="form-control"></select>
                  </div>
                  <div class="form-group" id="txTargetWalletContainer" style="display: none;">
                    <label>Ke Dompet</label>
                    <select id="txTargetWalletSelect" class="form-control"></select>
                  </div>
                  <div class="form-group" id="txCategoryContainer">
                    <label>Kategori</label>
                    <select id="txCategorySelect" class="form-control">
                      <option value="Food & Dining">Makanan & Minuman</option>
                      <option value="Housing">Tempat Tinggal / Kos</option>
                      <option value="Shopping">Belanja & Pakaian</option>
                      <option value="Transport">BBM & Transportasi</option>
                      <option value="Kesehatan">Kesehatan & Medis</option>
                      <option value="Internet & Pulsa">Internet / Pulsa</option>
                      <option value="Salary">Gaji Pokok</option>
                      <option value="Freelance">Freelance / Proyek</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>
                </div>

                <!-- Date -->
                <div class="form-group" style="margin-bottom: 16px;">
                  <label>Tanggal</label>
                  <input type="date" id="txDateInput" class="form-control" />
                </div>

                <button type="submit" class="primary-btn" style="width: 100%; justify-content: center; padding: 12px; font-weight: 700; border-radius: 14px;">
                  <i class="fa-check fa-solid"></i> Simpan Transaksi
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal WLLT-Ai Chat Assistant -->
        <div class="wllt-chat-modal" id="wlltChatModal">
          <div class="wllt-chat-box">
            <div class="wllt-chat-header">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: #fff;">
                  <i class="fa-robot fa-solid"></i>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800;">WLLT-Ai ✨</h4>
                  <span style="font-size: 0.72rem; color: #10b981; font-weight: 600;">Online • Asisten Finansial</span>
                </div>
              </div>
              <button id="closeWlltChatBtn" style="background: none; border: none; font-size: 1.4rem; color: var(--text-muted); cursor: pointer;">&times;</button>
            </div>

            <div class="wllt-chat-messages" id="wlltChatMessages">
              <!-- Chat bubbles injected by JS -->
            </div>

            <!-- Quick prompt pills -->
            <div style="padding: 6px 16px; display: flex; gap: 6px; overflow-x: auto; background: var(--bg-card); border-top: 1px solid var(--border-color);">
              <button class="prompt-chip" data-prompt="Analisa pengeluaran saya minggu ini gimana">📊 Review Pengeluaran</button>
              <button class="prompt-chip" data-prompt="Beli obat flu batuk 35rb di apotek pakai mandiri">💊 Catat Beli Obat 35rb</button>
              <button class="prompt-chip" data-prompt="Makan siang warteg 25rb pakai tunai">🍛 Catat Makan Siang 25rb</button>
            </div>

            <form class="wllt-chat-input-bar" id="wlltChatForm">
              <input type="text" id="wlltChatInput" placeholder="Tanyakan atau ketik transaksi..." autocomplete="off" />
              <button type="submit" class="primary-btn" style="border-radius: 50%; width: 42px; height: 42px; padding: 0; justify-content: center;">
                <i class="fa-paper-plane fa-solid"></i>
              </button>
            </form>
          </div>
        </div>

      </div>
    `;

    DompetModule.bindGlobalEvents(container);
    DompetModule.renderSubTab(DompetModule.currentSubTab, container);
  },

  // Binds navigation and modal events
  bindGlobalEvents: (container) => {
    // Navigation buttons
    container.querySelectorAll('.wllt-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        container.querySelectorAll('.wllt-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        DompetModule.currentSubTab = tab;
        DompetModule.renderSubTab(tab, container);
      });
    });

    // FAB Add Transaction Modal
    const fabBtn = container.querySelector('#wlltFabAddBtn');
    const txModal = container.querySelector('#wlltTxModal');
    const closeTxModal = container.querySelector('#closeWlltTxModal');

    fabBtn.addEventListener('click', () => {
      DompetModule.populateTxModal(container);
      txModal.classList.add('open');
    });

    closeTxModal.addEventListener('click', () => {
      txModal.classList.remove('open');
    });

    // Transaction form submission
    const txForm = container.querySelector('#wlltTxForm');
    txForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = container.querySelector('.wllt-type-toggle.active')?.getAttribute('data-type') || 'expense';
      const amount = parseFloat(container.querySelector('#txAmountInput').value) || 0;
      const title = container.querySelector('#txTitleInput').value.trim();
      const walletId = container.querySelector('#txWalletSelect').value;
      const targetWalletId = container.querySelector('#txTargetWalletSelect')?.value;
      const category = container.querySelector('#txCategorySelect')?.value || 'Lain-lain';
      const date = container.querySelector('#txDateInput').value || new Date().toISOString().split('T')[0];

      if (amount <= 0 || !title) return;

      WalletStore.addTransaction({
        title,
        amount,
        type,
        walletId,
        targetWalletId: type === 'transfer' ? targetWalletId : undefined,
        category: type === 'transfer' ? 'Transfer' : category,
        date
      });

      txModal.classList.remove('open');
      txForm.reset();
      DompetModule.renderSubTab(DompetModule.currentSubTab, container);
    });

    // Type toggles in Tx Modal
    container.querySelectorAll('.wllt-type-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.wllt-type-toggle').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'var(--bg-card)';
          b.style.color = 'var(--text-muted)';
        });
        btn.classList.add('active');
        const type = btn.getAttribute('data-type');
        if (type === 'expense') {
          btn.style.background = '#ef4444';
          btn.style.color = '#fff';
          container.querySelector('#txTargetWalletContainer').style.display = 'none';
          container.querySelector('#txCategoryContainer').style.display = 'block';
        } else if (type === 'income') {
          btn.style.background = '#10b981';
          btn.style.color = '#fff';
          container.querySelector('#txTargetWalletContainer').style.display = 'none';
          container.querySelector('#txCategoryContainer').style.display = 'block';
        } else if (type === 'transfer') {
          btn.style.background = 'var(--primary)';
          btn.style.color = '#fff';
          container.querySelector('#txTargetWalletContainer').style.display = 'block';
          container.querySelector('#txCategoryContainer').style.display = 'none';
        }
      });
    });

    // Quick chips in Tx Modal
    container.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const add = parseInt(btn.getAttribute('data-add'), 10);
        const input = container.querySelector('#txAmountInput');
        const current = parseInt(input.value, 10) || 0;
        input.value = current + add;
      });
    });

    // AI Chat Modal Toggle
    const aiOpenBtn = container.querySelector('#wlltAiOpenBtn');
    const chatModal = container.querySelector('#wlltChatModal');
    const closeChatBtn = container.querySelector('#closeWlltChatBtn');
    const chatForm = container.querySelector('#wlltChatForm');
    const chatInput = container.querySelector('#wlltChatInput');

    aiOpenBtn.addEventListener('click', () => {
      DompetModule.renderChatMessages(container);
      chatModal.classList.add('open');
    });

    closeChatBtn.addEventListener('click', () => {
      chatModal.classList.remove('open');
    });

    // Quick prompt chips
    container.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        chatInput.value = prompt;
        chatForm.dispatchEvent(new Event('submit'));
      });
    });

    // Chat submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (!msg) return;

      const history = WalletStore.getAiChatHistory();
      history.push({ sender: 'user', text: msg, time: 'Baru saja' });
      chatInput.value = '';

      // AI response
      const res = WlltAiService.respond(msg);
      if (res.type === 'confirm_transaction') {
        history.push({
          sender: 'ai',
          text: res.text,
          confirmCard: res.parsed,
          time: 'Baru saja'
        });
      } else {
        history.push({
          sender: 'ai',
          text: res.text,
          time: 'Baru saja'
        });
      }

      WalletStore.saveAiChatHistory(history);
      DompetModule.renderChatMessages(container);
    });
  },

  populateTxModal: (container) => {
    const wallets = WalletStore.getWallets();
    const sourceSelect = container.querySelector('#txWalletSelect');
    const targetSelect = container.querySelector('#txTargetWalletSelect');

    sourceSelect.innerHTML = wallets.map(w => `<option value="${w.id}">${w.name} (${formatRupiah(w.balance)})</option>`).join('');
    targetSelect.innerHTML = wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    container.querySelector('#txDateInput').value = new Date().toISOString().split('T')[0];
  },

  renderChatMessages: (container) => {
    const chatContainer = container.querySelector('#wlltChatMessages');
    const history = WalletStore.getAiChatHistory();

    chatContainer.innerHTML = history.map((h, idx) => {
      if (h.sender === 'user') {
        return `<div class="wllt-chat-bubble user">${h.text}</div>`;
      }

      let confirmCardHtml = '';
      if (h.confirmCard) {
        const c = h.confirmCard;
        confirmCardHtml = `
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; margin-top: 10px;">
            <span style="font-size: 0.7rem; color: #10b981; font-weight: 700; text-transform: uppercase;">✨ TRANSAKSI BARU</span>
            <h4 style="margin: 4px 0 2px 0; font-size: 1rem; font-weight: 800;">${c.title}</h4>
            <div style="font-size: 1.35rem; font-weight: 800; color: #10b981; font-family: var(--font-heading); margin-bottom: 8px;">${formatRupiah(c.amount)}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 12px;">
              <div>Tipe: <strong>${c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</strong></div>
              <div>Wallet: <strong>${c.walletId.toUpperCase()}</strong></div>
              <div>Kategori: <strong>${c.category}</strong></div>
              <div>Tanggal: <strong>${c.date}</strong></div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="primary-btn confirm-ai-save-btn" data-idx="${idx}" style="flex: 1; justify-content: center; padding: 8px; font-size: 0.8rem; background: #10b981;">
                <i class="fa-check fa-solid"></i> Simpan
              </button>
            </div>
          </div>
        `;
      }

      // Convert basic markdown asterisks to HTML bold
      const formattedText = h.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

      return `
        <div class="wllt-chat-bubble ai">
          ${formattedText}
          ${confirmCardHtml}
        </div>
      `;
    }).join('');

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Bind confirm save buttons
    chatContainer.querySelectorAll('.confirm-ai-save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const card = history[idx]?.confirmCard;
        if (card) {
          WalletStore.addTransaction(card);
          btn.disabled = true;
          btn.innerHTML = '<i class="fa-check fa-solid"></i> Berhasil Disimpan!';
          btn.style.background = '#64748b';
          DompetModule.renderSubTab(DompetModule.currentSubTab, container);
        }
      });
    });
  },

  // Main Sub-Tab Renderer
  renderSubTab: (tab, container) => {
    const view = container.querySelector('#wlltViewContent');
    const overview = WalletStore.calculateOverview();
    const profile = WalletStore.getUserProfile();

    // Synchronize bottom floating nav active states
    container.querySelectorAll('.wllt-nav-item').forEach(btn => {
      const navTab = btn.getAttribute('data-tab');
      if (navTab === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tab === 'beranda') {
      DompetModule.renderBerandaTab(view, overview, profile, container);
    } else if (tab === 'transaksi') {
      DompetModule.renderTransaksiTab(view, overview, container);
    } else if (tab === 'hutang') {
      DompetModule.renderHutangTab(view, overview, container);
    } else if (tab === 'piutang') {
      DompetModule.renderPiutangTab(view, overview, container);
    } else if (tab === 'goals') {
      DompetModule.renderGoalsTab(view, overview, container);
    } else if (tab === 'laporan') {
      DompetModule.renderLaporanTab(view, overview, container);
    } else if (tab === 'langganan') {
      DompetModule.renderLanggananTab(view, overview, container);
    }
  },

  // 1. BERANDA (Main Mobile & Desktop Bento Hub)
  // 1. BERANDA (Main Mobile & Desktop Bento Hub)
  renderBerandaTab: (view, overview, profile, container) => {
    const wallets = WalletStore.getWallets();

    view.innerHTML = `
      <!-- Greeting Header -->
      <div class="wllt-header">
        <div>
          <div class="wllt-greeting-badge">
            <i class="fa-solid fa-sparkles"></i> Personal Wealth Dashboard
          </div>
          <div class="wllt-greeting">
            <h2>${profile.greeting || 'Selamat Datang'}, ${profile.name || 'Riyandi'}!</h2>
            <p>Monitor arus kas harian, dompet aktif, dan proyeksi kesehatan keuanganmu.</p>
          </div>
        </div>
        <div class="wllt-header-actions">
          <button class="wllt-action-pill-btn" id="wlltSwitchToPlannerBtn" title="Buka Mode Perencanaan Anggaran Rumah Tangga">
            <i class="fa-solid fa-calculator"></i>
            <span>Mode Planner</span>
          </button>
        </div>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip active" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <!-- Bento Grid Layout: 2 Columns on Desktop, Single Column on Mobile -->
      <div class="wllt-bento-layout">
        
        <!-- Bento Column Left / Main -->
        <div class="wllt-bento-col-main">
          
          <!-- Hero Card: Total Kekayaan Bersih & Quick Actions -->
          <div class="wllt-hero-card">
            <div class="wllt-hero-top">
              <div class="wllt-hero-subtitle">
                <i class="fa-solid fa-shield-halved"></i> TOTAL SALDO KELOLAAN
              </div>
              <div class="wllt-hero-health-chip">
                <i class="fa-solid fa-heart-pulse"></i> Skor ${overview.healthScore}/100
              </div>
            </div>

            <div class="wllt-hero-balance-row">
              <div class="wllt-hero-balance">${formatRupiah(overview.totalSaldo)}</div>
            </div>
            <div class="wllt-hero-subtext">Akumulasi seluruh rekening bank, e-wallet, dan uang tunai aktif</div>

            <!-- Progress bar pemakaian budget -->
            <div class="wllt-progress-info">
              <span>Disiplin Anggaran Bulanan</span>
              <span>${Math.min(100, Math.round((overview.totalPengeluaranBulan / (overview.totalPlannedBudget || 1)) * 100))}% Terpakai</span>
            </div>
            <div class="wllt-progress-bar">
              <div class="wllt-progress-fill" style="width: ${Math.min(100, Math.round((overview.totalPengeluaranBulan / (overview.totalPlannedBudget || 1)) * 100))}%;"></div>
            </div>

            <!-- Quick Action Strip -->
            <div class="wllt-hero-actions">
              <button class="wllt-hero-action-btn green" id="heroQuickIncomeBtn">
                <i class="fa-solid fa-plus-circle"></i>
                <span>Catat Masuk</span>
              </button>
              <button class="wllt-hero-action-btn red" id="heroQuickExpenseBtn">
                <i class="fa-solid fa-minus-circle"></i>
                <span>Catat Keluar</span>
              </button>
              <button class="wllt-hero-action-btn purple" id="heroQuickTransferBtn">
                <i class="fa-solid fa-arrow-right-arrow-left"></i>
                <span>Transfer</span>
              </button>
            </div>
          </div>

          <!-- Cashflow Overview Boxes -->
          <div class="wllt-cashflow-grid">
            <div class="wllt-cashflow-box">
              <div class="wllt-cashflow-icon inc">
                <i class="fa-solid fa-arrow-trend-up"></i>
              </div>
              <div class="wllt-cashflow-data">
                <div class="cf-label">Total Pemasukan</div>
                <div class="cf-val inc">+${formatRupiah(overview.totalPemasukanBulan)}</div>
              </div>
            </div>

            <div class="wllt-cashflow-box">
              <div class="wllt-cashflow-icon exp">
                <i class="fa-solid fa-arrow-trend-down"></i>
              </div>
              <div class="wllt-cashflow-data">
                <div class="cf-label">Total Pengeluaran</div>
                <div class="cf-val exp">-${formatRupiah(overview.totalPengeluaranBulan)}</div>
              </div>
            </div>
          </div>

          <!-- AI Copilot Strip Banner -->
          <div class="wllt-scan-banner" id="wlltScanBannerBtn">
            <div class="wllt-scan-info">
              <div class="wllt-scan-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
              <div class="wllt-scan-text">
                <h4>WLLT-AI Financial Copilot</h4>
                <p>Ketik bebas transaksi harian atau tanyakan saran alokasi keuanganmu</p>
              </div>
            </div>
            <button class="primary-btn" style="padding: 8px 16px; font-size: 0.8rem; border-radius: 12px; background: #10b981;">
              Buka AI <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i>
            </button>
          </div>

          <!-- Sisa Batas Aman Info Card -->
          <div class="wllt-card-item" style="display: flex; align-items: center; justify-content: space-between; gap: 14px; background: rgba(16, 185, 129, 0.06); border-color: rgba(16, 185, 129, 0.25);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                <i class="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <h5 style="margin: 0; font-size: 0.92rem; font-weight: 800;">Sisa Batas Aman Harian</h5>
                <p style="margin: 2px 0 0; font-size: 0.76rem; color: var(--text-muted);">Alokasi belanja wajar per hari hingga akhir bulan</p>
              </div>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #10b981; font-family: var(--font-heading); white-space: nowrap;">
              ~${formatRupiah(overview.sisaBatasAmanHarian)}
            </div>
          </div>

        </div><!-- End col-main -->

        <!-- Bento Column Right / Side -->
        <div class="wllt-bento-col-side">
          
          <!-- Dompet & Rekening Aktif List -->
          <div class="wllt-card-item" style="padding: 20px;">
            <div class="wllt-section-header" style="margin-bottom: 14px;">
              <h3>💳 Dompet & Rekening</h3>
              <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">${wallets.length} Sumber Dana</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${wallets.map(w => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 14px; background: var(--bg-input); border: 1px solid var(--border-color); transition: all 0.2s ease;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(37,99,235,0.12); color: ${w.color}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                      <i class="fa-solid ${w.icon}"></i>
                    </div>
                    <div>
                      <h5 style="margin: 0 0 2px 0; font-size: 0.88rem; font-weight: 800;">${w.name}</h5>
                      <span style="font-size: 0.68rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">${w.type}</span>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">${formatRupiah(w.balance)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Kalender Aktivitas Bulan Ini -->
          ${DompetModule.renderCalendarSnippet()}

        </div><!-- End col-side -->

      </div><!-- End wllt-bento-layout -->
    `;

    // Events in Beranda
    view.querySelector('#wlltScanBannerBtn').addEventListener('click', () => {
      container.querySelector('#wlltAiOpenBtn').click();
    });

    view.querySelector('#wlltSwitchToPlannerBtn')?.addEventListener('click', () => {
      if (window.AppInstance) {
        window.AppInstance.loadModule('dashboard');
      } else {
        window.location.href = 'index.html';
      }
    });

    // Sub-Navigation Chips click handler
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });

    // Hero Action Buttons (Quick actions)
    view.querySelector('#heroQuickIncomeBtn')?.addEventListener('click', () => {
      DompetModule.populateTxModal(container);
      const incBtn = container.querySelector('.wllt-type-toggle[data-type="income"]');
      if (incBtn) incBtn.click();
      container.querySelector('#wlltTxModal').classList.add('open');
    });

    view.querySelector('#heroQuickExpenseBtn')?.addEventListener('click', () => {
      DompetModule.populateTxModal(container);
      const expBtn = container.querySelector('.wllt-type-toggle[data-type="expense"]');
      if (expBtn) expBtn.click();
      container.querySelector('#wlltTxModal').classList.add('open');
    });

    view.querySelector('#heroQuickTransferBtn')?.addEventListener('click', () => {
      DompetModule.populateTxModal(container);
      const tfBtn = container.querySelector('.wllt-type-toggle[data-type="transfer"]');
      if (tfBtn) tfBtn.click();
      container.querySelector('#wlltTxModal').classList.add('open');
    });
  },

  // 2. TRANSAKSI (List & Filter)
  renderTransaksiTab: (view, overview, container) => {
    const transactions = WalletStore.getTransactions();
    const wallets = WalletStore.getWallets();

    // Group transactions by date
    const grouped = {};
    transactions.forEach(t => {
      grouped[t.date] = grouped[t.date] || [];
      grouped[t.date].push(t);
    });

    const sortedDates = Object.keys(grouped).sort().reverse();

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; font-weight: 800; font-family: var(--font-heading);">Buku Kas & Transaksi</h2>
          <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Riwayat mutasi keluar, masuk, dan perpindahan dana antar dompet</p>
        </div>
        <button class="primary-btn" id="addTxFromTabBtn" style="padding: 9px 16px; font-size: 0.82rem; border-radius: 12px; background: #10b981;">
          <i class="fa-plus fa-solid"></i> Tambah Transaksi
        </button>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip active" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <!-- Filter Card -->
      <div class="wllt-card-item" style="margin-bottom: 16px; padding: 14px;">
        <div style="display: flex; gap: 8px;">
          <input type="text" id="txSearchInput" class="form-control" placeholder="Cari transaksi berdasarkan judul, kategori, atau dompet..." style="font-size: 0.85rem;" />
        </div>
      </div>

      <!-- Transactions grouped list -->
      <div id="txListContainer">
        ${sortedDates.map(date => {
          const dayTxs = grouped[date];
          const dayTotal = dayTxs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
          const isPositive = dayTotal >= 0;

          return `
            <div class="wllt-tx-day-group">
              <div class="wllt-tx-day-header">
                <span>${date} • ${dayTxs.length} item</span>
                <span style="color: ${isPositive ? '#10b981' : '#ef4444'};">${isPositive ? '+' : ''}${formatRupiah(dayTotal)}</span>
              </div>
              ${dayTxs.map(t => {
                const w = wallets.find(x => x.id === t.walletId);
                const isInc = t.type === 'income';
                return `
                  <div class="wllt-tx-item">
                    <div class="wllt-tx-left">
                      <div class="wllt-tx-icon" style="color: ${isInc ? '#10b981' : '#ef4444'};">
                        <i class="fa-solid ${isInc ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                      </div>
                      <div class="wllt-tx-info">
                        <h5>${t.title}</h5>
                        <div class="wllt-tx-meta">
                          <span><i class="fa-solid fa-wallet"></i> ${w ? w.name : 'Wallet'}</span>
                          <span>•</span>
                          <span>${t.category}</span>
                        </div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span class="wllt-tx-amount ${isInc ? 'income' : 'expense'}">
                        ${isInc ? '+' : '-'}${formatRupiah(t.amount)}
                      </span>
                      <button class="delete-tx-btn" data-id="${t.id}" style="background: none; border: none; color: #94a3b8; cursor: pointer;" title="Hapus Transaksi">
                        <i class="fa-trash fa-solid"></i>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;

    view.querySelector('#addTxFromTabBtn').addEventListener('click', () => {
      container.querySelector('#wlltFabAddBtn').click();
    });

    // Sub-Navigation Chips click handler
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });

    // Search filter live handler
    const searchInput = view.querySelector('#txSearchInput');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      view.querySelectorAll('.wllt-tx-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    view.querySelectorAll('.delete-tx-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus transaksi ini? Saldo dompet akan disesuaikan otomatis.')) {
          WalletStore.deleteTransaction(id);
          DompetModule.renderSubTab('transaksi', container);
        }
      });
    });
  },

  // 3. HUTANG (Debts Tracking)
  renderHutangTab: (view, overview, container) => {
    const debts = WalletStore.getDebts();

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; font-weight: 800; font-family: var(--font-heading);">Kelola & Pantau Hutang</h2>
          <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Tracking sisa cicilan, jatuh tempo, dan progres pelunasan liabilitas</p>
        </div>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip active" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <!-- Hero Dark Card Hutang -->
      <div class="wllt-hero-card" style="margin-bottom: 20px;">
        <div class="wllt-hero-top">
          <div class="wllt-hero-subtitle"><i class="fa-solid fa-building-columns"></i> TOTAL SISA HUTANG AKTIF</div>
          <div class="wllt-hero-health-chip" style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); color: #f87171;">
            <i class="fa-solid fa-scale-unbalanced"></i> DSR ${overview.dsrRatio}%
          </div>
        </div>
        
        <div class="wllt-hero-balance-row">
          <div class="wllt-hero-balance" style="color: #fca5a5;">${formatRupiah(overview.totalSisaHutang)}</div>
        </div>
        <div class="wllt-hero-subtext">Akumulasi seluruh tagihan kredit berjalan, pinjaman, dan pembiayaan</div>

        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; margin-bottom: 6px;">
          <span>PROGRES PELUNASAN KESELURUHAN (${overview.debtProgressPercent}%)</span>
          <span>${formatRupiah(overview.totalTerbayarHutang)} terbayar</span>
        </div>
        <div class="wllt-progress-bar">
          <div class="wllt-progress-fill" style="width: ${overview.debtProgressPercent}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
        </div>

        <div class="wllt-cashflow-grid" style="margin-top: 10px;">
          <div class="wllt-cashflow-box" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1);">
            <div class="wllt-cashflow-icon" style="background: rgba(255,255,255,0.1); color: #cbd5e1;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <div class="wllt-cashflow-data">
              <div class="cf-label" style="color: #94a3b8;">Total Pokok Hutang</div>
              <div class="cf-val" style="color: #e2e8f0;">${formatRupiah(overview.totalPokokHutang)}</div>
            </div>
          </div>
          <div class="wllt-cashflow-box" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1);">
            <div class="wllt-cashflow-icon exp">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
            <div class="wllt-cashflow-data">
              <div class="cf-label" style="color: #94a3b8;">Beban Cicilan Bulanan</div>
              <div class="cf-val exp">${formatRupiah(overview.totalCicilanBulan)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Debt Items List -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${debts.map(d => {
          const percent = Math.round((d.paidAmount / (d.totalPrincipal || 1)) * 100);
          return `
            <div class="wllt-card-item">
              <div class="wllt-card-header">
                <div class="wllt-card-info">
                  <h4><i class="fa-solid ${d.icon || 'fa-building-columns'}" style="color: var(--primary); margin-right: 6px;"></i> ${d.name}</h4>
                  <p>Cicilan: <strong>${formatRupiah(d.monthlyPayment)}</strong>/bulan • Jatuh Tempo: <strong>${d.dueDate}</strong></p>
                </div>
                <div class="wllt-card-amount">${formatRupiah(d.remainingAmount)}</div>
              </div>
              <div class="wllt-progress-bar" style="margin-bottom: 8px;">
                <div class="wllt-progress-fill" style="width: ${percent}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
              </div>
              <div class="wllt-card-footer">
                <span><i class="fa-solid fa-check-double" style="color: #10b981; margin-right: 4px;"></i> ${percent}% terbayar (${formatRupiah(d.paidAmount)} / ${formatRupiah(d.totalPrincipal)})</span>
                <button class="primary-btn pay-debt-btn" data-id="${d.id}" data-amt="${d.monthlyPayment}" style="padding: 7px 14px; font-size: 0.78rem; border-radius: 10px; background: #10b981;">
                  <i class="fa-solid fa-money-bill-wave"></i> Bayar Cicilan
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Subnav clicks
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });

    view.querySelectorAll('.pay-debt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const amt = parseFloat(btn.getAttribute('data-amt'));
        if (confirm(`Bayar cicilan sebesar ${formatRupiah(amt)}? Saldo dompet akan terpotong secara otomatis.`)) {
          WalletStore.payDebtInstallment(id, amt);
          DompetModule.renderSubTab('hutang', container);
        }
      });
    });
  },

  // 4. PIUTANG (Receivables Tracking)
  renderPiutangTab: (view, overview, container) => {
    const recs = WalletStore.getReceivables();

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; font-weight: 800; font-family: var(--font-heading);">Buku Piutang & Tagihan</h2>
          <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Pantau dana yang dipinjamkan ke rekan dan status penagihan</p>
        </div>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip active" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <!-- Hero Dark Card Piutang -->
      <div class="wllt-hero-card" style="margin-bottom: 20px;">
        <div class="wllt-hero-top">
          <div class="wllt-hero-subtitle"><i class="fa-solid fa-handshake"></i> TOTAL PIUTANG AKTIF</div>
          <div class="wllt-hero-health-chip" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
            <i class="fa-solid fa-clock-rotate-left"></i> ${recs.length} Peminjam Aktif
          </div>
        </div>

        <div class="wllt-hero-balance-row">
          <div class="wllt-hero-balance" style="color: #6ee7b7;">${formatRupiah(overview.totalPiutangAktif)}</div>
        </div>
        <div class="wllt-hero-subtext">Dana yang sedang beredar di luar dan menunggu pelunasan kembali</div>

        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; margin-bottom: 6px;">
          <span>PROGRES PENAGIHAN DANA</span>
          <span>${formatRupiah(overview.totalPiutangTerkumpul)} terkumpul</span>
        </div>
        <div class="wllt-progress-bar">
          <div class="wllt-progress-fill" style="width: ${overview.totalPiutangDipinjamkan > 0 ? Math.round((overview.totalPiutangTerkumpul / overview.totalPiutangDipinjamkan) * 100) : 0}%; background: linear-gradient(90deg, #10b981, #06b6d4);"></div>
        </div>
      </div>

      <!-- Receivables items -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${recs.map(r => `
          <div class="wllt-card-item">
            <div class="wllt-card-header">
              <div class="wllt-card-info">
                <h4><i class="fa-solid fa-user-tag" style="color: #10b981; margin-right: 6px;"></i> ${r.name}</h4>
                <p>Peminjam: <strong>${r.borrowerName}</strong> • Estimasi Kembali: <strong>${r.dueDate}</strong></p>
              </div>
              <div class="wllt-card-amount receivable">${formatRupiah(r.remainingAmount)}</div>
            </div>
            <div class="wllt-card-footer">
              <span>Terkumpul: <strong>${formatRupiah(r.collectedAmount)}</strong> dari ${formatRupiah(r.totalLoan)}</span>
              <button class="primary-btn collect-rec-btn" data-id="${r.id}" style="padding: 7px 14px; font-size: 0.78rem; border-radius: 10px; background: #10b981;">
                <i class="fa-solid fa-hand-holding-dollar"></i> Terima Pembayaran
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Subnav clicks
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });

    view.querySelectorAll('.collect-rec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const amtStr = prompt('Masukkan nominal pelunasan yang diterima ke dompet:', '500000');
        if (amtStr) {
          const amt = parseFloat(amtStr);
          if (amt > 0) {
            WalletStore.collectReceivable(id, amt);
            DompetModule.renderSubTab('piutang', container);
          }
        }
      });
    });
  },

  // 5. GOALS (Tujuan Keuangan & Alokasi Impian)
  renderGoalsTab: (view, overview, container) => {
    const goals = WalletStore.getGoals();

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; font-weight: 800; font-family: var(--font-heading);">Tujuan Finansial & Goals</h2>
          <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Alokasi tabungan berjangka, dana darurat, dan rencana impian masa depan</p>
        </div>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip active" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
        ${goals.map(g => {
          const percent = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));
          return `
            <div class="wllt-card-item" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16,185,129,0.12); color: ${g.color || '#10b981'}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                      <i class="fa-solid ${g.icon}"></i>
                    </div>
                    <div>
                      <h4 style="margin: 0 0 2px 0; font-size: 1.05rem; font-weight: 800;">${g.title}</h4>
                      <p style="margin: 0; font-size: 0.76rem; color: var(--text-muted);">Target: <strong>${formatRupiah(g.targetAmount)}</strong></p>
                    </div>
                  </div>
                  <div style="font-size: 1.15rem; font-weight: 800; color: #10b981; font-family: var(--font-heading);">${percent}%</div>
                </div>

                <div class="wllt-progress-bar" style="margin-bottom: 12px;">
                  <div class="wllt-progress-fill" style="width: ${percent}%; background: ${g.color || 'linear-gradient(90deg, #10b981, #06b6d4)'};"></div>
                </div>
              </div>

              <div class="wllt-card-footer">
                <span style="font-weight: 700; color: var(--text-main);">Terkumpul: ${formatRupiah(g.currentAmount)}</span>
                <button class="primary-btn topup-goal-btn" data-id="${g.id}" style="padding: 7px 14px; font-size: 0.78rem; border-radius: 10px; background: #10b981;">
                  <i class="fa-solid fa-plus-circle"></i> Setor Tabungan
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Subnav clicks
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });

    view.querySelectorAll('.topup-goal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const amtStr = prompt('Masukkan nominal yang ingin disetor ke goal ini:', '1000000');
        if (amtStr) {
          const amt = parseFloat(amtStr);
          if (amt > 0) {
            WalletStore.topupGoal(id, amt);
            DompetModule.renderSubTab('goals', container);
          }
        }
      });
    });
  },

  // 6. LAPORAN & SKOR KESEHATAN FINANSIAL
  renderLaporanTab: (view, overview, container) => {
    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; font-weight: 800; font-family: var(--font-heading);">Analitik & Skor Kesehatan Finansial</h2>
          <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Diagnosis komprehensif atas rasio tabungan, ketahanan dana darurat, dan beban hutang</p>
        </div>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip active" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <!-- Skor Kesehatan Finansial Hero Card -->
      <div class="wllt-hero-card" style="margin-bottom: 20px;">
        <div class="wllt-hero-top">
          <div class="wllt-hero-subtitle"><i class="fa-solid fa-heart-pulse"></i> DIAGNOSIS KESEHATAN FINANSIAL</div>
          <div class="wllt-hero-health-chip">
            Status: ${overview.healthStatus.toUpperCase()}
          </div>
        </div>

        <div style="display: flex; align-items: baseline; gap: 8px; margin: 10px 0;">
          <span style="font-size: 3.4rem; font-weight: 800; font-family: var(--font-heading); color: #34d399;">${overview.healthScore}</span>
          <span style="font-size: 1.4rem; opacity: 0.7;">/100</span>
        </div>

        <p style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 20px; line-height: 1.5;">
          Perhitungan otomatis berdasarkan 4 pilar: Rasio Tabungan Bulanan, Kedisiplinan Anggaran Rumah Tangga, Daya Tahan Dana Darurat (Runway), dan Rasio Beban Utang (DSR).
        </p>

        <!-- 4 Health Metrics Badges -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
          <div style="background: rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
            <i class="fa-solid fa-piggy-bank" style="color: #fbbf24; font-size: 1.2rem; margin-bottom: 6px;"></i>
            <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-heading);">${overview.savingsRatio}%</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">Rasio Tabungan</div>
          </div>
          <div style="background: rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
            <i class="fa-solid fa-chart-pie" style="color: #a855f7; font-size: 1.2rem; margin-bottom: 6px;"></i>
            <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-heading);">${overview.budgetDiscipline}%</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">Disiplin Anggaran</div>
          </div>
          <div style="background: rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
            <i class="fa-solid fa-shield-halved" style="color: #38bdf8; font-size: 1.2rem; margin-bottom: 6px;"></i>
            <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-heading);">${overview.runwayMonths} bln</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">Runway Darurat</div>
          </div>
          <div style="background: rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 10px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
            <i class="fa-solid fa-scale-unbalanced" style="color: #f87171; font-size: 1.2rem; margin-bottom: 6px;"></i>
            <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-heading);">${overview.dsrRatio}%</div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">Beban Utang (DSR)</div>
          </div>
        </div>
      </div>

      <!-- Financial Totals Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
        <div class="wllt-card-item">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(59,130,246,0.12); color: #3b82f6; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-vault"></i>
            </div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL SALDO AKTIF</span>
          </div>
          <div style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-heading);">${formatRupiah(overview.totalSaldo)}</div>
        </div>

        <div class="wllt-card-item">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(16,185,129,0.12); color: #10b981; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL PEMASUKAN BULAN INI</span>
          </div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #10b981; font-family: var(--font-heading);">+${formatRupiah(overview.totalPemasukanBulan)}</div>
        </div>

        <div class="wllt-card-item">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(239,68,68,0.12); color: #ef4444; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-arrow-trend-down"></i>
            </div>
            <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL PENGELUARAN BULAN INI</span>
          </div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #ef4444; font-family: var(--font-heading);">-${formatRupiah(overview.totalPengeluaranBulan)}</div>
        </div>
      </div>
    `;

    // Subnav clicks
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });
  },

  // 7. LANGGANAN & RUTIN
  renderLanggananTab: (view, overview, container) => {
    const subs = WalletStore.getSubscriptions();
    const totalSubsCost = subs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const dailyAverage = Math.round(totalSubsCost / 30);

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 16px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; font-weight: 800; font-family: var(--font-heading);">Langganan & Beban Rutin</h2>
          <p style="margin: 2px 0 0; font-size: 0.8rem; color: var(--text-muted);">Audit pengeluaran tetap bulanan, subscriptions software, dan streaming</p>
        </div>
      </div>

      <!-- Sub-Navigation Pill Bar -->
      <div class="wllt-subnav-bar">
        <button class="wllt-subnav-chip" data-sub="beranda"><i class="fa-solid fa-house"></i> Ringkasan</button>
        <button class="wllt-subnav-chip" data-sub="transaksi"><i class="fa-solid fa-receipt"></i> Transaksi</button>
        <button class="wllt-subnav-chip" data-sub="hutang"><i class="fa-solid fa-building-columns"></i> Hutang</button>
        <button class="wllt-subnav-chip" data-sub="piutang"><i class="fa-solid fa-handshake"></i> Piutang</button>
        <button class="wllt-subnav-chip" data-sub="goals"><i class="fa-solid fa-bullseye"></i> Goals</button>
        <button class="wllt-subnav-chip" data-sub="laporan"><i class="fa-solid fa-chart-pie"></i> Analitik</button>
        <button class="wllt-subnav-chip active" data-sub="langganan"><i class="fa-solid fa-sliders"></i> Rutin</button>
      </div>

      <!-- Hero Summary -->
      <div class="wllt-hero-card" style="margin-bottom: 20px;">
        <div class="wllt-hero-top">
          <div class="wllt-hero-subtitle"><i class="fa-solid fa-sliders"></i> TOTAL BIAYA LANGGANAN BERULANG</div>
          <div class="wllt-hero-health-chip">
            ${subs.length} Layanan Aktif
          </div>
        </div>

        <div class="wllt-hero-balance-row">
          <div class="wllt-hero-balance" style="color: #fca5a5;">${formatRupiah(totalSubsCost)}</div>
        </div>
        <div class="wllt-hero-subtext">Estimasi pengeluaran rutin yang terdebit setiap siklus 30 hari</div>

        <div style="display: flex; gap: 20px; font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 14px; color: #cbd5e1;">
          <div>Rata-rata Harian: <strong style="color: #fff;">${formatRupiah(dailyAverage)} / hari</strong></div>
          <div>Beban Setahun: <strong style="color: #fff;">${formatRupiah(totalSubsCost * 12)}</strong></div>
        </div>
      </div>

      <!-- Subs List -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${subs.map(s => `
          <div class="wllt-card-item">
            <div class="wllt-card-header">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(0,0,0,0.06); color: ${s.color}; display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">
                  <i class="${s.icon}"></i>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 1rem; font-weight: 800;">${s.name}</h4>
                  <p style="margin: 2px 0 0; font-size: 0.76rem; color: var(--text-muted);">${s.category} • Siklus Jatuh Tempo: <strong>${s.dueDate}</strong></p>
                </div>
              </div>
              <div class="wllt-card-amount">-${formatRupiah(s.amount)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Subnav clicks
    view.querySelectorAll('.wllt-subnav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sub = chip.getAttribute('data-sub');
        DompetModule.currentSubTab = sub;
        DompetModule.renderSubTab(sub, container);
      });
    });
  },

  // Helper Calendar snippet
  renderCalendarSnippet: () => {
    const days = ['Se', 'Se', 'Ra', 'Ka', 'Ju', 'Sa', 'Mi'];
    return `
      <div class="wllt-card-item" style="padding: 16px;">
        <div class="wllt-section-header">
          <h3>Aktivitas Bulan Ini</h3>
          <span style="font-size: 0.76rem; color: var(--primary); font-weight: 700;">Kalender Harian</span>
        </div>
        <div class="wllt-calendar-grid">
          ${days.map(d => `<div class="wllt-calendar-day-header">${d}</div>`).join('')}
          ${Array.from({ length: 31 }, (_, i) => {
            const dayNum = i + 1;
            const isToday = dayNum === new Date().getDate();
            let badgeHtml = '';
            if (dayNum === 24) badgeHtml = `<span class="day-badge income">+14.5Jt</span>`;
            else if (dayNum === 23) badgeHtml = `<span class="day-badge expense">-3.5Jt</span>`;
            else if (dayNum === 22) badgeHtml = `<span class="day-badge expense">-45Rb</span>`;
            else if (dayNum === 20) badgeHtml = `<span class="day-badge expense">-375Rb</span>`;

            return `
              <div class="wllt-calendar-cell ${isToday ? 'current-day' : ''}">
                <span class="day-num">${dayNum}</span>
                ${badgeHtml}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
};
