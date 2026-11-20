# Architectural Decisions & Changes Log (LBQueen Member)

## 2026-11-21: Clean UI dengan aksen liquid glass

- Kaca dibatasi pada navigasi, banner, kartu poin/membership, dan area unggulan. `.surface` serta alias `.glass-soft` kini solid di kedua tema dengan garis tipis dan bayangan ringan; katalog, daftar voucher/pesanan, menu profil, form autentikasi, dan ringkasan checkout tidak membiaskan latar.
- Input, chip, tombol sekunder, dan dialog memakai permukaan solid. Blur navigasi dikurangi; ambient dibuat statis dan lebih redup. Scrim detail produk/pesanan/ulasan tidak lagi memburamkan seluruh layar. `prefers-reduced-transparency` menonaktifkan kaca navigasi/unggulan.
- Tombol checkout menjadi "Buat pesanan"; keterangan jadwal dan pembayaran memperjelas konfirmasi manual oleh admin. Tidak mengubah checkout, harga, stok, akses katalog publik, atau logika sesi. Tema dan nota cetak tetap dipertahankan.
- Audit pada permukaan solid menemukan teks kecil `ink-faint` kurang kontras di tema terang; token digelapkan ke `#766b68` agar label poin dan harga lama terbaca.
- Verifikasi: build/TypeScript, lint komponen yang diubah, sesi dan environment lulus. Harness visual menghasilkan 133 screenshot tanpa kegagalan permukaan solid, CSP, atau runtime; sesudah koreksi kontras, 18 audit terarah beranda/detail produk/akun reguler pada kedua tema dan tiga ukuran layar tidak menemukan pelanggaran WCAG. `test-browser.mjs` lama masih menunggu judul "Voucher Tersedia" yang sudah menjadi "Voucher Saya"; tidak diubah dalam pekerjaan visual ini.

## 2026-11-20 (lanjutan 4): Mode gelap

- Tiga pilihan tema di Profil, bagian "Tampilan" (`components/profile/ThemeSwitcher.tsx`, radiogroup Terang/Gelap/Sistem, panah kiri/kanan). Bawaan mengikuti sistem (`prefers-color-scheme`). Hanya preferensi yang disimpan di localStorage `lbq-theme` (tanpa nilai berarti sistem). Halaman sambutan, masuk, dan daftar ikut preferensi yang sama.
- `src/lib/theme-mode.ts`: skrip inline kecil di `<head>` layout akar memasang kelas `dark` pada `<html>` dan mengisi meta `theme-color` sebelum halaman digambar (tanpa kilatan, dibungkus try/catch; `<html suppressHydrationWarning>`). `Providers` berlangganan perubahan tema sistem dan pilihan dari tab lain. Saat berganti tema transisi dimatikan sesaat (`lbq-theme-switch`) agar semua permukaan berganti serentak.
- Semua warna lewat token CSS di `globals.css` (`:root` terang, `.dark` gelap): latar, teks (`ink`, `ink-2`, `ink-3`, `ink-muted`, `ink-faint`, `ink-disabled`), `brand`/`brand-ink`, `price`, `blush`, `gold-ink`/`gold-soft`, status (`danger`, `success`, `warning`, `info` beserta `-soft`/`-line`), `fill`/`edge`/`line`, `scrim`, serta isi dan tepi kaca, sheet, chip, input, skeleton, scrollbar, dan cahaya ambient. Token terdaftar sebagai warna Tailwind (`text-ink`, `bg-fill/90`, `border-edge/80`); warna hex di komponen sudah diganti token. Varian `dark:` memakai `@custom-variant dark` (kelas `.dark`, hanya `@media screen`).
- Gelap: dasar plum `#120c10` dengan cahaya rose/berry/emas lembut, kaca isi putih 5 sampai 8% dengan tepi tipis, sheet/dialog pekat `#1b1418` (tidak tembus), panel rose dan tombol rose tetap sama. Kaca HP di gelap hampir pekat agar header dan navigasi tetap terbaca tanpa blur. Ubin ikon memakai `.icon-tile` (tint per nada lewat `--tint`). Logo resmi tetap di ubin putih membulat; banner dan foto tidak diubah.
- Nota/struk selalu terang: `InvoiceReceipt` memakai `.light-scope` dan token gelap hanya berlaku di layar, jadi cetak selalu hitam di atas putih.
- `npm run screenshots -- <folder>` kini memotret semua halaman dan dialog dalam dua tema (`<folder>/light`, `<folder>/dark`; konteks `colorScheme` + `lbq-theme`), WebKit iPhone untuk beranda dan profil gelap, nota mode cetak, memeriksa kelas `<html>` saat body pertama diurai (tanpa kilatan), dan menjalankan axe-core (WCAG 2.1 AA) di setiap tangkapan.

