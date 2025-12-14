# Database Schema Documentation

## 🗄️ Database Overview

AtoZ menggunakan **SQLite** untuk development dan dapat di-migrate ke **PostgreSQL** atau **MySQL** untuk production. Schema dikelola menggunakan **Prisma ORM** dengan type-safe queries dan migrations.

**Database File**: `prisma/dev.db` (SQLite)  
**Schema Definition**: `prisma/schema.prisma`

---

## 📊 Entity-Relationship Diagram

```
                    ┌─────────────────┐
                    │     Family      │
                    │─────────────────│
                    │ id (PK)         │
                    │ name            │
                    │ description     │
                    │ createdAt       │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
         ┌────────▼────────┐   ┌───────▼────────┐
         │      User       │   │     Member     │
         │─────────────────│   │────────────────│
         │ id (PK)         │   │ id (PK)        │
         │ email           │   │ fullName       │
         │ name            │   │ gender         │
         │ role            │   │ birthDate      │
         │ familyId (FK)   │   │ deathDate      │
         │                 │   │ birthPlace     │
         └────┬────────────┘   │ address        │
              │                │ occupation     │
              │                │ phone          │
              │                │ email          │
    ┌─────────┴────────┐       │ photoUrl       │
    │                  │       │ notes          │
┌───▼─────┐     ┌──────▼────┐  │ isAlive        │
│ Session │     │  Account  │  │ familyId (FK)  │
│─────────│     │───────────│  │ createdByUserId│
│ id      │     │ id        │  └───┬────────────┘
│ token   │     │ userId    │      │
│ expires │     │ provider  │      │
└─────────┘     └───────────┘      │
                                   │
                  ┌────────────────┴────────────────┐
                  │                                 │
          ┌───────▼──────────┐           ┌─────────▼────────┐
          │   ParentChild    │           │     Marriage     │
          │──────────────────│           │──────────────────│
          │ id (PK)          │           │ id (PK)          │
          │ parentId (FK) ◄──┼───────────┤ spouseAId (FK) ◄─┤
          │ childId (FK)  ◄──┼───────────┤ spouseBId (FK) ◄─┤
          │ parentRole       │           │ marriageDate     │
          └──────────────────┘           │ divorceDate      │
                                         │ notes            │
                                         └──────────────────┘
```

---

## 📋 Tables & Models

### 1. **User** - User Authentication & Profile

Menyimpan data user yang bisa login dan mengelola data keluarga.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (cuid) | No | cuid() | Primary key |
| `name` | String | Yes | null | User's display name |
| `email` | String | Yes | null | Email (unique) |
| `emailVerified` | DateTime | Yes | null | Email verification timestamp |
| `image` | String | Yes | null | Profile image URL |
| `role` | String | No | "viewer" | Access role: admin/contributor/viewer |
| `familyId` | String | Yes | null | Foreign key to Family |
| `createdAt` | DateTime | No | now() | Creation timestamp (implicit) |

**Indexes**:
- `email` (unique)
- `familyId`

**Relations**:
- `family`: Many-to-One → Family
- `accounts`: One-to-Many → Account
- `sessions`: One-to-Many → Session
- `todos`: One-to-Many → Todo
- `membersCreated`: One-to-Many → Member

**Example**:
```typescript
{
  id: "cm4abc123",
  name: "Demo Admin",
  email: "demo@example.com",
  role: "admin",
  familyId: "fam123",
  emailVerified: null,
  image: null
}
```

---

### 2. **Account** - OAuth & External Accounts

Menyimpan OAuth provider information (untuk Google, GitHub, etc).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | String (cuid) | No | Primary key |
| `userId` | String | No | Foreign key to User |
| `type` | String | No | Account type (oauth, email, etc) |
| `provider` | String | No | Provider name (google, github) |
| `providerAccountId` | String | No | Provider's user ID |
| `refresh_token` | String | Yes | OAuth refresh token |
| `access_token` | String | Yes | OAuth access token |
| `expires_at` | Int | Yes | Token expiration timestamp |
| `token_type` | String | Yes | Token type (Bearer) |
| `scope` | String | Yes | OAuth scopes |
| `id_token` | String | Yes | OpenID Connect ID token |
| `session_state` | String | Yes | Session state |

