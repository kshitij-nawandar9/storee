# Storee E-Commerce Platform - Development Guide

This document provides guidance for Claude Code when working on the Storee e-commerce project.

---

## Project Overview

**Storee** is a modern e-commerce platform specializing in kids' travel organizers and pouches. The platform features 12 different product lines with 46 total image variants (9 active products with images, 3 coming soon). Products are managed as static frontend data for optimal performance.

**Product Range**: ₹450 - ₹2600
**Target Audience**: Parents and families looking for kids' travel and organization solutions

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Router for routing
- Axios for HTTP requests
- React Hot Toast for notifications

**Backend:**
- Golang with Gin framework
- MySQL database
- GORM as ORM
- Razorpay payment integration
- Google OAuth authentication
- CORS middleware

**Infrastructure:**
- Vercel (frontend hosting)
- Railway (backend hosting)
- MySQL (local database)
- Static product data (no product database needed)

---

## Repository Structure

```
storee/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── data/            # Static product data (products.ts)
│   └── package.json
│
├── backend/                  # Golang API server
│   ├── config/              # Configuration management
│   ├── database/            # Database connection & migrations
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # Middleware (auth, CORS, etc.)
│   ├── models/              # Database models
│   ├── routes/              # Route definitions
│   ├── services/            # Business logic & external services
│   ├── utils/               # Helper functions
│   ├── main.go              # Application entry point
│   ├── go.mod               # Go dependencies
│   └── .env                 # Environment variables
│
├── docs/                     # Project documentation
│   ├── PRODUCTION_LAUNCH_CHECKLIST.md
│   ├── BUG_TRACKER.md
│   ├── FEATURE_REQUESTS.md
│   ├── DEPLOYMENT_LOG.md
│   └── PROJECT_NOTES.md
│
├── README.md
├── FRONTEND_BACKEND_INTEGRATION.md
└── SKILL.md                  # This file
```

---

## Development Workflow

### Starting the Development Environment

**Backend:**
```bash
cd backend
# Ensure .env file is configured
go run main.go
# Server runs on http://localhost:8080
```

**Frontend:**
```bash
cd frontend
# Ensure .env file has VITE_API_URL and VITE_RAZORPAY_KEY_ID
npm install
npm run dev
# App runs on http://localhost:5173
```

### Environment Variables

**Backend (.env):**
- `PORT` - Server port (default: 8080)
- `ENV` - Environment (development/production)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL credentials
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` - Razorpay credentials
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret for JWT token generation
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

**Frontend (.env):**
- `VITE_API_URL` - Backend API URL (e.g., http://localhost:8080/api/v1)
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

**Note:** Products are static data in `frontend/src/data/products.ts` - no API calls needed for browsing

---

## Code Patterns & Conventions

### Backend (Golang)

**File Organization:**
- `handlers/` - HTTP request handlers (controller layer)
- `services/` - Business logic and external service integrations
- `models/` - Database models (GORM structs)
- `middleware/` - Request/response middleware
- `utils/` - Helper functions and utilities

**Naming Conventions:**
- Use standard Go naming (PascalCase for exported, camelCase for unexported)
- Handler functions: `HandleXxx` or `XxxHandler`
- Model structs: singular nouns (e.g., `Product`, `Order`, `User`)
- Use descriptive variable names

**Error Handling:**
- Always return errors, don't panic
- Use structured error responses via `utils/response.go`
- Log errors with context before returning

**API Response Format:**
```go
// Success
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

### Frontend (React + TypeScript)

**Component Structure:**
- Use functional components with hooks
- Keep components small and focused
- Separate business logic into custom hooks
- Use TypeScript for type safety

**File Organization:**
- `components/` - Reusable UI components
- `pages/` - Route-level page components
- `services/` - API service layer (Axios)
- `hooks/` - Custom React hooks
- `types/` - TypeScript interfaces and types

