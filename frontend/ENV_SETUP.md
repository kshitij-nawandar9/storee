# Frontend Environment Setup

## Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api/v1

# Razorpay Key ID (for payment gateway)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# PostHog analytics (optional — analytics are disabled if unset)
VITE_POSTHOG_KEY=your_posthog_project_api_key
# VITE_POSTHOG_HOST=https://us.i.posthog.com  # use https://eu.i.posthog.com for EU cloud

# PostHog shared dashboard link, embedded on /admin/analytics (optional)
# VITE_POSTHOG_DASHBOARD_URL=https://us.posthog.com/shared/xxxxxxxx

# Optional: Use mock data instead of backend (set to 'true' to enable)
# VITE_USE_MOCK_DATA=false

# Optional: Fallback to mock data if backend is unavailable (set to 'true' to enable)
# VITE_FALLBACK_TO_MOCK=false
```

## Setup Instructions

1. **Create `.env` file**:
   ```bash
   cd frontend
   cp .env.example .env  # If .env.example exists
   # Or create .env manually
   ```

2. **Set Backend URL**:
   - For local development: `VITE_API_URL=http://localhost:8080/api/v1`
   - For production: `VITE_API_URL=https://your-backend-domain.com/api/v1`

3. **Set Razorpay Key**:
   - Get your Razorpay Key ID from [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Add it to `VITE_RAZORPAY_KEY_ID`

4. **Restart Dev Server**:
   After creating/updating `.env`, restart your dev server:
   ```bash
   npm run dev
   ```

## Configuration Options

### VITE_API_URL
- **Required**: Yes (has default: `http://localhost:8080/api/v1`)
- **Description**: Backend API base URL
- **Example**: `http://localhost:8080/api/v1` or `https://api.storee.com/api/v1`

### VITE_RAZORPAY_KEY_ID
- **Required**: Yes (for payment functionality)
- **Description**: Razorpay API Key ID for payment gateway
- **Example**: `rzp_test_xxxxxxxxxxxxx`

### VITE_POSTHOG_KEY
- **Required**: No (analytics are silently disabled if unset)
- **Description**: PostHog project API key (publishable) for visitor/funnel analytics
- **Example**: `phc_xxxxxxxxxxxxx` — from PostHog → Project Settings → Project API Key

### VITE_POSTHOG_HOST
- **Required**: No (default: `https://us.i.posthog.com`)
- **Description**: PostHog ingestion host — set to `https://eu.i.posthog.com` if the project is on EU cloud

### VITE_POSTHOG_DASHBOARD_URL
- **Required**: No (the /admin/analytics page shows setup instructions if unset)
- **Description**: Public share link of a PostHog dashboard, embedded on the admin Analytics tab. Anyone with this URL can view the dashboard, so don't share it beyond admins.
- **Example**: `https://us.posthog.com/shared/xxxxxxxx` — from PostHog → your dashboard → Share → enable public sharing

### VITE_USE_MOCK_DATA
- **Required**: No (default: `false`)
- **Description**: Set to `true` to use mock data instead of backend API
- **Use Case**: Development/testing without backend

### VITE_FALLBACK_TO_MOCK
- **Required**: No (default: `false`)
- **Description**: Set to `true` to fallback to mock data if backend is unavailable
- **Use Case**: Graceful degradation during backend downtime

## Default Behavior

By default, the frontend will:
1. ✅ **Always try to fetch from backend** first
2. ✅ **Throw errors** if backend is unavailable (unless `VITE_FALLBACK_TO_MOCK=true`)
3. ✅ **Use backend API** for all product data

## Production Setup

For production deployment:

1. Set `VITE_API_URL` to your production backend URL
2. Set `VITE_RAZORPAY_KEY_ID` to your production Razorpay key
3. Do **NOT** set `VITE_USE_MOCK_DATA` or `VITE_FALLBACK_TO_MOCK` in production
4. Ensure backend CORS is configured to allow your frontend domain

## Troubleshooting

### Products not loading
- Check if backend is running: `curl http://localhost:8080/health`
- Verify `VITE_API_URL` is correct
- Check browser console for API errors
- Ensure CORS is configured on backend

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check backend CORS middleware configuration

### Mock Data Still Showing
- Check if `VITE_USE_MOCK_DATA=true` is set
- Remove or set to `false` to use backend
- Restart dev server after changing `.env`