**Indexes**:
- `[provider, providerAccountId]` (unique compound)
- `userId`

**Relations**:
- `user`: Many-to-One → User

---

### 3. **Session** - User Sessions

Menyimpan active sessions untuk authenticated users.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | String (cuid) | No | Primary key |
| `sessionToken` | String | No | Session token (unique) |
| `userId` | String | No | Foreign key to User |
| `expires` | DateTime | No | Session expiration |

**Indexes**:
- `sessionToken` (unique)
- `userId`

**Relations**:
- `user`: Many-to-One → User

---

### 4. **VerificationToken** - Email Verification

Menyimpan tokens untuk email verification dan password reset.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `identifier` | String | No | Email or user identifier |
| `token` | String | No | Verification token |
| `expires` | DateTime | No | Token expiration |

**Indexes**:
- `token` (unique)
- `[identifier, token]` (unique compound)

---

### 5. **Family** - Family Groups

Menyimpan informasi keluarga. Setiap user dan member terikat ke satu family.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (cuid) | No | cuid() | Primary key |
| `name` | String | No | - | Family name |
| `description` | String | Yes | null | Family description |
| `createdAt` | DateTime | No | now() | Creation timestamp |

**Relations**:
- `users`: One-to-Many → User
- `members`: One-to-Many → Member

**Example**:
```typescript
{
  id: "fam123",
  name: "The Smith Family",
  description: "Keluarga besar Smith dari Jakarta",
  createdAt: "2025-01-01T00:00:00Z"
}
```

---

### 6. **Member** - Family Members

Tabel utama untuk anggota keluarga. Menyimpan semua informasi personal.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (cuid) | No | cuid() | Primary key |
| `fullName` | String | No | - | Full name |
| `gender` | String | Yes | null | "male" or "female" |
| `birthDate` | DateTime | Yes | null | Date of birth |
| `deathDate` | DateTime | Yes | null | Date of death |
| `birthPlace` | String | Yes | null | Place of birth |
| `address` | String | Yes | null | Current/last address |
| `occupation` | String | Yes | null | Occupation/job |
| `phone` | String | Yes | null | Phone number |
| `email` | String | Yes | null | Email address |
| `photoUrl` | String | Yes | null | Photo URL |
| `notes` | String | Yes | null | Additional notes |
| `isAlive` | Boolean | No | true | Living status |
| `familyId` | String | No | - | Foreign key to Family |
| `createdByUserId` | String | Yes | null | Foreign key to User (creator) |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `updatedAt` | DateTime | No | now() | Last update timestamp |

**Indexes**:
- `fullName` (for search performance)
- `familyId` (for family scoping)

**Relations**:
- `family`: Many-to-One → Family
- `createdBy`: Many-to-One → User
- `parents`: One-to-Many → ParentChild (as child)
- `children`: One-to-Many → ParentChild (as parent)
- `marriagesA`: One-to-Many → Marriage (as spouseA)
- `marriagesB`: One-to-Many → Marriage (as spouseB)

**Example**:
```typescript
{
  id: "mem123",
  fullName: "John Smith",
  gender: "male",
  birthDate: "1950-01-15T00:00:00Z",
  deathDate: null,
  birthPlace: "Jakarta",
  address: "Jl. Sudirman No. 1, Jakarta",
  occupation: "Engineer",
  phone: "+62812345678",
  email: "john@example.com",
  photoUrl: "https://example.com/john.jpg",
  notes: "Pendiri keluarga",
  isAlive: true,
  familyId: "fam123",
  createdByUserId: "user123",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-12-14T00:00:00Z"
}
```

---

### 7. **ParentChild** - Parent-Child Relationships

Menyimpan relasi orang tua-anak. Self-referencing many-to-many relationship pada Member.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | String (cuid) | No | Primary key |
| `parentId` | String | No | Foreign key to Member (parent) |
| `childId` | String | No | Foreign key to Member (child) |
| `parentRole` | String | Yes | "father" or "mother" |

**Indexes**:
- `[parentId, childId]` (unique compound - prevent duplicates)
- `childId` (for reverse lookups)

