# Architectural Decisions & Changes Log (LBQueen Member)

## 2026-11-19: Tata letak bergaya Gojek

- Atas permintaan pemilik, tampilan member mengikuti alur aplikasi Gojek; ini menggantikan catatan 2026-11-17 bahwa banner promo dan tombol kategori beranda tidak diubah. Navigasi bawah: Beranda, Promo (`/promo`), Pesanan, Profil, berupa bar mengambang dengan pil aktif. Keranjang dibuka dari bar keranjang mengambang (muncul di beranda/promo/kategori bila ada item), kartu poin, grid layanan, dan profil.
- Beranda: bar atas (pencarian, chip tier ke `/membership`, avatar ke profil), carousel banner brand (`public/banners/*.webp`, latar `#FFECF4` sama dengan banner), kartu jalan pintas (booking/konsultasi WhatsApp, jam buka, lokasi), kartu poin (Voucher/Pesanan/Keranjang), grid 8 layanan (Layanan, Produk, Promo tetap membuka `/category/*`), strip membership (akun reguler tetap menampilkan "Akun Anda sudah aktif" dan tautan upgrade WhatsApp), voucher, katalog promo berpaginasi, dan info klinik.
- `/promo`: ringkasan voucher/membership, voucher dengan tombol salin kode, filter Semua/Layanan/Produk (diproses server lewat `/api/catalog`), katalog promo berpaginasi. `/membership` (wajib login, ditambahkan ke `proxy.ts`): carousel kartu tier Reguler/Silver/Gold/Platinum dan daftar benefit; tidak ada target poin karena tier ditetapkan admin.
- Jam buka (Senin–Kamis 09.00–21.00, Jumat–Sabtu 10.00–21.00 WIB) dan alamat diambil dari materi banner klinik (`src/lib/clinic.ts`, `src/lib/constants.ts`). Hari Minggu tidak tercantum di materi tersebut sehingga status buka/tutup tidak ditampilkan pada hari Minggu.
- Build lokal dengan webpack gagal bila path folder mengandung `#` (`#LBQueen`); jalankan dari drive pengganti, mis. `subst Q: "D:\...\#LBQueen"` lalu `npm run build` di `Q:\LBQueen`.

## 2026-11-18: Salinan password terenkripsi

- Daftar, ganti password, dan login (bila salinan belum ada) mengisi `customers.password_encrypted` memakai `src/lib/password-vault.ts` dengan `PASSWORD_VIEW_KEY` yang sama dengan POS. Tanpa kunci, ganti password mengosongkan salinan agar superadmin tidak melihat password lama. Kolom ini dibuang dari respons gateway dan profil.

## 2026-11-18: Login pelanggan toleran format

- Login: username dicocokkan tanpa membedakan huruf besar/kecil (`ilike` dengan escape), nomor HP dinormalkan dan dicocokkan juga dalam bentuk `62…`/`+62…`; pesan khusus bila username berisi spasi. Input login mematikan auto-kapital/autokoreksi (iPad mengubah huruf pertama menjadi kapital).
- Daftar: memakai aturan `src/lib/validation.ts` yang sama dengan POS, peringatan per kolom, cek username/nomor HP kembar sebelum insert.

## 2026-11-17: Penyelesaian refactor dan alur akun pelanggan

- Komponen halaman member dipisahkan sesuai tanggung jawabnya (beranda, katalog, keranjang, pesanan, profil, autentikasi, dan nota), dengan utilitas format, konstanta, dan tipe bersama.
- Profil pelanggan kini bersumber dari cookie sesi dan database melalui `/api/session`, dibagikan lewat `CustomerProvider`. Data diperbarui saat navigasi, kembali fokus, dan setiap 60 detik; localStorage tidak menentukan status login, poin, atau membership. Endpoint hanya memilih kolom profil publik dan tidak di-cache.
- Akun reguler yang sudah login menampilkan akun aktif serta tautan WhatsApp untuk bertanya upgrade kepada admin. Status membership dikelola admin; target poin untuk kenaikan tier otomatis dihapus.
- Voucher tersedia juga bagi akun reguler. Klaim poin tambahan dari ulasan dan status akun terverifikasi dihapus. Nota pelanggan tidak lagi mengambil identitas kasir dari penyimpanan browser aplikasi POS.
- Tes browser memakai database mock untuk menguji akun reguler/member tanpa profil localStorage, pembaruan poin/tier dari server, pengabaian profil lokal setelah cookie sesi dihapus, dan privasi profil.

## 2026-11-17: Latensi navigasi

- Header `x-vercel-id: sin1::iad1` menunjukkan fungsi (API, server action, proxy) berjalan di Washington DC, sementara pengguna dan Supabase berada di Asia Tenggara; respons API live 1,3–1,9 detik. `vercel.json` kini menetapkan `regions: ["sin1"]` (Singapura). Bila region Supabase bukan Singapura, samakan region ini dengan region database.
- Matcher `proxy.ts` dibatasi ke rute yang memang perlu diperiksa, sehingga beranda, login, aset `public/`, dan halaman publik tidak lagi melewati fungsi proxy.

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