**Naming Conventions:**
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCart.ts`)
- Services: camelCase (e.g., `api.ts`, `razorpay.ts`)
- Types: PascalCase interfaces (e.g., `Product`, `CartItem`)

**State Management:**
- Use Zustand for global state (cart, auth)
- Use React hooks for component-level state
- Avoid prop drilling with contexts when needed

**Styling:**
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### Page Layouts

**Home Page Structure:**
1. **Navbar** - Navigation bar with links:
   - Home
   - Products
   - Cart
   - Orders
   - Admin (only visible for admin users)
   - Profile
2. **Banner** - Hero banner image (`/images/banner/2.jpg`)
3. **Featured Products** - Grid of featured product cards
4. **Why Choose Storee** - Benefits section (Free Delivery, Secure Payment, Easy Returns)
5. **Reviews** - Customer testimonials/reviews section
6. **Bottom Panel** - Footer with additional information

---

## API Endpoints

### Products
**Note:** Products are now static frontend data in `frontend/src/data/products.ts`
- API endpoints still exist for backward compatibility but are not actively used
- `GET /api/v1/products` - List all products (available but unused)
- `GET /api/v1/products/:id` - Get product by ID (available but unused)
- `GET /api/v1/products/slug/:slug` - Get product by slug (available but unused)

### Authentication
- `POST /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Orders
- `POST /api/v1/razorpay/create-order` - Create Razorpay order (requires auth)
- `POST /api/v1/razorpay/verify-payment` - Verify payment signature (requires auth)
- `POST /api/v1/orders/cod` - Create Cash on Delivery order (requires auth)
- `GET /api/v1/orders/history` - Get user order history (requires auth)

### Admin (requires admin auth)
- `GET /api/v1/admin/orders` - Get all orders with pagination
- `PUT /api/v1/admin/orders/:id/approve` - Approve order
- `POST /api/v1/admin/products` - Create product (available but unused)
- `PUT /api/v1/admin/products/:id` - Update product (available but unused)
- `DELETE /api/v1/admin/products/:id` - Delete product (available but unused)
- `GET /api/v1/admin/products` - Get all products including inactive (available but unused)

---

## Product Management

### Static Product Data (Frontend)
**Location:** `frontend/src/data/products.ts`

Products are stored as a TypeScript array with complete product information:
- 12 total products (9 active with images, 3 coming soon)
- Price range: ₹450 - ₹2600
- 46 total image variants
- No database queries needed for product browsing

**To Update Products:**
1. Edit `frontend/src/data/products.ts`
2. Update product details, prices, or images
3. Refresh browser - changes appear immediately

**Product Structure:**
```typescript
{
  id: string,
  name: string,
  slug: string,
  description: string,
  basePrice: number, // Price in paise
  category: string,
  stock: number,
  isActive: boolean,
  features: string[],
  images: Array<{
    id: string,
    url: string,
    altText: string,
    order: number,
    isPrimary: boolean
  }>
}
```

### Database Schema (Still Used for Orders)