**Relations**:
- `parent`: Many-to-One → Member
- `child`: Many-to-One → Member

**Constraints**:
- parentId must not equal childId (validated in API)
- Unique combination of parentId and childId

**Example**:
```typescript
{
  id: "rel123",
  parentId: "mem123",  // John Smith
  childId: "mem456",   // Jane Smith
  parentRole: "father"
}
```

**Query Examples**:
```typescript
// Get all children of a member
await prisma.parentChild.findMany({
  where: { parentId: "mem123" },
  include: { child: true }
})

// Get all parents of a member
await prisma.parentChild.findMany({
  where: { childId: "mem456" },
  include: { parent: true }
})
```

---

### 8. **Marriage** - Marriage Relationships

Menyimpan relasi pernikahan. Self-referencing many-to-many relationship pada Member.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | String (cuid) | No | Primary key |
| `spouseAId` | String | No | Foreign key to Member (spouse 1) |
| `spouseBId` | String | No | Foreign key to Member (spouse 2) |
| `marriageDate` | DateTime | Yes | Date of marriage |
| `divorceDate` | DateTime | Yes | Date of divorce (if applicable) |
| `notes` | String | Yes | Marriage notes |

**Indexes**:
- `[spouseAId, spouseBId]` (unique compound)

**Relations**:
- `spouseA`: Many-to-One → Member
- `spouseB`: Many-to-One → Member

**Constraints**:
- spouseAId must not equal spouseBId (validated in API)
- Unique combination of spouseAId and spouseBId

**Example**:
```typescript
{
  id: "mar123",
  spouseAId: "mem123",  // John Smith
  spouseBId: "mem789",  // Mary Johnson
  marriageDate: "1970-06-15T00:00:00Z",
  divorceDate: null,
  notes: "Traditional ceremony in Jakarta"
}
```

---

### 9. **Todo** - Todo Items (Legacy Feature)

Menyimpan todo items untuk users. Feature warisan dari awal development.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (cuid) | No | cuid() | Primary key |
| `text` | String | No | - | Todo text |
| `completed` | Boolean | No | false | Completion status |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `userId` | String | Yes | null | Foreign key to User |

**Relations**:
- `user`: Many-to-One → User

---

## 🔗 Relationships Summary

| From Model | Relationship Type | To Model | Description |
|------------|-------------------|----------|-------------|
| User | Many-to-One | Family | User belongs to one family |
| Account | Many-to-One | User | Account belongs to user |
| Session | Many-to-One | User | Session belongs to user |
| Todo | Many-to-One | User | Todo belongs to user |
| Member | Many-to-One | Family | Member belongs to one family |
| Member | Many-to-One | User | Member created by user |
| ParentChild | Many-to-One | Member | Parent reference |
| ParentChild | Many-to-One | Member | Child reference |
| Marriage | Many-to-One | Member | SpouseA reference |
| Marriage | Many-to-One | Member | SpouseB reference |

---

## 🔑 Primary Keys & IDs

Semua table menggunakan **CUID** (Collision-resistant Unique Identifier):
- Format: `cm4abc123xyz...` (25 karakter)
- Generated oleh Prisma
- URL-safe dan sortable

```prisma
id String @id @default(cuid())
```

**Benefits**:
- Tidak sequential (lebih aman)
- Globally unique (untuk distributed systems)
- Sortable by time
- No collision risk

---

## 📈 Indexing Strategy

### Performance Indexes

```prisma
model Member {
  // ...
  @@index([fullName])  // Fast name search
  @@index([familyId])  // Fast family queries
}

model ParentChild {
  // ...
  @@unique([parentId, childId])  // Prevent duplicates
  @@index([childId])              // Fast child lookups
}

model Marriage {
  // ...
  @@unique([spouseAId, spouseBId])  // Prevent duplicate marriages
}

model User {
  email String? @unique  // Fast email lookup for login
}

model Session {
  sessionToken String @unique  // Fast session validation
}
```

---

## 🔄 Cascade Deletes

### Delete Behavior

