import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { createSession } from '../src/lib/session.ts';

const customers = [{ id: 1, name: 'QA Customer', phone: '080000000001', points: 100, is_member: true, membership_type: 'Silver', username: 'qa_customer', join_date: '2026-11-17', password_hash: 'private-hash', password_plain: 'private-password' }, { id: 2, name: 'Other Customer', phone: '080000000002', points: 0, is_member: false, membership_type: 'Regular', username: 'other_customer', join_date: '2026-11-17' }];
const products = [{ id: 1, name: 'Facial Care', product_code: 'T001', type: 'Treatment Care & Beauty', purchase_price: 0, selling_price: 150000, stock: 0, unit: 'Sesi', variants: [], image_url: '/banner_facial.png' }, { id: 2, name: 'Daily Cleanser', product_code: 'P001', type: 'Product Care & Beauty', purchase_price: 50000, selling_price: 85000, stock: 10, unit: 'Pcs', variants: [], image_url: null }];
const orders = [{ id: 1, customer_id: 1, customer_name: 'QA Customer', product_name: 'Daily Cleanser Rp 85.000 (x1)', qty: 1, price: 85000, total_price: 85000, status: 'pending', product_id: 2, ordered_at: new Date().toISOString() }, { id: 2, customer_id: 2, customer_name: 'Other Customer', product_name: 'Private order', status: 'pending', ordered_at: new Date().toISOString() }];
products.push(...Array.from({ length: 58 }, (_, index) => ({ ...products[1], id: index + 3, name: `QA Product ${String(index + 3).padStart(3, '0')}` })));
const upstream = [];
const mock = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  upstream.push({ path: url.pathname, query: Object.fromEntries(url.searchParams), method: request.method });
  const table = url.pathname.split('/').at(-1);
  let data = [];
  if (table === 'consume_login_attempt') data = true;
  else if (table === 'customers') data = customers;
  else if (table === 'products') data = products;
  else if (table === 'customer_orders') data = orders;
  if (Array.isArray(data)) {
    for (const field of ['id', 'username', 'customer_id', 'status']) {
      const condition = url.searchParams.get(field);
      if (condition?.startsWith('eq.')) data = data.filter(row => String(row[field]) === condition.slice(3));
    }
    const type = url.searchParams.get('type');
    if (type?.startsWith('eq.')) data = data.filter(row => row.type === type.slice(3));
    if (table === 'products' && url.searchParams.get('select')?.includes('promotions:vouchers')) {
      data = data.map(({ purchase_price, stock, unit, ...row }) => ({ ...row, variants: [], promotions: row.id === 1 ? [{ product_id: 1, type: 'nominal', discount_amount: 10000, min_transaction: 0 }] : [] }));
      if (url.searchParams.has('promotions.min_transaction')) data = data.filter(row => row.promotions.length);
    }
    const offset = Number(url.searchParams.get('offset') || 0);
    if (url.searchParams.get('limit')) data = data.slice(offset, offset + Number(url.searchParams.get('limit')));
  }
  const single = request.headers.accept?.includes('application/vnd.pgrst.object+json');
  if (single && Array.isArray(data)) data = data[0] || null;
  response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Range': `0-0/${Array.isArray(data) ? data.length : 1}` });
  response.end(request.method === 'HEAD' ? undefined : JSON.stringify(data));
});
await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
const apiPort = mock.address().port;
const appPort = 3110;
const base = `http://127.0.0.1:${appPort}`;
process.env.SESSION_SECRET = 'qa-only-member-secret-with-more-than-32-characters';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(appPort), '--hostname', '127.0.0.1'], { env: { ...process.env, SUPABASE_SERVICE_ROLE_KEY: 'qa-service-key', SUPABASE_URL: `http://127.0.0.1:${apiPort}`, NODE_ENV: 'production' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk; });
server.stderr.on('data', chunk => { serverOutput += chunk; });
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/login`)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
    if (i === 99) throw new Error(`Server not ready: ${serverOutput.slice(-2000)}`);
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const anonymous = await browser.newContext();
  const errors = [];
  await mkdir('.scratch/qa', { recursive: true });

  assert.equal((await anonymous.request.get(`${base}/api/database/customers`)).status(), 401);
  assert.equal((await anonymous.request.get(`${base}/api/database/users`)).status(), 404, 'Admin table exposed by member app');
  assert.equal((await anonymous.request.get(`${base}/api/database/transactions`)).status(), 404, 'Transactions exposed by member app');
  assert.equal((await anonymous.request.get(`${base}/api/database/rpc/report_summary`)).status(), 404, 'Admin RPC exposed by member app');
  assert.equal((await anonymous.request.get(`${base}/pos`)).status(), 404, 'POS route present in member app');
  const legacy = await anonymous.request.get(`${base}/customer-portal/orders?tab=1`, { maxRedirects: 0 });
  assert.equal(legacy.status(), 308);
  const legacyTarget = new URL(legacy.headers().location, base);
  assert.equal(legacyTarget.pathname + legacyTarget.search, '/orders?tab=1');
  assert.equal((await anonymous.request.get(`${base}/orders`, { maxRedirects: 0 })).status(), 307, 'Orders open without login');

  const catalogResponse = await anonymous.request.get(`${base}/api/catalog?page=1`);
  assert.match(catalogResponse.headers()['cache-control'], /no-store/);
  const catalogFirst = await catalogResponse.json();
  const catalogSecond = await (await anonymous.request.get(`${base}/api/catalog?page=2`)).json();
  assert.equal(catalogFirst.products.length, 24);
  assert.equal(catalogSecond.products.length, 24);
  assert(!catalogFirst.products.some(first => catalogSecond.products.some(second => first.id === second.id)), 'Catalog pagination repeats rows');
  const catalogLast = await (await anonymous.request.get(`${base}/api/catalog?page=3`)).json();
  assert.equal(catalogLast.products.length, 12);
  assert.equal(catalogLast.hasMore, false);
  assert(!catalogFirst.products.some(product => 'purchase_price' in product), 'Private catalog columns exposed');
  const catalogPromo = await (await anonymous.request.get(`${base}/api/catalog?category=promo`)).json();
  assert.deepEqual(catalogPromo.products.map(product => product.id), [1]);
  assert.equal(catalogPromo.products[0].voucher_discount, 10000);
  assert.equal((await anonymous.request.get(`${base}/api/catalog?page=-1`)).status(), 400);
  assert.equal((await anonymous.request.get(`${base}/api/catalog?category=Barang%20Klinik`)).status(), 400);
  const rawProducts = await (await anonymous.request.get(`${base}/api/database/products?select=*`)).json();
  assert(!JSON.stringify(rawProducts).includes('purchase_price'), 'Purchase price exposed through gateway');

  const customerContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await customerContext.addCookies([{ name: 'lbqueen_customer', value: await createSession(1, 'customer', 60), url: base }]);
  const response = await customerContext.request.get(`${base}/api/database/customer_orders?select=*&customer_id=eq.2`);
  assert.equal(response.status(), 200);
  assert((await response.json()).every(order => order.customer_id === 1), 'Customer accessed another account');
  const profile = await (await customerContext.request.get(`${base}/api/database/customers?select=*`)).json();
  assert(!JSON.stringify(profile).includes('private-password') && !JSON.stringify(profile).includes('private-hash'), 'Credentials leaked through API');
  assert.equal((await customerContext.request.get(`${base}/api/database/products?select=*,customer_orders(*)`)).status(), 400);
  assert.equal((await customerContext.request.get(`${base}/api/database/products?type=eq.Barang%20Klinik`)).status(), 400);
  assert.equal((await customerContext.request.patch(`${base}/api/database/customers?id=eq.1`, { headers: { Origin: base }, data: { points: 1000000 } })).status(), 405);
  const adminContext = await browser.newContext();
  await adminContext.addCookies([{ name: 'lbqueen_admin', value: await createSession(1, 'admin', 60, 'superadmin'), url: base }]);
  assert.equal((await adminContext.request.get(`${base}/api/database/customer_orders`)).status(), 401, 'Admin session grants member data access');

  const customerPage = await customerContext.newPage();
  customerPage.on('pageerror', error => errors.push(error.message));
  await customerPage.addInitScript(customer => localStorage.setItem('lbqueen_customer', JSON.stringify(customer)), customers[0]);
  await customerPage.goto(base + '/');
  await customerPage.getByPlaceholder('Cari treatment atau produk...').waitFor();
  await customerPage.waitForTimeout(500);
  assert.equal(await customerPage.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Portal overflows mobile');
  await customerPage.screenshot({ path: '.scratch/qa/member-home-mobile.png', fullPage: true });
  await customerPage.goto(base + '/orders');
  await customerPage.waitForTimeout(500);
  assert(!await customerPage.getByText('Private order', { exact: true }).count(), 'Other customer order displayed');
  await customerPage.screenshot({ path: '.scratch/qa/member-orders-mobile.png', fullPage: true });
  assert.deepEqual(errors, [], 'Browser runtime error');
  assert(upstream.some(call => call.path.endsWith('/customer_orders') && call.query.customer_id === 'eq.1'));
  console.log('PASS: member routes at root, legacy /customer-portal redirect, admin tables/RPC/routes absent, catalog pagination/promo/private columns, own-customer filtering, write rejection, admin session rejected, mobile layout, no runtime errors. Database responses mocked.');
} finally {
  await browser?.close();
  server.kill();
  await new Promise(resolve => mock.close(resolve));
}
