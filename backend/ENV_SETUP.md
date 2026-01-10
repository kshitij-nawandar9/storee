# Environment Variables Setup

Copy this content to your `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=8080
ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=storee

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Admin API Key (for admin endpoints)
ADMIN_API_KEY=dev-admin-key-change-in-production
```

## Setup Instructions

1. Create a `.env` file in the `backend/` directory
2. Copy the above content
3. Replace the placeholder values with your actual credentials:
   - **DB_PASSWORD**: Your PostgreSQL password
   - **RAZORPAY_KEY_ID**: Your Razorpay API Key ID (from Razorpay Dashboard)
   - **RAZORPAY_KEY_SECRET**: Your Razorpay API Secret (from Razorpay Dashboard)
   - **FRONTEND_URL**: Your frontend URL (default: http://localhost:5173)
   - **ADMIN_API_KEY**: Secret key for admin API access (change in production!)

## Getting Razorpay Credentials

1. Sign up/Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate API Keys (use Test Keys for development)
4. Copy the Key ID and Key Secret

## Database Setup

### Using Local PostgreSQL

```bash
# Create database
createdb storee

# Or using psql
psql -U postgres
CREATE DATABASE storee;
```

### Using Supabase

1. Create a project on [Supabase](https://supabase.com/)
2. Go to Project Settings → Database
3. Copy the connection string or use individual values:
   - Host: Your Supabase host
   - Port: 5432
   - User: postgres
   - Password: Your Supabase password
   - Database: postgres