## 2026-11-20 (lanjutan 3): Keamanan sesi, CSP, profil, pesanan, dan keranjang

- Sesi pelanggan (`src/lib/customer-session.ts`, satu pemeriksa untuk proxy, API, dan server action lewat `customer-auth.ts`): cookie berisi `v` (versi sesi) dan `last` (aktivitas terakhir); berakhir bila tidak aktif 14 hari atau versi berbeda dengan `customers.session_version` (dibaca dengan cache 30 detik di `globalThis`). Cookie diperpanjang paling sering sekali sehari tanpa menambah batas absolut 30 hari. Cookie lama tanpa `v`/`last` tetap diterima lalu diperbarui. Kolom belum ada dianggap versi 0, gangguan database tidak mengeluarkan pengguna. Kolom dan bucket dibuat migrasi POS.
- Profil: "Keluar dari semua perangkat" dan ganti password menaikkan versi sesi (ganti password tetap memasukkan perangkat ini). Bagian Profil, Keamanan, Membership & voucher, Aktivitas, Bantuan. Ubah nama, HP, username, alamat (`actions/profile.ts`, validasi bersama, cek kembar, batas percobaan). Foto profil dikompres di perangkat (persegi WebP 512px, di bawah 150 KB), diunggah ke bucket `customer-avatars`, foto lama dihapus; `avatar_url` boleh belum ada (dibaca ulang tanpa kolom itu).
- localStorage tidak lagi menyimpan profil (`lbqueen_customer` dihapus saat aplikasi dibuka).
- CSP lengkap di `next.config.ts` (tanpa nonce agar halaman statis tetap statis): skrip dan koneksi hanya ke domain sendiri, gambar dari Supabase/Unsplash. `npm run screenshots` gagal bila ada pelanggaran CSP.
- Pesanan: `parseProductName` membaca format lama "Nama (Varian) [Jadwal: ...] Rp X (xN)" sehingga teks mentah tidak pernah tampil (kartu, rincian, ulasan, beranda, nota, pesan WhatsApp). Kartu pesanan, modal ulasan (bintang wajib dipilih), dan rincian disederhanakan; "Beri Ulasan" hanya untuk pesanan selesai yang belum diulas (`reviewed_at`).
- Keranjang: kartu item ringkas, satu baris voucher membuka pemilih, jadwal dan persetujuan hanya untuk treatment dengan pesan kesalahan di tempat, pembayaran ringkas, bar bawah berisi total dan tombol Pesan.
- Beranda: Reveal tidak menyembunyikan konten di layar sentuh atau layar sempit; header berisi pencarian dan avatar; sapaan dua baris tanpa garis hias; banner satu slide penuh; kartu poin tanpa pintasan ganda. Garis hias sebelum label seksi dihapus di semua halaman.

## 2026-11-20 (lanjutan 2): Uji perangkat, performa glass, aksesibilitas, teks ringkas

