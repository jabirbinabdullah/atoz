# API Documentation

## 📡 API Overview

AtoZ menyediakan RESTful API untuk mengelola data genealogi keluarga. Semua endpoint menggunakan JSON format dan memerlukan autentikasi (kecuali endpoint auth).

**Base URL**: `http://localhost:3000/api` (development)

**Authentication**: Session-based (NextAuth.js)

---

## 🔐 Authentication

### NextAuth Endpoints

NextAuth.js otomatis menyediakan endpoint autentikasi:

#### Sign In
```http
POST /api/auth/signin
```

**Request Body**:
```json
{
  "email": "demo@example.com",
  "password": "demo123",
  "callbackUrl": "/members"
}
```

**Response**: Redirect ke callbackUrl atau homepage

#### Sign Out
```http
POST /api/auth/signout
```

**Response**: Redirect ke homepage

#### Session
```http
GET /api/auth/session
```

**Response**:
```json
{
  "user": {
    "email": "demo@example.com",
    "name": "Demo Admin",
    "role": "admin",
    "familyId": "family123"
  },
  "expires": "2025-12-21T00:00:00.000Z"
}
```

---

## 👥 Members API

### List Members

```http
GET /api/members
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Search by name (case-insensitive) |
| `gender` | string | No | Filter by gender: "male" or "female" |
| `isAlive` | string | No | Filter by status: "true" or "false" |
| `include` | string | No | Include relations: "relations" |

**Headers**:
```
Cookie: next-auth.session-token=<token>
```

**Authorization**: Any authenticated user

**Response** (200 OK):
```json
[
  {
    "id": "cm123abc",
    "fullName": "John Doe",
    "gender": "male",
    "birthDate": "1950-01-15T00:00:00.000Z",
    "deathDate": null,
    "birthPlace": "Jakarta",
    "address": "Jl. Sudirman No. 1",
    "occupation": "Engineer",
    "phone": "+62812345678",
    "email": "john@example.com",
    "photoUrl": null,
    "notes": "Founder of the family",
    "isAlive": true,
    "familyId": "family123",
    "createdByUserId": "user123",
    "createdAt": "2025-12-01T00:00:00.000Z",
    "updatedAt": "2025-12-10T00:00:00.000Z"
  }
]
```

**Response with Relations** (`?include=relations`):
```json
[
  {
    "id": "cm123abc",
    "fullName": "John Doe",
    // ... other fields ...
    "parents": [
      {
        "id": "rel123",
        "parentId": "parent123",
        "parentRole": "father",
        "parent": {
          "id": "parent123",
          "fullName": "Jane Doe"
        }
      }
    ],
    "children": [
      {
        "id": "rel456",
        "childId": "child123",
        "child": {
          "id": "child123",
          "fullName": "Bob Doe"
        }
      }
    ]
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `500 Internal Server Error`: Database error

**Example**:
```bash
# Get all members
curl http://localhost:3000/api/members

# Search by name
curl http://localhost:3000/api/members?q=John

# Filter males who are alive
curl http://localhost:3000/api/members?gender=male&isAlive=true

# Include relations
curl http://localhost:3000/api/members?include=relations
```

---

### Create Member

```http
POST /api/members
```

**Authorization**: Admin or Contributor

**Request Body**:
```json
{
  "fullName": "Jane Smith",
  "gender": "female",
  "birthDate": "1980-05-20",
  "deathDate": null,
  "birthPlace": "Bandung",
  "address": "Jl. Asia Afrika No. 10",
  "occupation": "Doctor",
  "phone": "+62812345679",
  "email": "jane@example.com",
  "photoUrl": "https://example.com/photo.jpg",
  "notes": "Second generation",
  "isAlive": true
}
```

**Required Fields**:
- `fullName` (string): Member's full name

**Optional Fields**:
- `gender` (string): "male" or "female"
- `birthDate` (string): ISO date format
- `deathDate` (string): ISO date format
- `birthPlace` (string)
- `address` (string)
- `occupation` (string)
- `phone` (string)
- `email` (string)
- `photoUrl` (string): URL to photo
- `notes` (string)
- `isAlive` (boolean): Default true

**Response** (201 Created):
```json
{
  "id": "cm456def",
  "fullName": "Jane Smith",
  "gender": "female",
  // ... all fields ...
  "familyId": "family123",
  "createdByUserId": "user123",
  "createdAt": "2025-12-14T00:00:00.000Z",
  "updatedAt": "2025-12-14T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Insufficient permissions (viewer role)
- `400 Bad Request`: Missing required fields or invalid data

---

### Get Member by ID

```http
GET /api/members/{id}
```

**Authorization**: Any authenticated user (family-scoped)

**Response** (200 OK):
```json
{
  "id": "cm123abc",
  "fullName": "John Doe",
  // ... all member fields ...
  "parents": [
    {
      "id": "rel123",
      "parentId": "parent123",
      "parentRole": "father",
      "parent": {
        "id": "parent123",
        "fullName": "Grandfather",
        "birthDate": "1920-01-01T00:00:00.000Z"
      }
    }
  ],
  "children": [
    {
      "id": "rel456",
      "childId": "child123",
      "child": {
        "id": "child123",
        "fullName": "Son",
        "birthDate": "1975-06-15T00:00:00.000Z"
      }
    }
  ],
  "marriagesA": [
    {
      "id": "mar123",
      "spouseBId": "spouse123",
      "marriageDate": "1970-12-25T00:00:00.000Z",
      "divorceDate": null,
      "notes": "Happy marriage",
      "spouseB": {
        "id": "spouse123",
        "fullName": "Wife",
        "gender": "female"
      }
    }
  ],
  "marriagesB": []
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `404 Not Found`: Member not found or not in user's family
- `500 Internal Server Error`: Database error

---

### Update Member

```http
PATCH /api/members/{id}
```

**Authorization**: Admin or Contributor

**Request Body** (partial update):
```json
{
  "fullName": "John Doe Jr.",
  "occupation": "Retired Engineer",
  "isAlive": false,
  "deathDate": "2025-01-01"
}
```

**Response** (200 OK):
```json
{
  "id": "cm123abc",
  "fullName": "John Doe Jr.",
  // ... updated fields ...
  "updatedAt": "2025-12-14T10:30:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid data
- `404 Not Found`: Member not found

---

### Delete Member

```http
DELETE /api/members/{id}
```

**Authorization**: Admin only

**Response** (200 OK):
```json
{
  "ok": true
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not admin
- `400 Bad Request`: Cannot delete (relations exist)
- `404 Not Found`: Member not found

**Note**: Cascade deletes related records (relations)

---

## 👨‍👩‍👧 Relationships API

### Parent-Child Relationships

#### Create Parent-Child Relation

```http
POST /api/relationships/parent-child
```

**Authorization**: Admin or Contributor

**Request Body**:
```json
{
  "parentId": "parent123",
  "childId": "child456",
  "parentRole": "father"
}
```

**Fields**:
- `parentId` (string, required): Parent member ID
- `childId` (string, required): Child member ID
- `parentRole` (string, optional): "father" or "mother"

**Validation**:
- parentId must not equal childId

**Response** (201 Created):
```json
{
  "id": "rel789",
  "parentId": "parent123",
  "childId": "child456",
  "parentRole": "father"
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Validation error (parent = child)

---

#### Delete Parent-Child Relation

```http
DELETE /api/relationships/parent-child
```

**Authorization**: Admin only

**Request Body**:
```json
{
  "parentId": "parent123",
  "childId": "child456"
}
```

**Response** (200 OK):
```json
{
  "ok": true
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not admin
- `400 Bad Request`: Relation not found

---

### Marriage Relationships

#### Create Marriage

```http
POST /api/relationships/marriages
```

**Authorization**: Admin or Contributor

**Request Body**:
```json
{
  "spouseAId": "spouse1",
  "spouseBId": "spouse2",
  "marriageDate": "1990-06-15",
  "divorceDate": null,
  "notes": "Traditional ceremony"
}
```

**Fields**:
- `spouseAId` (string, required): First spouse ID
- `spouseBId` (string, required): Second spouse ID
- `marriageDate` (string, optional): ISO date
- `divorceDate` (string, optional): ISO date
- `notes` (string, optional)

**Validation**:
- spouseAId must not equal spouseBId

**Response** (201 Created):
```json
{
  "id": "mar123",
  "spouseAId": "spouse1",
  "spouseBId": "spouse2",
  "marriageDate": "1990-06-15T00:00:00.000Z",
  "divorceDate": null,
  "notes": "Traditional ceremony"
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Validation error

---

#### Delete Marriage

```http
DELETE /api/relationships/marriages
```

**Authorization**: Admin only

**Request Body**:
```json
{
  "spouseAId": "spouse1",
  "spouseBId": "spouse2"
}
```

**Response** (200 OK):
```json
{
  "ok": true
}
```

**Error Responses**:
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not admin
- `400 Bad Request`: Marriage not found

---

## ✅ Todos API (Legacy)

### List Todos

```http
GET /api/todos
```

**Authorization**: Authenticated user

**Response** (200 OK):
```json
[
  {
    "id": "todo123",
    "text": "Complete documentation",
    "completed": false,
    "userId": "user123",
    "createdAt": "2025-12-14T00:00:00.000Z"
  }
]
```

---

### Create Todo

```http
POST /api/todos
```

**Request Body**:
```json
{
  "text": "New task",
  "completed": false
}
```

**Response** (201 Created):
```json
{
  "id": "todo456",
  "text": "New task",
  "completed": false,
  "userId": "user123",
  "createdAt": "2025-12-14T00:00:00.000Z"
}
```

---

### Update Todo

```http
PUT /api/todos/{id}
```

**Request Body**:
```json
{
  "text": "Updated task",
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": "todo123",
  "text": "Updated task",
  "completed": true,
  "userId": "user123",
  "createdAt": "2025-12-14T00:00:00.000Z"
}
```

---

### Delete Todo

```http
DELETE /api/todos/{id}
```

**Response** (200 OK):
```json
{
  "ok": true
}
```

---

## 🔒 Authorization Matrix

| Endpoint | Viewer | Contributor | Admin |
|----------|--------|-------------|-------|
| GET /api/members | ✅ | ✅ | ✅ |
| POST /api/members | ❌ | ✅ | ✅ |
| GET /api/members/[id] | ✅ | ✅ | ✅ |
| PATCH /api/members/[id] | ❌ | ✅ | ✅ |
| DELETE /api/members/[id] | ❌ | ❌ | ✅ |
| POST /api/relationships/parent-child | ❌ | ✅ | ✅ |
| DELETE /api/relationships/parent-child | ❌ | ❌ | ✅ |
| POST /api/relationships/marriages | ❌ | ✅ | ✅ |
| DELETE /api/relationships/marriages | ❌ | ❌ | ✅ |
| Todos endpoints | ✅ | ✅ | ✅ |

---

## 📝 Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common Error Codes**:
- `401 Unauthorized`: Missing or invalid session
- `403 Forbidden`: Valid session but insufficient permissions
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## 🔄 Rate Limiting

Currently: **No rate limiting** (development)

**Future**: Implement rate limiting in production:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## 🧪 Testing with cURL

### Login and Get Session
```bash
# Login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'

# Get session (include cookies from login)
curl http://localhost:3000/api/auth/session \
  --cookie "next-auth.session-token=YOUR_TOKEN"
```

### Create Member
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  --cookie "next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "fullName": "Test User",
    "gender": "male",
    "isAlive": true
  }'
```

### Search Members
```bash
curl "http://localhost:3000/api/members?q=John&gender=male" \
  --cookie "next-auth.session-token=YOUR_TOKEN"
```

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Version**: 1.0  
**Last Updated**: 14 Desember 2025
