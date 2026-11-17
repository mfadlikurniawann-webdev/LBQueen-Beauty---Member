import assert from "node:assert/strict";
import { createSession, verifySession } from "../src/lib/session.ts";

process.env.SESSION_SECRET = "test-only-secret-32-characters-minimum-long";
const token = await createSession(1, "admin", 60);
assert.equal((await verifySession(token, "admin"))?.id, 1);
assert.equal(await verifySession(token, "customer"), null);
assert.equal(await verifySession(undefined, "admin"), null);
assert.equal(await verifySession(JSON.stringify({ id: 1, role: "superadmin" }), "admin"), null);
const [payload, signature] = token.split(".");
const forged = Buffer.from(
  JSON.stringify({ id: 999, kind: "admin", expires: Date.now() + 60000 }),
).toString("base64url");
assert.equal(await verifySession(`${forged}.${signature}`, "admin"), null);
assert.equal(await verifySession(`${payload}.invalid`, "admin"), null);
assert.equal(await verifySession(`${token}.extra`, "admin"), null);
assert.equal(await verifySession(await createSession(1, "admin", -1), "admin"), null);
assert.equal(await verifySession(await createSession(-1, "admin", 60), "admin"), null);
console.log(
  "Session checks passed: valid, role, missing, legacy cookie, tampered payload/signature, malformed, expired, invalid ID.",
);