- Diuji di WebKit (iPhone 14, iPad gen 7) dan Chromium mobile dengan CPU 4x lebih lambat. `.ambient` kini menggerakkan `transform` pada `::before` (compositor) dan diam di perangkat sentuh; sebelumnya `background-position` layar penuh di-repaint setiap frame dan memaksa semua permukaan kaca di atasnya diburamkan ulang. Membuka sheet produk: 17,8 menjadi ~30 fps (frame panjang 8 menjadi 2-3).
- `.glass-strong` (sheet/dialog) tanpa backdrop-filter (sudah hampir pekat); overlay dialog tanpa blur di ponsel; tombol "+" dan badge diskon kartu produk tanpa blur. Elemen blur per layar: beranda 20 menjadi 4, kategori 28 menjadi 4.
- Ponsel (`max-width: 767px`): `.glass`/`.glass-lit` 92% dan chip/btn kaca 84% agar navigasi, header, dan bar tetap terbaca ketika blur tidak dirender (mode hemat daya, "Kurangi Transparansi"). Override ada di `@layer components` supaya `.panel-rose` tetap menang.
- Reveal: perangkat dengan `hardwareConcurrency` <= 4 memakai `lbq-reveal-lite` (tanpa animasi filter blur).
- Aksesibilitas: `hooks/useDialogFocus.ts` (fokus masuk, Tab berputar di dalam, Escape menutup, fokus kembali ke pemicu) dipakai sheet produk, rincian pesanan, dan ulasan. Semua kontrol >= 44x44 px (titik carousel tetap kecil, area tekan 44 px). Input 16px (mencegah zoom iOS). Teks UI minimal 12px (struk nota cetak tidak diubah). Urutan heading dirapikan, nama aksesibel memuat teks yang terlihat, carousel bisa digulir dengan keyboard. Login menautkan error ke input (`aria-invalid`, `aria-describedby`). Hasil axe-core di 390/820/1024/1440 untuk 12 halaman + 3 dialog: 114 node pelanggaran menjadi 0.
- Teks: tanpa em/en dash di UI ("Senin-Kamis 09.00-21.00", aturan validasi "3 sampai 50 karakter"; aturan sama di POS sebaiknya ikut diubah), ikon Sparkles benefit diganti ikon sesuai arti. Subtitle yang mengulang judul dihapus (Keranjang, Pesanan, Promo, Membership, kategori, rail beranda, eyebrow "Penawaran terbatas", "Benefit", tagline login desktop); kalimat sapaan per jam dihapus dan pil jam dipindah ke baris nama agar kartu poin + grid layanan lebih cepat terlihat.
- Paket `animejs` dihapus (tidak ada lagi yang mengimpor).

## 2026-11-20 (lanjutan): Tampilan liquid glass

- Seluruh tampilan member dirombak ke bahasa liquid glass (acuan portfolio `PORTFOLIO-Fadli`: `.glass`, ambient, spotlight, reveal blur-up), memakai palet rose LBQueen; rute, alur, data, dan teks tidak berubah.
- Sistem di `src/app/globals.css`: `.glass` (blur 22px + saturate, highlight inset atas) untuk chrome/kartu unggulan, `.glass-lit` (kilau diagonal), `.glass-strong` (sheet/dialog), `.glass-soft` (kaca tanpa backdrop-filter untuk kartu berulang di grid/daftar agar gulir ringan), `.panel-rose` (panel kontras gelap-rose: pita Promo Spesial, strip member, bar keranjang), `.spotlight` + `.lift` (cahaya mengikuti kursor dan terangkat saat hover, hanya perangkat ber-hover), `.btn-primary`/`.btn-glass`, `.chip-glass`/`.chip-active`, `.input-glass`, `.skeleton-glass`, `.eyebrow`, `.morph-bar`. Fallback `@supports not (backdrop-filter)` memakai permukaan pekat; reduced motion mematikan ambient, shimmer, dan reveal.
- Lapisan `.ambient` (medan cahaya rose/peach/emas yang bergeser 28 detik) dipasang tetap di belakang layout portal, halaman login/daftar, dan nota; latar halaman tidak lagi opak.
- Motion: `components/motion/Reveal.tsx` kini IntersectionObserver + CSS (tanpa animejs/framer-motion). Elemen ber-`data-reveal` naik dari blur saat masuk layar, bertahap 70 ms, konten yang dimuat belakangan dipantau MutationObserver; animasi memakai fill-mode `backwards` sehingga tidak meninggalkan transform/filter yang mengganggu elemen `fixed`. `hooks/useSpotlight.ts` (satu listener dokumen) dan `hooks/useScrolled.ts`.
- Header: `TopNav` (tablet/desktop) membentang di puncak lalu menyusut menjadi pil kaca melayang saat digulir; header beranda ponsel (pencarian, lencana tier, avatar) juga menjadi pil kaca saat digulir. Navigasi bawah berupa pil kaca dengan item aktif `chip-active`.
- Beranda: sapaan dengan eyebrow + nama besar di atas ambient (pita gradien lama dihapus), banner dibingkai kaca di layar lebar, kartu poin + grid layanan menjadi `glass-lit` (struktur tetap), ubin ikon `IconChip` bertint kaca. Kartu produk, voucher, pesanan, dan keranjang memakai `glass-soft`; sheet detail produk, rincian pesanan, ulasan, dan toast memakai `glass-strong`.
- Label huruf kapital lebar (uppercase + tracking) diganti label biasa sesuai acuan. `npm run screenshots` menunggu 1,4 detik setelah resize agar animasi reveal selesai sebelum dipotret.

