# ROORQ — Facebook Page Complete Setup Kit
*Every word in this document is ready to paste directly into Facebook.*

---

## SECTION 01: Page Identity

| Field | Value |
|-------|-------|
| Page Name | ROORQ |
| Username | @roorq.official |
| Category 1 | Clothing (Vintage) |
| Category 2 | E-Commerce Website |
| Website | roorq.com |
| Email | helloroorq@gmail.com |
| Phone | [your WhatsApp number] |
| Location | Roorkee, Uttarakhand, India |

---

## SECTION 02: Short Description
*Goes in: Edit Page → About → Short Description (255 char max)*

```
India's first campus-verified thrift marketplace. Built by IIT Roorkee students, for Gen Z sellers and buyers. Every piece is ROORQ Verified — real, accurate, trusted.
```

---

## SECTION 03: Long About / Story
*Goes in: Edit Page → About → Our Story*

```
ROORQ is where India's best vintage and thrifted clothing gets a second life — verified, curated, and delivered to your campus.

Founded by IIT Roorkee students, ROORQ solves the biggest problem in secondhand fashion: trust. Every item on our platform goes through the ROORQ Verified process — a video-authenticated inspection that confirms the piece is exactly as described. No fakes. No surprises.

We're starting with IIT Roorkee's campus as our first market, and expanding fast.

FOR BUYERS:
Browse curated, video-verified vintage pieces from handpicked sellers. Prepaid orders. Delivered to your hostel. Every piece is exactly what you see.

FOR VENDORS:
Join ROORQ as a founding seller. Reach IIT Roorkee's Gen Z campus. Get paid every Friday — 80% of your sale price, directly to your UPI. No exclusivity. No app knowledge required. We handle packaging, logistics, and buyer trust.

HOW TO APPLY AS A VENDOR:
DM us on Facebook, message us on WhatsApp, or comment "VENDOR" on any post. Our team will reach out within 24 hours. Onboarding takes under 10 minutes.

roorq.com | helloroorq@gmail.com
```

---

## SECTION 04: Impressum (Legal note)
*Goes in: Edit Page → About → Impressum*

```
ROORQ is operated by Urbanex Technologies, IIT Roorkee, Roorkee, Uttarakhand - 247667, India.

For vendor inquiries: helloroorq@gmail.com
For buyer support: helloroorq@gmail.com

All transactions are prepaid. Vintage items are sold as described. Returns for preference are not accepted, in line with standard vintage marketplace policy.
```

---

## SECTION 05: Cover Photo Brief
*Create in Canva (Facebook Cover = 1640 × 924px)*

