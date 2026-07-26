# Tic Toc Xpoint

A full-stack e-commerce platform for phone accessories & wearable medals, serving two stores — **Tic Toc** (wearable medals) and **Xpoint** (phone accessories).

## Live URLs

| Service | URL |
|---|---|
| Storefront | `https://tictoc-xpoint.vercel.app` |
| Backend API | `https://tictoc-xpoint-backend.vercel.app` |

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS 3, React Router 6, `motion` (framer-motion v12), lucide-react |
| **Backend** | Node.js, Express 4 (ESM), JWT auth, bcryptjs |
| **Database** | Supabase (PostgreSQL) |
| **Email** | Resend (transactional order confirmations) |
| **Image hosting** | Cloudinary (unsigned uploads) |
| **Deployment** | Vercel (frontend SPA + backend serverless) |

## Project Structure

```
tictoc-xpoint/
├── backend/
│   ├── auth.js              # JWT signing & admin middleware
│   ├── db.js                # All Supabase queries
│   ├── email.js             # Resend order confirmation emails
│   ├── server.js            # Express app & all API routes
│   ├── scripts/
│   │   └── hash-password.js # CLI tool to bcrypt a password
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js           # API client (fetch wrapper)
│   │   ├── App.jsx          # Router & layout
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css        # Global styles, CSS vars, RTL
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth, Cart, Locale, Theme
│   │   ├── i18n/            # English & Arabic translations
│   │   ├── lib/             # Animation presets
│   │   ├── pages/           # All route pages
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   └── ...
│   │   └── data/
│   │       └── constants.js # Store definitions
│   ├── .env.example
│   ├── vercel.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Routes

### Storefront

| Path | Page | Description |
|---|---|---|
| `/` | Home | Landing page |
| `/shop` | Shop | All products |
| `/shop/:store` | StorePage | Filter by store (`xpoint` / `tictoc`) |
| `/product/:id` | ProductDetail | Single product |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Checkout form (COD) |
| `/checkout/success` | CheckoutSuccess | Post-checkout confirmation |
| `/checkout/cancel` | CheckoutCancel | Post-checkout cancellation |
| `/order/:id` | OrderTracking | Track an order publicly |
| `/my-orders` | MyOrders | Lookup orders by phone number |
| `/about` | About | About page |
| `/contact` | Contact | Contact / complaint form |
| `/admin-access` | AdminAccess | Admin login page |

### Admin (requires login)

| Path | Page | Description |
|---|---|---|
| `/admin` | AdminDashboard | Stats overview |
| `/admin/orders` | AdminOrders | Manage orders (status, delivery) |
| `/admin/products` | AdminProducts | Product list |
| `/admin/products/new` | ProductForm | Create product |
| `/admin/products/:id/edit` | ProductForm | Edit product |
| `/admin/categories` | AdminCategories | Category CRUD |
| `/admin/customers` | AdminCustomers | Customer list |
| `/admin/analytics` | AdminAnalytics | Sales analytics |
| `/admin/support` | AdminSupport | Complaints & returns |
| `/admin/manage` | AdminManage | Admin user management |
| `/admin/shipping` | AdminSettings | Shipping fee & thresholds |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Listen port (default 4242, Vercel ignores) |
| `FRONTEND_URL` | Yes | CORS origin (e.g. `http://localhost:5173`) |
| `ADMIN_USERNAME` | Yes | Super admin username |
| `ADMIN_PASSWORD_HASH` | Yes | bcrypt hash of admin password (use `scripts/hash-password.js`) |
| `JWT_SECRET` | Yes | Random string ≥ 32 characters |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service_role key (not anon) |
| `RESEND_API_KEY` | Yes | Resend API key for order confirmation emails |
| `EMAIL_FROM` | No | Sender address (default: `onboarding@resend.dev`) |
| `SITE_URL` | No | Site URL for email links (falls back to `FRONTEND_URL`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend URL (default: `http://localhost:4242`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Cloudinary unsigned upload preset |

## Getting Started Locally

### Prerequisites
- Node.js 18+
- A Supabase project (free tier)
- A Cloudinary account (free tier)
- A Resend account (free tier for testing)

### 1. Clone & install
```bash
git clone <repo-url>
cd tictoc-xpoint

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your values
```

### 2. Generate admin password hash
```bash
cd backend
node scripts/hash-password.js "yourAdminPassword"
# Copy the output into ADMIN_PASSWORD_HASH in .env
```

### 3. Set up Supabase

Create a Supabase project and run the following SQL (or create tables through the UI):

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  store TEXT NOT NULL,
  category TEXT,
  images JSONB DEFAULT '[]',
  image TEXT,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  name TEXT NOT NULL,
  store TEXT NOT NULL,
  PRIMARY KEY (name, store)
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'pending',
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  estimated_delivery DATE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE complaints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE return_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_notes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Run
```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4242`  
Admin login: `http://localhost:5173/admin-access`

## Deployment

Both frontend and backend deploy to Vercel. Push to GitHub and Vercel auto-deploys.

### Backend Vercel settings
- **Root directory:** `backend`
- **Framework preset:** Other
- **Build command:** (none)
- **Output directory:** (none)
- **Environment variables:** All vars from `backend/.env` (set in Vercel dashboard)

### Frontend Vercel settings
- **Root directory:** `frontend`
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | — | List products (optional `?store=`) |
| `GET` | `/api/products/:id` | — | Get product |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `GET` | `/api/categories` | — | List categories (optional `?store=`) |
| `POST` | `/api/admin/categories` | Admin | Create category |
| `PUT` | `/api/admin/categories/:name` | Admin | Update category |
| `DELETE` | `/api/admin/categories/:name` | Admin | Delete category |
| `POST` | `/api/checkout/cod` | — | Place COD order |
| `GET` | `/api/orders/:id` | — | Get order |
| `GET` | `/api/orders` | — | Lookup orders by phone |
| `POST` | `/api/admin/login` | — | Admin login (rate-limited) |
| `GET` | `/api/admin/me` | Admin | Verify token |
| `GET` | `/api/admin/dashboard` | Admin | Dashboard stats |
| `GET` | `/api/admin/orders` | Admin | All orders |
| `PATCH` | `/api/admin/orders/:id` | Admin | Update order |
| `GET` | `/api/admin/admins` | Admin | List admins |
| `POST` | `/api/admin/admins` | Admin | Create admin |
| `DELETE` | `/api/admin/admins/:id` | Admin | Delete admin |
| `PATCH` | `/api/admin/admins/:id/password` | Admin | Change password |
| `POST` | `/api/complaints` | — | Submit complaint |
| `GET` | `/api/admin/complaints` | Admin | List complaints |
| `PATCH` | `/api/admin/complaints/:id` | Admin | Resolve complaint |
| `DELETE` | `/api/admin/complaints/:id` | Admin | Delete complaint |
| `POST` | `/api/returns` | — | Request return |
| `GET` | `/api/admin/returns` | Admin | List returns |
| `PATCH` | `/api/admin/returns/:id` | Admin | Update return |
| `DELETE` | `/api/admin/returns/:id` | Admin | Delete return |
| `GET` | `/api/admin/orders/:id/notes` | Admin | Order notes |
| `POST` | `/api/admin/orders/:id/notes` | Admin | Add note |
| `DELETE` | `/api/admin/notes/:id` | Admin | Delete note |
| `GET` | `/api/settings/public` | — | Shipping & contact info |
| `GET` | `/api/admin/settings` | Admin | All settings |
| `PUT` | `/api/admin/settings` | Admin | Update setting |
| `GET` | `/api/admin/analytics` | Admin | Sales analytics |
| `GET` | `/api/admin/customers` | Admin | Customer list |

## Features

- **Two stores** — Tic Toc (wearables) and Xpoint (phone accessories), each with its own products & categories
- **Bilingual** — Full English / Arabic (RTL) support with instant toggle
- **Dark mode** — Light/dark theme with system preference detection
- **Product gallery** — Swipeable image carousel with drag, pinch-free zoom, auto-rotate
- **COD checkout** — Cash-on-delivery with phone validation, shipping fee calculation, free shipping threshold
- **Order tracking** — Public order status page with progress tracker
- **Order email** — Branded HTML confirmation via Resend with item breakdown, track button, social links
- **Admin panel** — Dashboard, order management, product CRUD, category CRUD, analytics, complaints, returns, admin user management, shipping settings
- **Image upload** — Cloudinary integration for product images
- **Contact & support** — Complaint form, return requests, order notes

## Brand

| Token | Light | Dark |
|---|---|---|
| `--brand` | `#AA024D` (magenta) | `#F692B7` (pink) |
| `--accent` | `#01DFEA` (cyan) | `#4DE9F4` (cyan) |

- **Fonts:** Space Grotesk (headings), Inter (body), Cairo (Arabic)
- **Store colours:** Tic Toc → brand (magenta), Xpoint → accent (cyan)

## Local Storage

| Key | Purpose |
|---|---|
| `ttx-lang` | Language (`en` / `ar`) |
| `ttx-theme` | Theme (`dark` / `light`) |
| `ttx-token` | Admin JWT |
| `ttx-cart` | Cart items (JSON) |

## License

Private project — all rights reserved.
