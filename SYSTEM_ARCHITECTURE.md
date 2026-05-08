# Nonvoyxona OS - System Architecture Documentation

## Overview

Nonvoyxona OS is a comprehensive bakery management system built with React 19, Express 4, tRPC 11, and MySQL. The system provides complete business operations management for bakeries in Uzbekistan, with full Uzbek language localization and premium design.

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom animations
- **State Management**: React Query (via tRPC)
- **Routing**: Wouter
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4
- **API Layer**: tRPC 11
- **Database ORM**: Drizzle ORM
- **Database**: MySQL/TiDB
- **Authentication**: Manus OAuth + PIN-based local auth
- **Serialization**: SuperJSON

### Development
- **Language**: TypeScript 5.9
- **Testing**: Vitest
- **Package Manager**: pnpm
- **Build**: esbuild

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Login, Dashboard, Sales, Production,          │   │
│  │ Ingredients, Delivery, Expenses, Salaries,           │   │
│  │ Customers, Reports                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ tRPC Client (Type-safe RPC calls)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + tRPC)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ tRPC Routers:                                        │   │
│  │ - auth (PIN login, logout)                           │   │
│  │ - dashboard (metrics, charts)                        │   │
│  │ - sales (CRUD, debt tracking)                        │   │
│  │ - production (CRUD, ingredient consumption)          │   │
│  │ - ingredients (inventory, purchases)                 │   │
│  │ - delivery (orders, settlements)                     │   │
│  │ - expenses (CRUD, categories)                        │   │
│  │ - salaries (payments, tracking)                      │   │
│  │ - customers (management, debt)                       │   │
│  │ - reports (analytics, aggregations)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database Layer (Drizzle ORM)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                   Database (MySQL/TiDB)                      │
│  19 Tables with relationships and constraints               │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### Users & Authentication
- **users**: User accounts with PIN codes, roles, and profile info
  - Fields: id, openId, name, email, surname, phoneNumber, pinCode, role, isActive, createdAt, updatedAt, lastSignedIn

#### Business Operations
- **products**: Bakery products (bread, pastries, etc.)
- **sales**: Daily sales transactions with payment tracking
- **production**: Daily production records with quantities
- **ingredients**: Raw materials inventory
- **ingredient_consumption**: Links production to ingredient usage
- **deliveries**: Delivery orders and tracking
- **driver_settlements**: Driver earnings and settlements
- **expenses**: Operational expenses by category
- **salaries**: Employee salary records and payments
- **salary_payments**: Salary payment history
- **customers**: Customer information and debt tracking
- **debt_payments**: Payment history for customer debts

### Key Relationships

```
users (1) ──→ (many) sales
users (1) ──→ (many) production
users (1) ──→ (many) deliveries
users (1) ──→ (many) expenses
users (1) ──→ (many) salaries
users (1) ──→ (many) customers

products (1) ──→ (many) sales
products (1) ──→ (many) production

ingredients (1) ──→ (many) ingredient_consumption
production (1) ──→ (many) ingredient_consumption

customers (1) ──→ (many) sales
customers (1) ──→ (many) debt_payments

deliveries (1) ──→ (many) driver_settlements
```

## Authentication System

### PIN-Based Login
1. User enters phone number and PIN code
2. System validates PIN against database
3. User selects role (owner, manager, cashier, driver)
4. Session cookie is created and stored

### Owner Secret Code
- Additional security layer for owner role
- Separate from PIN code
- Required for sensitive operations
- Stored securely in database

### Role-Based Access Control (RBAC)
- **Owner**: Full system access, user management, secret code access
- **Manager**: All modules except user management
- **Cashier**: Sales, customers, delivery tracking
- **Driver**: Delivery tracking and settlement history

## API Layer (tRPC)

### Procedure Types
- **publicProcedure**: No authentication required
- **protectedProcedure**: Requires authentication
- **ownerProcedure**: Requires owner role

### Request/Response Flow
1. Frontend calls tRPC procedure with typed input
2. Backend validates input with Zod schemas
3. Procedure executes business logic
4. Database queries via Drizzle ORM
5. Results returned with automatic serialization (SuperJSON)
6. Frontend receives typed response

### Error Handling
- Input validation errors return 400 Bad Request
- Authentication errors return 401 Unauthorized
- Authorization errors return 403 Forbidden
- Server errors return 500 Internal Server Error
- All errors include descriptive messages

## Business Logic

### Automatic Calculations

#### Stock Deduction
When production is recorded:
1. Fetch production quantity and product
2. Calculate ingredient consumption based on recipe
3. Deduct from ingredient stock
4. Update ingredient table
5. Alert if stock falls below minimum

#### Debt Tracking
When sales are recorded with debt payment method:
1. Add amount to customer total debt
2. Record transaction in sales table
3. Update customer debt balance
4. Generate debt report

