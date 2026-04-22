-- Add story_score JSONB column to products table
-- This stores the curated provenance score set by the vendor via the vendor app.
--
-- Expected shape:
-- {
--   "total": 8.2,
--   "breakdown": [{ "label": "Origin clarity", "score": 9 }, ...],
--   "timeline":  [{ "label": "Origin", "text": "..." }, ...],
--   "tags":      ["2000s era", "Cleaned", "Vendor verified"],
--   "vendorNote": "..."
-- }

alter table products
  add column if not exists story_score jsonb default null;

comment on column products.story_score is
  'Vendor-provided Story Score JSON: total (0–10), breakdown[], timeline[], tags[], vendorNote';
