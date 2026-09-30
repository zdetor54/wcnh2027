(() => {
  // Registration and optional add-on prices in EUR cents.
  const DISPLAY_PRICES = {
    faculty: { label: "Faculty", cents: 71000 },
    industry: { label: "Industry", cents: 99000 },
    student: { label: "Student", cents: 56000 },
    gala_dinner: { label: "Gala dinner", cents: 5000 },
    hotel_transfer_one_way: { label: "Airport transfer — one-way", cents: 2700 },
    hotel_transfer_return: { label: "Airport transfer — return (2 trips)", cents: 5400 },
  };
  const formatEuro = (cents) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(cents / 100);
  const form = document.getElementById("registration-form");
  const total = document.getElementById("registration-total");
  const breakdown = document.getElementById("registration-breakdown");
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
  }

  function resetSelections() {
    form.reset();
    updateSummary();
  }

  document.querySelectorAll("[data-price-id]").forEach((label) => {
    label.textContent = formatEuro(DISPLAY_PRICES[label.dataset.priceId].cents);
  });
  resetSelections();
  form.addEventListener("change", updateSummary);
  form.addEventListener("submit", (event) => event.preventDefault());
  window.addEventListener("pageshow", resetSelections);
})();
