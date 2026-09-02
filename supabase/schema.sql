-- ==============================================================================
-- RADAR MINERAL - SUPABASE POSTGRES SCHEMA & SEEDS
-- ==============================================================================
-- Cara Menggunakan:
-- 1. Buka dashboard project Supabase Anda (https://supabase.com/dashboard)
-- 2. Pilih menu "SQL Editor" di sidebar kiri
-- 3. Klik "New Query", paste seluruh isi file ini, lalu klik "Run"
-- ==============================================================================

-- 1. TABEL PRODUK (Katalog Produk Galon & Dus)
create table if not exists products (
  id text primary key,                 -- misal: 'galon-19l', 'dus-600ml', 'dus-330ml', 'dus-220ml'
  name text not null,
  category text not null check (category in ('galon', 'dus')),
  badge text,
  image_url text,
  description text,
  capacity text,
  features text[] default '{}',
  price_description text,
  estimated_price integer,
  popular boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. TABEL FAQ (Pusat Bantuan)
create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('pemesanan', 'pengiriman', 'pembayaran', 'produk')),
  question text not null,
  answer text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 3. TABEL ORDERS (Pesanan Pelanggan B2B)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default ('RDR-' || floor(random() * 900000 + 100000)::text),
  store_name text,                      -- Nama Toko / Minimarket / Usaha (B2B)
  customer_name text not null,          -- PIC / Nama Pemesan
  phone text not null,
  address text not null,
  district text not null,
  notes text,
  payment_method text not null check (payment_method in ('qris', 'transfer', 'cod')),
  payment_status text not null default 'Belum Dibayar',
  payment_reference text,               -- Catatan / No Ref Transfer
  admin_notes text,                     -- Catatan internal admin (reputasi / catatan toko)
  amount_paid integer default 0,        -- Jumlah dibayar (jika DP / sebagian)
  timeline_data jsonb default '{}'::jsonb, -- Timestamp riwayat status { baruAt, diprosesAt, dikirimAt, selesaiAt }
  eta_text text,                        -- Estimasi waktu tiba dari admin (mis: ±30 Menit, ±1 Jam)
  status text not null default 'baru' check (status in ('baru', 'diproses', 'dikirim', 'selesai', 'batal')),
  total integer not null default 0,
  created_at timestamptz default now()
);

-- Pastikan kolom baru ada jika tabel orders sudah pernah dibuat sebelumnya
alter table orders add column if not exists store_name text;
alter table orders add column if not exists payment_status text not null default 'Belum Dibayar';
alter table orders add column if not exists payment_reference text;
alter table orders add column if not exists admin_notes text;
alter table orders add column if not exists amount_paid integer default 0;
alter table orders add column if not exists timeline_data jsonb default '{}'::jsonb;
alter table orders add column if not exists eta_text text;
alter table orders add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function public.set_updated_at();

-- 3b. TABEL ADMINS (Staff yang boleh mengelola pesanan)
-- Diisi manual lewat SQL editor / dashboard Supabase oleh pemilik project -
-- SENGAJA tidak ada policy insert/update/delete supaya tidak bisa self-service.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now()
);

-- 4. TABEL ORDER_ITEMS (Rincian Item Per Pesanan)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id text references products(id),
  product_name text not null,      -- snapshot nama produk saat transaksi
  quantity integer not null check (quantity > 0),
  unit_price integer not null default 0,
  gallon_exchange boolean default true,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di semua tabel
alter table products enable row level security;
alter table faq_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admins enable row level security;

-- Hapus policy lama jika ada untuk mencegah duplikasi saat re-run
drop policy if exists "produk publik" on products;
drop policy if exists "faq publik" on faq_items;
drop policy if exists "siapapun bisa checkout" on orders;
drop policy if exists "siapapun bisa isi item pesanan" on order_items;
drop policy if exists "admin bisa lihat dirinya sendiri" on admins;
drop policy if exists "admin bisa lihat semua pesanan" on orders;
drop policy if exists "admin bisa update pesanan" on orders;
drop policy if exists "admin bisa lihat semua item pesanan" on order_items;

