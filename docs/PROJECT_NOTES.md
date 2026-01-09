# 📝 Project Notes

General notes, decisions, and documentation for the Storee e-commerce project.

---

## Project Information

**Project Name**: Storee  
**Description**: E-commerce website for bag packs and pouches  
**Tech Stack**: React (Frontend) + Golang (Backend) + Razorpay  
**Start Date**: _______________  
**Repository**: _______________  

---

## Architecture Decisions

### Technology Choices

**Frontend**: React with Vite
- **Reason**: Fast development, modern tooling, great DX

**Backend**: Golang
- **Reason**: High performance, good concurrency, fast API responses

**Database**: PostgreSQL
- **Reason**: Reliable, ACID compliant, good for e-commerce

**Payment**: Razorpay
- **Reason**: Best for Indian market, supports UPI, cards, wallets

**Hosting**: 
- Frontend: Vercel (free tier, automatic SSL)
- Backend: Railway (easy Golang deployment)
- Database: Supabase (managed PostgreSQL)

---

## Product Information

### 8 Pouch Types
1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 

### Color Variants
[Document color options for each pouch type]

---

## API Endpoints

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/slug/:slug` - Get product by slug

### Variants
- `GET /api/v1/variants/:id` - Get variant details
- `GET /api/v1/variants/:id/stock` - Check stock

### Orders
- `POST /api/v1/razorpay/create-order` - Create Razorpay order
- `POST /api/v1/razorpay/verify-payment` - Verify payment
- `POST /api/v1/orders/cod` - Create COD order

### Reviews
- `GET /api/v1/products/:id/reviews` - Get product reviews
- `POST /api/v1/products/:id/reviews` - Create review

---

## Environment Variables

### Backend (.env)
```
PORT=8080
ENV=production
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FRONTEND_URL=
```

### Frontend (.env)
```
VITE_API_URL=
VITE_RAZORPAY_KEY_ID=
```

---

## Database Schema

### Products Table
- id (UUID)
- name (VARCHAR)
- slug (VARCHAR, unique)
- description (TEXT)
- base_price (BIGINT) - in paise
- category (VARCHAR)
- is_active (BOOLEAN)
- created_at, updated_at

### Product Variants Table
- id (UUID)
- product_id (UUID, FK)
- color_name (VARCHAR)
- color_code (VARCHAR)
- image (VARCHAR)
- price (BIGINT) - in paise
- stock (INTEGER)
- sku (VARCHAR, unique)
- is_default (BOOLEAN)
- is_active (BOOLEAN)

### Orders Table
- id (UUID)
- order_id (VARCHAR, unique) - Razorpay order ID
- customer_name, email, phone
- address (JSONB)
- items (JSONB)
- total_amount (BIGINT) - in paise
- status (VARCHAR)
- payment_id (VARCHAR)
- payment_method (VARCHAR) - 'razorpay' or 'cod'
- created_at, updated_at

---

## Important Decisions

### Date: _______________
**Decision**:  
**Reason**:  
**Impact**:  

---

## Meeting Notes

### Date: _______________
**Attendees**:  
**Topics Discussed**:  
**Decisions Made**:  
**Action Items**:  

---

## Code Standards

**Backend (Golang)**:  
- Use standard Go formatting
- Follow Go naming conventions
- Add comments for exported functions
- Error handling: return errors, don't panic

**Frontend (React)**:  
- Use TypeScript
- Functional components with hooks
- Component-based architecture
- Use Tailwind CSS for styling

---

## Third-Party Services

**Razorpay**:  
- Account: _______________
- Dashboard: _______________
- Support: _______________

**Email Service**:  
- Provider: _______________
- Account: _______________

**Hosting**:  
- Frontend: _______________
- Backend: _______________
- Database: _______________

---

## Useful Commands

### Backend
```bash
# Run locally
go run main.go

# Build
go build

# Run tests
go test ./...

# Run migrations
# [Add migration commands]
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
```

---

## Resources & Documentation

**Golang**:  
- Official Docs: https://go.dev/doc/
- Gin Framework: https://gin-gonic.com/docs/

**React**:  
- Official Docs: https://react.dev/
- Vite: https://vitejs.dev/

**Razorpay**:  
- Documentation: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/test-cards/

**PostgreSQL**:  
- Documentation: https://www.postgresql.org/docs/

---

## Future Considerations

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Subscription model
- [ ] Loyalty program

---

## Notes
- Keep this document updated as the project evolves
- Document important decisions and their rationale
- Add useful links and resources
- Update as new information becomes available
