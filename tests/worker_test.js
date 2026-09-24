import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = {
  ALLOWED_ORIGIN: "https://zdetor54.github.io",
  REGISTRATION_URL: "https://zdetor54.github.io/wcnh2027/registration.html",
  STRIPE_SECRET_KEY: "test-only-not-a-real-key",
};
const valid = { tierId: "faculty", addonIds: [] };
function request(value = valid, options = {}) {
  return new Request("https://worker.example/create-checkout-session", {
    method: "POST",
    headers: { Origin: env.ALLOWED_ORIGIN, "Content-Type": "application/json" },
    body: JSON.stringify(value),
    ...options,
  });
}

Deno.test("all 18 combinations charge server prices, with EUR line items and no surcharge", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const [tierId, base] of [["faculty", 71000], ["industry", 99000], ["student", 56000]]) {
      for (const gala of [false, true]) {
        for (const trips of [0, 1, 2]) {
          const addonIds = gala ? ["gala_dinner"] : [];
          if (trips) addonIds.push(trips === 1 ? "hotel_transfer_one_way" : "hotel_transfer_return");
          let calls = 0;
          globalThis.fetch = async (url, options) => {
            calls++;
            assert.equal(url, "https://api.stripe.com/v1/checkout/sessions");
            assert.equal(options.headers.Authorization, `Bearer ${env.STRIPE_SECRET_KEY}`);
            const params = options.body;
            assert.equal(params.get("mode"), "payment");
            assert.equal(params.get("success_url"), `${env.REGISTRATION_URL}?checkout=success`);
            const amounts = [[base, 1], ...(gala ? [[5000, 1]] : []), ...(trips ? [[2700, trips]] : [])];
            // Only mode, success URL and four required fields per line item.
            assert.equal([...params.keys()].length, 2 + amounts.length * 4);
            amounts.forEach(([amount, quantity], index) => {
              assert.equal(params.get(`line_items[${index}][price_data][currency]`), "eur");
              assert.equal(Number(params.get(`line_items[${index}][price_data][unit_amount]`)), amount);
              assert.equal(Number(params.get(`line_items[${index}][quantity]`)), quantity);
              assert.ok(params.get(`line_items[${index}][price_data][product_data][name]`));
            });
            assert.equal(params.has(`line_items[${amounts.length}][quantity]`), false);
            return Response.json({ url: "https://checkout.stripe.com/c/pay/test_session" });
          };
          const response = await worker.fetch(request({ tierId, addonIds }), env);
          assert.equal(response.status, 200);
          assert.deepEqual(await response.json(), { url: "https://checkout.stripe.com/c/pay/test_session" });
          assert.equal(calls, 1);
          assert.equal(response.headers.get("Access-Control-Allow-Origin"), env.ALLOWED_ORIGIN);
          assert.equal(response.headers.get("Cache-Control"), "no-store");
        }
      }
    }
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("rejects invalid orders and client monetary fields before contacting Stripe", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Stripe must not be called"); };
  try {
    const invalid = [null, [], {}, { addonIds: ["gala_dinner"] }, { ...valid, tierId: "unknown" },
      { ...valid, tierId: "__proto__" }, { ...valid, tierId: "constructor" }, { ...valid, tierId: ["faculty"] },
      { tierId: "faculty" }, { ...valid, addonIds: "gala_dinner" }, { ...valid, addonIds: [null] },
      { ...valid, addonIds: ["unknown"] }, { ...valid, addonIds: ["gala_dinner", "gala_dinner"] },
      { ...valid, addonIds: ["hotel_transfer_one_way", "hotel_transfer_return"] },
      { ...valid, addonIds: ["gala_dinner", "hotel_transfer_one_way", "hotel_transfer_return"] },
      { ...valid, total: 1 }, { ...valid, price: 1 }, { ...valid, quantity: 0 },
      { ...valid, success_url: "https://evil.example" }];
    for (const value of invalid) assert.equal((await worker.fetch(request(value), env)).status, 400);
    for (const body of ["{broken", "x".repeat(2049), ""]) {
      assert.equal((await worker.fetch(request(valid, { body }), env)).status, 400);
    }
  } finally { globalThis.fetch = originalFetch; }
});

Deno.test("CORS, preflight, method, path and content type checks", async () => {
  const preflight = await worker.fetch(request(valid, {
    method: "OPTIONS", body: undefined,
    headers: { Origin: env.ALLOWED_ORIGIN, "Access-Control-Request-Method": "POST" },
  }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Headers"), "Content-Type");
  assert.equal(preflight.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  for (const origin of ["https://evil.example", "null", "https://zdetor54.github.io.evil.example", ""]) {
    const response = await worker.fetch(request(valid, { headers: { Origin: origin, "Content-Type": "application/json" } }), env);
    assert.equal(response.status, 403);
    assert.equal(response.headers.has("Access-Control-Allow-Origin"), false);
  }
  assert.equal((await worker.fetch(request(valid, { method: "GET", body: undefined }), env)).status, 405);
  assert.equal((await worker.fetch(request(valid, { headers: { Origin: env.ALLOWED_ORIGIN, "Content-Type": "text/plain" } }), env)).status, 415);
  assert.equal((await worker.fetch(new Request("https://worker.example/no-route"), env)).status, 404);
  assert.equal((await worker.fetch(request(), { ...env, STRIPE_SECRET_KEY: "" })).status, 503);
});

Deno.test("Stripe failures and invalid checkout URLs produce safe errors", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const mock of [
      () => Response.json({ error: "private upstream information" }, { status: 401 }),
      () => { throw new Error("secret network detail"); },
      () => new Response("not JSON"),
      () => Response.json({ url: "https://evil.example" }),
      () => Response.json({ url: "http://checkout.stripe.com" }),
      () => Response.json({ url: null }),
    ]) {
      globalThis.fetch = mock;
      const response = await worker.fetch(request(), env);
      assert.equal(response.status, 502);
      assert.deepEqual(await response.json(), { error: "Unable to start checkout. Please try again shortly." });
    }
  } finally { globalThis.fetch = originalFetch; }
});
