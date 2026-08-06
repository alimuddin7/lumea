## Context

APISIX Dashboard saat ini memerlukan pembaruan tampilan antarmuka (UI) dari DaisyUI ke Shadcn UI agar lebih konsisten dengan standar antarmuka SaaS modern. Selain perombakan UI, aplikasi diperluas dengan fitur AI Integration yang memungkinkan administrator API mengonfigurasi API Key, Endpoint Provider, dan memilih Model AI yang diinginkan untuk mengotomatisasi pembuatan rute APISIX, rekomendasi plugin, dan analisis kebijakan API secara cepat.

## Goals / Non-Goals

**Goals:**
- Menghapus dependensi DaisyUI sepenuhnya dari `package.json` dan basis kode UI.
- Mengintegrasikan Shadcn UI (Tailwind CSS, Radix UI primitives, Lucide React icons) untuk seluruh komponen dashboard.
- Membangun antarmuka Settings Integrasi AI (Setup API Key, Custom Endpoint Link, Model Selector dengan opsi OpenAI, Gemini, Anthropic, DeepSeek, dll).
- Membangun AI Assistant widget/panel untuk menggenerasi dan mengkonfigurasi rute/plugin APISIX secara otomatis berbasis prompt natural language.

**Non-Goals:**
- Mengubah arsitektur core API backend APISIX Gateway secara mendasar (semua komunikasi tetap melalui API APISIX Admin API / Manager API).

## Decisions

1. **Komponen UI: Shadcn UI + Tailwind CSS**:
   - *Rasional*: Shadcn UI memberikan akses penuh ke source code komponen tanpa dependensi opini visual yang kaku seperti DaisyUI, serta mendukung dark/light mode dengan mudah.
   - *Alternatif*: Mantine atau Chakra UI (ditolak karena tim memilih Tailwind native & Radix primitives).

2. **Penyimpanan Credential AI di Client Local Storage / Secure State**:
   - *Rasional*: Memungkinkan pengguna memasukkan API Key secara langsung dari UI tanpa perlu setting ulang backend environment variable, memberikan fleksibilitas penuh untuk mencoba berbagai model AI.
   - *Alternatif*: Menyimpan API Key di backend env file (ditolak karena user ingin konfigurasi langsung dari UI).

3. **Multi-Model Provider Compatibility Layer**:
   - *Rasional*: Menyediakan adapter interface terstandarisasi untuk provider LLM (OpenAI Compatible API, Google Gemini API, Anthropic API) sehingga switcher model dapat bekerja seamless.

## Risks / Trade-offs

- [Hapus DaisyUI Class Names] → Perlu audit komprehensif pada seluruh file `.tsx`/`.jsx` agar tidak ada sisa utility class DaisyUI yang merusak tampilan.
- [AI Latency & Model Rate Limits] → Integrasi AI menyertakan indikator status loading / streaming response serta penanganan error quota/key invalid.
