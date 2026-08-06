## 1. Setup & UI Foundation Migrasi

- [x] 1.1 Hapus DaisyUI dari package.json dan install dependensi Shadcn UI, Radix UI primitives, Lucide React, serta Tailwind CSS helpers (clsx, tailwind-merge).
- [x] 1.2 Setup komponen dasar Shadcn UI (Button, Card, Input, Select, Dialog, Dropdown, Table, Switch, Badge, Tabs, Toast).
- [x] 1.3 Perbarui tailwind.config.js dan globals CSS untuk tema modern dark/light mode API Management.

## 2. Redesign Layout & Antarmuka Dashboard API Management

- [x] 2.1 Bangun ulang Main Layout (Sidebar Navigation, Header, Dark Mode Toggle, Profile/Environment Status).
- [x] 2.2 Migrasi Halaman Routes Management ke Shadcn Data Table dengan indikator status rute, visualisasi URI, plugin badges, dan aksi CRUD.
- [x] 2.3 Migrasi Halaman Upstreams & Services Management dengan visualisasi health status dan balance configuration.
- [x] 2.4 Migrasi Halaman Consumers & Plugin Marketplace ke grid komponen Shadcn UI.

## 3. Integrasi AI Setup & Configuration UI

- [x] 3.1 Buat halaman/modal Settings AI Integration untuk penginputan API Key dan Provider Endpoint Link (OpenAI, Gemini, Anthropic, Custom LLM).
- [x] 3.2 Implementasikan Model Selector dropdown dinamis untuk memilih active AI Model (gpt-4o, gemini-1.5-pro, claude-3-5-sonnet, deepseek, dll).
- [x] 3.3 Buat service/utility penyimpan kredensial AI secara aman di LocalStorage/State aplikasi dengan fitur test connectivity connection.

## 4. AI-Assisted API Manager Features

- [x] 4.1 Implementasikan AI Assistant Panel / Chat Drawer untuk menggenerasi konfigurasi Rute & Plugin APISIX berbasis prompt natural language.
- [x] 4.2 Integrasikan fitur AI Automated API Security & Performance Analyzer untuk mendeteksi celah keamanan rute dan merekomendasikan plugin (rate-limiting, key-auth, cors).
- [x] 4.3 Tambahkan tombol "Apply AI Configuration" untuk menerapkan skema JSON hasil rekomendasi AI secara instan ke APISIX.

## 5. Verifikasi & Pengujian Tampilan

- [x] 5.1 Pastikan seluruh referensi DaisyUI telah terhapus dan tidak ada error styling di konsol browser.
- [x] 5.2 Pengujian end-to-end fitur setup AI key, pemilihan model, serta pengujian respons AI Assistant dalam mengkonfigurasi rute API.
