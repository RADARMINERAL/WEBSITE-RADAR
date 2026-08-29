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

-- 3. TABEL ORDERS (Pesanan Pelanggan)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default ('RDR-' || floor(random() * 900000 + 100000)::text),
  customer_name text not null,
  phone text not null,
  address text not null,
  district text not null,
  notes text,
  payment_method text not null check (payment_method in ('qris', 'transfer', 'cod')),
  payment_status text not null default 'Belum Dibayar',
  status text not null default 'baru' check (status in ('baru', 'diproses', 'dikirim', 'selesai', 'batal')),
  total integer not null default 0,
  created_at timestamptz default now()
);

-- Pastikan kolom payment_status ada jika tabel orders sudah pernah dibuat sebelumnya
alter table orders add column if not exists payment_status text not null default 'Belum Dibayar';

-- Kolom updated_at, supaya kelihatan kapan status pesanan terakhir diubah admin
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
create policy "siapapun bisa checkout" on orders
  for insert with check (true);

-- Policy 4: Item pesanan dapat dimasukkan saat checkout
create policy "siapapun bisa isi item pesanan" on order_items
  for insert with check (true);

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
-- PENTING: nomor HP saja TIDAK CUKUP sebagai kunci (nomor HP bukan rahasia) — makanya
-- fungsi ini mensyaratkan kode pesanan yang cocok sebagai 'bukti kepemilikan' sebelum
-- riwayat pesanan lengkap ditampilkan.
drop function if exists public.get_my_orders(text, text);