#### Driver Settlements
When settlement is recorded:
1. Calculate earnings from completed deliveries
2. Apply deductions for returned goods
3. Subtract advances
4. Calculate net payout
5. Record settlement history

#### Profit Calculation
Daily/weekly/monthly:
1. Sum all sales revenue
2. Sum all expenses
3. Calculate net profit (revenue - expenses)
4. Calculate profit margin (profit / revenue * 100)

## Frontend Architecture

### Page Structure
```
App.tsx (Routes)
├── Login.tsx (Public)
├── Dashboard.tsx (Protected)
├── Sales.tsx (Protected)
├── Production.tsx (Protected)
├── Ingredients.tsx (Protected)
├── Delivery.tsx (Protected)
├── Expenses.tsx (Protected)
├── Salaries.tsx (Protected)
├── Customers.tsx (Protected)
└── Reports.tsx (Protected)
```

### Component Organization
```
components/
├── ui/ (shadcn/ui components)
├── DashboardLayout.tsx
├── ErrorBoundary.tsx
└── AIChatBox.tsx

contexts/
├── AuthContext.tsx
└── ThemeContext.tsx

hooks/
├── useAuth.ts
└── useI18n.ts

lib/
└── trpc.ts
```

### State Management
- React Query for server state (via tRPC)
- React Context for auth state
- Local component state for forms

## Localization (i18n)

### Language Support
- Primary: Uzbek (Latin script)
- 200+ UI strings translated
- Date/time formatting for Uzbekistan
- Currency formatting (UZS)

### String Categories
- Common UI labels
- Module-specific strings
- Error messages
- Validation messages
- Report labels

## Design System

### Color Palette
- Primary: Amber (#f59e0b)
- Secondary: Orange (#f97316)
- Accent: Rose (#fb923c)
- Backgrounds: Warm gradients

### Typography
- Font: System fonts (Tailwind default)
- Sizes: 12px to 48px
- Weights: 400, 500, 600, 700, 900

### Animations
- Slide In/Out: 0.3-0.4s
- Fade: 0.2-0.3s
- Scale: 0.3s
- Hover effects: 0.2s
- Loading: Continuous shimmer

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Security Considerations

### Authentication
- PIN-based login (4-6 digits)
- Owner secret code protection
- Session cookies with secure flags
- CSRF protection via tRPC

### Authorization
- Role-based access control
- Protected routes on frontend
- Protected procedures on backend
- Input validation on all endpoints

### Data Protection
- SQL injection prevention (Drizzle ORM)
- XSS prevention (React auto-escaping)
- CSRF tokens in session
- Secure password hashing (if needed)

## Performance Optimization

### Frontend
- Code splitting via Vite
- Lazy loading of pages
- Image optimization
- CSS minification

### Backend
- Database query optimization
- SQL aggregations for reports
- Connection pooling
- Caching strategies

### Database
- Indexed foreign keys
- Efficient query patterns
- Normalized schema
- Batch operations

## Deployment

### Environment Variables
- DATABASE_URL: MySQL connection string
- JWT_SECRET: Session signing key
- VITE_APP_ID: OAuth application ID
- OAUTH_SERVER_URL: OAuth backend URL
- VITE_OAUTH_PORTAL_URL: OAuth login portal

### Build Process
1. `pnpm build`: Compile TypeScript and bundle
2. Output: `dist/` directory with server and client
3. `pnpm start`: Run production server

### Hosting
- Manus platform (built-in hosting)
- Auto-scaling
- SSL/TLS encryption
- Database backups

## Monitoring & Logging

### Server Logs
- Request/response logging
- Error tracking
- Performance metrics
- Database query logs

### Client Logs
- Console errors/warnings
- Network requests
- User interactions
- Session tracking

## Future Enhancements

### Planned Features
- Voice input system (Uzbek speech-to-text)
- Advanced filtering on all list views
- Employee-based salary assignment
- Customer balance history views
- Real PDF/Excel export implementation
- Dark mode support
- Mobile app (React Native)
- SMS notifications
- Email reports

### Scalability
- Horizontal scaling ready
- Database sharding support
- Caching layer (Redis)
- CDN for static assets
- Load balancing

## Maintenance

### Regular Tasks
- Database backups
- Log rotation
- Security updates
- Performance monitoring
- User support

### Troubleshooting
- Check server logs
- Verify database connection
- Clear browser cache
- Restart services
- Review error messages

## Support & Documentation

### User Documentation
- Admin guide (role management)
- User manual (module usage)
- FAQ section
- Video tutorials

### Developer Documentation
- API documentation
- Database schema docs
- Component library
- Deployment guide

---

**Version**: 1.0.0  
**Last Updated**: May 8, 2026  
**Status**: Production Ready
