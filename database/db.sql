create table products (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  stock int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table categories (
  id bigint primary key generated always as identity,
  name text not null,
  description text
);

create table product_images (
  id bigint primary key generated always as identity,
  product_id bigint references products (id) on delete cascade,
  image_url text not null
);

create table orders (
  id bigint primary key generated always as identity,
  customer_name text not null,
  customer_email text not null,
  total_amount numeric(10, 2) not null,
  status text not null,
  created_at timestamptz default now()
);

create table order_items (
  id bigint primary key generated always as identity,
  order_id bigint references orders (id) on delete cascade,
  product_id bigint references products (id),
  quantity int not null,
  price numeric(10, 2) not null
);

create table product_categories (
  product_id bigint references products (id) on delete cascade,
  category_id bigint references categories (id) on delete cascade,
  primary key (product_id, category_id)
);

alter table products
alter column description
set not null;

create table subcategories (
  id bigint primary key generated always as identity,
  category_id bigint references categories (id) on delete cascade,
  name text not null,
  description text
);

alter table products
drop price,
drop stock;

alter table products
add column discount numeric(5, 2),
add column brand text;

drop table if exists order_items cascade;

drop table if exists orders cascade;

alter table products
add column subcategory_id bigint references subcategories (id) on delete set null;

drop table if exists product_categories cascade;

alter table products
add column state text check (state in ('available', 'sold out')) default 'available';

alter table products
add column price numeric(10, 2) not null;