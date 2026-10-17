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
  renderBerandaTab: (view, overview, profile, container) => {
    const wallets = WalletStore.getWallets();

    view.innerHTML = `
      <!-- Greeting Header -->
      <div class="wllt-header">
        <div class="wllt-greeting">
          <h2>${profile.greeting || 'Selamat Datang'}, ${profile.name || 'Riyandi'}! 👋</h2>
          <p>Kelola arus kas, pos kebutuhan, dan pantau kesehatan finansial harianmu.</p>
        </div>
        <div class="wllt-header-actions">
          <button class="wllt-action-pill-btn" id="wlltSwitchToPlannerBtn" title="Buka Mode Perencanaan Anggaran Rumah Tangga">
            <i class="fa-solid fa-calculator"></i>
            <span>Mode Planner</span>
          </button>
        </div>
      </div>

      <!-- Bento Grid Layout: 2 Columns on Desktop, Single Column on Mobile -->
      <div class="wllt-bento-layout">
        
        <!-- Bento Column Left / Main -->
        <div class="wllt-bento-col-main">
          
          <!-- Hero Card: Sekilas Hari Ini -->
          <div class="wllt-hero-card">
            <div class="wllt-hero-subtitle">
              <i class="fa-bolt fa-solid"></i> SEKILAS HARI INI
            </div>
            <div class="wllt-hero-balance">
              ${formatRupiah(overview.totalSaldo)}
              <span style="font-size: 1rem; font-weight: 500; opacity: 0.8;"><i class="fa-eye fa-solid"></i></span>
            </div>
            <div class="wllt-hero-subtext">Total Saldo Dompet Aktif & Budget Harian Tersisa</div>

            <!-- Progress bar pemakaian budget -->
            <div class="wllt-progress-bar">
              <div class="wllt-progress-fill" style="width: ${Math.min(100, Math.round((overview.totalPengeluaranBulan / (overview.totalPlannedBudget || 1)) * 100))}%;"></div>
            </div>

            <!-- Sisa Batas Aman Tag -->
            <div class="wllt-hero-tag">
              <i class="fa-circle-check fa-solid"></i>
              Sisa batas aman harian ~${formatRupiah(overview.sisaBatasAmanHarian)}/hari sampai akhir bulan
            </div>

            <!-- Cashflow item -->
            <div class="wllt-hero-cashflow">
              <div class="wllt-cashflow-item income">
                <span class="label">Pemasukan Bulan Ini</span>
                <span class="val">+${formatRupiah(overview.totalPemasukanBulan)}</span>
              </div>
              <div class="wllt-cashflow-item expense">
                <span class="label">Pengeluaran Bulan Ini</span>
                <span class="val">-${formatRupiah(overview.totalPengeluaranBulan)}</span>
              </div>
            </div>
          </div>

          <!-- Scan Struk Banner -->
          <div class="wllt-scan-banner" id="wlltScanBannerBtn">
            <div class="wllt-scan-info">
              <div class="wllt-scan-icon"><i class="fa-robot fa-solid"></i></div>
              <div class="wllt-scan-text">
                <h4>WLLT-Ai Smart Assistant</h4>
                <p>Ketik transaksi bebas atau minta audit keuangan mingguan ✨</p>
              </div>
            </div>
            <button class="primary-btn" style="padding: 8px 16px; font-size: 0.8rem; border-radius: 999px;">
              Buka AI <i class="fa-chevron-right fa-solid" style="margin-left: 4px;"></i>
            </button>
          </div>

          <!-- Grid Menu Utama (8 Menu Pilihan) -->
          <div class="wllt-menu-section">
            <div class="wllt-section-header">
              <h3>Menu Utama & Fitur Finansial</h3>
            </div>
            <div class="wllt-grid-menu">
              <button class="wllt-menu-btn" data-sub="budget">
                <div class="wllt-menu-icon" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;"><i class="fa-wallet fa-solid"></i></div>
                <span class="wllt-menu-label">Budget</span>
              </button>
              <button class="wllt-menu-btn" data-sub="goals">
                <div class="wllt-menu-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;"><i class="fa-bullseye fa-solid"></i></div>
                <span class="wllt-menu-label">Goals</span>
              </button>
              <button class="wllt-menu-btn" data-sub="wallets">
                <div class="wllt-menu-icon" style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9;"><i class="fa-gem fa-solid"></i></div>
                <span class="wllt-menu-label">Dompet</span>
              </button>
              <button class="wllt-menu-btn" data-sub="hutang">
                <div class="wllt-menu-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;"><i class="fa-file-invoice-dollar fa-solid"></i></div>
                <span class="wllt-menu-label">Hutang</span>
              </button>
              <button class="wllt-menu-btn" data-sub="piutang">
                <div class="wllt-menu-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;"><i class="fa-hand-holding-dollar fa-solid"></i></div>
                <span class="wllt-menu-label">Piutang</span>
              </button>
              <button class="wllt-menu-btn" data-sub="transaksi">
                <div class="wllt-menu-icon" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;"><i class="fa-receipt fa-solid"></i></div>
                <span class="wllt-menu-label">Transaksi</span>
              </button>
              <button class="wllt-menu-btn" data-sub="laporan">
                <div class="wllt-menu-icon" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;"><i class="fa-chart-pie fa-solid"></i></div>
                <span class="wllt-menu-label">Laporan</span>
              </button>
              <button class="wllt-menu-btn" data-sub="langganan">
                <div class="wllt-menu-icon" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;"><i class="fa-arrows-rotate fa-solid"></i></div>
                <span class="wllt-menu-label">Rutin</span>
              </button>
            </div>
          </div>

        </div><!-- End col-main -->

        <!-- Bento Column Right / Side -->
        <div class="wllt-bento-col-side">
          
          <!-- Dompet Aktif List -->
          <div>
            <div class="wllt-section-header">
              <h3>💳 Dompet & Rekening Aktif</h3>
              <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700;">${wallets.length} Dompet</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
              ${wallets.map(w => `
                <div class="wllt-card-item" style="padding: 14px; margin-bottom: 0;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(37,99,235,0.12); color: ${w.color}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                      <i class="fa-solid ${w.icon}"></i>
                    </div>
                    <span style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">${w.type}</span>
                  </div>
                  <h5 style="margin: 0 0 2px 0; font-size: 0.88rem; font-weight: 800;">${w.name}</h5>
                  <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading);">${formatRupiah(w.balance)}</div>
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

    view.querySelectorAll('.wllt-menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-sub');
        if (sub === 'budget') {
          window.AppInstance?.loadModule('dashboard');
        } else {
          DompetModule.currentSubTab = sub;
          DompetModule.renderSubTab(sub, container);
        }
      });
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
        <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Transaksi</h2>
        <button class="primary-btn" id="addTxFromTabBtn" style="padding: 8px 14px; font-size: 0.8rem; border-radius: 12px;">
          <i class="fa-plus fa-solid"></i> Tambah
        </button>
      </div>

      <!-- Filter Card -->
      <div class="wllt-card-item" style="margin-bottom: 16px; padding: 14px;">
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <input type="text" id="txSearchInput" class="form-control" placeholder="Cari transaksi..." style="font-size: 0.82rem;" />
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
      <div class="wllt-section-header" style="margin-bottom: 14px;">
        <div>
          <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Hutang</h2>
          <p style="margin: 2px 0 0; font-size: 0.78rem; color: var(--text-muted);">Kelola dan pantau cicilan hutang kamu</p>
        </div>
        <button class="primary-btn" id="addDebtModalBtn" style="padding: 8px 14px; font-size: 0.8rem; border-radius: 12px;">
          <i class="fa-plus fa-solid"></i> Tambah Hutang
        </button>
      </div>

      <!-- Hero Dark Card Hutang -->
      <div class="wllt-hero-card">
        <div class="wllt-hero-subtitle"><i class="fa-building-columns fa-solid"></i> TOTAL SISA HUTANG</div>
        <div class="wllt-hero-balance">${formatRupiah(overview.totalSisaHutang)}</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; margin-bottom: 6px;">
          <span>PROGRES PELUNASAN (${overview.debtProgressPercent}%)</span>
          <span>${formatRupiah(overview.totalTerbayarHutang)} terbayar</span>
        </div>
        <div class="wllt-progress-bar">
          <div class="wllt-progress-fill" style="width: ${overview.debtProgressPercent}%; background: linear-gradient(90deg, #f87171, #fbbf24);"></div>
        </div>
        <div class="wllt-hero-cashflow">
          <div class="wllt-cashflow-item">
            <span class="label">Total Pokok</span>
            <span class="val" style="color: #cbd5e1;">${formatRupiah(overview.totalPokokHutang)}</span>
          </div>
          <div class="wllt-cashflow-item expense">
            <span class="label">Cicilan / Bulan</span>
            <span class="val">${formatRupiah(overview.totalCicilanBulan)}</span>
          </div>
        </div>
      </div>

      <!-- Debt Items List -->
      ${debts.map(d => {
        const percent = Math.round((d.paidAmount / (d.totalPrincipal || 1)) * 100);
        return `
          <div class="wllt-card-item">
            <div class="wllt-card-header">
              <div class="wllt-card-info">
                <h4><i class="fa-solid ${d.icon || 'fa-building-columns'}"></i> ${d.name}</h4>
                <p>Cicilan: ${formatRupiah(d.monthlyPayment)}/bulan • Jatuh Tempo: ${d.dueDate}</p>
              </div>
              <div class="wllt-card-amount">${formatRupiah(d.remainingAmount)}</div>
            </div>
            <div class="wllt-progress-bar" style="margin-bottom: 8px;">
              <div class="wllt-progress-fill" style="width: ${percent}%; background: #10b981;"></div>
            </div>
            <div class="wllt-card-footer">
              <span>${percent}% lunas</span>
              <button class="primary-btn pay-debt-btn" data-id="${d.id}" data-amt="${d.monthlyPayment}" style="padding: 6px 12px; font-size: 0.76rem; border-radius: 8px; background: #10b981;">
                <i class="fa-money-bill-wave fa-solid"></i> Bayar Cicilan
              </button>
            </div>
          </div>
        `;
      }).join('')}
    `;

    view.querySelectorAll('.pay-debt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const amt = parseFloat(btn.getAttribute('data-amt'));
        if (confirm(`Bayar cicilan sebesar ${formatRupiah(amt)}? Saldo dompet akan terpotong.`)) {
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
      <div class="wllt-section-header" style="margin-bottom: 14px;">
        <div>
          <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Piutang</h2>
          <p style="margin: 2px 0 0; font-size: 0.78rem; color: var(--text-muted);">Kelola uang yang dipinjamkan ke orang lain</p>
        </div>
      </div>

      <!-- Hero Dark Card Piutang -->
      <div class="wllt-hero-card">
        <div class="wllt-hero-subtitle"><i class="fa-handshake fa-solid"></i> TOTAL PIUTANG AKTIF</div>
        <div class="wllt-hero-balance">${formatRupiah(overview.totalPiutangAktif)}</div>
        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8; margin-bottom: 6px;">
          <span>PROGRES PENAGIHAN</span>
          <span>${formatRupiah(overview.totalPiutangTerkumpul)} terkumpul</span>
        </div>
        <div class="wllt-progress-bar">
          <div class="wllt-progress-fill" style="width: ${overview.totalPiutangDipinjamkan > 0 ? Math.round((overview.totalPiutangTerkumpul / overview.totalPiutangDipinjamkan) * 100) : 0}%; background: #10b981;"></div>
        </div>
      </div>

      <!-- Receivables items -->
      ${recs.map(r => `
        <div class="wllt-card-item">
          <div class="wllt-card-header">
            <div class="wllt-card-info">
              <h4>${r.name}</h4>
              <p>Peminjam: <strong>${r.borrowerName}</strong> • Jatuh Tempo: ${r.dueDate}</p>
            </div>
            <div class="wllt-card-amount receivable">${formatRupiah(r.remainingAmount)}</div>
          </div>
          <div class="wllt-card-footer">
            <span>Terkumpul: ${formatRupiah(r.collectedAmount)} / ${formatRupiah(r.totalLoan)}</span>
            <button class="primary-btn collect-rec-btn" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.76rem; border-radius: 8px; background: #10b981;">
              <i class="fa-coins fa-solid"></i> Terima Pembayaran
            </button>
          </div>
        </div>
      `).join('')}
    `;

    view.querySelectorAll('.collect-rec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const amtStr = prompt('Masukkan nominal pembayaran yang diterima:', '500000');
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

  // 5. GOALS (Tujuan Keuangan)
  renderGoalsTab: (view, overview, container) => {
    const goals = WalletStore.getGoals();

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 14px;">
        <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Tujuan Keuangan (Goals)</h2>
      </div>

      ${goals.map(g => {
        const percent = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));
        return `
          <div class="wllt-card-item">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(99,102,241,0.15); color: ${g.color || '#6366f1'}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                <i class="fa-solid ${g.icon}"></i>
              </div>
              <div>
                <h4 style="margin: 0 0 2px 0; font-size: 1rem; font-weight: 700;">${g.title}</h4>
                <p style="margin: 0; font-size: 0.74rem; color: var(--text-muted);">Target: ${formatRupiah(g.targetAmount)}</p>
              </div>
            </div>
            <div class="wllt-progress-bar" style="margin-bottom: 8px;">
              <div class="wllt-progress-fill" style="width: ${percent}%; background: ${g.color || '#10b981'};"></div>
            </div>
            <div class="wllt-card-footer">
              <span style="font-weight: 700;">${formatRupiah(g.currentAmount)} (${percent}%)</span>
              <button class="primary-btn topup-goal-btn" data-id="${g.id}" style="padding: 6px 12px; font-size: 0.76rem; border-radius: 8px;">
                <i class="fa-plus fa-solid"></i> Setor Tabungan
              </button>
            </div>
          </div>
        `;
      }).join('')}
    `;

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
      <div class="wllt-section-header" style="margin-bottom: 14px;">
        <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Laporan & Skor Finansial</h2>
      </div>

      <!-- Skor Kesehatan Finansial Card -->
      <div class="wllt-hero-card">
        <div class="wllt-hero-subtitle"><i class="fa-heart-pulse fa-solid"></i> KESEHATAN FINANSIAL</div>
        <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 3rem; font-weight: 800; font-family: var(--font-heading);">${overview.healthScore}</span>
          <span style="font-size: 1.2rem; opacity: 0.7;">/100</span>
        </div>
        <div style="display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(255,255,255,0.15); font-size: 0.78rem; font-weight: 700; margin-bottom: 14px;">
          ${overview.healthStatus.toUpperCase()}
        </div>
        <p style="font-size: 0.76rem; color: #cbd5e1; margin-bottom: 16px;">
          Skor dihitung dari rasio tabungan, disiplin anggaran bulanan, runway dana darurat, dan beban utang (DSR).
        </p>

        <!-- 4 Health Metrics Badges -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 4px; text-align: center;">
            <i class="fa-sack-dollar fa-solid" style="color: #fbbf24; margin-bottom: 4px;"></i>
            <div style="font-size: 0.9rem; font-weight: 800;">${overview.savingsRatio}%</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">Tabungan</div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 4px; text-align: center;">
            <i class="fa-chart-pie fa-solid" style="color: #a855f7; margin-bottom: 4px;"></i>
            <div style="font-size: 0.9rem; font-weight: 800;">${overview.budgetDiscipline}%</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">Disiplin</div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 4px; text-align: center;">
            <i class="fa-shield-halved fa-solid" style="color: #ef4444; margin-bottom: 4px;"></i>
            <div style="font-size: 0.9rem; font-weight: 800;">${overview.runwayMonths} bln</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">Runway</div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 4px; text-align: center;">
            <i class="fa-credit-card fa-solid" style="color: #38bdf8; margin-bottom: 4px;"></i>
            <div style="font-size: 0.9rem; font-weight: 800;">${overview.dsrRatio}%</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">Beban Utang</div>
          </div>
        </div>
      </div>

      <!-- Financial Totals Cards -->
      <div class="wllt-card-item">
        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL SALDO</span>
        <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-heading); margin-top: 4px;">${formatRupiah(overview.totalSaldo)}</div>
      </div>

      <div class="wllt-card-item">
        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL PEMASUKAN BULAN INI</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #10b981; font-family: var(--font-heading); margin-top: 4px;">+${formatRupiah(overview.totalPemasukanBulan)}</div>
      </div>

      <div class="wllt-card-item">
        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL PENGELUARAN BULAN INI</span>
        <div style="font-size: 1.4rem; font-weight: 800; color: #ef4444; font-family: var(--font-heading); margin-top: 4px;">-${formatRupiah(overview.totalPengeluaranBulan)}</div>
      </div>
    `;
  },

  // 7. LANGGANAN & RUTIN
  renderLanggananTab: (view, overview, container) => {
    const subs = WalletStore.getSubscriptions();
    const totalSubsCost = subs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const dailyAverage = Math.round(totalSubsCost / 30);

    view.innerHTML = `
      <div class="wllt-section-header" style="margin-bottom: 14px;">
        <div>
          <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800;">Berulang & Langganan</h2>
          <p style="margin: 2px 0 0; font-size: 0.78rem; color: var(--text-muted);">Pantau pengeluaran bulanan rutin & subscriptions</p>
        </div>
      </div>

      <!-- Hero Summary -->
      <div class="wllt-card-item" style="padding: 18px; margin-bottom: 16px;">
        <span style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">TOTAL BIAYA LANGGANAN BULANAN</span>
        <div style="font-size: 1.8rem; font-weight: 800; color: #ef4444; font-family: var(--font-heading); margin: 4px 0 10px 0;">
          ${formatRupiah(totalSubsCost)}
        </div>
        <div style="display: flex; gap: 20px; font-size: 0.8rem; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <div>Langganan Aktif: <strong>${subs.length} Layanan</strong></div>
          <div>Rata-rata Harian: <strong>${formatRupiah(dailyAverage)}</strong></div>
        </div>
      </div>

      <!-- Subs List -->
      ${subs.map(s => `
        <div class="wllt-card-item">
          <div class="wllt-card-header">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(0,0,0,0.06); color: ${s.color}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                <i class="${s.icon}"></i>
              </div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700;">${s.name}</h4>
                <p style="margin: 2px 0 0; font-size: 0.74rem; color: var(--text-muted);">${s.category} • Jatuh Tempo: ${s.dueDate}</p>
              </div>
            </div>
            <div class="wllt-card-amount">-${formatRupiah(s.amount)}</div>
          </div>
        </div>
      `).join('')}
    `;
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
