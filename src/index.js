// Authoritative early-bird prices, in euro cents. Update manually in January 2027.
const TIERS = Object.freeze({
  faculty: { name: "WCNH 2027 — Faculty", amount: 71000 },
  industry: { name: "WCNH 2027 — Industry", amount: 99000 },
  student: { name: "WCNH 2027 — Student", amount: 56000 },
});
const GALA_PRICE = 5000;
const TRANSFER_PRICE = 2700;
const ADDON_IDS = ["gala_dinner", "hotel_transfer_one_way", "hotel_transfer_return"];
const MAX_BODY_BYTES = 2048;

function validateSelections(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.keys(value).some((key) => !["tierId", "addonIds"].includes(key))
    || typeof value.tierId !== "string" || !Object.hasOwn(TIERS, value.tierId)
    || !Array.isArray(value.addonIds) || value.addonIds.length > 2
    || value.addonIds.some((id) => !ADDON_IDS.includes(id))
    || new Set(value.addonIds).size !== value.addonIds.length
    || (value.addonIds.includes("hotel_transfer_one_way") && value.addonIds.includes("hotel_transfer_return"))) {
    throw new Error("Choose one registration tier and valid attendee add-ons.");
  }
  return value;
}

export function buildCheckout(selections, registrationUrl) {
  const { tierId, addonIds } = selections;
  const tier = TIERS[tierId];
  const items = [{ ...tier, quantity: 1 }];
  if (addonIds.includes("gala_dinner")) {
    items.push({ name: "Gala dinner", amount: GALA_PRICE, quantity: 1 });
  }
  const trips = addonIds.includes("hotel_transfer_return") ? 2
    : addonIds.includes("hotel_transfer_one_way") ? 1 : 0;
  if (trips) {
    items.push({ name: "Transfer to hotel, per trip", amount: TRANSFER_PRICE, quantity: trips });
  }

  const successUrl = new URL(registrationUrl);
  successUrl.searchParams.set("checkout", "success");
  const params = new URLSearchParams({
    mode: "payment",
    success_url: successUrl.href,
  });
  items.forEach((item, index) => {
    params.set(`line_items[${index}][price_data][currency]`, "eur");
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.amount));
    params.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
  });
  return params;
}

async function readSelections(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request body.");
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("Request too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return validateSelections(JSON.parse(new TextDecoder().decode(bytes)));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const headers = { "Cache-Control": "no-store", Vary: "Origin" };
    if (origin && origin === env.ALLOWED_ORIGIN) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
    const json = (value, status = 200, extra = {}) => Response.json(value, { status, headers: { ...headers, ...extra } });

    if (new URL(request.url).pathname !== "/create-checkout-session") {
      return json({ error: "Not found." }, 404);
    }
    if (!origin || origin !== env.ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed." }, 403);
    }
    if (request.method === "OPTIONS") {
      if (request.headers.get("Access-Control-Request-Method") !== "POST") {
        return json({ error: "Method not allowed." }, 405);
      }
      return new Response(null, { status: 204, headers: {
        ...headers,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "600",
      } });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405, { Allow: "POST, OPTIONS" });
    }
    if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return json({ error: "Send selections as JSON." }, 415);
    }

    let selections;
    try {
      selections = await readSelections(request);
    } catch {
      return json({ error: "Choose one registration tier and valid attendee add-ons." }, 400);
    }
    if (!env.STRIPE_SECRET_KEY || !env.REGISTRATION_URL) {
      return json({ error: "Checkout is temporarily unavailable. Please contact info@wcnh2027.com." }, 503);
    }

    try {
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: buildCheckout(selections, env.REGISTRATION_URL),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        await response.body?.cancel();
        return json({ error: "Unable to start checkout. Please try again shortly." }, 502);
      }
      const session = await response.json();
      const checkoutUrl = new URL(session.url);
      if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") {
        throw new Error("Unexpected checkout URL.");
      }
      return json({ url: checkoutUrl.href });
    } catch {
      return json({ error: "Unable to start checkout. Please try again shortly." }, 502);
    }
  },
};
