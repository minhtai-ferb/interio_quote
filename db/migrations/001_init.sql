-- interio_quote — initial schema
-- Raw SQL only, no ORM. Run once against the Neon Postgres database.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════
-- Templates — reusable data. Copied into a Quote's own rows on creation.
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE template_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_rooms_template_id ON template_rooms(template_id);
CREATE TRIGGER trg_template_rooms_updated_at BEFORE UPDATE ON template_rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- An "option" is one investment tier for a room (e.g. Basic / Standard / Premium).
-- Customers pick exactly one option per room.
CREATE TABLE template_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_room_id uuid NOT NULL REFERENCES template_rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_from integer NOT NULL DEFAULT 0,
  price_to integer NOT NULL DEFAULT 0,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_template_option_price CHECK (price_to >= price_from)
);
CREATE INDEX idx_template_options_room_id ON template_options(template_room_id);
CREATE TRIGGER trg_template_options_updated_at BEFORE UPDATE ON template_options
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE template_option_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_option_id uuid NOT NULL REFERENCES template_options(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  cloudinary_public_id text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_option_images_option_id ON template_option_images(template_option_id);

CREATE TABLE template_option_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_option_id uuid NOT NULL REFERENCES template_options(id) ON DELETE CASCADE,
  name text NOT NULL,
  spec text,
  price integer,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_option_items_option_id ON template_option_items(template_option_id);

-- ══════════════════════════════════════════════════════════════════
-- Customers
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════════
-- Quotes — an independent copy of a template's data, one per customer engagement.
-- ══════════════════════════════════════════════════════════════════

CREATE TYPE quote_status AS ENUM ('DRAFT', 'CONSULTING', 'CUSTOMER_SUBMITTED', 'FINALIZED');

CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  source_template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  project_type text,
  area_m2 numeric,
  note text,
  status quote_status NOT NULL DEFAULT 'DRAFT',
  public_token text NOT NULL UNIQUE,
  discount_amount integer NOT NULL DEFAULT 0,
  staff_note text,
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE UNIQUE INDEX idx_quotes_public_token ON quotes(public_token);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE quote_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_rooms_quote_id ON quote_rooms(quote_id);
CREATE TRIGGER trg_quote_rooms_updated_at BEFORE UPDATE ON quote_rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE quote_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_room_id uuid NOT NULL REFERENCES quote_rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_from integer NOT NULL DEFAULT 0,
  price_to integer NOT NULL DEFAULT 0,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_quote_option_price CHECK (price_to >= price_from)
);
CREATE INDEX idx_quote_options_room_id ON quote_options(quote_room_id);
CREATE TRIGGER trg_quote_options_updated_at BEFORE UPDATE ON quote_options
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE quote_option_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_option_id uuid NOT NULL REFERENCES quote_options(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  cloudinary_public_id text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_option_images_option_id ON quote_option_images(quote_option_id);

CREATE TABLE quote_option_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_option_id uuid NOT NULL REFERENCES quote_options(id) ON DELETE CASCADE,
  name text NOT NULL,
  spec text,
  price integer,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_option_items_option_id ON quote_option_items(quote_option_id);

-- Customer selection: exactly one option per room per quote.
CREATE TABLE quote_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  quote_room_id uuid NOT NULL REFERENCES quote_rooms(id) ON DELETE CASCADE,
  quote_option_id uuid NOT NULL REFERENCES quote_options(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quote_id, quote_room_id)
);
CREATE INDEX idx_quote_selections_quote_id ON quote_selections(quote_id);
CREATE TRIGGER trg_quote_selections_updated_at BEFORE UPDATE ON quote_selections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
