# ROORQ Vendor App — Fixed Files

## What was broken and what's fixed

### 1. SIGN-IN BROKEN — Users couldn't log in after signup
**Root cause:** signup.tsx assumed a DB trigger existed to auto-create vendor 
records, but no trigger existed. After signup, there was no vendor row, so 
every query against the vendors table returned nothing → app crashed.

**Fix (database):** Created trigger `on_auth_user_created_vendor` that 
auto-creates a vendors row when someone signs up. Also confirmed all 
unconfirmed test email accounts. Also backfilled vendor rows for existing 
auth users who didn't have one.

**Fix (code):** Updated signup.tsx to show a proper error if auto-sign-in 
fails after signup, instead of silently failing.

### 2. analytics.tsx queried WRONG TABLE
**Root cause:** Was querying `orders` table with `vendor_id` filter, but the 
`orders` table doesn't have a vendor_id column — it's a buyer orders table.

**Fix:** Rewrote to query `vendor_orders` (which has vendor_id, subtotal, 
platform_commission, vendor_payout columns). RLS policies handle filtering 
automatically — no need to manually filter by vendor_id.

### 3. order-detail.tsx queried WRONG TABLE
**Root cause:** Was querying `orders` (buyer table) and using columns like 
`amount`, `item_name`, `buyer_name` that don't exist on that table.

**Fix:** Rewrote to query `vendor_orders` with joined `vendor_order_items` 
and `parent_orders`. Uses real columns: subtotal, platform_commission, 
vendor_payout. Shows actual product names from the products table.

### 4. app.json had wrong scheme and package name
**Root cause:** Scheme was `roorqvendorapp` (no hyphens), package was 
`com.anonymous.roorqvendorapp`.

**Fix:** Scheme changed to `roorq-vendor` (matches /sell page deep links). 
Package changed to `com.roorq.vendor`. Added Android intent filters for 
deep link handling.

---

## Where to put each file

Copy these files into your roorq-vendor-app folder:

```
fixed file                → put it at
─────────────────────────────────────────────────────
app.json                  → roorq-vendor-app/app.json
signup.tsx                → roorq-vendor-app/app/(auth)/signup.tsx
analytics.tsx             → roorq-vendor-app/app/(tabs)/analytics.tsx
order-detail.tsx          → roorq-vendor-app/app/order-detail.tsx
```

No changes needed to: login.tsx, welcome.tsx, onboarding.tsx, _layout.tsx, 
supabase.js, index.tsx — these are fine as-is.

---

## Test after replacing files

1. Kill and restart the Expo dev server: `npx expo start --clear`
2. Try signing up with a new email (e.g. test@gmail.com, password: Test1234)
3. You should reach the onboarding screen
4. Complete onboarding → you should land on the tabs home screen
5. Check the Earnings tab → should show real data from vendor_orders
6. If you tap an order → should show real payout breakdown

---

## Database changes already applied (no action needed)

These migrations were already run on your Supabase production database:

1. `vendor_data_model_cleanup` — RLS policies, vendor record creation, 
   product assignment, vendor_orders backfill
2. `auto_create_vendor_on_signup` — DB trigger for auto vendor creation, 
   email confirmation fix, backfill for existing users