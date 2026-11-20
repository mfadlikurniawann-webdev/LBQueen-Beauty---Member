import http from "node:http";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
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
const mock = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  upstream.push({
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    method: request.method,
  });
  const table = url.pathname.split("/").at(-1);
  let data = [];
  if (table === "consume_login_attempt") data = true;
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
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file });
  await page.setViewportSize(viewport);
  shots.push(file);
}
async function visit(page, url, ready, viewport = MOBILE) {
  await page.setViewportSize(viewport);
  await page.goto(base + url);
  if (ready) await ready(page);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
}
const failures = [];
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

  const guest = await (await browser.newContext({ viewport: MOBILE })).newPage();
  await both(guest, "01-selamat-datang", "/", (p) =>
    p.getByRole("button", { name: "Masuk", exact: true }).waitFor(),
  );
  await both(guest, "02-masuk", "/login");
  await both(guest, "03-daftar", "/register");

  const memberContext = await browser.newContext({ viewport: MOBILE });
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
    p.getByRole("button", { name: /Konfirmasi/ }).waitFor(),
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

  const regularContext = await browser.newContext({ viewport: MOBILE });
  await regularContext.addCookies([
    { name: "lbqueen_customer", value: await createSession(2, "customer", 900), url: base },
  ]);
  const regular = await regularContext.newPage();
  await both(regular, "14-beranda-akun-reguler", "/", home);
  await both(regular, "15-membership-akun-reguler", "/membership", (p) =>
    p.getByRole("heading", { name: /Nikmati/ }).waitFor(),
  );

  console.log(`Saved ${shots.length} screenshots to ${outDir}`);
  if (failures.length) {
    console.error(["Gagal:", ...failures].join("\n"));
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  server.kill();
  await new Promise((resolve) => mock.close(resolve));
}
