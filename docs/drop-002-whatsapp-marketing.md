# ROORQ Drop 002 — WhatsApp Marketing Playbook
**Drop date:** May 15, 2026 · 6:00 PM IST · 30 curated pieces
**Platform:** Interakt (interakt.ai)

---

## TASK 1: INTERAKT SETUP GUIDE

### Step 1 — Create Your Account

1. Go to **interakt.ai** → click "Get Started Free"
2. Sign up with your business email (use `contact@roorq.in` or your founders' email)
3. Enter business name: **ROORQ**, country: India, business phone
4. Verify email → you land on the Interakt dashboard

---

### Step 2 — Connect WABA (WhatsApp Business Account)

> **Critical:** The phone number you connect **cannot** already be on WhatsApp Personal or WhatsApp Business app. If it is, you must unregister it from that app first (Settings → Account → Delete my account on the phone). Use a fresh SIM or a number you're willing to convert.

**Inside Interakt:**
1. Go to **Settings → WhatsApp Business Account → Connect**
2. Click "Connect via Facebook" — a Meta OAuth popup opens
3. Log in with the Facebook account that owns your Meta Business Portfolio (create one at business.facebook.com if you don't have one)
4. Select or create a **Business Portfolio** → enter legal business name
5. Enter the phone number → verify via OTP
6. Select business category: **Retail**
7. Hit "Finish" — WABA status shows "Pending" for a few hours, then "Connected"

**Display name approval:** Meta reviews your WhatsApp display name ("ROORQ") separately. This usually takes 1–3 days on a new account. Submit it immediately — it must be approved before template messages can be sent.

---

### Step 3 — Business Profile Setup

Go to **Settings → Business Profile** and fill in:

| Field | Value |
|---|---|
| Display Name | ROORQ |
| Category | Retail / Shopping |
| Description | India's first curated pre-loved fashion marketplace. Drop-based, campus-born, aesthetic-first. |
| Website | roorq.in |
| Email | contact@roorq.in |
| Address | IIT Roorkee, Uttarakhand 247667 |
| Logo | 640×640px minimum, PNG on white/dark background |

> The description shows on your WhatsApp Business profile card when someone taps your number. Keep it under 256 characters.

---

### Step 4 — Import Contacts & Create Broadcast Segments

Interakt uses **Contact Tags** for segmentation. Import once, tag on import.

**Export contacts from Supabase first:**
```sql
-- Early subscribers (website email capture)
SELECT name, phone, email FROM subscribers ORDER BY created_at;

-- Vendors
SELECT business_name AS name, phone, email FROM vendors WHERE status = 'approved';
```

**Import flow in Interakt:**
1. Go to **Contacts → Import Contacts**
2. Download the CSV template from Interakt
3. Map columns: `name`, `phone` (format: `+919876543210`), `email`
4. On the import screen, **assign a tag** before confirming

**Three segments to create:**

| Tag Name | Who's in it | Source |
|---|---|---|
| `early_subscriber` | Everyone who signed up on roorq.in | Supabase subscribers table |
| `vendor` | Approved + pending vendors | Supabase vendors table |
| `past_enquiry` | Anyone who messaged "DROP" or "SELL" or replied to a previous broadcast | Interakt auto-collects these |

> To broadcast: **Broadcasts → New Broadcast → Filter by Tag → select template → schedule**

---

### Step 5 — Keyword Auto-Replies

Go to **Automation → Keyword Replies → Create New**

---

#### Auto-Reply 1: "DROP"

- **Keyword:** `DROP` (tick "case insensitive")
- **Match type:** Exact match OR Contains (use "Contains" so "drop?" and "DROP!!" also trigger)
- **Reply message:**

```
Hey! 👋 Drop 002 is live — 30 hand-picked pre-loved pieces.

🗓 May 15 · 6 PM IST
🔗 roorq.in/drops

Drops sell out fast. Ping us here if you need help finding your size.
```

---

#### Auto-Reply 2: "SELL"

- **Keyword:** `SELL`
- **Match type:** Contains

```
Want to sell on ROORQ? Here's how it works:

1️⃣ Apply at roorq.in/vendors
2️⃣ We review your profile in 24–48h
3️⃣ Once approved, list a piece via WhatsApp in under 2 mins 🔥

Reply here with any questions — we'll get you set up personally.
```

---

### Step 6 — Template Message Approval

All **outbound broadcast messages** (business-initiated) require Meta approval. Interakt submits on your behalf.

**Where to submit:**
1. Go to **Templates → Create Template**
2. Fill in all fields (see templates below for exact content)
3. Click **Submit for Approval** → status shows "Pending"

**What Meta reviews:**
- Template name (lowercase, underscores only — e.g., `roorq_drop_002_announcement`)
- Category (Marketing / Utility / Authentication)
- Body text for policy violations (no threats, no misleading claims)
- Any URLs must be your own domain or a known shortener

**Approval timeline:**
- Typically **24–48 hours** for a new account
- Can be as fast as 2–4 hours if the template is clean
- Rejections come with a reason code — most common: too promotional, missing opt-out footer, URL not whitelisted

> **Action item:** Submit all 5 templates by **May 13 morning** to have buffer for a rejection and resubmission before May 14 evening broadcast.

**If a template is rejected:** Read the rejection code, tweak the offending line, resubmit. Do not resubmit the identical text — Meta will auto-reject.

---

### Step 7 — Free Trial Limits & Costs

**Interakt trial:** 14 days free, up to 1,000 contacts

**WhatsApp conversation pricing (India, 2025):**

| Category | Cost per conversation |
|---|---|
| Marketing | ~₹0.88 |
| Utility | ~₹0.17 |
| Authentication | ~₹0.15 |

A "conversation" = a 24-hour window. One broadcast to 500 people = 500 conversations. For Drop 002 with ~500 subscribers, expect **₹400–500** in WhatsApp costs for the full drop sequence.

**What's free:**
- Inbound messages from users (they initiate) → free for the 24h window
- Replies within a user-initiated conversation
- Keyword auto-replies (these fall inside user-initiated windows)

**Interakt paid plan:** Starter is ~₹999/month after trial. You can stay on trial for the drop if you move fast.

---

---

## TASK 2: WHATSAPP MESSAGE TEMPLATES

> Format: exact message text · variables in `{{double brackets}}` · approval category

---

### Template 1: DROP ANNOUNCEMENT
**Name:** `roorq_drop_002_announcement`
**Category:** Marketing
**When to send:** May 14, 7:00 PM IST (evening before the drop)
**Send to:** Tag = `early_subscriber` + `past_enquiry`

**Header (Image):** Upload the Drop 002 flat-lay or product grid photo

**Body:**
```
Hey {{1}} 👋

Drop 002 lands tomorrow — 30 pieces, hand-picked by the ROORQ team.

Y2K · old money · indie sleaze · gorpcore
All pre-loved. All priced right. No restocks.

🗓 Tomorrow · May 15 · 6:00 PM IST
🔗 roorq.in/drops

Set your reminder. Last drop sold out in under 40 minutes.
```

**Footer:** `Reply STOP to unsubscribe`

**Button (CTA):** Visit Website → `https://roorq.in/drops`

**Variables:**
- `{{1}}` = recipient first name (mapped from contact's Name field)

**Character count:** ~320 ✓ (well under 1024)

---

### Template 2: DROP LIVE ALERT
**Name:** `roorq_drop_002_live`
**Category:** Marketing
**When to send:** May 15, 6:00 PM IST (the moment the drop goes live)
**Send to:** Tag = `early_subscriber` + `past_enquiry`

**Header (Text):** `Drop 002 is LIVE 🔥`

**Body:**
```
{{1}}, it's here.

Drop 002 just went live — 30 pieces, zero restocks, no holds.

First come, first gets. That's the only rule.

👉 roorq.in/drops

Tap in before it's gone.
```

**Footer:** `Reply STOP to unsubscribe`

**Button (CTA):** Shop Now → `https://roorq.in/drops`

**Variables:**
- `{{1}}` = recipient first name

**Character count:** ~200 ✓

> Keep this one short. People are on their phones at 6 PM — they don't want to read, they want to tap.

---

### Template 3: ORDER CONFIRMED
**Name:** `roorq_order_confirmed`
**Category:** Utility
**When to send:** Triggered immediately after a purchase is confirmed
**Send to:** Buyer's phone number (from checkout)

**Header (Text):** `Order Confirmed ✓`

**Body:**
```
Hey {{1}}, you got it! 🎉

Your order is confirmed and we're packing it up.

📦 Item: {{2}}
🧾 Order ID: #{{3}}
💰 Total paid: ₹{{4}}

Tracking details will be sent within 24 hours. Reply here if you need anything before then.

Thanks for shopping ROORQ 🤍
```

**Footer:** `roorq.in`

**Variables:**
- `{{1}}` = buyer first name
- `{{2}}` = item name (e.g., "Vintage Levi's 501 — Size 28")
- `{{3}}` = order ID
- `{{4}}` = total amount paid

**Character count:** ~340 ✓

> Utility templates cost ~₹0.17 vs ₹0.88 for Marketing. Order confirmations always qualify as Utility — use this category.

---

### Template 4: VENDOR APPROVED
**Name:** `roorq_vendor_approved`
**Category:** Utility
**When to send:** Triggered when ops team approves a vendor application
**Send to:** Vendor's phone number (from application)

**Header (Text):** `You're in, {{1}} 🎉`

**Body:**
```
Your ROORQ vendor account is approved — welcome to the team.

Here's how to list your first piece in under 2 minutes:

1️⃣ Send 3–5 clear photos of the item here on WhatsApp
2️⃣ Our bot reads the details and suggests a fair price
3️⃣ Confirm measurements → item goes live on the marketplace

Your dashboard: roorq.in/vendor/dashboard

Questions? Reply right here — we're online.
```

**Footer:** `roorq.in/vendors`

**Button (CTA):** Open Dashboard → `https://roorq.in/vendor/dashboard`

**Variables:**
- `{{1}}` = vendor first name

**Character count:** ~460 ✓

---

### Template 5: RE-ENGAGEMENT
**Name:** `roorq_drop_002_reengagement`
**Category:** Marketing
**When to send:** May 17, 6:00 PM IST (48 hours after drop live, sent to visitors who didn't buy)
**Send to:** Custom segment — past_enquiry minus anyone who got an Order Confirmed message

**Header (Text):** `Still thinking? 👀`

**Body:**
```
Hey {{1}} 👋

You checked out Drop 002 — {{2}} pieces are still available (for now).

We get it, sometimes it takes a second. But these don't restock.

Also — Drop 003 is coming {{3}}, and early access goes to buyers first.

👉 roorq.in/drops

No pressure. Just don't sleep on it.
```

**Footer:** `Reply STOP to unsubscribe`

**Button (CTA):** See What's Left → `https://roorq.in/drops`

**Variables:**
- `{{1}}` = recipient first name
- `{{2}}` = number of pieces still in stock (pull from DB at send time)
- `{{3}}` = Drop 003 date (e.g., "June 1")

**Character count:** ~360 ✓

> This is the highest-ROI message if timed right. Send it when there are still 5–10 pieces left — creates FOMO without lying about scarcity.

---

---

## TASK 3: REPEAT CUSTOMER FLOW

Build this as an **Interakt Journey** (Automation → Journeys → Create).

**Trigger:** Contact receives tag `first_purchase_complete`
(Set this tag programmatically from your backend when an order is confirmed — call Interakt's Contacts API: `POST /api/v1/contacts/{phone}/tags`)

---

### Day 0 — Purchase Confirmation (Template 3 fires here)
Handled by the Order Confirmed template above. No separate action needed in the Journey — just make sure the tag fires.

---

### Day 3 — Check-In + Drop 003 Tease

**Wait:** 3 days after trigger
**Action:** Send WhatsApp message (use approved template `roorq_checkin_day3`)

**Template name:** `roorq_checkin_day3`
**Category:** Marketing

```
Hey {{1}} 👋

How's the {{2}} treating you?

We're already deep in curation for Drop 003 — early word is it's going to be the best one yet.

No details yet, but you'll hear first.

Stay close. 🤍
— ROORQ
```

**Variables:**
- `{{1}}` = buyer first name
- `{{2}}` = item name (short — e.g., "jacket" or "Levi's")

---

### Day 7 — Exclusive Early Access

**Wait:** 7 days after trigger
**Condition:** Check if Drop 003 early access is live
- If yes → send early access link
- If no → add to `waitlist_drop_003` tag and skip message (send when ready)

**Template name:** `roorq_early_access_drop3`
**Category:** Marketing

```
{{1}}, you're in early. 🙌

Drop 003 early access is open — buyers from Drop 002 get 30 minutes before everyone else.

30 pieces. {{2}} hours until it opens to the public.

👉 {{3}}

Don't share this link — it's just for you (well, for now 😉)
```

**Variables:**
- `{{1}}` = buyer first name
- `{{2}}` = hours until public drop
- `{{3}}` = early access URL (unique per user, or a gated page)

---

### Day 14 — Referral Nudge

**Wait:** 14 days after trigger
**Template name:** `roorq_referral_nudge`
**Category:** Marketing

```
Hey {{1}} 🤍

Quick one — do you have a friend who'd love ROORQ?

Share your code **{{2}}** with them. When they make their first purchase, you both get ₹50 off your next order. No catch.

👉 roorq.in/refer?code={{2}}

Karma credits, but make it fashion.
— ROORQ
```

**Variables:**
- `{{1}}` = buyer first name
- `{{2}}` = referral code (generate per user on the backend)

---

### Journey Summary (Interakt config)

```
TRIGGER: Tag = first_purchase_complete
  │
  ├── Day 3: Send template roorq_checkin_day3
  │
  ├── Day 7: Check condition [drop_003_early_access = live?]
  │     ├── YES → Send template roorq_early_access_drop3
  │     └── NO  → Add tag waitlist_drop_003 → End branch
  │               (separate trigger fires this when drop goes live)
  │
  └── Day 14: Send template roorq_referral_nudge
              → End journey
```

**Interakt notes:**
- Journeys are under **Automation → Journeys** (available on Growth plan and above)
- On Starter plan: replicate this manually with 3 scheduled broadcasts filtered to `first_purchase_complete` tag
- Variable data for Day 7 and Day 14 must be pre-loaded into the contact's custom attributes before the message fires

---

## QUICK CHECKLIST — Before May 14

- [ ] Interakt account created, WABA connected
- [ ] Display name "ROORQ" submitted to Meta
- [ ] Business profile filled (logo, description, website)
- [ ] Contacts imported and tagged (early_subscriber, vendor, past_enquiry)
- [ ] All 5 templates submitted by May 13 morning
- [ ] Keyword auto-replies live (test: message "DROP" from a personal number)
- [ ] Broadcast scheduled: Template 1 → May 14, 7 PM IST
- [ ] Broadcast scheduled: Template 2 → May 15, 6 PM IST (set to send when you flip drop live)
- [ ] Order Confirmed trigger wired from backend (Interakt API)
- [ ] Re-engagement broadcast planned for May 17, 6 PM IST
