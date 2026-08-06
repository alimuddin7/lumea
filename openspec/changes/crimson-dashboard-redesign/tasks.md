## 1. Solid Crimson Red Active Indicators & Primary Buttons

- [x] 1.1 Update HSL design variables di src/app.css dengan warna Merah Crimson Red elegan (hsl(346 84% 50%)), soft rose highlight, dan rounded glass/card utility classes.
- [x] 1.2 Update gaya active state pill sidebar pada src/routes/+layout.svelte menjadi Merah Crimson Red solid (bg-rose-600 text-white font-bold shadow-md).
- [x] 1.3 Update Button.svelte agar primary variant menggunakan Merah Crimson Red solid (bg-rose-600 text-white font-bold).
- [x] 1.4 Refactor tombol pada halaman Certificates (src/routes/ssl/+page.svelte) ke komponen Button solid.
- [x] 1.5 Refactor tombol pada halaman Custom Plugins (src/routes/plugins/custom/+page.svelte) ke komponen Button solid.
- [x] 1.6 Refactor tombol pada halaman Consumer Groups (src/routes/consumer-groups/+page.svelte) ke komponen Button solid.

## 2. Mobile Responsive Menu & 100% Opaque Modal Fixes

- [x] 2.1 Memperbaiki bug tombol hamburger menu mobile di src/routes/+layout.svelte agar sidebar drawer dapat dibuka/ditutup secara responsif.
- [x] 2.2 Refactor Dialog.svelte, AISettingsDialog.svelte, dan PluginVisualBuilder.svelte agar modal card berlatar solid 100% opaque tanpa transparansi.

## 3. Real APISIX Dashboard & Final Verification

- [x] 3.1 Hubungkan dashboard (+page.svelte) ke APISIX Admin API untuk mengambil data rute nyata (Real APISIX Routes), upstreams, services, consumers, dan SSLs.
- [x] 3.2 Tampilkan daftar Rute APISIX Asli dengan badge method HTTP, URI, target upstream/service, dan toggle status active/inactive yang terintegrasi live.
- [x] 3.3 Buat widget Quick Actions & APISIX Gateway Connection Health Card bertema Crimson Red.
- [x] 3.4 Jalankan npm run build untuk memverifikasi kompilasi dan bebas error konsol.
