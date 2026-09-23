# Support Ticket Management System

A full-stack Support Ticket Management System built for the Junior Full Stack Developer technical assessment.

## Stack

- Frontend: React + Vite + JavaScript
- Backend: Node.js + Express
- Database: MySQL
- Authentication: JWT
- Password hashing: bcryptjs
- API client: Axios
- API testing: Jest + Supertest
- Manual API testing: Postman

## Requirements

Install:

- Node.js 18+
- MySQL 8+
- Git

## 1. Create the project

Clone or create the repository and keep this structure:

support-ticket-system/
- backend/
- frontend/
- database/
- tests/
- README.md

## 2. Create the MySQL database

Open MySQL:

```bash
mysql -u root -p
```

Run:

```sql
SOURCE /absolute/path/to/support-ticket-system/database/schema.sql;
SOURCE /absolute/path/to/support-ticket-system/database/seed.sql;
```

Or from your terminal:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p support_ticket_system < database/seed.sql
```

## 3. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set the real MySQL password and a strong JWT secret.

Install:

```bash
npm install
```

Start:

```bash
npm run dev
```

The API runs at:

http://localhost:5000

Health check:

http://localhost:5000/api/health

## 4. Configure frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

http://localhost:5173

## Demo accounts

Seed data provides:

Customer:
- Email: customer@example.com
- Password: Password@123

Agent:
- Email: agent@example.com
- Password: Password@123

Change these credentials for any real deployment.

## 5. API overview

### Public

POST /api/auth/register
POST /api/auth/login

### Authenticated

GET /api/tickets
GET /api/tickets/:id
PUT /api/tickets/:id
DELETE /api/tickets/:id
GET /api/tickets/:id/comments
POST /api/tickets/:id/comments

### Customer

POST /api/tickets

### Agent

GET /api/users

## 6. Testing

From backend:

```bash
npm test
```

The included tests cover health checks, authentication validation, protected endpoints, and unknown routes.

For complete integration testing, start MySQL and the backend, then extend the Jest/Supertest suite with test users and tickets.

## 7. Postman

Create a Postman environment:

```text
baseUrl = http://localhost:5000/api
token = JWT returned by login
```

Use:

```text
POST {{baseUrl}}/auth/register
POST {{baseUrl}}/auth/login
GET {{baseUrl}}/tickets
POST {{baseUrl}}/tickets
GET {{baseUrl}}/tickets/1
PUT {{baseUrl}}/tickets/1
GET {{baseUrl}}/tickets/1/comments
POST {{baseUrl}}/tickets/1/comments
GET {{baseUrl}}/users
```

For protected requests add:

```text
Authorization: Bearer {{token}}
```

## 8. Production deployment checklist

Before deploying:

1. Build the frontend with `npm run build`.
2. Configure the frontend's `VITE_API_URL` to the deployed API URL.
3. Configure the backend's `CLIENT_ORIGIN`.
4. Use a managed/cloud MySQL database.
5. Set `NODE_ENV=production`.
6. Generate a strong random JWT secret.
7. Never commit `.env`.
8. Run the database schema and seed scripts against the production database only when appropriate.
9. Verify authentication and role restrictions.
10. Verify the public frontend, API and database connectivity.
11. Add the live frontend URL, API URL, GitHub URL and setup instructions to the final submission.

## Security notes

- Passwords are hashed with bcrypt.
- JWT authentication and role authorization are separate middleware concerns.
- Customers are restricted to their own tickets.
- Agent-only user listing is protected.
- SQL queries use parameterized values.
- Helmet and rate limiting are enabled.
- Secrets are read from environment variables.
- CORS is restricted using CLIENT_ORIGIN.

## Database JOIN example

```sql
SELECT
  t.id,
  t.subject,
  t.priority,
  t.status,
  u.name AS customer_name,
  u.email AS customer_email
FROM tickets t
JOIN users u ON u.id = t.user_id
WHERE t.status = 'OPEN'
ORDER BY t.created_at DESC;
```
