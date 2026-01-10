# Postman Collection Setup Guide

This guide will help you import and use the Postman collection for testing the Storee API.

## 📦 Files Included

1. **Storee_API.postman_collection.json** - Complete API collection with all endpoints
2. **Storee_API.postman_environment.json** - Environment variables for easy configuration

## 🚀 Quick Start

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Storee_API.postman_collection.json`
5. Click **Import**

### Step 2: Import Environment (Optional but Recommended)

1. Click **Import** again
2. Select **File** tab
3. Choose `Storee_API.postman_environment.json`
4. Click **Import**
5. Select the environment from the dropdown (top right): **Storee API - Local**

### Step 3: Update Base URL and Admin API Key

If your backend is running on a different port or URL:

1. Click on the environment dropdown (top right)
2. Select **Storee API - Local**
3. Click the eye icon to view/edit variables
4. Update `base_url` if needed (default: `http://localhost:8080`)
5. Update `admin_api_key` if you've set a custom ADMIN_API_KEY in your `.env` file

## 📋 Available Endpoints

### Health Check

- **GET** `/health` - Check API server status

### Products

- **GET** `/api/v1/products` - Get all products
- **GET** `/api/v1/products?category=pouch` - Get products by category
- **GET** `/api/v1/products/:id` - Get product by ID
- **GET** `/api/v1/products/slug/:slug` - Get product by slug

### Razorpay

- **POST** `/api/v1/razorpay/create-order` - Create Razorpay order
- **POST** `/api/v1/razorpay/verify-payment` - Verify payment signature

### Orders

- **POST** `/api/v1/orders/cod` - Create Cash on Delivery order

### Admin (Requires API Key)

- **POST** `/api/v1/admin/products` - Create new product
- **GET** `/api/v1/admin/products` - Get all products (including inactive)
- **PUT** `/api/v1/admin/products/:id` - Update product
- **DELETE** `/api/v1/admin/products/:id` - Delete product

## 🔧 Testing Workflow

### 1. Test Health Check

Start by testing the health endpoint to ensure the server is running:

```
GET /health
```

### 2. Test Products

Test product endpoints:

```
GET /api/v1/products
GET /api/v1/products/slug/medicine-pouch
```

### 3. Test Order Creation

#### Razorpay Order Flow:

1. **Create Order**: `POST /api/v1/razorpay/create-order`

   - Copy the `razorpay_id` from the response
   - Use this in your frontend for Razorpay checkout

2. **Verify Payment**: `POST /api/v1/razorpay/verify-payment`
   - After payment is completed in frontend
   - Use the payment details to verify

#### COD Order:

```
POST /api/v1/orders/cod
```

### 4. Test Admin Endpoints

**Important**: Admin endpoints require an API key in the `X-API-Key` header.

1. **Create Product**: `POST /api/v1/admin/products`

   - Add `X-API-Key` header with your admin API key
   - See example request body below

2. **Get All Products (Admin)**: `GET /api/v1/admin/products`

   - Returns all products including inactive ones

3. **Update Product**: `PUT /api/v1/admin/products/:id`

   - Only include fields you want to update

4. **Delete Product**: `DELETE /api/v1/admin/products/:id`
   - Soft deletes the product

## 📝 Request Examples

### Create Razorpay Order

```json
{
  "amount": 69900,
  "items": [
    {
      "product": {
        "id": "1",
        "name": "Medicine Pouch",
        "basePrice": 69900
      },
      "quantity": 1
    }
  ],
  "customer": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210"
  },
  "address": {
    "line1": "123 Main Street",
    "line2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

### Create COD Order

```json
{
  "amount": 69900,
  "items": [
    {
      "product": {
        "id": "1",
        "name": "Medicine Pouch",
        "basePrice": 69900
      },
      "quantity": 1
    }
  ],
  "customer": {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "9876543210"
  },
  "address": {
    "line1": "456 Oak Avenue",
    "line2": "Floor 2",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  }
}
```

### Create Product (Admin)

**Header**: `X-API-Key: dev-admin-key-change-in-production`

```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description here",
  "basePrice": 99900,
  "category": "pouch",
  "stock": 100,
  "isActive": true,
  "features": [
    "Multipurpose Storage",
    "Water-Resistant Protection",
    "Durable & Easy to Wash",
    "Perfect for Travel",
    "Stylish & Functional"
  ],
  "images": [
    {
      "url": "/images/products/product-image.jpeg",
      "altText": "New Product",
      "order": 1,
      "isPrimary": true
    }
  ]
}
```

### Update Product (Admin)

**Header**: `X-API-Key: dev-admin-key-change-in-production`

```json
{
  "name": "Updated Product Name",
  "basePrice": 89900,
  "stock": 50,
  "isActive": true
}
```

## 🔐 Important Notes

1. **Amount Format**: All amounts are in **paise** (not rupees)

   - ₹699.00 = 69900 paise
   - ₹999.00 = 99900 paise

2. **Phone Number**: Use 10-digit Indian phone numbers (without country code)

3. **Pincode**: Use 6-digit Indian pincodes

4. **Razorpay Integration**:

   - Make sure Razorpay credentials are set in `.env`
   - Test mode uses test API keys
   - Production mode uses live API keys

5. **Admin API Key**:
   - Admin endpoints require `X-API-Key` header
   - Default key: `dev-admin-key-change-in-production`
   - Set `ADMIN_API_KEY` in `.env` for production
   - **Important**: Change the default key in production!

## 🐛 Troubleshooting

### Connection Refused

- Ensure backend server is running: `go run main.go`
- Check if port 8080 is available
- Verify `base_url` in environment variables

### 404 Not Found

- Check if the endpoint path is correct
- Ensure API version is `/api/v1/`

### 500 Internal Server Error

- Check backend logs for detailed error messages
- Verify database connection
- Ensure all environment variables are set correctly

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS middleware configuration

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [Backend README](./README.md)
- [Environment Setup Guide](./ENV_SETUP.md)
