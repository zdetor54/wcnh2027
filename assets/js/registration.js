(() => {
  // Set this to the deployed Worker URL; use http://localhost:8787 for local testing.
  const CHECKOUT_ENDPOINT = "https://REPLACE_WITH_YOUR_WORKER.workers.dev/create-checkout-session";

  // Display estimates only. The Worker independently validates IDs and sets prices.
  // Update this table and the static price labels in January 2027 along with the Worker.
  const DISPLAY_PRICES = {
    faculty: { label: "Faculty", cents: 71000 },
    industry: { label: "Industry", cents: 99000 },
    student: { label: "Student", cents: 56000 },
    gala_dinner: { label: "Gala dinner", cents: 5000 },
    hotel_transfer_one_way: { label: "Transfer to hotel — one-way", cents: 2700 },
    hotel_transfer_return: { label: "Transfer to hotel — return (2 trips)", cents: 5400 },
  };
  const formatEuro = (cents) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
  const storageKey = "wcnh2027-registration-selections";
  const form = document.getElementById("registration-form");
  const submit = document.getElementById("checkout-submit");
  const total = document.getElementById("registration-total");
  const breakdown = document.getElementById("registration-breakdown");
  const error = document.getElementById("checkout-error");
  const status = document.getElementById("checkout-status");
  const returnNotice = document.getElementById("checkout-return");
  const fieldsets = [document.getElementById("tier-options"), document.getElementById("addon-options")];
  let pending = false;

  const selections = () => {
    const tierId = form.querySelector('[name="tierId"]:checked')?.value || "";
    const transfer = form.querySelector('[name="transferId"]:checked')?.value || "none";
    const addonIds = [];
    if (document.getElementById("gala-dinner").checked) addonIds.push("gala_dinner");
    if (transfer !== "none") addonIds.push(transfer);
    return { tierId, addonIds };
  };

  function updateSummary() {
    const choice = selections();
    const ids = [choice.tierId, ...choice.addonIds].filter(Boolean);
    breakdown.replaceChildren();
    if (!choice.tierId) {
      const note = document.createElement("li");
      note.textContent = "Choose a registration tier to complete your total.";
      breakdown.append(note);
    }
    for (const id of ids) {
      const item = document.createElement("li");
      item.textContent = `${DISPLAY_PRICES[id].label}: ${formatEuro(DISPLAY_PRICES[id].cents)}`;
      breakdown.append(item);
    }
    total.textContent = formatEuro(ids.reduce((sum, id) => sum + DISPLAY_PRICES[id].cents, 0));
    submit.disabled = pending || !choice.tierId;
    status.hidden = Boolean(choice.tierId) && !pending;
    try { sessionStorage.setItem(storageKey, JSON.stringify(choice)); } catch { /* Storage may be disabled. */ }
  }

  // Restore selections after Stripe cancellation or a browser back navigation.
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.addonIds)) {
      for (const radio of form.querySelectorAll('[name="tierId"]')) radio.checked = radio.value === saved.tierId;
      document.getElementById("gala-dinner").checked = saved.addonIds.includes("gala_dinner");
      const transfer = saved.addonIds.includes("hotel_transfer_return") ? "hotel_transfer_return"
        : saved.addonIds.includes("hotel_transfer_one_way") ? "hotel_transfer_one_way" : "none";
      for (const radio of form.querySelectorAll('[name="transferId"]')) radio.checked = radio.value === transfer;
    }
  } catch { /* A fresh form remains usable without storage. */ }

  document.querySelectorAll("[data-price-id]").forEach((label) => {
    label.textContent = formatEuro(DISPLAY_PRICES[label.dataset.priceId].cents);
  });
  updateSummary();
  const outcome = new URLSearchParams(window.location.search).get("checkout");
  if (outcome === "success" || outcome === "cancelled") {
    returnNotice.hidden = false;
    // A query string is not proof of payment. Organisers verify payment in Stripe.
    returnNotice.textContent = outcome === "success"
      ? "Thank you for returning from checkout. Check your payment confirmation before making another payment. If you are unsure whether payment completed, contact info@wcnh2027.com."
      : "You returned without completing this checkout. Your selections are still available below; you can review them and try again.";
    returnNotice.focus();
  }
  form.addEventListener("change", () => { error.hidden = true; updateSummary(); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    error.hidden = true;
    if (CHECKOUT_ENDPOINT.includes("REPLACE_WITH_YOUR_WORKER")) {
      error.textContent = "Online payment is not available yet. Please contact info@wcnh2027.com for assistance.";
      error.hidden = false;
      error.focus();
      return;
    }
    const payload = selections();
    pending = true;
    submit.disabled = true;
    fieldsets.forEach((fieldset) => { fieldset.disabled = true; });
    form.setAttribute("aria-busy", "true");
    status.textContent = "Opening secure checkout…";
    status.hidden = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: "omit",
      });
      if (!response.ok) throw new Error("Checkout request failed.");
      const result = await response.json();
      const url = new URL(result.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") throw new Error("Invalid checkout URL.");
      window.location.assign(url.href);
    } catch {
      error.textContent = "We could not open checkout. Your selections have been kept. Please try again, or contact info@wcnh2027.com.";
      error.hidden = false;
      error.focus();
      status.textContent = "Ready to try again.";
      pending = false;
      fieldsets.forEach((fieldset) => { fieldset.disabled = false; });
      form.removeAttribute("aria-busy");
      updateSummary();
    } finally {
      window.clearTimeout(timeout);
    }
  });
  window.addEventListener("pageshow", () => {
    pending = false;
    fieldsets.forEach((fieldset) => { fieldset.disabled = false; });
    form.removeAttribute("aria-busy");
    status.textContent = "Choose a tier, then continue to secure payment.";
    updateSummary();
  });
})();