## 2026-11-20: Optimasi beban server & banner baru

- Profil sesi memakai satu key SWR (`customer-profile`) dengan refresh 120 detik; navigasi tetap memperbarui profil bila data lebih tua dari 15 detik. Login, daftar, logout, dan checkout memanggil `refresh()` dari `useCustomer` secara eksplisit.
- Gateway: cek kode voucher dibatasi 8/menit per IP (kode baru selalu lolos cache CDN); `customer_orders` tanpa daftar kolom dipaksa ke kolom aman; JSON diserialisasi sekali. Pesanan dan nota memilih kolom eksplisit.
- `/api/vouchers` men-cache daftar voucher per tier 60 detik (`unstable_cache`); data pelanggan tetap dibaca per permintaan. `/api/catalog` tidak lagi mengirim `product_code`.
- `ProductDetailSheet`, `OrderDetailModal`, `ReviewModal` dimuat lewat `next/dynamic`; katalog beranda tidak diambil untuk pengunjung yang belum login; React Query (tidak dipakai, semua data lewat SWR) dihapus; `sw.js` tanpa fetch handler; pembersihan `auth_attempts` lewat `after()`; cek rate limit login/daftar paralel. Index pendukung ada di migrasi POS `20261120090000_*`.
- Carousel beranda, layar sambutan, dan panel login/daftar memakai 4 banner baru (`public/banners/lbqueen-percaya-diri|perawatan-lengkap|tenaga-medis|investasi-kecantikan.webp`); teks layar sambutan kini 4 slide. Banner lama tidak dipakai lagi.

## 2026-11-19 (lanjutan 2): Voucher per membership, beranda, motion, keamanan gateway

- Beranda: kartu Info Klinik dan daftar voucher dihapus. Header seperti GoStar: pencarian, lencana tier ("Silver Member", ke `/membership`), dan avatar inisial pelanggan (ke `/profile`); logo tidak lagi di header ponsel. Sapaan + nama besar, kalimat singkat sesuai jam, pil tanggal + jam WIB (tanpa status buka/tutup).
- Voucher: `/api/vouchers` (wajib sesi) mengembalikan voucher aktif untuk tier pelanggan ("Voucher Saya"); `/api/catalog` tidak lagi mengirim daftar voucher publik dan promo otomatis hanya dari voucher tanpa batasan membership. Keranjang: ketik kode atau pilih dari Voucher Saya; syarat (tier, minimal belanja, produk) dicek di klien dan ditegakkan di `create_online_order`. Halaman Promo menampilkan Voucher Saya.
- Motion: `tw-animate-css` dipasang (kelas `animate-in`/`fade-in`/`slide-in-*`/`zoom-in-*` sebelumnya tidak terdefinisi sehingga tidak beranimasi). Detail produk punya animasi keluar; tambah ke keranjang menerbangkan foto ke bar/ikon keranjang (`src/lib/motion.ts`, `data-cart-target`) lalu "bump"; hapus item keranjang memudar dulu; angka jumlah beranimasi. Semua menghormati reduced motion.
- Keamanan gateway `/api/database`: hanya menerima/meneruskan JSON (`Accept` lain ditolak 406, respons non-JSON 502) sehingga penyaring kolom rahasia (`purchase_price`, password) tidak bisa dilewati lewat `text/csv`/`vnd.pgrst.object`; `Vary: Accept` pada respons cache.
- Teks UI dipangkas: deskripsi panjang (catatan tier, deskripsi benefit, info login, dll.) dihapus atau disingkat.
- `npm run screenshots` juga menjalankan cek regresi keamanan gateway.

