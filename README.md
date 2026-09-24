# WCNH 2027

Static conference website on GitHub Pages, with a separate Cloudflare Worker for Stripe Checkout. `registration.html` is a new page. The existing homepage, programme, shared styles, and navigation are unchanged. Registration stays hidden in the navigation until a later launch.

## Registration

One checkout buys registration for one attendee. Gala dinner and transfers can only be purchased with registration and cover that attendee only. For later add-ons, email `info@wcnh2027.com`; do not purchase another registration.

| Selection | Early-bird EUR price |
| --- | ---: |
| Faculty (Academic / Clinical) | €710 |
| Industry | €990 |
| Student (Postdoc / PhD / Research assistants) | €560 |
| Gala dinner | €50 |
| Transfer to hotel — one-way (arrival or departure, one trip) | €27 |
| Transfer to hotel — return (arrival and departure, two trips) | €54 |

Transfers cover travel between the hotel and either the airport or port on arrival and departure.

Replace `[FEE_PERCENTAGE]` in `registration.html` before launch. This notice is informational: the organiser covers the processing fee and no surcharge is added to the displayed or charged total. There is no automatic price switch, tax calculation, or discount.

The price table in `src/index.js` is authoritative. The browser table in `assets/js/registration.js` is for display only. No monetary values are accepted from the browser. Stripe products or Price IDs do not need to be created beforehand.

### Inspect checkout without a Stripe account

While `CHECKOUT_ENDPOINT` still contains its placeholder, the normal registration page automatically uses preview mode. Once an endpoint is configured, use `?preview=1` to explicitly enable preview mode.

Serve the repository with `python -m http.server 8000 --bind 127.0.0.1`, then open `http://localhost:8000/registration.html?preview=1`. Choose a tier and add-ons and click **Preview checkout request**. The page shows the browser JSON and the decoded and encoded Stripe request body, using the Worker's actual payload builder. No API request is sent, no secret key is needed, and no checkout session is created. Preview return URLs use the current page address; deployed checkout uses `REGISTRATION_URL`. Module loading requires HTTP rather than opening the HTML as a local file. Once the endpoint is configured, remove `?preview=1` to restore normal checkout.

The Stripe request contains only `mode`, `success_url`, and each line item's currency, amount, name and quantity. No metadata, cancellation URL, payment-method restriction or billing-address override is sent.

### API request

`POST /create-checkout-session`, with `Content-Type: application/json`:

```json
{"tierId":"faculty","addonIds":["gala_dinner","hotel_transfer_return"]}
```

Tier IDs: `faculty`, `industry`, `student`. Add-on IDs: `gala_dinner`, `hotel_transfer_one_way`, `hotel_transfer_return`. Use `[]` for no add-ons. Transfer options are mutually exclusive. Extra fields, duplicates, and add-on-only purchases are rejected.

Success: HTTP 200 with `{"url":"https://checkout.stripe.com/…"}`. Errors return `{"error":"…"}` with a 4xx/5xx status. CORS permits the configured site origin only. It is a browser restriction, not authentication or bot protection.

## Tests

Dependency-free tests use Deno and mock Stripe, so no cards are charged:

```sh
deno test tests/worker_test.js
```

The tests cover all 18 price combinations, Stripe amounts and quantities, minimal request fields, input validation, CORS, missing secrets, and upstream errors. Complete a real Stripe test-mode checkout before launch as described below.

Optional Chrome checks use Playwright downloaded into Deno’s cache, curl for Bootstrap assets, and mocked checkout responses:

```sh
deno test -A tests/browser_test.js
```

These check all displayed totals, the submitted IDs, error recovery, duplicate-submit prevention, return messages, keyboard controls, and layout widths from 320 to 1280 pixels. Chrome defaults to its macOS installation path; set `CHROME_PATH` to your Chrome executable on other systems. Cosmetic font/icon requests are blocked during this test.

## Setup and deploy

1. **Install tooling and log in.** Have a Cloudflare Workers account, Stripe account, and supported Node.js LTS version. Install Wrangler globally; no frontend build or repository package manifest is required:

   ```sh
   npm install -g wrangler
   wrangler login
   ```

   Run subsequent commands from the repository root.

