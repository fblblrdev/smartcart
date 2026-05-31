# SmartCart

A modern e-commerce platform for small resellers to showcase products and receive customer orders.

## Features

**Customer**
- Browse products with search, category filter, and sorting
- Product detail page with image carousel and stock info
- Guest cart (localStorage) merged into user cart on login
- Checkout with shipping form and order confirmation
- View past orders by email

**Reseller**
- Dashboard: total products, orders, revenue, low-stock alerts
- Product management: add/edit/delete, image upload, activate/deactivate
- Category management: add/edit/delete
- Order management: view details, update status (pending → confirmed → shipped → delivered)

**Platform**
- Email/Google authentication via Supabase Auth
- Email notifications to reseller on order placement via Resend API
- Supabase Storage for product images
- Row-Level Security on all tables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| UI | Material UI v5 |
| State | React Query v5 |
| Routing | React Router v7 |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Email | Resend API |
| Hosting | Vercel (frontend) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier)
- A [Resend](https://resend.com) account (free tier — 3000 emails/month)

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `smartcart`), set a database password, select a region

### 1.2 Run Schema
1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates all tables, functions, RLS policies, and the storage bucket.

### 1.3 Enable Google Auth (optional)
1. **Authentication** → **Providers** → **Google** → Enable
2. Add your Google OAuth credentials (Client ID & Secret)
3. Set the redirect URL to `https://your-project.supabase.co/auth/v1/callback`

### 1.4 Get API Keys
1. **Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## Step 2: Resend Setup

1. Go to [resend.com](https://resend.com) → Sign up
2. **API Keys** → **Create API Key** → copy the key → `VITE_RESEND_API_KEY`
3. The free tier sends from `onboarding@resend.dev` (no domain setup needed for demo)

---

## Step 3: Local Development

```bash
# Clone the project
cd smartcart

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RESEND_API_KEY=re_xxxxxxxxxxxx
VITE_RESELLER_EMAIL=prahaasm@gmail.com
```

```bash
# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Step 4: Seed Demo Data

```bash
npm run seed
```

This creates:
- 5 categories (Electronics, Fashion, Grocery, Sports, Home Decor)
- 50 products (10 per category) with placeholder images

### Create Test Accounts

1. In Supabase dashboard → **Authentication** → **Users** → **Invite User**
2. Create:
   - `reseller@smartcart.com` / `password123`
   - `customer@smartcart.com` / `password123`
3. Copy their user IDs
4. In **SQL Editor**, run `supabase/seed_users.sql` (uncomment and replace UUIDs)

---

## Step 5: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
```

Add all four variables from `.env`.

Also create `vercel.json` to handle SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Project Structure

```
smartcart/
├── src/
│   ├── api/              # Supabase data functions
│   │   ├── categories.ts
│   │   ├── email.ts      # Resend email notification
│   │   ├── orders.ts
│   │   └── products.ts
│   ├── components/
│   │   ├── common/       # Navbar, Layout, ProductCard, etc.
│   │   └── reseller/     # ResellerLayout sidebar
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── pages/
│   │   ├── auth/         # Login, Register
│   │   ├── customer/     # Home, ProductListing, ProductDetail, Cart, Checkout, Orders
│   │   └── reseller/     # Dashboard, Products, Categories, Orders
│   ├── types/index.ts
│   ├── theme.ts
│   └── App.tsx
├── supabase/
│   ├── schema.sql        # Full DB schema + RLS policies
│   └── seed_users.sql    # Test account insert template
├── scripts/
│   └── seed.ts           # Demo data seeder (5 categories, 50 products)
├── .env.example
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public API key |
| `VITE_RESEND_API_KEY` | Yes | Resend API key for email |
| `VITE_RESELLER_EMAIL` | Yes | Email address to receive order notifications |

---

## User Roles

| Role | Access |
|---|---|
| `CUSTOMER` | Browse, cart, checkout, view own orders |
| `RESELLER` | All above + full product/category/order management |

Role is set at registration and stored in the `users` table.

---

## Order Flow

1. Customer fills checkout form → clicks **Place Order**
2. Order and order items created in DB
3. Product inventory decremented via `decrement_product_quantity` SQL function
4. Email sent to `VITE_RESELLER_EMAIL` via Resend API
5. Customer sees success page and message:
   > "Your order has been placed successfully. The reseller will contact you regarding payment and delivery."

---

## Future Phases

**Phase 2**
- Razorpay payment integration
- Order tracking with status timeline

**Phase 3**
- OTP login
- WhatsApp/SMS notifications
- Multi-store support