-- Policy 1: Produk aktif dapat dibaca oleh publik (website & aplikasi)
create policy "produk publik" on products
  for select using (is_active = true);

-- Policy 2: FAQ dapat dibaca oleh publik
create policy "faq publik" on faq_items
  for select using (true);

-- Policy 3: Checkout pesanan baru dapat dibuat oleh siapa saja tanpa login
-- WITH CHECK memvalidasi field wajib agar tidak ada insert kosong / spam
create policy "siapapun bisa checkout" on orders
  for insert with check (
    customer_name is not null and trim(customer_name) <> ''
    and phone     is not null and trim(phone)         <> ''
    and address   is not null and trim(address)       <> ''
    and district  is not null and trim(district)      <> ''
    and payment_method in ('qris', 'transfer', 'cod')
  );

-- Policy 4: Item pesanan hanya boleh dimasukkan jika order_id valid (ada di tabel orders)
-- Ini mencegah spam insert item untuk order_id acak / fiktif
create policy "siapapun bisa isi item pesanan" on order_items
  for insert with check (
    order_id is not null
    and exists (select 1 from public.orders where id = order_id)
  );

-- Policy 5: User hanya bisa melihat baris admin miliknya sendiri (buat cek "apakah saya admin")
create policy "admin bisa lihat dirinya sendiri" on admins
  for select using (auth.uid() = user_id);

-- Policy 6: Admin (terdaftar di tabel admins) boleh lihat SEMUA pesanan
create policy "admin bisa lihat semua pesanan" on orders
  for select using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Policy 7: Admin boleh ubah status / status pembayaran pesanan
create policy "admin bisa update pesanan" on orders
  for update using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Policy 8: Admin boleh lihat rincian item tiap pesanan
create policy "admin bisa lihat semua item pesanan" on order_items
  for select using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Aktifkan Realtime di tabel orders, supaya dashboard admin auto-update tanpa refresh manual
do $$
begin
  execute 'alter publication supabase_realtime add table orders';
exception when duplicate_object then
  null; -- sudah ditambahkan sebelumnya, aman diabaikan
end $$;

-- ==============================================================================
-- SECURE STORED FUNCTIONS / RPC
-- ==============================================================================

-- Fungsi aman untuk mengambil riwayat pesanan berdasarkan nomor telepon + kode pesanan
-- Menghindari pembukaan akses SELECT publik pada tabel orders (keamanan data pelanggan).
drop function if exists public.get_my_orders(text, text);

create function public.get_my_orders(p_phone text, p_order_code text)
returns table (
  id uuid,
  order_code text,
  store_name text,
  customer_name text,
  phone text,
  address text,
  district text,
  notes text,
  payment_method text,
  payment_status text,
  payment_reference text,
  status text,
  total integer,
  timeline_data jsonb,
  eta_text text,
  created_at timestamptz,
  items jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verified boolean;
begin
  select exists (
    select 1
    from public.orders o
    where o.order_code = p_order_code
      and (
        replace(replace(replace(o.phone, ' ', ''), '-', ''), '+62', '0') =
        replace(replace(replace(p_phone, ' ', ''), '-', ''), '+62', '0')
        or o.phone = p_phone
      )
  ) into v_verified;

  if not v_verified then
    return;
  end if;

  return query
  select 
    o.id,
    o.order_code,
    o.store_name,
    o.customer_name,
    o.phone,
    o.address,
    o.district,
    o.notes,
    o.payment_method,
    o.payment_status,
    o.payment_reference,
    o.status,
    o.total,
    o.timeline_data,
    o.eta_text,
    o.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'gallon_exchange', oi.gallon_exchange
          )
        )
        from public.order_items oi
        where oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items
  from public.orders o
  where replace(replace(replace(o.phone, ' ', ''), '-', ''), '+62', '0') =
        replace(replace(replace(p_phone, ' ', ''), '-', ''), '+62', '0')
     or o.phone = p_phone
  order by o.created_at desc
  limit 25;
end;
$$;

-- ==============================================================================
-- SEED DATA (DATA AWAL 2 PRODUK B2B GROSIR & FAQ)
-- ==============================================================================