2. **Review `wrangler.toml`.** The public configuration assumes the requested GitHub Pages URL:

   ```toml
   ALLOWED_ORIGIN = "https://zdetor54.github.io"
   REGISTRATION_URL = "https://zdetor54.github.io/wcnh2027/registration.html"
   ```

   If Pages uses a custom domain, update both values. The origin has no path; the registration URL includes the repository path. Successful checkout returns to that page with `?checkout=success`. No cancellation URL is sent. Change the Worker name if necessary.

3. **Set the test secret.** Obtain a Stripe test-mode secret key and enter it at the CLI prompt:

   ```sh
   wrangler secret put STRIPE_SECRET_KEY
   ```

   Never put the key in frontend code, `wrangler.toml`, command arguments, or commits. The Worker reads `env.STRIPE_SECRET_KEY`. Accept Wrangler’s offer to create the named Worker if it does not exist yet. See [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

4. **Test locally.** Using your editor, create an ignored `.dev.vars` containing `STRIPE_SECRET_KEY="your test key"`. Use test keys only locally. Start the Worker with local configuration overrides:

   ```sh
   wrangler dev --port 8787 --var ALLOWED_ORIGIN:http://localhost:8000 --var REGISTRATION_URL:http://localhost:8000/registration.html
   ```

   In another terminal, serve this repository:

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

   Temporarily set `CHECKOUT_ENDPOINT` in `assets/js/registration.js` to `http://localhost:8787/create-checkout-session`. Open `http://localhost:8000/registration.html` (use exactly `localhost`, not a file URL). This local server can serve files in the repository including local configuration; bind it only to loopback and close it after testing.

5. **Verify payment in test mode.** Try all selections. Faculty + gala + return is €814; Student alone is €560; Industry + gala + return is €1,094. Stripe must show the same line items and total, without an added percentage. Test browser back navigation and retry, then a completed payment using `4242 4242 4242 4242`, a future expiry, and a valid-format CVC. Inspect the completed payment and purchased line items in Stripe. See [Stripe testing](https://docs.stripe.com/testing).

   Checkout collects email; billing address collection and available payment methods use Stripe defaults and account settings. There is no attendee database or conference confirmation email implementation. Enable Stripe payment receipts in the Dashboard if desired. Confirm paid registrations in Stripe; the static return page is not proof of payment. Automated registration fulfilment requires a separate verified webhook integration. See [Stripe fulfilment](https://docs.stripe.com/checkout/fulfillment).

6. **Deploy the Worker with the test key first.**

   ```sh
   wrangler deploy
   ```

   Copy the resulting `https://wcnh2027-registration.<your-subdomain>.workers.dev` URL. Set `CHECKOUT_ENDPOINT` to that URL plus `/create-checkout-session`. The placeholder deliberately prevents checkout until configured. No secrets belong in this constant.

7. **Publish the page.** Replace the fee placeholder and review rates/copy. Commit and push the new registration assets, Worker, configuration, tests, documentation, and `.gitignore` through your existing GitHub Pages workflow. If Pages publishes from a different branch, merge there first. `.gitignore` now allows the new registration HTML and excludes local secrets/tooling output. Test the direct URL `https://zdetor54.github.io/wcnh2027/registration.html` with the deployed test-mode Worker. This URL is public even though the nav link remains hidden. No edits to `index.html` or `programme.html` are required.

8. **Switch to live payments when ready.** Complete Stripe account activation. Run `wrangler secret put STRIPE_SECRET_KEY` again and enter the live secret at the prompt; this updates the deployed Worker. The Worker URL/frontend do not change. Test cards work only with test-mode keys. Any real payment verification should be performed intentionally by the organiser.

9. **Update rates manually in January 2027.** Update `src/index.js`, the frontend `DISPLAY_PRICES` table, and static price labels/date copy in `registration.html`. The supplied standard rates are Faculty `81000`, Industry `109000`, and Student `66000` cents. Update this README and test expectations, run tests, then redeploy the Worker and publish matching static files. Add-ons remain €50 and €27 unless changed separately. Existing Checkout Sessions retain their original prices; expire open sessions in Stripe if old rates must stop immediately.