### Products Table (Exists but Unused for Frontend)
```go
type Product struct {
    ID          uuid.UUID      `gorm:"type:char(36);primary_key"`
    Name        string         `gorm:"type:varchar(255);not null"`
    Slug        string         `gorm:"type:varchar(255);uniqueIndex;not null"`
    Description string         `gorm:"type:text"`
    BasePrice   int64          `gorm:"not null"` // Price in paise
    Category    string         `gorm:"type:varchar(100);not null"`
    Stock       *int           `gorm:"nullable"`
    IsActive    bool           `gorm:"default:true"`
    Features    StringArray    `gorm:"type:json"`
    Images      []ProductImage `gorm:"foreignKey:ProductID"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt `gorm:"index"`
}
```

### Product Images Table (Exists but Unused for Frontend)
```go
type ProductImage struct {
    ID        uuid.UUID `gorm:"type:char(36);primary_key"`
    ProductID uuid.UUID `gorm:"type:char(36);not null"`
    URL       string    `gorm:"not null"`
    AltText   string
    Order     int       `gorm:"default:0"`
    IsPrimary bool      `gorm:"default:false"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

### Orders Table
```go
type Order struct {
    ID            uuid.UUID `gorm:"type:uuid;primary_key"`
    OrderID       string    `gorm:"uniqueIndex"` // Razorpay order ID
    UserID        *uuid.UUID // Optional: null for guest orders
    CustomerName  string    `gorm:"not null"`
    Email         string    `gorm:"not null"`
    Phone         string    `gorm:"not null"`
    Address       datatypes.JSON
    Items         datatypes.JSON
    TotalAmount   int64     `gorm:"not null"` // Amount in paise
    Status        string    `gorm:"default:'pending'"`
    PaymentID     string
    PaymentMethod string    // 'razorpay' or 'cod'
    CreatedAt     time.Time
    UpdatedAt     time.Time
}
```

### Users Table
```go
type User struct {
    ID            uuid.UUID `gorm:"type:char(36);primary_key"`
    GoogleID      string    `gorm:"uniqueIndex;not null"`
    Email         string    `gorm:"uniqueIndex;not null"`
    Name          string    `gorm:"not null"`
    Picture       string
    EmailVerified bool      `gorm:"default:false"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
}
```

**Admin Users:** Determined by email match against `ADMIN_EMAILS` environment variable

---

## Key Features Implementation

### Razorpay Integration
- Payment flow: Create Order → Display Razorpay Checkout → Verify Signature
- Test mode uses test keys (prefix: `rzp_test_`)
- Production uses live keys (prefix: `rzp_live_`)
- Always verify payment signature server-side for security

### Cash on Delivery (COD)
- Direct order creation without payment gateway
- Status: 'pending' until fulfilled
- Confirmation via email and WhatsApp

### Authentication & Authorization
- Google OAuth 2.0 authentication
- JWT-based session management
- Admin determined by email whitelist (ADMIN_EMAILS env var)
- Protected routes for admin operations

### Image Management
- Product images stored in `frontend/public/images/products/`
- Multiple images per product (5-10 variants each)
- Images organized by product folder
- Static serving via Vite dev server / Vercel in production

---

## Testing Guidelines

### Backend Testing
```bash
cd backend
go test ./...
```

**Test API Endpoints:**
```bash
# Health check
curl http://localhost:8080/health

# Get products
curl http://localhost:8080/api/v1/products

# Create order (with auth token)
curl -X POST http://localhost:8080/api/v1/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 50000, "items": [...]}'
```

### Frontend Testing
- Manual testing in browser
- Check browser console for errors
- Test responsive design (mobile, tablet, desktop)
- Verify API calls in Network tab

### Payment Testing
- Use Razorpay test cards: https://razorpay.com/docs/payments/test-cards/
- Test card: 4111 1111 1111 1111, any future expiry, any CVV
- Test UPI: success@razorpay
- Verify payment signature on backend

---

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Build command: `npm run build`
4. Output directory: `dist`
5. Auto-deploys on push to main branch

### Backend (Railway)
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Railway auto-detects Go application
4. Runs `go build` and starts the binary
5. Auto-deploys on push to main branch

### Database (MySQL)
- Local MySQL instance during development
- Configure via `DB_*` environment variables in backend/.env
- Auto-migrations run on backend startup via GORM

---

## Common Tasks

### Adding a New Product
1. Add product images to `frontend/public/images/products/product-name/`
2. Edit `frontend/src/data/products.ts`
3. Add new product object with all details (name, price, description, images, etc.)
4. Refresh browser to see new product
5. See `PRODUCTS.md` for detailed product information

### Adding a New API Endpoint
1. Define route in `backend/routes/routes.go`
2. Create handler in `backend/handlers/`
3. Add business logic in `backend/services/` if needed
4. Update API documentation

### Adding a New Frontend Page
1. Create component in `frontend/src/pages/`
2. Add route in `App.tsx`
3. Create corresponding API service in `frontend/src/services/`
4. Add navigation link if needed

### Debugging Common Issues
- **CORS errors**: Check `FRONTEND_URL` in backend .env
- **API connection timeout**: Verify `VITE_API_URL` and backend is running
- **Payment failure**: Check Razorpay keys and signature verification
- **Database connection**: Verify PostgreSQL credentials
- **Build errors**: Check TypeScript types and missing dependencies

---

## Important Notes

### Security Considerations
- Never commit `.env` files
- Always verify Razorpay signatures server-side
- Use HTTPS in production
- Sanitize user inputs
- Hash passwords with bcrypt
- Use parameterized queries (GORM handles this)

### Performance Optimization
- Use database indexes on frequently queried fields
- Implement pagination for product lists
- Lazy load images
- Cache static assets
- Minimize API calls

### Code Quality
- Follow Go and React best practices
- Write clear, descriptive commit messages
- Keep functions small and focused
- Add comments for complex logic
- Use TypeScript strictly (no `any` types)

### Documentation
- Update `docs/` folder when making significant changes
- Document new environment variables
- Update API documentation for new endpoints
- Keep README.md current

---

## Useful Commands

### Backend
```bash
# Run server
go run main.go

# Build binary
go build -o storee

# Run tests
go test ./...

# Format code
go fmt ./...

# Install dependencies
go mod tidy

# Update dependencies
go get -u ./...
```

### Frontend
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Database
```bash
# Connect to local MySQL
mysql -u root -p storee

# Or use credentials from .env
mysql -h localhost -u root -p storee

# Run migrations (auto-runs on backend start)
# Migrations are in database/database.go
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

---

## Resources

### Official Documentation
- **Golang**: https://go.dev/doc/
- **Gin Framework**: https://gin-gonic.com/docs/
- **GORM**: https://gorm.io/docs/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://github.com/pmndrs/zustand

### Payment & Services
- **Razorpay**: https://razorpay.com/docs/
- **Razorpay Test Cards**: https://razorpay.com/docs/payments/test-cards/
- **Resend (Email)**: https://resend.com/docs

### Hosting & Infrastructure
- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app/
- **Supabase**: https://supabase.com/docs

---

## Project-Specific Guidelines

### When Adding Features
1. Check `docs/FEATURE_REQUESTS.md` for planned features
2. Update both frontend and backend if needed
3. Test thoroughly in development
4. Update documentation
5. Test in production environment before deploying

### When Fixing Bugs
1. Document bug in `docs/BUG_TRACKER.md`
2. Reproduce the issue locally
3. Write fix with clear commit message
4. Test the fix thoroughly
5. Update bug tracker with resolution

### When Modifying Database Schema
1. Update models in `backend/models/`
2. Migration runs automatically on backend startup
3. Test migration on development database first
4. Backup production database before deploying
5. Update documentation with schema changes

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Security best practices followed
- [ ] No hardcoded credentials or secrets
- [ ] Console.logs removed (or use proper logging)
- [ ] Responsive design tested
- [ ] API changes documented
- [ ] Environment variables documented if added

---

## Contact & Support

For questions or issues:
1. Check existing documentation in `docs/` folder
2. Review `FRONTEND_BACKEND_INTEGRATION.md` for setup help
3. Check `docs/BUG_TRACKER.md` for known issues
4. Refer to official documentation links above

---

---

## Current Product Catalog

**See `PRODUCTS.md` for complete product information**

| Product | Price | Variants | Status |
|---------|-------|----------|--------|
| Pack A Week Kit | ₹2600 | 5 | ✅ Available |
| Packing Cubes | ₹2500 | 5 | ✅ Available |
| Toiletry Kit | ₹1000 | 5 | ✅ Available |
| Shoe Pouch | ₹1000 | 5 | ✅ Available |
| Multipurpose Pouch | ₹900 | 10 | ✅ Available |
| On-the-Go Foldable Pouch | ₹900 | 1 | ✅ Available |
| Foldable Travel Kit | ₹500 | 5 | ✅ Available |
| Accessory Pouch | ₹450 | 5 | ✅ Available |
| Dental Kit | TBD | 5 | ✅ Available |
| Crossbody Bag | TBD | 0 | 🚀 Coming Soon |
| Medicine Kit | TBD | 0 | 🚀 Coming Soon |
| Pencil Pouch | TBD | 0 | 🚀 Coming Soon |

---

**Last Updated**: 2026-03-07
**Maintained by**: Storee Development Team
