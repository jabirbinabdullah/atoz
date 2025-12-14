# Panduan Pengembangan (Development Guide)

## 🚀 Setup Development Environment

### Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Node.js**: v18 atau lebih tinggi
- **npm**: v8 atau lebih tinggi
- **Git**: untuk version control
- **VS Code** (recommended): dengan extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Installation Steps

1. **Clone Repository**
```powershell
git clone https://github.com/yourusername/atoz.git
cd atoz
```

2. **Install Dependencies**
```powershell
npm install
```

3. **Setup Environment Variables**

Create `.env` file:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
```

Generate NEXTAUTH_SECRET:
```powershell
# Using OpenSSL
openssl rand -base64 32

# Or using Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. **Setup Database**
```powershell
# Run migrations
npx prisma migrate dev

# Seed demo data
npm run seed
```

5. **Start Development Server**
```powershell
npm run dev
```

Visit: http://localhost:3000

6. **Login with Demo Account**
- Email: `demo@example.com`
- Password: `demo123`

---

## 📁 Project Structure

```
atoz/
├── prisma/                    # Database
│   ├── schema.prisma         # Schema definition
│   ├── migrations/           # Migration history
│   └── dev.db               # SQLite database (gitignored)
│
├── public/                   # Static assets
│   └── ...
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── globals.css      # Global styles
│   │   │
│   │   ├── api/            # API routes
│   │   │   ├── auth/
│   │   │   ├── members/
│   │   │   ├── relationships/
│   │   │   └── todos/
│   │   │
│   │   ├── members/        # Members pages
│   │   └── todos/          # Todos pages
│   │
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── TodoList.tsx
│   │   └── __tests__/
│   │
│   └── lib/                 # Utilities
│       ├── prisma.ts        # Prisma client
│       └── auth.ts          # Auth helpers
│
├── docs/                     # Documentation
│
├── .env                      # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── jest.config.mjs
└── README.md
```

---

## 🛠️ Development Workflow

### 1. Feature Development

#### Create New Branch
```powershell
git checkout -b feature/your-feature-name
```

#### Development Cycle
1. Write code
2. Write tests
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Test manually in browser
6. Commit changes

#### Commit Convention
```
type(scope): description

Examples:
feat(members): add search functionality
fix(api): resolve auth guard issue
docs(readme): update installation steps
test(members): add unit tests for search
refactor(auth): simplify authorize function
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `style`: Code formatting
- `chore`: Maintenance tasks

---

### 2. Database Changes

#### Creating a Migration

1. Edit `prisma/schema.prisma`
2. Create migration:
```powershell
npx prisma migrate dev --name description_of_change
```

Example:
```powershell
npx prisma migrate dev --name add_photo_field_to_member
```

3. Verify migration in `prisma/migrations/`
4. Update seed if needed
5. Run seed: `npm run seed`

#### Common Prisma Commands

```powershell
# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Format schema file
npx prisma format
```

---

### 3. API Development

#### Creating New API Route

File: `src/app/api/your-route/route.ts`

```typescript
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorize } from '@/lib/auth'

// GET handler
export async function GET(req: Request) {
  const session = await authorize() // Any authenticated user
  if (session instanceof NextResponse) return session

  try {
    const data = await prisma.yourModel.findMany()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500 }
    )
  }
}

// POST handler (requires specific roles)
export async function POST(req: Request) {
  const session = await authorize(['admin', 'contributor'])
  if (session instanceof NextResponse) return session

  try {
    const body = await req.json()
    const result = await prisma.yourModel.create({
      data: body
    })
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to create' }, 
      { status: 400 }
    )
  }
}
```

#### Testing API with cURL

```powershell
# GET request
curl http://localhost:3000/api/your-route

# POST request
curl -X POST http://localhost:3000/api/your-route `
  -H "Content-Type: application/json" `
  -d '{"key":"value"}'

# With authentication (need session token)
curl http://localhost:3000/api/your-route `
  --cookie "next-auth.session-token=YOUR_TOKEN"
```

---

### 4. Component Development

#### Creating New Component

File: `src/components/YourComponent.tsx`

```typescript
'use client' // If needs client-side features

import { useState } from 'react'

interface YourComponentProps {
  title: string
  onAction?: () => void
}

export default function YourComponent({ 
  title, 
  onAction 
}: YourComponentProps) {
  const [state, setState] = useState('')

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">{title}</h2>
      <button 
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Action
      </button>
    </div>
  )
}
```

#### Server vs Client Components

**Server Component** (default):
- No "use client" directive
- Runs on server
- Can directly access database
- Better for SEO
- Smaller bundle size

**Client Component**:
- Needs "use client" directive
- Runs in browser
- Can use useState, useEffect, etc.
- Interactive features
- Can't directly access database

---

### 5. Styling with Tailwind

#### Common Patterns

```tsx
// Container
<div className="max-w-3xl mx-auto p-6">

