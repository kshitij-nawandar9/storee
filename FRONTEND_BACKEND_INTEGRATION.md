# Frontend-Backend Integration Guide

## ✅ Configuration Complete

The frontend is now configured to fetch products from the backend API by default.

## Changes Made

1. **Updated API Service** (`frontend/src/services/api.ts`):

   - ✅ Removed automatic mock data fallback
   - ✅ Increased timeout from 3s to 10s
   - ✅ Backend API is now the primary data source
   - ✅ Mock data only used if explicitly enabled via environment variables

2. **Created Environment Setup Guide** (`frontend/ENV_SETUP.md`):
   - ✅ Complete documentation for environment variables
   - ✅ Setup instructions
   - ✅ Troubleshooting guide

## Quick Start

### 1. Backend Setup

```bash
cd backend
# Create .env file (see backend/ENV_SETUP.md)
go run main.go
# Backend runs on http://localhost:8080
```

### 2. Frontend Setup

```bash
cd frontend
# Create .env file with:
# VITE_API_URL=http://localhost:8080/api/v1
# VITE_RAZORPAY_KEY_ID=your_key_id
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Verify Connection

- Open browser console
- Check Network tab for API calls to `/api/v1/products`
- Products should load from backend

## Environment Variables

### Required

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8080/api/v1`)
- `VITE_RAZORPAY_KEY_ID` - Razorpay Key ID for payments

### Optional

- `VITE_USE_MOCK_DATA` - Set to `'true'` to use mock data instead of backend
- `VITE_FALLBACK_TO_MOCK` - Set to `'true'` to fallback to mock data if backend unavailable

## API Endpoints Used

The frontend calls these backend endpoints:

1. **GET** `/api/v1/products` - Get all products
2. **GET** `/api/v1/products?category=pouch` - Get products by category
3. **GET** `/api/v1/products/:id` - Get product by ID
4. **GET** `/api/v1/products/slug/:slug` - Get product by slug
5. **POST** `/api/v1/razorpay/create-order` - Create Razorpay order
6. **POST** `/api/v1/razorpay/verify-payment` - Verify payment
7. **POST** `/api/v1/orders/cod` - Create COD order

## Testing

### Test Backend Connection

```bash
# Health check
curl http://localhost:8080/health

# Get products
curl http://localhost:8080/api/v1/products
```

### Test Frontend

1. Start backend: `cd backend && go run main.go`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. Check browser console for API calls
5. Products should load from backend

## Troubleshooting

### Products Not Loading

1. **Check Backend is Running**:

   ```bash
   curl http://localhost:8080/health
   ```

2. **Check Environment Variables**:

   - Verify `VITE_API_URL` in frontend `.env`
   - Verify backend is running on correct port

3. **Check CORS**:

   - Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
   - Default: `http://localhost:5173`

4. **Check Browser Console**:
   - Look for API errors
   - Check Network tab for failed requests

### CORS Errors

If you see CORS errors:

1. Update backend `.env`:
   ```
   FRONTEND_URL=http://localhost:5173
   ```
2. Restart backend server
3. Clear browser cache

### Backend Connection Timeout

- Increase timeout in `api.ts` (currently 10 seconds)
- Check if backend is running
- Verify `VITE_API_URL` is correct

## Production Deployment

### Frontend

1. Set `VITE_API_URL` to production backend URL
2. Set `VITE_RAZORPAY_KEY_ID` to production key
3. Build: `npm run build`
4. Deploy `dist/` folder

### Backend

1. Set `FRONTEND_URL` to production frontend URL
2. Set all environment variables (see `backend/ENV_SETUP.md`)
3. Deploy to Railway/Heroku/etc.

## Next Steps

1. ✅ Frontend configured to use backend
2. ⬜ Add products via admin API
3. ⬜ Test full checkout flow
4. ⬜ Deploy to production

## Support

- Frontend setup: See `frontend/ENV_SETUP.md`
- Backend setup: See `backend/ENV_SETUP.md`
- API documentation: See `backend/POSTMAN_SETUP.md`
