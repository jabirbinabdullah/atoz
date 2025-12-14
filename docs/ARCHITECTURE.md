# Arsitektur Sistem AtoZ

## 🏗️ Gambaran Arsitektur

AtoZ dibangun dengan arsitektur modern **Full-Stack TypeScript** menggunakan Next.js 16 dengan App Router, yang menggabungkan frontend dan backend dalam satu aplikasi monolitik yang teroptimasi.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  React UI    │  │  Components  │  │  Client      │     │
│  │  (Browser)   │  │              │  │  State Mgmt  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ▲                  ▲                  ▲             │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┼────────────────────────────────┐
│                            ▼                                │
│                     SERVER LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js App Router (SSR/RSC)               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Pages     │  │  API       │  │  Middleware│    │  │
│  │  │  (SSR)     │  │  Routes    │  │  & Auth    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Auth      │  │  Member    │  │  Relations │    │  │
│  │  │  Service   │  │  Service   │  │  Service   │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Access Layer                       │  │
│  │              Prisma ORM                              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                            ▼                                │
│                      DATABASE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SQLite Database                         │  │
│  │  - Users & Auth tables                               │  │
│  │  - Family & Members                                  │  │
│  │  - Relationships                                     │  │
│  │  - Todos (legacy)                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Arsitektur Pattern

### 1. **Monolithic Full-Stack**
- Single deployment unit
- Co-located frontend & backend
- Simplified development & deployment

### 2. **Server-Side Rendering (SSR)**
- Pre-render pages di server
- SEO-friendly
- Fast initial page load

### 3. **API-First Design**
- RESTful API endpoints
- JSON data format
- Stateless operations

### 4. **Database-First Schema**
- Prisma schema sebagai single source of truth
- Type-safe database access
- Migration-based schema evolution

## 🔧 Technology Stack

### Frontend Layer

#### **Next.js 16 (App Router)**
- **Role**: Full-stack React framework
- **Features**:
  - File-based routing
  - Server Components (RSC)
  - Automatic code splitting
  - Image optimization
  - Font optimization

#### **React 19**
- **Role**: UI library
- **Features**:
  - Functional components
  - Hooks (useState, useEffect, etc.)
  - Client components ("use client")

#### **TypeScript 5**
- **Role**: Type safety
- **Features**:
  - Static typing
  - IDE intellisense
  - Compile-time error checking
  - Interface definitions

#### **Tailwind CSS 4**
- **Role**: Styling framework
- **Features**:
  - Utility-first CSS
  - Responsive design
  - Custom design system
  - Dark mode support (future)

### Backend Layer

#### **Next.js API Routes**
- **Location**: `src/app/api/**/route.ts`
- **Pattern**: File-based routing
- **Methods**: GET, POST, PATCH, DELETE
- **Format**: RESTful JSON APIs

#### **NextAuth.js 4**
- **Role**: Authentication library
- **Features**:
  - Session management
  - Credentials provider
  - JWT tokens
  - Database sessions
  - CSRF protection

#### **Prisma ORM 6**
- **Role**: Database toolkit
- **Features**:
  - Type-safe queries
  - Schema migrations
  - Seeding
  - Introspection
  - Connection pooling

### Database Layer

#### **SQLite 3**
- **Type**: Embedded relational database
- **Usage**: Development & small deployments
- **Features**:
  - Zero-configuration
  - Serverless
  - Single file database
  - ACID compliant

**Note**: Dapat di-migrate ke PostgreSQL/MySQL untuk production

### Testing Layer

#### **Jest 30**
- **Role**: Testing framework
- **Features**:
  - Unit testing
  - Mocking
  - Code coverage
  - Snapshot testing

#### **React Testing Library**
- **Role**: UI testing
- **Features**:
  - Component testing
  - User interaction simulation
  - Accessibility testing

## 📁 Struktur Direktori