**Layout:**
- Full black background (#0D0D0D)
- Left 40%: ROORQ wordmark (from logo file) — large, centered vertically
- Below wordmark: tagline in Cream (#FAF8F4), 16–18px — *"Campus-curated thrift. Every piece verified."*
- Right 60%: 3 product photos in overlapping card layout (vintage clothing flat-lays)
- Bottom-right: "roorq.com" in Red (#C0392B), small

**Profile Photo (170 × 170px):**
- The uploaded ROORQ wordmark logo, cropped tight
- Black square background
- Centered wordmark in Cream

---

## SECTION 06: CTA Button Setup
*Edit Page → Add a button → Send WhatsApp Message*

- Button type: **Send WhatsApp Message**
- WhatsApp number: +91 [your number]
- Pre-filled message (if available): "Hi ROORQ, I want to apply as a vendor."

---

## SECTION 07: Messenger Auto-Replies

### Instant Reply (auto-sent to every new message)
*Settings → Messaging → Instant reply → Turn ON → Message:*

```
Hey! 👋 Thanks for reaching out to ROORQ.

Are you looking to buy or sell vintage clothing?

Reply with:
👕 VENDOR — to apply as a thrift seller
🛍️ SHOP — to browse our verified vintage picks
❓ HELP — for any other question

We'll get back to you within a few hours!
```

### Away Message (when you're offline)
*Settings → Messaging → Away message → Turn ON → Message:*

```
Hey! We're offline right now but we'll respond within a few hours.

In the meantime:
- Browse our vintage collection: roorq.com
- Apply as a vendor: DM us or message on WhatsApp
- General questions: helloroorq@gmail.com

The ROORQ team 🖤
```

---

## SECTION 08: ManyChat Bot — Full Flow Script
*Platform: manychat.com (free plan supports this fully)*
*Setup: Connect Facebook page → Create flows below*

---

### FLOW 1: Main Menu (trigger: any first message OR keywords "hi", "hello", "hey")

**Bot message:**
```
Hey! I'm ROORQ's bot 🖤

We're India's first campus-verified thrift marketplace — built by IIT Roorkee students.

What brings you here today?
```

**Quick reply buttons:**
- [I want to SELL on ROORQ]
- [I want to SHOP vintage]
- [What is ROORQ?]

---

### FLOW 2: Vendor Onboarding Path

**Triggered by:** Button "I want to SELL on ROORQ" OR keywords: "vendor", "sell", "apply", "selling", "join", "onboard"

**Message 1:**
```
That's awesome — you're exactly who we're looking for 🔥

ROORQ vendors get:
✅ Access to IIT Roorkee's campus buyer pool
✅ ROORQ Verified badge on every piece
✅ Weekly Friday payouts (80% of sale price → UPI)
✅ No exclusivity — sell anywhere you already do
✅ We handle packaging and logistics

Takes under 10 minutes to set up.

Let me ask you 3 quick questions 👇
```

**Question 1:**
```
Do you currently sell clothes online?
```
Buttons:
- [Yes — on Instagram / WhatsApp]
- [Just getting started]

*(Both paths continue to Question 2)*

**Question 2:**
```
How many pieces do you have available to list right now?
```
Buttons:
- [Under 10 pieces]
- [10–30 pieces]
- [30+ pieces]

*(All paths continue to Question 3)*

**Question 3:**
```
What's your WhatsApp number? (We'll reach out within 24 hours to complete onboarding)

Just type your 10-digit number below 👇
```
*Input type: Text (stores as custom field "vendor_whatsapp")*

**Confirmation message:**
```
Done! 🎉

You're on our founding vendor list. Ajaz from ROORQ will WhatsApp you within 24 hours to walk you through onboarding.

It's quick — under 10 minutes — and you can start listing straight after.

While you wait:
→ Check out roorq.com to see what we're building
→ Follow us on Instagram @roorq.official

Talk soon 🖤 — The ROORQ Team
```

*ManyChat action: Tag contact as "vendor-lead" + send to CRM / Google Sheet via Zapier (optional)*

---

### FLOW 3: Buyer / Shopping Path

**Triggered by:** Button "I want to SHOP vintage"

**Message:**
```
Love it 🛍️

We're launching our first verified vintage drop soon — curated pieces from handpicked sellers, all video-verified before they go live.

Here's where to go:
→ Browse now: roorq.com
→ Follow on Instagram @roorq.official for drop alerts
→ Join our WhatsApp community for first access

Any questions about a specific piece or your order?
```

**Quick reply:**
- [Yes, I have a question]
- [I'm good, thanks!]

If "Yes, I have a question" → "Drop us a message here or email helloroorq@gmail.com — our team responds within a few hours 🖤"

---

### FLOW 4: About ROORQ Path

**Triggered by:** Button "What is ROORQ?"

**Message:**
```
ROORQ is India's first campus-verified thrift marketplace 🖤

Built by IIT Roorkee students, we solve the #1 problem in secondhand fashion: trust.

Every item listed on ROORQ goes through our ROORQ Verified process — a video-authenticated check that confirms each piece is real and exactly as described.

We started with IIT Roorkee as our first campus, and we're growing fast.

Want to:
```
Buttons:
- [Sell on ROORQ]
- [Shop vintage]

---

### FLOW 5: Keyword "VENDOR" (standalone trigger)

**Triggered by:** User sends just the word "VENDOR" in a comment or DM

*Action: Send Flow 2 (Vendor Onboarding Path) immediately*

This handles the pinned post CTA: "comment VENDOR and we'll reach out"

---

## SECTION 09: First 5 Posts — Complete Captions + Visuals

---

### POST 1: Brand Intro (Day 1)

**Image:** ROORQ logo on full black background. Add tagline below wordmark.

**Caption:**
```
Thrift, but make it official. 🖤

ROORQ is here — India's first campus-verified vintage marketplace.

Every piece is video-verified before it goes live. No fakes. No "not as described." Just real vintage, curated for campus.

Starting with IIT Roorkee. Expanding fast.

→ roorq.com

#roorq #thrifted #vintage #vintagefashion #thriftstore #campusfashion #IITRoorkee #genZ #sustainablefashion #secondhandfirst
```

---

### POST 2: Vendor Call (Day 2)

**Image:** Aesthetic flat lay — 4-5 thrifted clothing pieces on dark background.

**Caption:**
```
You curate. We verify. They buy.

Selling vintage or thrifted pieces? ROORQ wants you.

We're onboarding our founding vendors RIGHT NOW — and there are only 10 spots left.

What you get:
✅ Sell to IIT Roorkee's Gen Z campus
✅ ROORQ Verified badge on your pieces
✅ Friday payouts, 80% of every sale
✅ No exclusivity. No setup fees.

How to join:
DM us this page OR comment VENDOR below and we'll reach out within 24 hours.

Onboarding takes under 10 minutes 🖤

#roorqvendor #sellyourthrift #thriftbusiness #vintagebusiness #IITRoorkee #thriftmercato #sellonline #vintageseller
```

---

### POST 3: Verified Badge Explainer (Day 4)

**Image:** ROORQ Verified badge graphic (red badge with checkmark, on cream background). Create in Canva.

**Caption:**
```
What is the ROORQ Verified badge? 🔴✓

Every item listed on ROORQ goes through our verification process before going live.

Here's how it works:
1. Vendor uploads product photos
2. We generate a short verification video from those photos
3. The ROORQ Verified badge is applied to the listing
4. Buyers see exactly what they're getting — no surprises

In a world where "as described" means nothing, we built a system where it means everything.

Every piece. Verified. roorq.com

#roorqverified #thrifttrust #vintageauthenticated #secondhandfashion #thriftmarketplace #roorq
```

---

### POST 4: Drop Teaser (Day 6)

**Image:** 3–4 vintage pieces arranged on black background — dramatic, editorial feel.

**Caption:**
```
Drop 001 is coming. 🔴

Limited pieces. All ROORQ Verified. All vintage.

Date: [your drop date here]
Where: roorq.com

Follow this page and turn notifications ON so you don't miss it.

First come, first served. 🖤

#roorqdrop #drop001 #thriftdrop #vintagedrop #limitededition #thrifted #vintage #campusdrop #IITRoorkee
```

---

### POST 5: Founder Story (Day 8)

**Image:** Team photo at IIT Roorkee campus, or an academic building photo.

**Caption:**
```
This started with frustration.

We were tired of unreliable secondhand markets. Sellers ghosting. Items "not as described." No accountability. Just vibes and hope.

So we built the fix.

ROORQ was founded by IIT Roorkee students who believed that secondhand fashion deserved the same trust infrastructure as any other serious marketplace.

Verification. Payouts. Real accountability.

We're live. And we're just getting started.

→ roorq.com
→ Vendor applications: DM us or comment VENDOR

#buildinpublic #IITRoorkee #startupIndia #roorq #thriftstartup #vintagemarketplace #founderstory #genZstartup
```

---

## SECTION 10: Page Settings Checklist

After setup, verify all of the following in Settings:

**General:**
- [ ] Page name: ROORQ ✓
- [ ] Username: @roorq.official ✓
- [ ] Visitor posts: Allow (lets vendors comment "VENDOR" to trigger bot)
- [ ] Profanity filter: Medium

**Messaging:**
- [ ] Instant reply: ON ✓
- [ ] Away message: ON ✓
- [ ] Response assistant: OFF (handled by ManyChat)
- [ ] Response time shown: "Within a few hours"

**Privacy:**
- [ ] Page audience: Public ✓
- [ ] Country restrictions: None (or India-only if preferred)

**Notifications:**
- [ ] Comments: ON
- [ ] DMs: ON
- [ ] Mention: ON

**Publishing:**
- [ ] Posts scheduling: Set up first 5 posts in Creator Studio

---

## SECTION 11: Ad Account Setup (after page is live)

Once the page is fully set up:

1. Go to business.facebook.com → Create Business Account
   - Business name: Urbanex Technologies
   - Email: helloroorq@gmail.com

2. Add Ad Account:
   - Business Settings → Ad Accounts → Add → Create New Ad Account
   - Currency: INR
   - Time zone: Asia/Kolkata

3. Link Facebook Page to Ad Account

4. This will allow the Meta Ads MCP to manage campaigns from VSCode

**First campaign to run (after page is set up):**
- Objective: Lead Generation
- Audience: Instagram sellers, thrift fashion interest, 18–25, India
- Ad creative: Vendor call post (Post 2 caption)
- Budget: ₹100/day
- Lead form: Name, WhatsApp, "How many pieces do you have?"

---

*ROORQ Facebook Page Setup Kit — v1.0*
*Generated May 2026 | helloroorq@gmail.com*
