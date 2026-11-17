# Architectural Decisions & Changes Log (LBQueen Member)

## 2026-11-17: Navigasi kategori berlapis

- Beranda hanya menampilkan tombol Promo, Layanan, Produk (tanpa "Lihat Semua") yang membuka `/category/promo|layanan|produk`. Isi beranda di bawahnya hanya katalog promo (atau hasil pencarian) dengan paginasi; bagian Produk Terlaris/Layanan Terpopuler dihapus.
- Halaman kategori menyimpan nomor halaman di URL (`?page=N`, `router.push`) sehingga tombol back browser/HP kembali per halaman; tombol panah header kembali ke beranda. Filter mengatur ulang ke halaman 1 dengan `router.replace`.
- `proxy.ts` mengalihkan alamat lama `/category/Treatment Care & Beauty` dan `/category/Product Care & Beauty` (308) dan memberi 404 untuk kategori tak dikenal (validasi di halaman tidak bisa mengubah status karena `loading.tsx` memulai streaming).

## 2026-11-17: Pengerasan keamanan, beban, dan keterbacaan UI

- `src/lib/rate-limit.ts` memakai RPC `consume_login_attempt` (8 hit per kunci per 15 menit) dengan kunci berjendela waktu untuk batas per IP tanpa migrasi skema: login 8/menit per IP + 8/15 menit per akun, daftar 8/5 menit per IP + per nomor HP, ganti password 8/15 menit per member, checkout dan ulasan 8/5 menit per member. Baris `auth_attempts` > 24 jam dibersihkan secara acak (2%).
- Form daftar memiliki honeypot `website`; panjang input dibatasi di server. Checkout memvalidasi item, kode voucher, serta format tanggal/jam sebelum RPC.
- Gateway: voucher hanya bisa dicek per kode (`code=eq.X`), jumlah baris dibatasi 100, `limit`/`offset` divalidasi, header `Range` tidak diteruskan. Respons katalog publik (`/api/catalog` 60 dtk, tabel katalog di gateway 30 dtk) di-cache CDN dengan stale-while-revalidate; data milik member tetap `private, no-store`.
- Header CSP `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'` dan COOP `same-origin-allow-popups` (WhatsApp tetap bisa dibuka).
- UI: teks sekunder minimal setara slate-500/#766B68, ukuran minimum 11px, placeholder input lebih kontras. Banner promo dan tombol kategori beranda sengaja tidak diubah atas permintaan pemilik.

## 2026-11-17: Dipisahkan dari POS LBQueen

- Portal pelanggan (`/customer-portal`) dipindahkan dari proyek `POS LBQueen` menjadi aplikasi Next.js tersendiri untuk domain `lbqueen.id`. Rute berada di root (`/`, `/cart`, `/orders`, `/profile`, `/login`, `/register`, `/category/[type]`, `/invoice/[id]`); `/customer-portal/*` lama diarahkan 308 ke rute baru.
- Database tetap satu proyek Supabase bersama POS. Skema/migrasi hanya dikelola di `POS LBQueen/supabase`.
- Gateway `/api/database` dipersempit menjadi baca-saja untuk katalog dan data milik member; tabel admin, transaksi, dan RPC tidak tersedia. `purchase_price` ikut disaring.
- Server action hanya untuk pelanggan (login, daftar, ganti password, checkout online, ulasan). Tidak ada kode admin di proyek ini.
- `SESSION_SECRET` sebaiknya berbeda dari POS sehingga token antar aplikasi tidak dapat dipakai silang.
- Lihat `rules.md` untuk aturan UI/kode yang sama dengan POS.
