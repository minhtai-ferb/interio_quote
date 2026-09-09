-- Adds the fields needed to pin an exact final price when staff finalizes a quote.
-- An option only carries a price range (price_from..price_to); finalizing requires
-- one concrete number per room, plus a snapshotted grand total on the quote itself.

ALTER TABLE quote_selections ADD COLUMN final_price integer;
ALTER TABLE quotes ADD COLUMN final_total integer;
