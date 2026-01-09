# 🛍️ Storee - E-Commerce Platform

An e-commerce website for bag packs and pouches, built with React (Frontend) and Golang (Backend), integrated with Razorpay for payments.

## 📋 Project Overview

Storee is a modern e-commerce platform specializing in bag packs and pouches. The platform features 8 different pouch types, each with multiple color variants, providing customers with a wide selection of products.

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Golang** - Server language
- **Gin** - Web framework
- **PostgreSQL** - Database
- **GORM** - ORM
- **Razorpay** - Payment gateway

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **Supabase** - Database hosting
- **Resend** - Email service

## 📁 Project Structure

```
storee/
├── frontend/          # React frontend application
├── backend/           # Golang backend API
├── docs/              # Documentation and tracking files
│   ├── PRODUCTION_LAUNCH_CHECKLIST.md
│   ├── BUG_TRACKER.md
│   ├── FEATURE_REQUESTS.md
│   ├── DEPLOYMENT_LOG.md
│   └── PROJECT_NOTES.md
└── README.md
```

## 🏗️ Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Go** 1.21+
- **PostgreSQL** 14+ (or use Supabase)
- **Git**

### Installation

#### Backend Setup

```bash
cd backend
go mod init storee/backend
go mod tidy
go run main.go
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories. See `docs/PROJECT_NOTES.md` for required variables.

## 📚 Documentation

- **[Production Launch Checklist](docs/PRODUCTION_LAUNCH_CHECKLIST.md)** - Complete launch plan
- **[Bug Tracker](docs/BUG_TRACKER.md)** - Track and manage bugs
- **[Feature Requests](docs/FEATURE_REQUESTS.md)** - Track new features
- **[Deployment Log](docs/DEPLOYMENT_LOG.md)** - Deployment history
- **[Project Notes](docs/PROJECT_NOTES.md)** - Architecture decisions and notes

## 🎯 Features

- ✅ Product catalog with 8 pouch types
- ✅ Multiple color variants per product
- ✅ Shopping cart functionality
- ✅ Secure checkout with Razorpay
- ✅ Cash on Delivery (COD) option
- ✅ Order management
- ✅ Product reviews and ratings
- ✅ Responsive design
- ✅ WhatsApp integration
- ✅ Email notifications

## 🔐 Security

- HTTPS enforced
- Environment variables for sensitive data
- CORS configured
- Input validation
- SQL injection prevention
- XSS protection
- Payment signature verification

## 📊 Development Status

- **Development**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- **Testing**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
- **Deployment**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

[Add your license here]

## 📞 Contact

[Add contact information]

---

**Last Updated**: _______________