## 2026-11-19 (lanjutan): Variasi, galeri foto, tablet, dan logo resmi

- Logo UI kembali memakai logo resmi lengkap (`public/lbqueen-logo-192/512.png`: monogram, mahkota, teks QUEEN.ID Care & Beauty Clinic) lewat `BrandMark`, juga favicon/manifest; `lbqueen-mark.png` (monogram hasil potong) dihapus atas permintaan pemilik.
- Tablet (iPad potret, `md` ke atas) kini memakai tata letak desktop: `TopNav` di atas (nav bawah hanya di bawah `md`), hero beranda 2 kolom, keranjang 2 kolom dengan ringkasan menempel. Sebelumnya tablet memakai tata letak ponsel yang direntangkan.
- Sambutan beranda: sapaan + nama besar, pil tier, kalimat sesuai jam, status klinik (buka/tutup), dan tanggal WIB. Banner beranda memakai mode `peek` (`BannerCarousel`): di ponsel slide ~78% lebar dengan slide berikutnya mengintip sehingga tidak terlalu besar.
- Detail produk bergaya marketplace (`ProductDetailSheet`): carousel foto (`ProductGallery`: swipe, panah di layar lebar, penghitung, thumbnail; foto variasi ikut di galeri dan otomatis ditampilkan saat variasi dipilih), harga rentang sebelum variasi dipilih, chip variasi berfoto (stok habis dinonaktifkan untuk produk), label variasi dari admin (`variant_label`), stok variasi, deskripsi dengan "Lihat selengkapnya". Ponsel: bottom sheet; `md`+: dialog dua kolom.
- Pembeli wajib memilih variasi bila produk punya lebih dari satu variasi (seperti Shopee). Diskon promo dihitung dari harga variasi (`discountFor`); keranjang memakai foto variasi bila ada. Kartu katalog menampilkan "Mulai Rp X" dan jumlah variasi/foto.
- `/api/catalog` kini mengirim `images`, `description`, `variant_label`, serta `image_url`/`sort_order` variasi (diurutkan). Skema dikelola di POS (`20261119150000_variasi_dan_galeri_produk.sql`).
- `npm run screenshots` memotret ponsel, tablet (820x1180), dan desktop, termasuk detail produk bervariasi; halaman yang gagal dicatat tanpa menghentikan seluruh proses.

## 2026-11-19: Tata letak bergaya Gojek

