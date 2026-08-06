## 1. UI Bugfixes & Accessibility Fixes

- [x] 1.1 Perbaiki bug modal overlay dan click/keydown event handler pada PluginVisualBuilder.svelte dan Dialog.svelte.
- [x] 1.2 Perbaiki label association dan ketiadaan id pada elemen form di RouteForm.svelte, SSLForm.svelte, UpstreamForm.svelte, dan AISettingsDialog.svelte.
- [x] 1.3 Perbaiki button accessibility (aria-label & explicit labels) pada Switch.svelte dan komponen tombol icon.

## 2. Redesign Forms & Plugin Visual Builder

- [x] 2.1 Merombak antarmuka RouteForm.svelte dengan gaya wizard Shadcn UI modern (Card, Input, Badge, Button) dan integrasi visual plugin.
- [x] 2.2 Merombak antarmuka SSLForm.svelte, UpstreamForm.svelte, dan ConsumerForm.svelte dengan tampilan Shadcn UI yang bersih dan responsif.
- [x] 2.3 Merombak tampilan PluginVisualBuilder.svelte dengan tema dark glassmorphic, visual badges, dan flow visualisasi plugin APISIX.

## 3. Redesign Dashboard Utama & Final Polish

- [x] 3.1 Merombak Halaman Utama (+page.svelte) dengan statistik visual, metrik APISIX, status gateway, dan quick actions yang elegan.
- [x] 3.2 Lakukan verifikasi build komprehensif tanpa peringatan type check maupun error konsol browser.