```
atoz/
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed data scripts
│
├── public/                      # Static assets
│   └── ...                     # Images, fonts, etc.
│
├── src/                         # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   │
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── members/       # Members CRUD
│   │   │   │   ├── route.ts          # GET list, POST create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET, PATCH, DELETE by ID
│   │   │   │
│   │   │   ├── relationships/ # Family relationships
│   │   │   │   ├── parent-child/
│   │   │   │   │   └── route.ts      # Parent-child relations
│   │   │   │   └── marriages/
│   │   │   │       └── route.ts      # Marriage relations
│   │   │   │
│   │   │   └── todos/         # Todo CRUD (legacy)
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   │
│   │   ├── members/           # Members UI
│   │   │   ├── page.tsx       # Members list & create page
│   │   │   └── __tests__/
│   │   │       └── MembersPage.test.tsx
│   │   │
│   │   └── todos/             # Todos UI (legacy)
│   │       └── page.tsx
│   │
│   ├── components/             # Reusable components
│   │   ├── Header.tsx         # App header/nav
│   │   ├── TodoList.tsx       # Todo list component
│   │   └── __tests__/
│   │       └── TodoList.test.tsx
│   │
│   └── lib/                    # Shared utilities
│       ├── prisma.ts          # Prisma client singleton
│       └── auth.ts            # Auth helper functions
│
├── docs/                        # Documentation
│   ├── README.md
│   ├── FUNCTIONAL_DESCRIPTION.md
│   ├── ARCHITECTURE.md
│   └── ...
│
├── tests/                       # Additional tests
│   └── ...
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── eslint.config.mjs           # ESLint configuration
├── jest.config.mjs             # Jest configuration
├── jest.setup.js               # Jest setup
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & scripts
├── postcss.config.mjs          # PostCSS config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── README.md                    # Project readme
```

## 🔄 Data Flow

### Request Flow

```
User Action (Browser)
    ↓
React Component
    ↓
fetch('/api/members')
    ↓
Next.js API Route
    ↓
Auth Middleware (authorize)
    ↓ (if authorized)
Business Logic
    ↓
Prisma Client
    ↓
SQLite Database
    ↓ (query result)
Prisma Client
    ↓
JSON Response
    ↓
React Component
    ↓
UI Update (re-render)
```

### Authentication Flow

```
1. User submits login form
    ↓
2. POST /api/auth/signin (NextAuth)
    ↓
3. Validate credentials against database
    ↓
4. Create session in database
    ↓
5. Return session token to client
    ↓
6. Store session in cookie
    ↓
7. Subsequent requests include session cookie
    ↓
8. Server validates session on each API call
```

### Authorization Flow

```
API Request with session
    ↓
authorize(['admin', 'contributor'])
    ↓
getServerSession(authOptions)
    ↓
Validate session exists
    ↓
Check user role matches required roles
    ↓
Check familyId matches (data isolation)
    ↓
Return session OR 401/403 error
```

## 🗄️ Database Architecture

### Entity-Relationship Diagram

```
┌─────────────┐
│   Family    │
│─────────────│
│ id (PK)     │
│ name        │
│ description │
└─────┬───────┘
      │ 1
      │
      │ N
┌─────┴────────┐         ┌──────────────┐
│    User      │         │    Member    │
│──────────────│         │──────────────│
│ id (PK)      │         │ id (PK)      │
│ email        │         │ fullName     │
│ role         │         │ gender       │
│ familyId (FK)│◄───┐    │ birthDate    │
└──────┬───────┘    │    │ deathDate    │
       │ 1          │    │ ...          │
       │            │    │ familyId (FK)│
       │ N          │    │ createdBy(FK)│
┌──────┴───────┐   │    └───┬──────────┘
│   Session    │   │        │ 1
│──────────────│   │        │
│ id (PK)      │   └────────┤
│ sessionToken │            │ N
│ userId (FK)  │    ┌───────┴──────────┐
│ expires      │    │  ParentChild     │
└──────────────┘    │──────────────────│
                    │ id (PK)          │
┌──────────────┐    │ parentId (FK)    │───┐
│   Account    │    │ childId (FK)     │◄──┤
│──────────────│    │ parentRole       │   │
│ id (PK)      │    └──────────────────┘   │
│ userId (FK)  │                            │
│ provider     │    ┌──────────────────┐   │
│ ...          │    │    Marriage      │   │
└──────────────┘    │──────────────────│   │
                    │ id (PK)          │   │
┌──────────────┐    │ spouseAId (FK)   │───┤
│     Todo     │    │ spouseBId (FK)   │◄──┘
│──────────────│    │ marriageDate     │
│ id (PK)      │    │ divorceDate      │
│ text         │    └──────────────────┘
│ completed    │
│ userId (FK)  │
└──────────────┘
```

### Key Relationships

