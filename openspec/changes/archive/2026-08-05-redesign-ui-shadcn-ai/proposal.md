## Why

Aplikasi APISIX Dashboard saat ini memerlukan perombakan visual dan fungsional agar menjadi platform API Management yang modern, intuitif, dan responsif. Penggunaan DaisyUI dinilai kurang fleksibel untuk desain enterprise modern standar industri, sehingga perlu digantikan sepenuhnya oleh Shadcn UI. Selain itu, pengintegrasian AI ke dalam API Manager akan memungkinkan otomasi pembuatan rute, rekomendasi konfigurasi plugin, dan optimasi keamanan API secara otomatis berbasis prompt natural language.

## What Changes

- **Hapus DaisyUI & Migrasi ke Shadcn UI**: Menghapus dependensi DaisyUI dan membangun ulang komponen UI utama menggunakan komponen Shadcn UI (Radix UI + Tailwind CSS) dengan tema dark/light mode modern.
- **Redesign Antarmuka API Management**: Tampilan dashboard enterprise baru untuk Manajemen Rute, Upstream, Services, Consumer, dan Plugin APISIX dengan UX yang lebih intuitif, clean, dan dynamic.
- **Fitur AI Configuration & Setup**: Halaman pengaktifan integrasi AI untuk memasukkan API Key, endpoint URL provider (OpenAI, Gemini, Anthropic, Custom), serta pemilih model AI (Model Selector).
- **Asisten AI untuk API Management**: Fitur AI Assistant di mana pengguna dapat membuat/mengatur rute, mengkonfigurasi plugin APISIX (rate-limiting, auth, transform), dan menganalisis performa API secara otomatis berdasarkan rekomendasi AI.

## Capabilities

### New Capabilities
- `modern-ui-shadcn`: Perombakan total UI/UX dashboard API Management berbasis Shadcn UI & Tailwind CSS tanpa DaisyUI.
- `ai-integration-settings`: Pengaturan integrasi AI (API Key, Provider Endpoint, dan AI Model Selector).
- `ai-assisted-api-manager`: Fitur asisten AI terintegrasi untuk pembuatan dan pengoptimalan konfigurasi APISIX secara otomatis.

### Modified Capabilities

(Belum ada spec awal di proyek ini)

## Impact

- **Frontend Dependencies**:
  - Hapus: `daisyui`
  - Tambah: `clsx`, `tailwind-merge`, `@radix-ui/*` (atau Shadcn UI primitives), `@tanstack/react-table`, `lucide-react`, `ai` / `@google/genai` / SDK AI terkait.
- **UI Components**: Seluruh layout, form, tabel, modal, dan sidebar akan diganti dengan Shadcn UI primitives.
- **State & Storage**: Penyimpanan aman untuk konfigurasi AI Key & Endpoint di local storage / secure app settings state.