// Card
<div className="border rounded-lg p-4 shadow">

// Button (primary)
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">

// Button (secondary)
<button className="px-4 py-2 border rounded hover:bg-gray-50">

// Form input
<input className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flexbox
<div className="flex items-center justify-between">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
```

#### Custom Styles

If needed, add to `src/app/globals.css`:
```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
  }
}
```

---

### 6. Testing

#### Running Tests

```powershell
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- MembersPage.test.tsx

# Run with coverage
npm test -- --coverage

# Silent mode (less output)
npm test --silent
```

#### Writing Tests

**Component Test Example**:
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click', async () => {
    const onAction = jest.fn()
    render(<YourComponent title="Test" onAction={onAction} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onAction).toHaveBeenCalled()
  })
})
```

**API Test Example**:
```typescript
import { GET } from '../route'
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    member: {
      findMany: jest.fn()
    }
  }
}))

jest.mock('@/lib/auth', () => ({
  authorize: jest.fn(async () => ({ 
    user: { id: 'user1', role: 'admin' } 
  }))
}))

describe('GET /api/members', () => {
  it('returns members', async () => {
    const mockMembers = [{ id: '1', fullName: 'Test' }]
    ;(prisma.member.findMany as jest.Mock).mockResolvedValue(mockMembers)

    const req = { url: 'http://localhost/api/members' } as Request
    const res = await GET(req)
    const json = await res.json()

    expect(json).toEqual(mockMembers)
  })
})
```

---

## 🔍 Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Debug Techniques

1. **Console Logging**:
```typescript
console.log('Debug:', { variable })
```

2. **Prisma Logging**:
```typescript
// In lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})
```

3. **Network Tab**:
- Open browser DevTools
- Check Network tab for API calls
- Inspect request/response

4. **React DevTools**:
- Install React DevTools extension
- Inspect component props/state

---

## 📝 Code Quality

### ESLint

```powershell
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### TypeScript

```powershell
# Check types
npx tsc --noEmit
```

### Code Style

Follow these conventions:
- Use TypeScript for all files
- Use functional components
- Use arrow functions
- Use async/await (not .then())
- Extract magic numbers to constants
- Add JSDoc comments for complex functions
- Use descriptive variable names

**Good**:
```typescript
const MAX_ITEMS = 100

async function fetchMembers() {
  const members = await prisma.member.findMany({
    take: MAX_ITEMS
  })
  return members
}
```

**Bad**:
```typescript
function fetchMembers() {
  return prisma.member.findMany({ take: 100 })
}
```

---

## 🔧 Common Tasks

### Add New Field to Member

1. Update schema:
```prisma
model Member {
  // ... existing fields
  newField String?
}
```

2. Create migration:
```powershell
npx prisma migrate dev --name add_new_field
```

3. Update API:
```typescript
// In POST /api/members
const member = await prisma.member.create({
  data: {
    // ... existing fields
    newField: body.newField ?? null
  }
})
```

4. Update UI form
5. Update tests
6. Test manually

### Add New API Endpoint

1. Create route file: `src/app/api/your-route/route.ts`
2. Implement handlers (GET, POST, etc.)
3. Add auth guards
4. Write tests: `src/app/api/__tests__/your-route.test.ts`
5. Document in `docs/API.md`

### Add New Page

1. Create page: `src/app/your-page/page.tsx`
2. Add navigation in Header
3. Implement UI
4. Connect to API
5. Write tests
6. Test on mobile

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Prisma Client Out of Sync
**Error**: "Prisma client is out of sync"

**Solution**:
```powershell
npx prisma generate
```

#### 2. Migration Failed
**Error**: Migration failed

**Solution**:
```powershell
# Reset database (dev only)
npx prisma migrate reset

# Or manually delete migrations and start fresh
Remove-Item -Recurse prisma/migrations
npx prisma migrate dev --name init
```

#### 3. Port Already in Use
**Error**: "Port 3000 is already in use"

**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
$env:PORT=3001; npm run dev
```

#### 4. Tests Failing with ESM Errors
**Error**: "Unexpected token 'export'"

**Solution**: Update `jest.config.mjs`:
```javascript
transformIgnorePatterns: ['node_modules/(?!(jose|other-esm-package)/)']
```

#### 5. Auth Not Working
**Error**: 401 Unauthorized

**Solution**:
1. Check NEXTAUTH_SECRET is set
2. Verify user exists in database
3. Check session in browser cookies
4. Try logging out and back in

---

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Components](https://tailwindui.com/)

---

## 🤝 Getting Help

### Internal Resources
1. Check documentation in `/docs`
2. Review existing code for patterns
3. Check git history: `git log --oneline`

### External Resources
1. Stack Overflow
2. Next.js Discord
3. Prisma Discord
4. GitHub Issues

### Reporting Bugs
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if UI issue)
- Error messages
- Environment (OS, Node version)

---

**Version**: 1.0  
**Last Updated**: 14 Desember 2025
