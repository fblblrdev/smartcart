/**
 * SmartCart Demo Data Seeder
 * 10 curated products with matching Unsplash images.
 *
 * Usage:  npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: process.env.VITE_SUPABASE_SCHEMA ?? 'smartcart' } }
);

// ---------------------------------------------------------------------------
// Each product has a `images` array of real Unsplash photo URLs that visually
// match the product. All photos are free-to-use via Unsplash's open licence.
// ---------------------------------------------------------------------------

const SEED_DATA = [
  // ── ELECTRONICS ────────────────────────────────────────────────────────────
  {
    category: { name: 'Electronics', description: 'Gadgets, phones, laptops, and accessories' },
    products: [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Over-ear noise-cancelling headphones with 30-hour battery life, premium 40mm drivers, and foldable design. Compatible with all Bluetooth devices.',
        price: 2499,
        quantity: 45,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e736ee27a0?w=800&q=80',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
        ],
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit full-size mechanical keyboard with tactile blue switches, anti-ghosting, and aluminium top plate. Perfect for gaming and fast typing.',
        price: 3999,
        quantity: 30,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
          'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80',
        ],
      },
    ],
  },

  // ── FASHION ────────────────────────────────────────────────────────────────
  {
    category: { name: 'Fashion', description: 'Clothing, footwear, and accessories' },
    products: [
      {
        name: 'Unisex Running Sneakers',
        description: 'Lightweight mesh running shoes with responsive foam cushioning, breathable upper, and non-slip rubber sole. Available in sizes 6–12.',
        price: 2499,
        quantity: 60,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
          'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
        ],
      },
      {
        name: 'Canvas Backpack 30L',
        description: 'Durable water-resistant canvas backpack with padded laptop sleeve (fits up to 15.6"), multiple compartments, and ergonomic shoulder straps.',
        price: 1599,
        quantity: 45,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
        ],
      },
    ],
  },

  // ── GROCERY ────────────────────────────────────────────────────────────────
  {
    category: { name: 'Grocery', description: 'Fresh produce, pantry staples, and snacks' },
    products: [
      {
        name: 'Raw Forest Honey (500g)',
        description: 'Pure unprocessed forest honey, cold-extracted to preserve natural enzymes and antioxidants. No added sugar or preservatives. Sourced from the Nilgiri hills.',
        price: 399,
        quantity: 120,
        images: [
          'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
          'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
        ],
      },
      {
        name: 'Mixed Dry Fruits & Nuts (500g)',
        description: 'Premium assortment of California almonds, cashews, raisins, and walnuts. High in protein, fibre, and healthy fats. Ideal as a daily snack.',
        price: 499,
        quantity: 150,
        images: [
          'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=80',
          'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80',
        ],
      },
    ],
  },

  // ── SPORTS ─────────────────────────────────────────────────────────────────
  {
    category: { name: 'Sports', description: 'Equipment, activewear, and outdoor gear' },
    products: [
      {
        name: 'Yoga Mat (6mm)',
        description: 'Eco-friendly TPE yoga mat with alignment guide lines, non-slip texture on both sides, and carrying strap. 183 × 61 cm, 6mm cushioning.',
        price: 899,
        quantity: 80,
        images: [
          'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80',
          'https://images.unsplash.com/photo-1601925228184-8f5b70a6f73e?w=800&q=80',
        ],
      },
      {
        name: 'Adjustable Dumbbells (5kg pair)',
        description: 'Cast iron hex dumbbells with rubber-coated ends to protect floors. Ergonomic knurled handle for a firm grip. Sold as a pair (2 × 5kg).',
        price: 1499,
        quantity: 40,
        images: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
        ],
      },
    ],
  },

  // ── HOME DECOR ─────────────────────────────────────────────────────────────
  {
    category: { name: 'Home Decor', description: 'Furniture, decor, and home essentials' },
    products: [
      {
        name: 'Aroma Diffuser 300ml',
        description: 'Ultrasonic essential oil diffuser with 7-colour LED mood lighting, whisper-quiet operation, auto shut-off, and 10-hour continuous mist mode.',
        price: 1299,
        quantity: 40,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
          'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
        ],
      },
      {
        name: 'String Fairy Lights (10m)',
        description: 'Warm white LED string lights with USB power, 8 lighting modes, and memory function. 100 LEDs across 10m. Perfect for bedrooms and balconies.',
        price: 399,
        quantity: 130,
        images: [
          'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80',
          'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------

async function clearExistingData() {
  console.log('🗑  Clearing existing data...');
  await supabase.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  ✅ Done\n');
}

async function seed() {
  console.log('🌱 SmartCart Demo Seeder\n');

  await clearExistingData();

  let totalProducts = 0;

  for (const group of SEED_DATA) {
    // Upsert category
    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .upsert(group.category, { onConflict: 'name' })
      .select('id, name')
      .single();

    if (catErr) { console.error(`❌ Category "${group.category.name}":`, catErr.message); continue; }
    console.log(`📂 ${cat.name}`);

    for (const p of group.products) {
      const { images, ...productData } = p;

      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .insert({ ...productData, category_id: cat.id, active: true })
        .select('id, name')
        .single();

      if (prodErr) { console.error(`  ❌ "${p.name}":`, prodErr.message); continue; }

      // Insert all matching images
      await supabase.from('product_images').insert(
        images.map((url) => ({ product_id: prod.id, image_url: url }))
      );

      console.log(`  ✅ ${prod.name} (${images.length} images)`);
      totalProducts++;
    }
  }

  console.log(`\n✨ Seeding complete — ${totalProducts} products across ${SEED_DATA.length} categories`);
}

seed().catch(console.error);
