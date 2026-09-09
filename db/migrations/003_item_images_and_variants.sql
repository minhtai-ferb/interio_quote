-- Each hạng mục (item) can now carry its own photo (previously only the
-- option had a shared photo gallery), and can optionally offer a few
-- sub-options (material/style variants), each with its own price, that the
-- customer picks between.

ALTER TABLE template_option_items ADD COLUMN image_url text;
ALTER TABLE template_option_items ADD COLUMN cloudinary_public_id text;
ALTER TABLE quote_option_items ADD COLUMN image_url text;
ALTER TABLE quote_option_items ADD COLUMN cloudinary_public_id text;

CREATE TABLE template_option_item_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_option_item_id uuid NOT NULL REFERENCES template_option_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  spec text,
  price integer NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_option_item_variants_item_id ON template_option_item_variants(template_option_item_id);

CREATE TABLE quote_option_item_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_option_item_id uuid NOT NULL REFERENCES quote_option_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  spec text,
  price integer NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_option_item_variants_item_id ON quote_option_item_variants(quote_option_item_id);

-- Which variant the customer picked for a given item (falls back to the
-- item's own base price/name when no row exists here).
CREATE TABLE quote_item_variant_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  quote_option_item_id uuid NOT NULL REFERENCES quote_option_items(id) ON DELETE CASCADE,
  quote_option_item_variant_id uuid NOT NULL REFERENCES quote_option_item_variants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quote_id, quote_option_item_id)
);
CREATE INDEX idx_quote_item_variant_selections_quote_id ON quote_item_variant_selections(quote_id);
CREATE TRIGGER trg_quote_item_variant_selections_updated_at BEFORE UPDATE ON quote_item_variant_selections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
