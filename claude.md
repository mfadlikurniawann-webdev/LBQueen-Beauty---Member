# Architectural Decisions & Changes Log (LBQueen Member)

## 2026-11-17: Dipisahkan dari POS LBQueen

- Portal pelanggan (`/customer-portal`) dipindahkan dari proyek `POS LBQueen` menjadi aplikasi Next.js tersendiri untuk domain `lbqueen.id`. Rute berada di root (`/`, `/cart`, `/orders`, `/profile`, `/login`, `/register`, `/category/[type]`, `/invoice/[id]`); `/customer-portal/*` lama diarahkan 308 ke rute baru.
- Database tetap satu proyek Supabase bersama POS. Skema/migrasi hanya dikelola di `POS LBQueen/supabase`.
- Gateway `/api/database` dipersempit menjadi baca-saja untuk katalog dan data milik member; tabel admin, transaksi, dan RPC tidak tersedia. `purchase_price` ikut disaring.
- Server action hanya untuk pelanggan (login, daftar, ganti password, checkout online, ulasan). Tidak ada kode admin di proyek ini.
- `SESSION_SECRET` sebaiknya berbeda dari POS sehingga token antar aplikasi tidak dapat dipakai silang.
- Lihat `rules.md` untuk aturan UI/kode yang sama dengan POS.