-- Bersihkan & hapus permanen seluruh produk lama selain 2 produk resmi B2B
update order_items set product_id = null where product_id not in ('dus-220ml', 'galon-19l');
delete from products where id not in ('dus-220ml', 'galon-19l');

-- Seed 2 Produk B2B
insert into products (id, name, category, badge, image_url, description, capacity, features, price_description, estimated_price, popular, is_active)
values 
(
  'dus-220ml',
  'Air Kemasan Cup (220ml)',
  'dus',
  'B2B Grosir • Min. 10 Dus',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiIjJC08yhMhzI51Ew6bID79AuWytQhm_vLcpbVjCo8QU1fjkF3c84hf76sjh6vDqNC5_YdPS5n5o-W9E18zMxPkDe_GroDMHlN9D4E9gySVfQuFhYJc8JPaVBtQGtrpL6Qasmwzh6-2zePs-wZyil67Lh8VBLJ8mG1lf7L8HJpDW-SbH0euLaa4ByfJlHKJulyxsWepOvWhEHvqPM5hNQjVg5AwZEK69AaSjmGr4BE2K_kCS-1OUi',
  'Air mineral kemasan cup/gelas 220ml isi 48 cup per dus. Pasokan utama untuk toko bahan campuran, minimarket (Alfamart/Indomaret), dan toko grosir.',
  '220ml x 48 Cup per Dus',
  array['Isi 48 cup per dus (Kardus tebal tahan tumpuk)', 'Minimal pemesanan (MOQ): 10 Dus', 'Lid seal rapat anti bocor & sedotan higienis', 'Harga grosir distributor bersaing'],
  'Rp30.000 / dus (Harga Grosir)',
  30000,
  true,
  true
),
(
  'galon-19l',
  'Air Galon 19 Liter',
  'galon',
  'B2B Grosir • Min. 5 Galon',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA34OJreaZvE10wieVICb1bNayLOes9DyRyRUVrnzTL8aHRSgSSY01JQr49eh_Hp1a7mZcXRVXXtt0EBj_sOrvyS309M3O1yXOx5tKFHTZVbYP85HBrsCKm3NKhaYGZ57WmDyJGv5-0QhAV9y23i0r0OThd4cGCzH6F5vWfHGn_OOLF51e-x7_5VGS-TyQjZ5mIwKhncwWYftzWMslkW6c-meKvi8iniM-YGF1hNqREfgVSG0LegqNH',
  'Air mineral alami higienis kemasan galon 19L untuk pasokan toko kelontong, pangkalan galon, dan ritel.',
  '19 Liter per Galon',
  array['Kapasitas 19 Liter standar', 'Minimal pemesanan (MOQ): 5 Galon', 'Tutup galon segel ganda higienis', 'Layanan tukar galon kosong / beli baru'],
  'Rp18.000 / galon (isi ulang)',
  18000,
  true,
  true
)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  badge = excluded.badge,
  image_url = excluded.image_url,
  description = excluded.description,
  capacity = excluded.capacity,
  features = excluded.features,
  price_description = excluded.price_description,
  estimated_price = excluded.estimated_price,
  popular = excluded.popular,
  is_active = excluded.is_active;

-- Seed FAQ Items
insert into faq_items (category, question, answer, sort_order)
values
(
  'pemesanan',
  'Berapa batas minimal pemesanan (MOQ) untuk toko / pelanggan B2B?',
  'Batas minimal pemesanan khusus B2B grosir: Minimal 10 Dus untuk Air Kemasan Cup 220ml (isi 48 cup) dan Minimal 5 Galon untuk Air Galon 19 Liter.',
  1
),
(
  'pemesanan',
  'Siapa saja segmen pelanggan Radar Mineral?',
  'Kami melayani rantai minimarket (Alfamart, Indomaret), toko bahan campuran, toko grosir sembako, warung kelontong, dan kebutuhan institusi/usaha di Makassar.',
  2
),
(
  'pengiriman',
  'Apakah melayani pengiriman langsung ke toko di seluruh Makassar?',
  'Ya, armada kurir internal kami mengantarkan pasokan langsung ke toko mitra di seluruh kecamatan Kota Makassar.',
  3
),
(
  'pembayaran',
  'Metode pembayaran apa saja yang tersedia?',
  'Tersedia Scan QRIS, Transfer Bank (BCA, Mandiri, BRI), dan Pembayaran Tunai saat barang tiba (COD).',
  4
),
(
  'pembayaran',
  'Apakah tersedia nota / invoice untuk pembukuan toko?',
  'Ya, admin menyediakan dokumen invoice resmi sederhana yang memuat rincian produk, kuantitas, harga, dan total belanja untuk arsip toko Anda.',
  5
),
(
  'produk',
  'Bagaimana standar higienitas produk Radar Mineral?',
  'Setiap galon dan cup diproses melalui multi-filtrasi, ozonisasi, dan sterilisasi sinar UV sesuai standar SNI & BPOM RI.',
  6
)
on conflict do nothing;