```prisma
model Member {
  family   Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
  // When Family deleted → All members deleted

  parents  ParentChild[] @relation("ChildParents")
  children ParentChild[] @relation("ParentChildren")
  // When Member deleted → All parent-child relations deleted
  
  marriagesA Marriage[] @relation("SpouseA")
  marriagesB Marriage[] @relation("SpouseB")
  // When Member deleted → All marriage relations deleted
}

model User {
  family Family? @relation(fields: [familyId], references: [id])
  // When Family deleted → User.familyId set to null (no cascade)
}
```

**Cascade Rules**:
1. **Delete Family** → Deletes all Members in that family
2. **Delete Member** → Deletes all related ParentChild and Marriage records
3. **Delete User** → Deletes all Accounts, Sessions, Todos (but not Members)

---

## 🎯 Query Patterns

### Common Queries

#### Get Member with Relations
```typescript
const member = await prisma.member.findUnique({
  where: { id: "mem123" },
  include: {
    parents: {
      include: { parent: true }
    },
    children: {
      include: { child: true }
    },
    marriagesA: {
      include: { spouseB: true }
    },
    marriagesB: {
      include: { spouseA: true }
    }
  }
})
```

#### Search Members by Name
```typescript
const members = await prisma.member.findMany({
  where: {
    familyId: "fam123",
    fullName: {
      contains: "John",
      mode: "insensitive"
    }
  },
  orderBy: { fullName: "asc" }
})
```

#### Get Family Tree (All Members)
```typescript
const family = await prisma.family.findUnique({
  where: { id: "fam123" },
  include: {
    members: {
      include: {
        parents: { include: { parent: true } },
        children: { include: { child: true } },
        marriagesA: { include: { spouseB: true } },
        marriagesB: { include: { spouseA: true } }
      }
    }
  }
})
```

---

## 🔧 Migrations

### Migration Files

Migrations stored in: `prisma/migrations/`

**Current Migration**:
```
prisma/migrations/
└── 20251101020906_init/
    └── migration.sql
```

### Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

---

## 🌱 Seeding

### Seed Script

File: `seed.ts`

**Current Seed Data**:
1. Creates demo Family
2. Creates demo Admin user (demo@example.com / demo123)
3. Links user to family

**Run Seed**:
```bash
npm run seed
```

**Seed Script**:
```typescript
async function main() {
  const family = await prisma.family.create({
    data: {
      name: "Demo Family",
      description: "Demo family for testing"
    }
  })

  const hashedPassword = await hash("demo123", 10)
  
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo Admin",
      role: "admin",
      familyId: family.id,
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "demo@example.com",
          access_token: hashedPassword
        }
      }
    }
  })
}
```

---

## 📊 Database Statistics

### Current Schema (v0.1.0)

| Metric | Value |
|--------|-------|
| Total Tables | 9 |
| User/Auth Tables | 4 (User, Account, Session, VerificationToken) |
| Core Tables | 3 (Family, Member, Todo) |
| Relation Tables | 2 (ParentChild, Marriage) |
| Total Columns | ~60 |
| Foreign Keys | 12 |
| Indexes | 8 |
| Unique Constraints | 6 |

---

## 🚀 Production Considerations

### Migration to PostgreSQL

**Steps**:
1. Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/atoz"
```

3. Run migration:
```bash
npx prisma migrate dev
```

**PostgreSQL Benefits**:
- Better concurrent writes
- Full-text search
- JSON columns
- Better performance at scale
- More advanced features

### Performance Optimization

1. **Add more indexes** for common queries
2. **Connection pooling** with PgBouncer
3. **Read replicas** for scaling reads
4. **Caching** with Redis
5. **Query optimization** with explain plans

---

## 📝 Schema Evolution

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | Dec 2025 | Initial schema with all core models |
| 0.0.1 | Nov 2025 | Basic todo app schema |

### Planned Changes

**v0.2.0**:
- [ ] Add `Document` table for file attachments
- [ ] Add `Event` table for timeline
- [ ] Add full-text search indexes

**v0.3.0**:
- [ ] Add `Notification` table
- [ ] Add `AuditLog` table
- [ ] Add `Comment` table

---

**Version**: 1.0  
**Last Updated**: 14 Desember 2025
