import http from "node:http";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium, devices, webkit } from "@playwright/test";
import { createSession } from "../src/lib/session.ts";

const customers = [
  {
    id: 1,
    name: "QA Customer",
    phone: "080000000001",
    points: 100,
    is_member: true,
    membership_type: "Silver",
    username: "qa_customer",
    join_date: "2026-11-17",
    password_hash: "private-hash",
    password_plain: "private-password",
  },
  {
    id: 2,
    name: "Other Customer",
    phone: "080000000002",
    points: 0,
    is_member: false,
    membership_type: "Regular",
    username: "other_customer",
    join_date: "2026-11-17",
  },
];
const products = [
  {
    id: 1,
    name: "Facial Care",
    product_code: "T001",
    type: "Treatment Care & Beauty",
    purchase_price: 0,
    selling_price: 150000,
    stock: 0,
    unit: "Sesi",
    variants: [],
    image_url: "/banner_facial.png",
  },
  {
    id: 2,
    name: "Daily Cleanser",
    product_code: "P001",
    type: "Product Care & Beauty",
    purchase_price: 50000,
    selling_price: 85000,
    stock: 10,
    unit: "Pcs",
    variants: [],
    image_url: "/banner_eyelash.png",
  },
];
const vouchers = [
  {
    id: 1,
    name: "Promo Glow Up",
    code: "GLOW25",
    type: "percent",
    discount_amount: 25,
    min_transaction: 200000,
    product_id: null,
    is_active: true,
  },
  {
    id: 2,
    name: "Hemat Member",
    code: "MEMBER50",
    type: "nominal",
    discount_amount: 50000,
    min_transaction: 300000,
    product_id: null,
    is_active: true,
  },
];
const orders = [
  {
    id: 1,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name: "Daily Cleanser Rp 85.000 (x1)",
    qty: 1,
    price: 85000,
    total_price: 85000,
    status: "pending",
    product_id: 2,
    ordered_at: new Date().toISOString(),
  },
  {
    id: 2,
    customer_id: 2,
    customer_name: "Other Customer",
    product_name: "Private order",
    status: "pending",
    ordered_at: new Date().toISOString(),
  },
];
products.push(
  ...Array.from({ length: 58 }, (_, index) => ({
    ...products[1],
    id: index + 3,
    name: `QA Product ${String(index + 3).padStart(3, "0")}`,
  })),
);
Object.assign(products[1], {
  images: [
    "/banner_eyelash.png",
    "/beauty_carousel_2_1778829728230.png",
    "/beauty_carousel_3_1778829748066.png",
  ],
  variant_label: "Ukuran",
  description:
    "Pembersih wajah lembut untuk pemakaian harian.\n\nCara pakai: basahi wajah, pijat perlahan selama 30 detik, lalu bilas.",
  variants: [
    {
      id: 21,
      product_id: 2,
      variant_name: "50 ml",
      price: 85000,
      stock: 5,
      image_url: "/banner_eyelash.png",
      sort_order: 0,
    },
    {
      id: 22,
      product_id: 2,
      variant_name: "100 ml",
      price: 140000,
      stock: 0,
      image_url: null,
      sort_order: 1,
    },
    {
      id: 23,
      product_id: 2,
      variant_name: "Paket 2 pcs",
      price: 160000,
      stock: 3,
      image_url: "/beauty_carousel_1_1778829705862.png",
      sort_order: 2,
    },
  ],
});
const upstream = [];
// Hari buka pertama setelah hari ini (WIB, lewati Minggu): jam 10.30 sudah dibooking sehingga slot 10.00 penuh.
const TAKEN_DATE = (() => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  for (let i = 1; ; i++) {
    const d = new Date(`${today}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    if (d.getUTCDay() !== 0) return d.toISOString().slice(0, 10);
  }
})();
const mock = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  upstream.push({
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    method: request.method,
  });
  const table = url.pathname.split("/").at(-1);
  // Storage (foto profil): unggah, buat bucket, dan hapus selalu berhasil.
  if (url.pathname.startsWith("/storage/v1/")) {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ Key: url.pathname, Id: "qa", name: "qa" }));
    return;
  }
  let data = [];
  if (table === "consume_login_attempt") data = true;
  else if (table === "bookings") data = [{ booking_date: TAKEN_DATE, booking_time: "10:30:00", status: "confirmed" }];
  else if (table === "create_online_order")
    data = {
      orders: [{ id: 99, product_name: "Daily Cleanser (50 ml) Rp 85.000 (x1)", qty: 1, price: 85000, total_price: 85000 }],
      total: 85000,
    };
  else if (table === "customers") data = customers;
  else if (table === "products") data = products;
  else if (table === "customer_orders") data = orders;
  else if (table === "vouchers") data = vouchers;
  if (Array.isArray(data)) {
    for (const field of ["id", "username", "customer_id", "status"]) {
      const condition = url.searchParams.get(field);
      if (condition?.startsWith("eq."))
        data = data.filter((row) => String(row[field]) === condition.slice(3));
    }
    const type = url.searchParams.getAll("type").find((value) => value.startsWith("eq."));
    if (type) data = data.filter((row) => row.type === type.slice(3));
    const status = url.searchParams.get("status");
    if (status?.startsWith("in.("))
      data = data.filter((row) => status.slice(4, -1).split(",").includes(row.status));
    if (table === "products" && url.searchParams.get("select")?.includes("promotions:vouchers")) {
      data = data.map(({ purchase_price, stock, unit, ...row }) => ({
        ...row,
        variants: row.variants || [],
        promotions:
          row.id === 1
            ? [{ product_id: 1, type: "nominal", discount_amount: 10000, min_transaction: 0 }]
            : [],
      }));
      if (url.searchParams.has("promotions.min_transaction"))
        data = data.filter((row) => row.promotions.length);
    }
    const selected = url.searchParams.get("select");
    if (selected && selected !== "*" && !selected.includes(":")) {
      const fields = selected.split(",");
      data = data.map((row) =>
        Object.fromEntries(
          fields.filter((field) => field in row).map((field) => [field, row[field]]),
        ),
      );
    }
    const offset = Number(url.searchParams.get("offset") || 0);
    if (url.searchParams.get("limit"))
      data = data.slice(offset, offset + Number(url.searchParams.get("limit")));
  }
  const single = request.headers.accept?.includes("application/vnd.pgrst.object+json");
  if (single && Array.isArray(data)) data = data[0] || null;
  response.writeHead(200, {
    "Content-Type": "application/json",
    "Content-Range": `0-0/${Array.isArray(data) ? data.length : 1}`,
  });
  response.end(request.method === "HEAD" ? undefined : JSON.stringify(data));
});
await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
const apiPort = mock.address().port;
const appPort = 3111;
const base = `http://127.0.0.1:${appPort}`;
process.env.SESSION_SECRET = "qa-only-member-secret-with-more-than-32-characters";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(appPort), "--hostname", "127.0.0.1"],
  {
    env: {
      ...process.env,
      SUPABASE_SERVICE_ROLE_KEY: "qa-service-key",
      SUPABASE_URL: `http://127.0.0.1:${apiPort}`,
      NODE_ENV: "production",
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk;
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk;
});

const outDir = path.resolve(process.argv[2] || ".scratch/screenshots");
// Setiap halaman dipotret dua kali: tema terang (outDir/light) dan gelap (outDir/dark).
let theme = "light";
let shotDir = outDir;
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");
const axeResults = { light: [], dark: [] };
async function newContext(b, options = {}) {
  const context = await b.newContext({ ...options, colorScheme: theme });
  const mode = theme;
  await context.addInitScript((value) => {
    try {
      localStorage.setItem("lbq-theme", value);
    } catch {}
  }, mode);
  return context;
}
// axe-core (WCAG 2.1 A/AA) di halaman/dialog yang sedang terbuka; hasil dikumpulkan per tema.
async function audit(page, name) {
  try {
    if (!(await page.evaluate(() => !!window.axe))) await page.evaluate(axeSource);
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        resultTypes: ["violations"],
      });
      return result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.length,
        sample: v.nodes.slice(0, 3).map((n) => `${n.target.join(" ")} ${n.any?.[0]?.message || ""}`),
      }));
    });
    for (const v of violations) axeResults[theme].push({ name, ...v });
  } catch (error) {
    axeResults[theme].push({ name, id: "audit-error", nodes: 0, sample: [error.message.split("\n")[0]] });
  }
}
const MOBILE = { width: 390, height: 844 };
const TABLET = { width: 820, height: 1180 };
const DESKTOP = { width: 1440, height: 900 };
const CART = [
  {
    id: 1,
    name: "Facial Care",
    price: 150000,
    qty: 1,
    image_url: "/banner_facial.png",
    is_consultation: false,
    voucher_discount: 10000,
    is_set: false,
    type: "Treatment Care & Beauty",
  },
  {
    id: 2,
    name: "Daily Cleanser",
    price: 85000,
    qty: 2,
    image_url: "/banner_eyelash.png",
    is_consultation: false,
    voucher_discount: 0,
    is_set: false,
    type: "Product Care & Beauty",
  },
];
orders.unshift(
  {
    id: 3,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name: "Facial Care Rp 140.000 (x1)",
    qty: 1,
    price: 140000,
    total_price: 140000,
    status: "completed",
    product_id: 1,
    ordered_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 4,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name: "Daily Cleanser Rp 85.000 (x2)",
    qty: 2,
    price: 85000,
    total_price: 170000,
    status: "processing",
    product_id: 2,
    ordered_at: new Date(Date.now() - 86400000).toISOString(),
  },
  // Format lama dari database: jadwal dalam kurung siku, harga, dan jumlah di nama.
  {
    id: 5,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name:
      "Breshaugmentation BRESH UP Premium Body Contouring Paket Lengkap [Jadwal: 2026-11-21 19:00] Rp 19.250.000 (x7)",
    qty: 7,
    price: 2750000,
    total_price: 19250000,
    status: "pending",
    product_id: 1,
    ordered_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 6,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name: "Daily Cleanser (Paket 2 pcs) Rp 160.000 (x3)",
    qty: 3,
    price: 160000,
    total_price: 480000,
    status: "dp",
    product_id: 2,
    ordered_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 7,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name: "Facial Care (Gold) [Jadwal: 2026-11-25 10:30] Rp 140.000 (x1)",
    qty: 1,
    price: 140000,
    total_price: 140000,
    status: "cancelled",
    product_id: 1,
    ordered_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 8,
    customer_id: 1,
    customer_name: "QA Customer",
    product_name: "Facial Care Rp 140.000 (x2)",
    qty: 2,
    price: 140000,
    total_price: 280000,
    status: "completed",
    product_id: 1,
    ordered_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
);
let browser;
const shots = [];
async function shoot(page, name, viewport, { full = true } = {}) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(400);
  if (full) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({
      width: viewport.width,
      height: Math.max(viewport.height, height),
    });
    // Animasi reveal (blur-up bertahap) butuh ~1,3 detik sebelum konten diam.
    await page.waitForTimeout(1400);
  }
  const file = path.join(shotDir, `${name}.png`);
  await page.screenshot({ path: file });
  const translucentWorkSurfaces = await page.evaluate(() =>
    [...document.querySelectorAll(".surface, .glass-soft, .input-glass, .glass-strong")]
      .filter((el) => {
        if (!el.getClientRects().length) return false;
        const style = getComputedStyle(el);
        const alpha = style.backgroundColor.startsWith("rgba(")
          ? parseFloat(style.backgroundColor.split(",").at(-1))
          : 1;
        return alpha < 1 || style.backgroundColor === "transparent" || style.backdropFilter !== "none";
      })
      .map((el) => el.className),
  );
  if (translucentWorkSurfaces.length)
    failures.push(`${theme}/${name}: permukaan kerja tidak solid: ${translucentWorkSurfaces.join("; ")}`);
  await page.setViewportSize(viewport);
  shots.push(file);
  await audit(page, `${name}`);
}
async function visit(page, url, ready, viewport = MOBILE) {
  await page.setViewportSize(viewport);
  await page.goto(base + url);
  if (ready) await ready(page);
  // Konten sudah ditunggu lewat ready(); networkidle hanya penenang, bukan syarat lulus.
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}
const failures = [];
// Pelanggaran CSP dan error konsol dikumpulkan dari semua halaman; harus nol.
const cspViolations = [];
const consoleErrors = [];
async function watch(context) {
  await context.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(`CSP: ${event.violatedDirective} ${event.blockedURI || "inline"}`);
    });
  });
  context.on("console", (message) => {
    if (message.type() !== "error") return;
    // Hanya halaman aplikasi ini; skrip /_vercel/* hanya ada di Vercel (404 lokal wajar).
    if (!message.page()?.url().startsWith(base)) return;
    const text = message.text();
    if (/_vercel\//.test(`${message.location()?.url || ""} ${text}`)) return;
    if (text.startsWith("CSP:") || /Content Security Policy/i.test(text))
      cspViolations.push(`${message.page()?.url() || ""} ${text}`);
    else consoleErrors.push(`${message.page()?.url() || ""} ${text}`);
  });
  context.on("weberror", (error) => {
    if (error.page()?.url().startsWith(base)) consoleErrors.push(`pageerror ${error.error().message}`);
  });
  return context;
}
async function both(page, name, url, ready) {
  for (const [label, viewport] of [
    ["mobile", MOBILE],
    ["tablet", TABLET],
    ["desktop", DESKTOP],
  ]) {
    try {
      await visit(page, url, ready, viewport);
      await shoot(page, `${name}-${label}`, viewport);
    } catch (error) {
      failures.push(`${name}-${label}: ${error.message.split(/\r?\n/)[0]}`);
      await shoot(page, `${name}-${label}-GAGAL`, viewport, { full: false }).catch(() => {});
    }
  }
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${base}/login`)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (i === 99) throw new Error(`Server not ready: ${serverOutput.slice(-2000)}`);
  }
  await mkdir(outDir, { recursive: true });
  browser = await chromium.launch({ channel: "msedge", headless: true });
  // Regresi keamanan: format non-JSON ditolak, voucher pribadi wajib login, kolom rahasia tersaring.
  for (const [label, path, init, status] of [
    ["accept csv", "/api/database/products?select=*", { headers: { accept: "text/csv" } }, 406],
    ["voucher tanpa login", "/api/vouchers", {}, 401],
    ["embed customers", "/api/database/products?select=*,customers(*)", {}, 400],
  ]) {
    const response = await fetch(base + path, init);
    if (response.status !== status)
      throw new Error(`${label}: status ${response.status}, harusnya ${status}`);
  }
  const catalogRows = await (await fetch(`${base}/api/database/products?select=*`)).json();
  if (JSON.stringify(catalogRows).includes("purchase_price"))
    throw new Error("purchase_price bocor dari gateway member");
  console.log("Cek keamanan gateway member: lulus");

  for (const mode of ["light", "dark"]) {
  theme = mode;
  shotDir = path.join(outDir, mode);
  await mkdir(shotDir, { recursive: true });

  const guest = await (await watch(await newContext(browser, { viewport: MOBILE }))).newPage();
  await both(guest, "01-selamat-datang", "/", (p) =>
    p.getByRole("button", { name: "Masuk", exact: true }).waitFor(),
  );
  await both(guest, "02-masuk", "/login");
  await both(guest, "03-daftar", "/register");

  const memberContext = await watch(await newContext(browser, { viewport: MOBILE }));
  await memberContext.addCookies([
    { name: "lbqueen_customer", value: await createSession(1, "customer", 900), url: base },
  ]);
  await memberContext.addInitScript(
    (cart) => localStorage.setItem("lbqueen_cart", JSON.stringify(cart)),
    CART,
  );
  const member = await memberContext.newPage();
  const home = (p) => p.getByRole("navigation", { name: "Menu layanan" }).waitFor();
  await both(member, "04-beranda", "/", home);
  await visit(member, "/", home);
  await member
    .getByRole("button", { name: /Facial Care/ })
    .first()
    .click();
  await member.getByRole("dialog").waitFor();
  await member.waitForTimeout(500);
  await shoot(member, "05-detail-produk-mobile", MOBILE, { full: false });
  await member.setViewportSize(TABLET);
  await member.waitForTimeout(400);
  await shoot(member, "05-detail-produk-tablet", TABLET, { full: false });
  await member.setViewportSize(DESKTOP);
  await member.waitForTimeout(400);
  await shoot(member, "05-detail-produk-desktop", DESKTOP, { full: false });
  await member.keyboard.press("Escape");
  await visit(member, "/category/produk", (p) => p.getByText("Daily Cleanser").first().waitFor());
  await member
    .getByRole("button", { name: /Daily Cleanser/ })
    .first()
    .click();
  await member.getByRole("dialog").waitFor();
  await member.getByRole("radio", { name: /Paket 2 pcs/ }).click();
  await member.waitForTimeout(700);
  await shoot(member, "05b-detail-variasi-mobile", MOBILE, { full: false });
  await member.setViewportSize(TABLET);
  await member.waitForTimeout(500);
  await shoot(member, "05b-detail-variasi-tablet", TABLET, { full: false });
  await member.setViewportSize(DESKTOP);
  await member.waitForTimeout(500);
  await shoot(member, "05b-detail-variasi-desktop", DESKTOP, { full: false });
  await member.keyboard.press("Escape");
  await both(member, "06-promo", "/promo", (p) =>
    p.getByRole("heading", { name: "Voucher Saya" }).waitFor(),
  );
  await both(member, "07-kategori-layanan", "/category/layanan", (p) =>
    p.getByText("Facial Care").first().waitFor(),
  );
  await both(member, "08-kategori-produk", "/category/produk", (p) =>
    p.getByText("Daily Cleanser").first().waitFor(),
  );
  await both(member, "09-keranjang", "/cart", (p) =>
    p.getByRole("button", { name: "Buat pesanan", exact: true }).first().waitFor(),
  );
  await both(member, "10-pesanan", "/orders", (p) =>
    p.getByText("Daily Cleanser").first().waitFor(),
  );
  await both(member, "11-profil", "/profile", (p) =>
    p.getByRole("heading", { name: "QA Customer" }).waitFor(),
  );
  await both(member, "12-membership", "/membership", (p) =>
    p.getByRole("heading", { name: /Nikmati/ }).waitFor(),
  );
  await both(member, "13-nota-online", "/invoice/1");
  // Pesanan: nama format lama tampil bersih; modal ulasan dan rincian.
  await visit(member, "/orders", (p) => p.getByText(/Breshaugmentation/).first().waitFor());
  if (await member.getByText(/\[Jadwal|\(x\d+\)|Rp 19\.250\.000 \(x/).count())
    failures.push("teks mentah nama pesanan tampil di daftar pesanan");
  await member.getByRole("button", { name: "Beri Ulasan" }).first().click();
  await member.getByRole("dialog").waitFor();
  await member.waitForTimeout(400);
  await shoot(member, "16-ulasan-mobile", MOBILE, { full: false });
  await member.setViewportSize(DESKTOP);
  await member.waitForTimeout(400);
  await shoot(member, "16-ulasan-desktop", DESKTOP, { full: false });
  await member.keyboard.press("Escape");
  await member.setViewportSize(MOBILE);
  await member.getByRole("button", { name: /Detail pesanan Breshaugmentation/ }).click();
  await member.getByRole("dialog").waitFor();
  await member.waitForTimeout(400);
  await shoot(member, "17-rincian-pesanan-mobile", MOBILE, { full: false });
  await member.setViewportSize(DESKTOP);
  await member.waitForTimeout(400);
  await shoot(member, "17-rincian-pesanan-desktop", DESKTOP, { full: false });
  await member.keyboard.press("Escape");

  // Profil: panel ubah profil, lalu unggah foto profil (Storage dimock).
  await visit(member, "/profile", (p) => p.getByRole("heading", { name: "QA Customer" }).waitFor());
  await member.getByRole("button", { name: /Ubah profil/ }).click();
  await member.locator("#profile-name").waitFor();
  await shoot(member, "18-profil-ubah-mobile", MOBILE);
  await member.locator('input[type="file"]').setInputFiles(
    path.resolve("public/banners/lbqueen-tenaga-medis.webp"),
  );
  try {
    await member.getByText("Foto profil diperbarui.").waitFor({ timeout: 15000 });
  } catch {
    failures.push("unggah foto profil tidak selesai");
  }
  // Tampilan foto: URL Storage mock tidak diizinkan next/image, jadi sesi dibelokkan ke gambar lokal.
  await memberContext.route("**/api/session", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    if (body.profile) body.profile.avatar_url = "/banners/lbqueen-tenaga-medis.webp";
    await route.fulfill({ response, json: body });
  });
  await both(member, "19-profil-foto", "/profile", (p) =>
    p.getByRole("button", { name: "Hapus foto" }).waitFor(),
  );
  await memberContext.unroute("**/api/session");

  // Pemilih voucher terbuka (sheet dengan isi bergulir dan scrollbar tipis).
  for (const [label, viewport] of [
    ["mobile", MOBILE],
    ["desktop", DESKTOP],
  ]) {
    await visit(member, "/cart", (p) =>
      p.getByRole("button", { name: "Buat pesanan", exact: true }).first().waitFor(),
    viewport);
    await member.getByRole("button", { name: /^Voucher/ }).click();
    await member.getByRole("dialog", { name: "Pilih voucher" }).waitFor();
    await member.waitForTimeout(400);
    await shoot(member, `22-pilih-voucher-${label}`, viewport, { full: false });
    await member.keyboard.press("Escape");
  }
  await member.setViewportSize(MOBILE);

  // Jadwal treatment: slot yang sudah dibooking pelanggan lain nonaktif, slot lain bisa dipilih.
  for (const [label, viewport] of [
    ["mobile", MOBILE],
    ["desktop", DESKTOP],
  ]) {
    await visit(member, "/cart", (p) => p.locator(`[data-date="${TAKEN_DATE}"]`).waitFor(), viewport);
    await member.locator(`[data-date="${TAKEN_DATE}"]:not([disabled])`).click();
    await member.locator('[data-slot="10:00"]').waitFor();
    if (!(await member.locator('[data-slot="10:00"]').isDisabled())) failures.push(`slot terpakai masih bisa dipilih ${label}`);
    await member.locator('[data-slot="11:00"]').click();
    if ((await member.locator('[data-slot="11:00"]').getAttribute("aria-checked")) !== "true")
      failures.push(`slot jadwal tidak bisa dipilih ${label}`);
    if (await member.getByText("Jadwal dikonfirmasi admin").count()) failures.push("deskripsi jadwal masih tampil");
    const overflow = await member.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) failures.push(`keranjang melebar ${overflow}px ${label}`);
    await member.locator('[data-slot="11:00"]').scrollIntoViewIfNeeded();
    await member.waitForTimeout(300);
    await shoot(member, `25-jadwal-${label}`, viewport, { full: false });
  }
  await member.setViewportSize(MOBILE);

  // Keranjang tanpa treatment.
  const productContext = await watch(await newContext(browser, { viewport: MOBILE }));
  await productContext.addCookies([
    { name: "lbqueen_customer", value: await createSession(1, "customer", 900), url: base },
  ]);
  await productContext.addInitScript(
    (cart) => localStorage.setItem("lbqueen_cart", JSON.stringify(cart)),
    CART.filter((item) => item.type !== "Treatment Care & Beauty"),
  );
  await both(await productContext.newPage(), "20-keranjang-produk", "/cart", (p) =>
    p.getByRole("button", { name: "Buat pesanan", exact: true }).first().waitFor(),
  );

  // QRIS besar + unduh, lalu lembar "Pesanan dibuat" dengan tautan WhatsApp yang diketuk pengguna.
  for (const [label, viewport] of [
    ["mobile", MOBILE],
    ["desktop", DESKTOP],
  ]) {
    const page = await productContext.newPage();
    await page.setViewportSize(viewport);
    await page.goto(`${base}/cart`);
    await page.getByRole("radio", { name: "QRIS" }).click();
    await page.getByRole("link", { name: "Unduh QRIS" }).waitFor();
    if ((await page.getByRole("link", { name: "Unduh QRIS" }).getAttribute("download")) !== "QRIS-LBQueen.png")
      failures.push(`unduh QRIS tidak tersedia ${label}`);
    const qrisWidth = await page.getByRole("img", { name: "QRIS LBQueen" }).evaluate((el) => el.getBoundingClientRect().width);
    if (qrisWidth < 240) failures.push(`QRIS terlalu kecil ${label}: ${Math.round(qrisWidth)}px`);
    await page.getByRole("radio", { name: "QRIS" }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shoot(page, `23-qris-${label}`, viewport, { full: false });
    await page.getByRole("button", { name: "Buat pesanan", exact: true }).first().click();
    const sheet = page.getByRole("dialog", { name: "Pesanan dibuat" });
    await sheet.waitFor();
    await page.waitForTimeout(400);
    await shoot(page, `24-pesanan-dibuat-${label}`, viewport, { full: false });
    const wa = sheet.getByRole("link", { name: /Kirim bukti di WhatsApp/ });
    if (!(await wa.getAttribute("href"))?.startsWith("https://wa.me/")) failures.push(`tautan WhatsApp salah ${label}`);
    // Ketukan pengguna pada tautan harus membuka tab WhatsApp (tidak diblokir CSP/COOP).
    const [popup] = await Promise.all([productContext.waitForEvent("page", { timeout: 5000 }).catch(() => null), wa.click()]);
    if (!popup) failures.push(`tautan WhatsApp tidak terbuka ${label}`);
    await popup?.close();
    await sheet.getByRole("button", { name: "Lihat pesanan" }).click();
    await page.waitForURL("**/orders");
    // Keranjang dikosongkan checkout; init script konteks mengisinya lagi di halaman berikutnya.
    await page.close();
  }

  // Layar pertama beranda tanpa menggulir (HP sentuh + WebKit iPhone): tidak boleh ada yang tersembunyi.
  const hiddenInView = () =>
    [...document.querySelectorAll("[data-reveal]")].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < innerHeight && rect.bottom > 0 && Number(getComputedStyle(el).opacity) < 0.99;
    }).length;
  const firstScreen = async (context, name) => {
    await context.addCookies([
      { name: "lbqueen_customer", value: await createSession(1, "customer", 900), url: base },
    ]);
    await context.addInitScript(
      (cart) => localStorage.setItem("lbqueen_cart", JSON.stringify(cart)),
      CART,
    );
    const page = await context.newPage();
    await page.goto(base + "/");
    await page.getByRole("navigation", { name: "Menu layanan" }).waitFor();
    await page.waitForTimeout(1200);
    const hidden = await page.evaluate(hiddenInView);
    if (hidden) failures.push(`${name}: ${hidden} elemen di layar masih tersembunyi`);
    const file = path.join(shotDir, `${name}.png`);
    await page.screenshot({ path: file });
    shots.push(file);
    await context.close();
  };
  for (const width of [360, 390, 430])
    await firstScreen(
      await watch(
        await newContext(browser, {
          viewport: { width, height: 844 },
          isMobile: true,
          hasTouch: true,
          deviceScaleFactor: 2,
        }),
      ),
      `21-beranda-layar-awal-${width}`,
    );
  const webkitBrowser = await webkit.launch();
  try {
    await firstScreen(
      await newContext(webkitBrowser, { ...devices["iPhone 14"] }),
      "21-beranda-layar-awal-webkit-iphone",
    );
    if (theme === "dark") {
      const context = await newContext(webkitBrowser, { ...devices["iPhone 14"] });
      await context.addCookies([
        { name: "lbqueen_customer", value: await createSession(1, "customer", 900), url: base },
      ]);
      const page = await context.newPage();
      await page.goto(base + "/profile");
      await page.getByRole("radiogroup", { name: "Tampilan" }).waitFor();
      await page.waitForTimeout(1000);
      const file = path.join(shotDir, "23-profil-webkit-iphone.png");
      await page.screenshot({ path: file });
      shots.push(file);
      await context.close();
    }
  } finally {
    await webkitBrowser.close();
  }

  const regularContext = await watch(await newContext(browser, { viewport: MOBILE }));
  await regularContext.addCookies([
    { name: "lbqueen_customer", value: await createSession(2, "customer", 900), url: base },
  ]);
  const regular = await regularContext.newPage();
  await both(regular, "14-beranda-akun-reguler", "/", home);
  await both(regular, "15-membership-akun-reguler", "/membership", (p) =>
    p.getByRole("heading", { name: /Nikmati/ }).waitFor(),
  );

  // Nota tetap terang saat dicetak, juga dengan preferensi gelap.
  await visit(member, "/invoice/1");
  await member.emulateMedia({ media: "print" });
  await shoot(member, "13-nota-cetak", MOBILE);
  await member.emulateMedia({ media: null });

  // Kelas <html> saat <body> pertama kali diurai (sebelum paint) harus sudah sesuai preferensi.
  for (const [pref, scheme, expectDark] of [
    ["dark", "light", true],
    ["light", "dark", false],
    [null, "dark", true],
    [null, "light", false],
  ]) {
    const context = await browser.newContext({ viewport: MOBILE, colorScheme: scheme });
    await context.addInitScript((value) => {
      if (value) localStorage.setItem("lbq-theme", value);
      else localStorage.removeItem("lbq-theme");
      new MutationObserver((_, observer) => {
        if (!document.body) return;
        window.__firstPaintDark = document.documentElement.classList.contains("dark");
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    }, pref);
    const page = await context.newPage();
    await page.goto(base + "/login");
    const first = await page.evaluate(() => window.__firstPaintDark);
    if (first !== expectDark)
      failures.push(`tema awal salah (pref ${pref}, sistem ${scheme}): dark=${first}`);
    await context.close();
  }
  }

  console.log(`Saved ${shots.length} screenshots to ${outDir}`);
  for (const mode of ["light", "dark"]) {
    const list = axeResults[mode];
    console.log(`axe ${mode}: ${list.length} pelanggaran, ${list.reduce((n, v) => n + v.nodes, 0)} node`);
    for (const v of list.slice(0, 40)) console.log(`  ${v.name} ${v.id} (${v.nodes}) ${v.sample.join(" | ")}`);
    if (list.length) failures.push(`${mode}: ${list.length} pelanggaran aksesibilitas`);
  }
  console.log(`Pelanggaran CSP: ${cspViolations.length}, error konsol: ${consoleErrors.length}`);
  for (const line of [...cspViolations, ...consoleErrors].slice(0, 20)) console.log(`  ${line}`);
  if (cspViolations.length) failures.push(`${cspViolations.length} pelanggaran CSP`);
  if (failures.length) {
    console.error(["Gagal:", ...failures].join("\n"));
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  server.kill();
  await new Promise((resolve) => mock.close(resolve));
}
