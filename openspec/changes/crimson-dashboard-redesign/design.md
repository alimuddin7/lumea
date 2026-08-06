## Context

Pengguna meminta agar tombol utama dan penanda halaman aktif (sidebar active pill) secara konsisten menggunakan warna **Merah Crimson Red (`bg-rose-600` / `#E11D48`)**.

## Goals / Non-Goals

**Goals:**
- Meng-update `src/routes/+layout.svelte` agar active navigation item pada sidebar menggunakan class `bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30`.
- Meng-update `src/lib/components/ui/Button.svelte` agar primary variant menggunakan `bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/25 border border-rose-500/40`.
- Meng-update HSL CSS variable `--primary` di `src/app.css` ke `346 84% 50%` (Rose 600) untuk konsistensi seluruh komponen Svelte.

## Decisions

1. **Explicit Crimson Red Accent**:
   - `bg-rose-600` (atau `bg-primary` yang bernilai HSL `346 84% 50%`) dipasang sebagai warna utama untuk tombol aksi dan indikator navigasi aktif.
