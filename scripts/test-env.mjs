import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { normalizeEnvValue } from "../src/lib/env.ts";
import { createSession, verifySession } from "../src/lib/session.ts";

const url = "https://example.supabase.co";
assert.throws(() => createClient(JSON.stringify(url), "test-public-key"), /Invalid supabaseUrl/);
for (const input of [url, `"${url}"`, `'${url}'`, ` \r\n"${url}"\r\n `]) {
  const client = createClient(normalizeEnvValue(input), normalizeEnvValue(' "test-public-key" '), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  assert.equal(client.supabaseUrl, url);
}
assert.equal(normalizeEnvValue(undefined), "");
assert.equal(normalizeEnvValue('""'), "");
assert.equal(normalizeEnvValue("not-a-url"), "not-a-url");
assert.throws(
  () => createClient(normalizeEnvValue("not-a-url"), "test-public-key"),
  /Invalid supabaseUrl/,
);
const previous = process.env.SESSION_SECRET;
try {
  const secret = "test-only-secret-with-at-least-32-characters";
  process.env.SESSION_SECRET = `"${secret}"`;
  const session = await createSession(1, "admin", 60, "superadmin");
  process.env.SESSION_SECRET = secret;
  assert.equal((await verifySession(session, "admin")).role, "superadmin");
} finally {
  if (previous === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = previous;
}
console.log(
  "PASS: reproduced quoted Supabase URL failure; normalized URL/key initialize successfully; quoted/unquoted session secret signs consistently; invalid URLs remain rejected.",
);
