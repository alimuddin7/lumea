## Context

Aplikasi memerlukan perbaikan bug secara menyeluruh pada komponen UI (button, modal, label accessibility, form controls) serta perombakan visual ke tingkat premium (enterprise SaaS) untuk menggantikan sisa styling bawaan yang dinilai kurang memuaskan.

## Goals / Non-Goals

**Goals:**
- Memperbaiki bug modal overlay, keyboard accessibility, dan form labels pada `RouteForm`, `SSLForm`, `UpstreamForm`, `ConsumerForm`, dan `PluginVisualBuilder`.
- Mengganti gaya form lama yang usang dengan arsitektur form Shadcn UI modern (`Card`, `Input`, `Button`, `Badge`, `Tabs`, `Switch`).
- Merombak tampilan Dashboard Utama (`+page.svelte`), kartu statistik, dan grafik pemantauan agar terlihat sangat profesional dan memukau.

**Non-Goals:**
- Mengubah skema data backend APISIX Admin API.

## Decisions

1. **Struktur Component Clean & Accessible**:
   - Memastikan semua elemen tombol menggunakan `<button type="button">` dengan aria-label yang tepat.
   - Memastikan `label` terasosiasi dengan `id` input secara valid.
   - Menggunakan Shadcn UI dialog primitives untuk menangani backdrop overlay dan penutupan modal.

2. **Form Layout Wizard Modern**:
   - Membagi form kompleks (`RouteForm`, `PluginVisualBuilder`) menjadi langkah-langkah yang jelas dengan visual feedback langsung.
