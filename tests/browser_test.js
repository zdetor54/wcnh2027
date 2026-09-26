// Optional real-browser checks. Uses an installed Chrome; no live Stripe requests.
// deno test -A tests/browser_test.js
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { chromium } from "npm:playwright@1.58.2";

Deno.test({
  name: "registration browser totals, payload, recovery, return states and mobile layout",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const executablePath = Deno.env.get("CHROME_PATH") || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    const browser = await chromium.launch({ executablePath, headless: true });
    try {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(20000);
      const site = "https://zdetor54.github.io/wcnh2027/";
      const endpoint = "https://test-worker.example/create-checkout-session";
      const root = new URL("../", import.meta.url);
      let configured = false;
      let apiMode = "error";
      let requests = 0;
      let sent;
      let releasePending;
      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));
      // Fonts/icons are cosmetic and should not hold up functional checks.
      await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
      await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
      await page.route("https://cdn.jsdelivr.net/npm/bootstrap-icons@**", (route) => route.abort());
      // Fetch Bootstrap once via curl, which respects the host network proxy.
      for (const asset of ["css/bootstrap.min.css", "js/bootstrap.bundle.min.js"]) {
        const url = `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/${asset}`;
        const download = await new Deno.Command("curl", {
          args: ["--fail", "--silent", "--show-error", "--max-time", "20", url],
        }).output();
        assert.equal(download.code, 0, `Unable to retrieve ${asset}`);
        await page.route(url, (route) => route.fulfill({ body: new TextDecoder().decode(download.stdout), contentType: asset.endsWith("css") ? "text/css" : "text/javascript" }));
      }
      await page.route(`${site}**`, async (route) => {
        const pathname = new URL(route.request().url()).pathname.replace("/wcnh2027/", "");
        const file = new URL(pathname, root);
        let body = Buffer.from(await Deno.readFile(file));
        const extension = pathname.split(".").pop();
        if (pathname === "assets/js/registration.js" && configured) {
          body = body.toString("utf8").replace(
            "https://REPLACE_WITH_YOUR_WORKER.workers.dev/create-checkout-session", endpoint,
          );
        }
        await route.fulfill({ body, contentType: { html: "text/html", js: "text/javascript", css: "text/css", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg" }[extension] || "application/octet-stream" });
      });
      await page.route("https://checkout.stripe.com/**", (route) => route.fulfill({ body: "Mock Stripe Checkout", contentType: "text/html" }));
      await page.route(endpoint, async (route) => {
        requests++;
        sent = route.request().postDataJSON();
        if (apiMode === "pending") await new Promise((resolve) => { releasePending = resolve; });
        await route.fulfill({
          status: apiMode === "success" ? 200 : 502,
          contentType: "application/json",
          body: JSON.stringify(apiMode === "success" ? { url: "https://checkout.stripe.com/c/pay/test_session" } : { error: "Test failure" }),
        });
      });
      await page.goto(`${site}registration.html`, { waitUntil: "domcontentloaded" });
      assert.equal(await page.locator("#checkout-submit").isDisabled(), true);
      for (const [tier, price] of [["faculty", 710], ["industry", 990], ["student", 560]]) {
        for (const gala of [false, true]) {
          for (const [transfer, extra] of [["none", 0], ["one-way", 27], ["return", 54]]) {
            await page.locator(`#tier-${tier}`).check();
            await page.locator("#gala-dinner").setChecked(gala);
            await page.locator(`#transfer-${transfer}`).check();
            const expected = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(price + (gala ? 50 : 0) + extra);
            assert.equal(await page.locator("#registration-total").textContent(), expected);
          }
        }
      }
      await page.locator("#checkout-submit").click();
      await page.locator("#checkout-preview").waitFor({ state: "visible" });
      assert.match(await page.locator("#checkout-preview").textContent(), /56000/);
      assert.match(await page.locator("#checkout-preview").textContent(), /line_items%5B0%5D/);
      assert.equal(requests, 0);

      configured = true;
      await page.reload({ waitUntil: "domcontentloaded" });
      assert.equal(await page.locator("#registration-total").textContent(), "€664.00");
      apiMode = "pending";
      await page.locator("#checkout-submit").click();
      await page.waitForFunction(() => document.getElementById("registration-form").getAttribute("aria-busy") === "true");
      assert.equal(await page.locator("#checkout-submit").isDisabled(), true);
      // Even synthetic duplicate submission must not create another session.
      await page.locator("#registration-form").dispatchEvent("submit");
      await page.waitForRequest(() => false, { timeout: 100 }).catch(() => {});
      assert.equal(requests, 1);
      assert.deepEqual(sent, { tierId: "student", addonIds: ["gala_dinner", "hotel_transfer_return"] });
      apiMode = "error";
      releasePending();
      await page.locator("#checkout-error").waitFor({ state: "visible" });
      assert.equal(await page.locator("#checkout-submit").isEnabled(), true);
      assert.equal(await page.locator("#tier-student").isEnabled(), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), "checkout-error");

      await page.goto(`${site}registration.html?checkout=cancelled`, { waitUntil: "domcontentloaded" });
      assert.match(await page.locator("#checkout-return").textContent(), /without completing/);
      assert.equal(await page.locator("#registration-total").textContent(), "€664.00");
      await page.goto(`${site}registration.html?checkout=success`, { waitUntil: "domcontentloaded" });
      assert.match(await page.locator("#checkout-return").textContent(), /Check your payment confirmation/);
      assert.equal(await page.locator('nav a[href="registration.html"]').count(), 0);
      for (const width of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `horizontal overflow at ${width}px`);
      }
      await page.locator("#tier-faculty").focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await page.locator("#tier-student").isChecked(), true);
      apiMode = "success";
      await page.locator("#checkout-submit").click();
      await page.waitForURL("https://checkout.stripe.com/c/pay/test_session");
      assert.equal(requests, 2);
      assert.deepEqual(pageErrors, []);
    } finally {
      await browser.close();
    }
  },
});
