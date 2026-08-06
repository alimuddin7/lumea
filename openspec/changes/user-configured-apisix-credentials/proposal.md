## Why

Saat ini, `src/lib/stores/config.ts` menyimpan nilai default hardcoded untuk `baseUrl` (`http://12.12.12.5:19180/apisix/admin`) dan `apiKey` (`iBIESRYmMCCajlvVSyepbWNEMvdotMEP`). Hal ini tidak aman dan dapat membingungkan pengguna baru yang menghubungkan instance APISIX mereka sendiri. Konfigurasi kredensial APISIX Admin API harus sepenuhnya diatur secara dinamis oleh pengguna dari antarmuka Web (UI Settings / Setup Prompt).

## What Changes

- **Hapus Hardcoded Default Credentials**: Menghapus nilai default `baseUrl` dan `apiKey` di `src/lib/stores/config.ts` dan menggantinya dengan nilai kosong.
- **Form Setup Kredensial Wajib di Web UI**: Mengarahkan pengguna untuk menginput `baseUrl` dan `apiKey` melalui halaman Settings / Modal Setup jika kredensial belum tersedia di LocalStorage.
- **Indikator Connectivity Dynamic**: Menampilkan status 'disconnected' dan prompt peringatan konfigurasi di header/dashboard jika APISIX belum diatur.

## Capabilities

### New Capabilities
- `dynamic-apisix-credentials`: Manajemen kredensial APISIX Admin API seratus persen terisolasi dan dapat diatur secara dinamis melalui antarmuka Web tanpa default nilai hardcoded.

### Modified Capabilities

(Belum ada spec terkait sebelumnya)

## Impact

- **File Terkait**: `src/lib/stores/config.ts`, `src/routes/settings/+page.svelte`, `src/routes/+layout.svelte`.
- **User Experience**: Pengguna baru akan disajikan form setup koneksi APISIX secara langsung saat pertama kali membuka aplikasi jika kredensial di LocalStorage masih kosong.
