## Why

Pengguna meminta agar semua tombol utama (primary buttons) dan penanda halaman aktif pada sidebar navigasi secara eksplisit menggunakan warna **Merah Crimson Red (`#E11D48` / Rose 600)** yang solid, tegas, dan kontras.

## What Changes

- **Active Page Navigation Pill Merah Crimson**:
  - Mengubah penanda halaman aktif pada sidebar (`src/routes/+layout.svelte`) agar menggunakan `bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30` yang sangat jelas dan solid.
- **Button Primary Solid Merah Crimson**:
  - Mengubah default variant pada `Button.svelte` dan `src/app.css` agar tombol primary menggunakan `bg-rose-600 hover:bg-rose-700 text-white font-bold border border-rose-500/40 shadow-md shadow-rose-600/25` di seluruh aplikasi.
- **Aksen Penanda Halaman Crimson**:
  - Badge penanda halaman, avatar icon, dan tombol aksi utama menggunakan warna Crimson Red Rose yang konsisten.

## Capabilities

### New Capabilities
- `crimson-dashboard-theme`: Tombol utama dan penanda menu sidebar aktif berwarna Merah Crimson Red Rose yang sangat solid, kontras, dan tegas di seluruh aplikasi.

### Modified Capabilities

(Belum ada spec terkait sebelumnya)

## Impact

- **File Terpengaruh**: `src/app.css`, `src/routes/+layout.svelte`, `src/lib/components/ui/Button.svelte`.
- **Pengalaman Pengguna**: Penanda navigasi aktif langsung mencuri perhatian dengan warna Merah Crimson Red solid yang mewah, dan tombol primary terlihat sangat mantap.
