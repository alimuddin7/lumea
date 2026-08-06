## Why

Pengguna merasa antarmuka saat ini kurang memuaskan dan masih memiliki bug pada komponen tombol (buttons), modal dialog overlay, serta form input. Untuk menjamin pengalaman pengguna tingkat enterprise yang memukau (state-of-the-art), perlu dilakukan perombakan visual menyeluruh dan pembersihan bug pada seluruh komponen UI, modal, form wizard, dan plugin builder.

## What Changes

- **Perbaikan Bug Komponen UI & Accessibility**: Memperbaiki event click/keydown pada modal overlay, perbaikan form label binding, serta aksesibilitas tombol & switch di seluruh komponen.
- **Redesign Premium Form & Wizard**: Merombak tampilan `RouteForm.svelte`, `SSLForm.svelte`, `UpstreamForm.svelte`, `ConsumerForm.svelte` dengan layout wizard multi-step modern berbasis Shadcn UI.
- **Peningkatan Visual Plugin Visual Builder & Editor**: Memperbarui `PluginVisualBuilder.svelte` dan `Editor.svelte` dengan estetika dark glassmorphism modern, animasi smooth, dan UX pembuatan rute yang intuitif.
- **Elevasi Tampilan Dashboard Utama**: Penyempurnaan halaman utama (`+page.svelte`), kartu statistik, serta navigasi agar konsisten dengan standar antarmuka SaaS premium.

## Capabilities

### New Capabilities
- `premium-ui-system`: Perombakan estetika UI premium enterprise dan perbaikan bug menyeluruh pada seluruh komponen visual, modal, dan form management.

### Modified Capabilities

(Belum ada spec terkait sebelumnya)

## Impact

- **Komponen UI Terpengaruh**: `RouteForm.svelte`, `SSLForm.svelte`, `UpstreamForm.svelte`, `ConsumerForm.svelte`, `PluginVisualBuilder.svelte`, `Editor.svelte`, `+page.svelte`.
- **Pengalaman Pengguna**: Tampilan terasa jauh lebih responsif, bersih, bebas bug visual, dan memiliki daya tarik estetika tingkat tinggi.
