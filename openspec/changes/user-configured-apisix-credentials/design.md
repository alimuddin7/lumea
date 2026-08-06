## Context

`src/lib/stores/config.ts` saat ini memiliki `DEFAULT_CONFIG` dengan IP dan API Key statis. Hal ini dihapus agar pengguna mengkonfigurasi kredensial instance APISIX mereka sendiri secara penuh melalui antarmuka web.

## Goals / Non-Goals

**Goals:**
- Mengubah `DEFAULT_CONFIG` di `src/lib/stores/config.ts` menjadi string kosong (`baseUrl: ''`, `apiKey: ''`).
- Menambahkan validasi koneksi dan prompt visual di antarmuka web jika kredensial belum diisi.

**Non-Goals:**
- Mengubah backend proxy API (`/api/proxy/[...path]`).

## Decisions

1. **Inisialisasi Kosong pada Config Store**:
   - `DEFAULT_CONFIG` diisi `{ baseUrl: '', apiKey: '' }`.
   - Menggunakan `localStorage` browser untuk menyimpan kredensial yang diisi pengguna.

2. **UX Prompt Setup di Layout Header**:
   - Jika `baseUrl` atau `apiKey` kosong, status koneksi ditampilkan sebagai `unconfigured` atau `disconnected` dengan indikator tombol pengarah ke halaman Settings.