-- ================================================================
-- GOOGLE SHEETS REAL-TIME SYNC via pg_net
-- ================================================================
-- Requires: pg_net extension enabled (Database → Extensions → pg_net)
-- Cara setup:
--   1. Enable pg_net di Supabase Dashboard: Database → Extensions → pg_net
--   2. Jalankan SQL ini di SQL Editor Supabase
--   3. Ganti URL di bawah dengan URL Google Apps Script Web App Anda
-- ================================================================

-- Enable pg_net extension (jalankan sekali)
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- ----------------------------------------------------------------
-- Function: kirim data pesanan ke Google Sheets via HTTP POST
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_order_to_google_sheets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  _payload  jsonb;
  _req_id   bigint;
  -- ⚠️  GANTI URL INI dengan URL Google Apps Script Web App Anda
  _google_sheet_url text := 'https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec';
BEGIN
  -- Susun payload JSON yang akan dikirim ke Google Apps Script
  _payload := jsonb_build_object(
    'type',   TG_OP,
    'table',  TG_TABLE_NAME,
    'record', to_jsonb(NEW)
  );

  -- Kirim HTTP POST via pg_net (asinkron, tidak memblokir DB)
  -- CATATAN: net.http_post() bukan extensions.http_post()
  SELECT net.http_post(
    url     := _google_sheet_url,
    body    := _payload,          -- jsonb langsung (bukan ::text)
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) INTO _req_id;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sync_order_to_google_sheets: gagal kirim ke Sheets: % (req_id: %)', SQLERRM, _req_id;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------
-- Trigger: jalankan function setiap INSERT atau UPDATE di orders
-- ----------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_sync_orders_to_sheets ON public.orders;

CREATE TRIGGER trg_sync_orders_to_sheets
  AFTER INSERT OR UPDATE
  ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_order_to_google_sheets();

-- ==============================================================================
-- SECURITY HARDENING — jalankan setelah seluruh schema di atas
-- Fixes: Supabase Security Linter warnings (WARN level)
-- ==============================================================================

-- [1] Hapus versi lama get_my_orders(p_phone text) jika masih ada di DB
--     (versi 1-argumen sudah tidak digunakan, diganti versi 2-argumen)
drop function if exists public.get_my_orders(text);

-- [2] REVOKE akses EXECUTE dari public/anon/authenticated untuk fungsi trigger
--     sync_order_to_google_sheets() HANYA boleh dipanggil oleh trigger DB,
--     bukan via REST API (/rest/v1/rpc/sync_order_to_google_sheets)
revoke execute on function public.sync_order_to_google_sheets()
  from anon, authenticated, public;

-- [3] Eksplisit grant/revoke untuk get_my_orders(text, text)
--     Fungsi ini PERLU diakses oleh anon (pelanggan cek pesanan tanpa login)
--     tapi TIDAK perlu oleh authenticated (admin pakai lib/admin.ts langsung)
--     atau public (terlalu luas)
revoke execute on function public.get_my_orders(text, text) from public, authenticated;
grant  execute on function public.get_my_orders(text, text) to anon;

-- [4] Informasi: auth_leaked_password_protection
--     Aktifkan lewat Supabase Dashboard:
--     Authentication → Sign In / Up → Password → Enable "Leaked password protection"
--     (tidak bisa diaktifkan via SQL)
