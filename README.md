# BizFlow - Small Business Management & Inventory SaaS

> "Simple Business Management for Small Businesses"

A multi-tenant SaaS platform for Indian SMBs to manage inventory, sales, customers, suppliers, and finances.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS 4, Recharts, React Router DOM v7, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Charts** | Recharts |
| **PDF** | jsPDF + jspdf-autotable |

## Project Structure

```
bizflow/
├── backend/                # Express.js API server
│   ├── src/
│   │   ├── config/         # DB connection, environment config
│   │   ├── controllers/    # 20 request handlers (auth, products, sales, etc.)
│   │   ├── middlewares/    # JWT auth, tenant isolation, rate limiting, error handler
│   │   ├── models/         # 23 Mongoose schemas (User, Business, Product, Sale, etc.)
│   │   ├── routes/         # 21 route files with 80+ API endpoints
│   │   ├── services/       # 19 business logic services
│   │   ├── utils/          # Response helpers, constants, seed data
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── api/            # 16 API service files + Axios instance
│   │   ├── components/     # 15 reusable UI components
│   │   ├── context/        # AuthContext, BusinessContext
│   │   ├── hooks/          # Custom hooks (useDebounce)
│   │   ├── layouts/        # MainLayout, AuthLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── public/     # Landing, Login, Register, Forgot/Reset Password, Pricing
│   │   │   ├── app/        # 18 business pages (Dashboard, POS, Products, Sales, etc.)
│   │   │   └── admin/      # 7 admin pages (Dashboard, Businesses, Plans, etc.)
│   │   ├── routes/         # ProtectedRoute, AdminRoute, AppRoutes
│   │   └── utils/          # formatCurrency, formatDate, constants
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Features (26 Modules)

- **Auth & Multi-Tenancy**: JWT auth, role-based access (Owner/Manager/Staff), complete data isolation
- **Dashboard**: Real-time stats, 7 interactive charts (sales, revenue, inventory, categories)
- **Products**: Full CRUD, search, filters, pagination, bulk export, image upload
- **Categories**: CRUD with grid/table views
- **Inventory**: Stock tracking, movement history, low stock alerts, stock adjustments
- **POS**: Professional split-view interface, product search, cart, multiple payment methods
- **Sales**: History, detail view, record payments, returns, void with inventory restoration
- **Customers**: CRUD, credit/udhaar ledger, payment recording
- **Suppliers**: CRUD, payable ledger, payment recording
- **Purchases**: Create orders, auto inventory increase, supplier balance update
- **Expenses**: Category tracking, monthly charts, date/payment filters
- **Employees**: Add staff, assign roles, activate/deactivate
- **Roles & Permissions**: 11 permission modules, granular RBAC
- **Reports**: Sales, inventory, customer, supplier, expense, P&L with charts
- **Analytics**: Best/worst products, revenue/expense/profit trends, stock turnover
- **Settings**: Business profile, invoice config, tax settings, danger zone
- **Subscription**: 4 plans (Free/Starter/Business/Pro), usage meters, upgrade flow
- **Notifications**: In-app notification center with read/unread
- **Branches**: Multi-branch management (Pro plan feature)
- **Super Admin**: Platform dashboard, business management, plan management, audit logs

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Backend Setup

```bash
cd bizflow/backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd bizflow/frontend
npm install

# Start development server (proxies /api to backend on port 5000)
npm run dev
```

### Seed Demo Data

```bash
cd bizflow/backend
npm run seed
```

Demo credentials after seeding:
- **Business Owner**: demo@bizflow.com / Demo@123
- **Super Admin**: admin@bizflow.com / Admin@123

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Response Format

```json
// Success
{ "success": true, "message": "Product created successfully", "data": {} }

// Error
{ "success": false, "message": "Product not found", "errorCode": "PRODUCT_NOT_FOUND" }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 } }
```

## Security
- JWT access + refresh token authentication
- Password hashing with bcryptjs
- Multi-tenant data isolation (businessId from JWT, never from request body)
- Role-based and permission-based authorization
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation on frontend and backend
- Audit logging for sensitive operations

## Deployment

- **Frontend**: Vercel (`npm run build` → deploy `dist/`)
- **Backend**: Render / Railway / Fly.io
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (for images)

## License
Private - All rights reserved.
