# Storee Backend API

Golang backend API for the Storee e-commerce platform.

## 🚀 Getting Started

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 14+ (or use Supabase)
- Razorpay account (for payment integration)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb storee
   ```

5. **Run the server**
   ```bash
   go run main.go
   ```

The server will start on `http://localhost:8080` by default.

## 📁 Project Structure

```
backend/
├── main.go                 # Application entry point
├── config/                 # Configuration management
│   └── config.go
├── database/               # Database connection and migrations
│   └── database.go
├── models/                 # Database models
│   ├── product.go
│   └── order.go
├── handlers/               # HTTP request handlers
│   ├── product_handler.go
│   ├── razorpay_handler.go
│   └── order_handler.go
├── routes/                 # Route definitions
│   └── routes.go
├── middleware/             # HTTP middleware
│   └── cors.go
├── services/               # External service clients
│   └── razorpay.go
├── utils/                  # Utility functions
│   ├── response.go
│   └── helpers.go
├── go.mod                  # Go module dependencies
├── go.sum                  # Dependency checksums
└── .env.example           # Environment variables template
```

## 🔌 API Endpoints

### Products

- `GET /api/v1/products` - Get all products (optional `?category=pouch` filter)
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/slug/:slug` - Get product by slug

### Razorpay

- `POST /api/v1/razorpay/create-order` - Create Razorpay order
- `POST /api/v1/razorpay/verify-payment` - Verify payment signature

### Orders

- `POST /api/v1/orders/cod` - Create Cash on Delivery order

### Health Check

- `GET /health` - Health check endpoint

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `ENV` | Environment (development/production) | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `storee` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | - |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | - |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🗄️ Database Schema

### Products Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `description` (TEXT)
- `base_price` (BIGINT) - in paise
- `category` (VARCHAR)
- `stock` (INTEGER, nullable)
- `is_active` (BOOLEAN)
- `features` (TEXT[])
- `created_at`, `updated_at` (TIMESTAMP)

### Product Images Table
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `url` (VARCHAR)
- `alt_text` (VARCHAR)
- `order` (INTEGER)
- `is_primary` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### Orders Table
- `id` (UUID, Primary Key)
- `order_id` (VARCHAR, Unique) - Razorpay order ID or custom ID
- `customer_name`, `customer_email`, `customer_phone` (VARCHAR)
- `address` (JSONB)
- `items` (JSONB)
- `total_amount` (BIGINT) - in paise
- `status` (VARCHAR) - pending, paid, processing, shipped, delivered, cancelled
- `payment_id` (VARCHAR) - Razorpay payment ID
- `payment_method` (VARCHAR) - razorpay or cod
- `created_at`, `updated_at` (TIMESTAMP)

## 🔧 Development

### Run in development mode
```bash
go run main.go
```

### Build for production
```bash
go build -o storee-backend
./storee-backend
```

### Run tests
```bash
go test ./...
```

### Format code
```bash
go fmt ./...
```

### Lint code
```bash
golangci-lint run
```

## 🔐 Security Notes

- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Razorpay signature verification is implemented for payment security
- CORS is configured to allow only specified frontend URLs
- Database uses parameterized queries (via GORM) to prevent SQL injection

## 📦 Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically detect Go and build the application
4. Set `PORT` environment variable (Railway provides this automatically)

### Environment Variables for Production

Make sure to set all required environment variables in your hosting platform:
- Database connection string (or individual DB_* variables)
- Razorpay credentials
- Frontend URL for CORS

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `createdb storee`

### Razorpay Integration Issues
- Verify Razorpay credentials are correct
- Check Razorpay dashboard for API key status
- Ensure you're using test keys for development

### CORS Issues
- Verify `FRONTEND_URL` matches your frontend URL exactly
- Check browser console for CORS error details

## 📚 Dependencies

- **Gin** - Web framework
- **GORM** - ORM for database operations
- **PostgreSQL Driver** - Database driver
- **Razorpay** - Payment gateway integration
- **CORS Middleware** - Cross-origin resource sharing

## 📞 Support

For issues or questions, please refer to the main project README or create an issue in the repository.
