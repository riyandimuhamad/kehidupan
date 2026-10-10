# 🍃 Kehidupan - Financial & Household Essentials Planner

**Kehidupan** adalah aplikasi web modern untuk menghitung, mengestimasi, dan mengelola kebutuhan harian rumah tangga (Beras, Air Galon, Listrik PLN, Gas LPG, BBM & Transportasi, Internet/Paket Data, Sembako, Hunian/KPR) serta mengintegrasikan hasilnya langsung ke **Dashboard Keuangan Bulanan** dan **Google Sheets (Spreadsheet Database API)**.

![Kehidupan App Banner](https://img.shields.io/badge/Kehidupan-Financial%20Planner-6366f1?style=for-the-badge&logo=leaf)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

---

## 🌟 Fitur Utama

- 🌾 **Kalkulator Beras & Pangan**: Hitung porsi makan (2x/3x), konsumsi kg/orang/hari, estimasi karung (5kg, 10kg, 25kg) & total biaya.
- 💧 **Kalkulator Air Galon**: Estimasi konsumsi liter/hari, jumlah galon 19L, dan durasi ketahanan 1 galon.
- ⚡ **Kalkulator Listrik PLN**: Hitung daya VA, kWh harian, estimasi tagihan/token bulanan + estimasi pajak PPJ (5%).
- 🔥 **Gas LPG Dapur**: Estimasi kebutuhan tabung gas 3kg Melon / 5.5kg / 12kg Bright Gas.
- 🚗 **BBM & Transportasi**: Hitung jarak tempuh (km/hari), efisiensi kendaraan (km/L), dan biaya BBM.
- 🌐 **Internet & Paket Data**: Hitung biaya gabungan WiFi rumah + paket data seluler HP keluarga.
- 🛒 **Sembako & Kebersihan**: Hitung kebutuhan bulanan minyak goreng, gula, detergen & alat mandi/cuci.
- 🏠 **Hunian & KPR**: Hitung biaya sewa Kos, Kontrakan, atau cicilan KPR + iuran kebersihan/IPL.
- 📊 **Dashboard Keuangan Bulanan**: Agregasi otomatis pemasukan vs pengeluaran pokok vs sisa cashflow.
- 🟢 **Integrasi Google Sheets Webhook**: Kirim dan simpan data alokasi anggaran langsung ke Google Sheets secara real-time.
- 🌓 **Dual Theme (Dark/Light Mode)** & **Ekspor CSV / Cetak PDF**.

---

## 🚀 Cara Menjalankan Aplikasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/riyandimuhamad/kehidupan.git
   cd kehidupan
   ```

2. Jalankan lokal server:
   ```bash
   npm run dev
   ```

3. Buka di browser: `http://localhost:3000`

---

## 📊 Integrasi Google Sheets (Apps Script API)

1. Buka Google Sheets baru di [sheets.new](https://sheets.new).
2. Pilih menu **Extensions** -> **Apps Script**.
3. Salin kode Apps Script yang disediakan di dalam aplikasi (Modal Google Sheets).
4. Klik **Deploy** -> **New Deployment** -> Type: **Web App** -> Access: **Anyone**.
5. Salin Webhook URL ke dalam aplikasi Kehidupan & tekan **Sync ke Google Sheets**.

---

## 🛠️ Teknologi Yang Digunakan

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism & Responsive System), ES Modules JS
- **Visualisasi**: Chart.js
- **Database/API**: Google Apps Script Webhook / LocalStorage State Store
- **Iconography**: FontAwesome 6

---

&copy; 2026 **Kehidupan App** &bull; Perencanaan Kebutuhan & Keuangan Rumah Tangga Indonesia.