create function public.get_my_orders(p_phone text, p_order_code text)
returns table (
  id uuid,
  order_code text,
  customer_name text,
  phone text,
  address text,
  district text,
  notes text,
  payment_method text,
  status text,
  total integer,
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
    o.customer_name,
    o.phone,
    o.address,
    o.district,
    o.notes,
    o.payment_method,
    o.status,
    o.total,
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
-- SEED DATA (DATA AWAL PRODUK & FAQ)
-- ==============================================================================

-- Seed Produk
insert into products (id, name, category, badge, image_url, description, capacity, features, price_description, estimated_price, popular, is_active)
values 
(
  'galon-19l',
  'Galon 19 Liter',
  'galon',
  'Paling Populer',
  'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=800',
  'Air mineral alami higienis dalam kemasan galon 19L, cocok untuk kebutuhan keluarga dan kantor. Diproses dengan multi-filtrasi dan ozonisasi.',
  '19 Liter',
  array['Tutup galon segel ganda higienis', 'Bebas BPA & ramah lingkungan', 'Cocok untuk dispenser panas/dingin', 'Layanan antar sampai ke lantai ruangan'],
  'Rp18.000 / galon (isi ulang)',
  18000,
  true,
  true
),
(
  'dus-600ml',
  'Air Dus 600ml (Isi 24 Botol)',
  'dus',
  'Praktis',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiIjJC08yhMhzI51Ew6bID79AuWytQhm_vLcpbVjCo8QU1fjkF3c84hf76sjh6vDqNC5_YdPS5n5o-W9E18zMxPkDe_GroDMHlN9D4E9gySVfQuFhYJc8JPaVBtQGtrpL6Qasmwzh6-2zePs-wZyil67Lh8VBLJ8mG1lf7L8HJpDW-SbH0euLaa4ByfJlHKJulyxsWepOvWhEHvqPM5hNQjVg5AwZEK69AaSjmGr4BE2K_kCS-1OUi',
  'Kemasan botol sedang 600ml dalam kardus isi 24 botol. Sangat ideal untuk acara meeting, seminar, perjamuan, maupun konsumsi harian.',
  '600ml x 24 Botol',
  array['Botol kokoh dan ergonomis', 'Segel tutup ulir rapat & aman', 'Mudah dibawa bepergian / aktivitas outdoor', 'Kardus tebal tahan tumpuk'],
  'Rp48.000 / dus',
  48000,
  true,
  true
),
(
  'dus-330ml',
  'Air Dus 330ml (Isi 24 Botol Mini)',
  'dus',
  'Favorit Acara',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiIjJC08yhMhzI51Ew6bID79AuWytQhm_vLcpbVjCo8QU1fjkF3c84hf76sjh6vDqNC5_YdPS5n5o-W9E18zMxPkDe_GroDMHlN9D4E9gySVfQuFhYJc8JPaVBtQGtrpL6Qasmwzh6-2zePs-wZyil67Lh8VBLJ8mG1lf7L8HJpDW-SbH0euLaa4ByfJlHKJulyxsWepOvWhEHvqPM5hNQjVg5AwZEK69AaSjmGr4BE2K_kCS-1OUi',
  'Kemasan botol mini 330ml yang elegan dan pas untuk sajian tamu undangan pesta pernikahan, rapat kantor, atau pengajian.',
  '330ml x 24 Botol',
  array['Ukuran kompak & pas sekali minum', 'Tampilan botol modern & rapi', 'Meminimalisir air terbuang', 'Kemasan kardus rapi'],
  'Rp42.000 / dus',
  42000,
  false,
  true
),
(
  'dus-220ml',
  'Air Dus Cup 220ml (Isi 48 Gelas)',
  'dus',
  'Ekonomis',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiIjJC08yhMhzI51Ew6bID79AuWytQhm_vLcpbVjCo8QU1fjkF3c84hf76sjh6vDqNC5_YdPS5n5o-W9E18zMxPkDe_GroDMHlN9D4E9gySVfQuFhYJc8JPaVBtQGtrpL6Qasmwzh6-2zePs-wZyil67Lh8VBLJ8mG1lf7L8HJpDW-SbH0euLaa4ByfJlHKJulyxsWepOvWhEHvqPM5hNQjVg5AwZEK69AaSjmGr4BE2K_kCS-1OUi',
  'Air mineral kemasan cup/gelas 220ml isi 48 cup per dus. Paling ekonomis dan praktis untuk hajatan besar, arisan, dan kegiatan sosial.',
  '220ml x 48 Cup',
  array['Lid seal kuat anti bocor', 'Sudah termasuk sedotan higienis di tiap dus', 'Paling hemat untuk tamu banyak', 'Kardus kokoh'],
  'Rp30.000 / dus',
  30000,
  false,
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
  'Bagaimana cara memesan air galon atau dus di Radar Mineral?',
  'Anda dapat memesan langsung melalui tombol "Pesan Sekarang" di website ini. Isi data nama, alamat, dan jumlah pesanan, lalu klik tombol "Kirim Pesanan ke WhatsApp". Pesanan Anda akan langsung tersimpan di database dan diteruskan ke admin kami.',
  1
),
(
  'pemesanan',
  'Berapa batas minimal pemesanan untuk layanan antar?',
  'Minimal pemesanan untuk pengantaran bebas ongkir adalah 2 galon (19L) atau 2 dus kemasan botol/gelas. Untuk kebutuhan kantor atau acara dalam jumlah besar, kami siap melayani partai besar.',
  2
),
(
  'pengiriman',
  'Berapa lama waktu pengantaran setelah pesanan dikirim?',
  'Pesanan diantar dalam rentang waktu 30 hingga 60 menit tergantung jarak lokasi dan kepadatan antrean kurir.',
  3
),
(
  'pembayaran',
  'Metode pembayaran apa saja yang tersedia?',
  'Kami menerima 3 metode pembayaran: QRIS Instan (bisa discan langsung saat kurir tiba), Transfer Bank (BCA, Mandiri, BRI), dan Pembayaran Tunai saat barang diterima (COD).',
  4
),
(
  'produk',
  'Bagaimana jika saya pelanggan baru dan belum memiliki galon kosong?',
  'Untuk pelanggan baru, Anda cukup membayar biaya deposit galon baru sebesar Rp40.000 per galon. Pada pesanan berikutnya, Anda hanya perlu membayar harga isi ulang (Rp18.000).',
  5
),
(
  'produk',
  'Apakah kualitas air Radar Mineral teruji laboratorium?',
  'Ya, air Radar Mineral diproses melalui filtrasi multi-tahap, ozonisasi, dan sterilisasi sinar UV sesuai standar SNI & Permenkes RI.',
  6
)
on conflict do nothing;