1. **User ↔ Family**: Many-to-One (user belongs to one family)
2. **Member ↔ Family**: Many-to-One (member belongs to one family)
3. **Member ↔ User**: Many-to-One (member created by user)
4. **Member ↔ ParentChild**: Self-referencing Many-to-Many
5. **Member ↔ Marriage**: Self-referencing Many-to-Many

### Indexing Strategy

```prisma
// Members table
@@index([fullName])      // Fast name search
@@index([familyId])      // Fast family scoping

// ParentChild table
@@unique([parentId, childId])  // Prevent duplicates
@@index([childId])             // Fast child lookups

// Marriage table
@@unique([spouseAId, spouseBId])  // Prevent duplicate marriages
```

## 🔐 Security Architecture

### Layers of Security

```
1. Network Layer
   └─ HTTPS (production)
   └─ CORS policies

2. Authentication Layer
   └─ NextAuth.js session management
   └─ Secure password hashing (bcrypt)
   └─ JWT tokens
   └─ CSRF protection

3. Authorization Layer
   └─ Role-based access control (RBAC)
   └─ Family data isolation
   └─ API route guards

4. Data Layer
   └─ SQL injection prevention (Prisma)
   └─ Input validation
   └─ Output sanitization

5. Application Layer
   └─ Environment variables
   └─ Secure session cookies
   └─ No sensitive data in client
```

### Authentication Mechanisms

- **Session-based**: Server-side sessions stored in database
- **Cookie-based**: Secure HTTP-only cookies
- **Token-based**: JWT for stateless validation (optional)

## ⚡ Performance Architecture

### Optimization Strategies

1. **Server-Side Rendering**
   - Pre-render pages on server
   - Reduce time-to-interactive
   - Better SEO

2. **Code Splitting**
   - Automatic by Next.js
   - Load only needed JavaScript
   - Lazy loading components

3. **Database Optimization**
   - Indexes on frequently queried fields
   - Limit queries (max 200 records)
   - Efficient joins with Prisma

4. **Caching Strategy**
   - Client-side: localStorage for todos
   - Server-side: Potential for Redis (future)
   - Database: Connection pooling

5. **Asset Optimization**
   - Next.js Image optimization
   - Font optimization
   - Static asset caching

## 🔄 State Management

### State Types

```
┌─────────────────────────────────────────┐
│          Application State              │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────┐    │
│  │     Server State               │    │
│  │  - Database (Prisma)           │    │
│  │  - Sessions (NextAuth)         │    │
│  └────────────────────────────────┘    │
│                 ▲                       │
│                 │ API Calls             │
│  ┌──────────────┴─────────────────┐    │
│  │     Client State               │    │
│  │  - React useState              │    │
│  │  - Form state                  │    │
│  │  - UI state                    │    │
│  └────────────────────────────────┘    │
│                 ▲                       │
│                 │ Cache                 │
│  ┌──────────────┴─────────────────┐    │
│  │     Persistent State           │    │
│  │  - localStorage (todos)        │    │
│  │  - Cookies (session)           │    │
│  └────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Development Environment
```
Developer Machine
├── Node.js runtime
├── SQLite database file
├── Next.js dev server (hot reload)
└── Port 3000 (default)
```

### Production Environment (Recommended)
```
Cloud Platform (Vercel/Netlify/AWS)
├── Node.js runtime
├── PostgreSQL database (upgrade from SQLite)
├── Next.js production build
├── CDN for static assets
├── HTTPS/SSL
└── Environment variables
```

## 🔧 Configuration Management

### Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Future additions
# AWS_S3_BUCKET="photos"
# SMTP_HOST="smtp.gmail.com"
```

## 📊 Scalability Considerations

### Current Architecture (SQLite)
- **Good for**: Development, small deployments (<1000 users)
- **Limitations**: Single-file, no concurrent writes

### Migration Path (PostgreSQL)
1. Update `DATABASE_URL` in `.env`
2. Update Prisma provider to `postgresql`
3. Run `prisma migrate dev`
4. Benefits:
   - Concurrent writes
   - Better performance
   - Unlimited scalability
   - Advanced features (full-text search, JSON queries)

### Horizontal Scaling (Future)
- Load balancers
- Multiple app instances
- Shared database
- Redis for caching
- CDN for static assets

---

**Version**: 1.0  
**Last Updated**: 14 Desember 2025
