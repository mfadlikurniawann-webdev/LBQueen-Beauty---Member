# LBQueen Member

Aplikasi pelanggan/member LBQueen Beauty Clinic untuk domain **https://lbqueen.id**. Panel admin dan kasir berada di proyek terpisah `POS LBQueen` (**https://pos.lbqueen.id**). Kedua aplikasi memakai **satu database Supabase yang sama**.

## Fitur

- Katalog treatment dan produk, promo member, kategori
- Daftar, masuk, profil, dan ganti password member
- Keranjang dan checkout online (jadwal treatment, transfer/QRIS, konfirmasi WhatsApp)
- Riwayat pesanan, ulasan, dan nota online (`/invoice/[id]`)

## Rute

| Rute | Akses |
| --- | --- |
| `/`, `/promo`, `/category/[type]`, `/login`, `/register` | Publik |
| `/cart`, `/orders`, `/profile`, `/membership`, `/invoice/[id]` | Wajib login member |
| `/customer-portal/*` | Redirect permanen (308) ke rute baru tanpa prefix |

## Batas akses ke database

- Gateway `/api/database` hanya melayani **baca**: katalog (`products`, `product_variants`, `vouchers` aktif) dan data milik member yang login (`customers`, `customer_orders`). Tabel admin, transaksi, dan RPC laporan tidak tersedia. Kolom password dan `purchase_price` disaring.
- Perubahan data hanya lewat server action: `loginCustomer`, `registerCustomer`, `updateCustomerPassword`, `checkoutOnline`, `submitOrderReview`.
- Cookie sesi `lbqueen_customer` hanya berlaku di domain member. Sesi admin POS tidak berlaku di sini, dan sebaliknya.
- Batas percobaan per IP dan per akun untuk login, daftar, ganti password, checkout, dan ulasan (`src/lib/rate-limit.ts`); honeypot anti-bot di form daftar.
- Kode voucher hanya bisa dicek satu per satu; respons dibatasi 100 baris; katalog publik di-cache CDN Vercel agar lonjakan trafik tidak langsung membebani database.

## Lapisan perlindungan di Vercel (disarankan)

Proteksi DDoS jaringan sudah otomatis dari Vercel. Tambahan di Vercel → proyek → **Firewall**: aktifkan Bot Protection, buat aturan rate limit per IP untuk `/api/*` dan `/register` bila paket mendukung, dan nyalakan **Attack Challenge Mode** saat terjadi serangan. Pantau **Usage** Vercel dan Supabase.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3001
```

Salin `.env.example` menjadi `.env.local`. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` **sama dengan POS** (satu database). `SESSION_SECRET` sebaiknya **berbeda** dari POS (minimal 32 karakter acak).

Pengujian: `npm run test:session`, `npm run test:env`, `npm run build && npm run test:browser` (database di-mock, memakai Microsoft Edge).

## Database

Skema, migrasi, fungsi SQL, dan seed tetap dikelola di proyek `POS LBQueen/supabase`. Proyek ini tidak menyimpan migrasi agar tidak ada dua sumber skema. Fungsi yang dipakai member: `consume_login_attempt`, `create_online_order`.

## Deploy (Vercel)

1. Buat proyek Vercel baru dari folder/repo ini (Next.js, `npm run build`, Node.js 24).
2. Isi environment Production/Preview seperti di atas.
3. Tambahkan domain `lbqueen.id` dan `www.lbqueen.id` ke proyek ini, lalu ikuti nilai DNS yang ditampilkan Vercel di DNS Hostinger. `pos.lbqueen.id` tetap diarahkan ke proyek POS.