- Atas permintaan pemilik, tampilan member mengikuti alur aplikasi Gojek; ini menggantikan catatan 2026-11-17 bahwa banner promo dan tombol kategori beranda tidak diubah. Navigasi bawah: Beranda, Promo (`/promo`), Pesanan, Profil, berupa bar mengambang dengan pil aktif. Keranjang dibuka dari bar keranjang mengambang (muncul di beranda/promo/kategori bila ada item), kartu poin, grid layanan, dan profil.
- Beranda: bar atas (pencarian, chip tier ke `/membership`, avatar ke profil), carousel banner brand (`public/banners/*.webp`, latar `#FFECF4` sama dengan banner), kartu jalan pintas (booking/konsultasi WhatsApp, jam buka, lokasi), kartu poin (Voucher/Pesanan/Keranjang), grid 8 layanan (Layanan, Produk, Promo tetap membuka `/category/*`), strip membership (akun reguler tetap menampilkan "Akun Anda sudah aktif" dan tautan upgrade WhatsApp), voucher, katalog promo berpaginasi, dan info klinik.
- `/promo`: ringkasan voucher/membership, voucher dengan tombol salin kode, filter Semua/Layanan/Produk (diproses server lewat `/api/catalog`), katalog promo berpaginasi. `/membership` (wajib login, ditambahkan ke `proxy.ts`): carousel kartu tier Reguler/Silver/Gold/Platinum dan daftar benefit; tidak ada target poin karena tier ditetapkan admin.
- Jam buka (Senin–Kamis 09.00–21.00, Jumat–Sabtu 10.00–21.00 WIB) dan alamat diambil dari materi banner klinik (`src/lib/clinic.ts`, `src/lib/constants.ts`). Hari Minggu tidak tercantum di materi tersebut sehingga status buka/tutup tidak ditampilkan pada hari Minggu.
- Putaran kedua: layar lebar (`lg`) memakai navigasi atas (`TopNav`) dan hero dua kolom; navigasi bawah hanya di mobile dan disembunyikan di `/cart`, yang kini punya bar checkout menempel di bawah (total + tombol konfirmasi). Detail produk di semua halaman memakai satu bottom sheet (`ProductDetailSheet`, tombol "Pesan" menampilkan total); modal lama dihapus. Halaman selamat datang dan login/daftar memakai banner brand. Ikon grid layanan berupa chip gradien.
- `npm run screenshots -- <folder>` (setelah build) menyimpan screenshot mobile dan desktop setiap halaman dengan database mock.
- Putaran ketiga (masukan pemilik: hanya kartu poin + grid layanan dan halaman membership yang disukai): seluruh warna dibatasi ke palet brand rose/berry/emas/mauve (`src/lib/theme.ts`) dan ikon memakai `IconChip` (tile tint + chip gradien) seperti grid layanan. Beranda disederhanakan: sapaan + pencarian, banner sebagai kartu, kartu poin dengan pil tier, grid, strip upgrade hanya untuk akun reguler, voucher, katalog promo, info klinik; baris kartu pintas dan chip tier di bar atas dihapus. Membership: kartu tier bergaya kartu member (tanpa latar gelap), titik navigasi, daftar benefit. Foto subject banner dan logo tidak diubah.
- Putaran keempat (beranda dinilai terlalu generik; acuan Blibli/Gojek): header gradien rose yang menempel di atas (logo, pencarian, keranjang, chat), banner menumpuk di atas gradien, satu kartu berisi poin + grid layanan, kartu pesanan aktif (status `pending`/`dp`/`processing` terbaru milik member, langkah Dipesan → Diproses → Selesai), rail horizontal produk bergambar (Promo Spesial dalam pita rose dengan persentase hemat dari data, Treatment Klinik, Produk Skincare) memakai `/api/catalog`, lalu voucher dan info klinik. Pencarian menampilkan grid hasil berpaginasi. Paginasi katalog promo di beranda diganti tautan "Lihat semua" ke `/category/*`.
- Putaran kelima: error "Loading chunk ... failed" saat login terjadi karena server action dimuat lewat `import()` dinamis; setelah deploy baru, tab lama meminta chunk yang sudah tidak ada. Semua server action kini diimpor statis, dan `src/lib/stale-deploy.ts` mendeteksi error versi lama (chunk/server action tidak ditemukan) lalu memuat ulang halaman sekali (dijaga 30 detik lewat sessionStorage) dari `Providers`, `error.tsx`, serta catch login/daftar/checkout. Aktifkan Skew Protection di Vercel bila paket mendukung.
- Halaman selamat datang mengikuti layar sambutan Gojek: logo, carousel banner yang berganti setiap 4 detik dengan judul/teks per slide, titik, tombol Masuk dan Daftar. Login/daftar: panah kembali + logo, judul singkat, tanpa kotak info panjang; desktop hanya carousel banner di panel kiri. Logo UI kemudian diganti ke logo resmi lengkap (lihat entri lanjutan di atas).
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
