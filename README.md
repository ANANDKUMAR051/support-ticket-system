# Support Ticket Management System

A full-stack Support Ticket Management System developed for the Junior Full Stack Developer technical assessment.

The application provides customer and agent workflows for creating, managing, tracking, and commenting on support tickets with JWT authentication and role-based authorization.

## Live Application

### Frontend

https://support-ticket-system-alpha-eight.vercel.app/

### Backend API

https://support-ticket-system-sr2i.onrender.com

### Backend Health Check

https://support-ticket-system-sr2i.onrender.com/api/health

### GitHub Repository

https://github.com/ANANDKUMAR051/support-ticket-system

---

## Features

### Authentication

- Customer and Agent registration/login
- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- Role-based authorization

### Customer Features

- View own support tickets
- Create support tickets
- View ticket details
- Add comments
- Search and filter tickets
- Update allowed ticket status fields
- Customers cannot access other customers' tickets
- Customers cannot modify agent-controlled fields such as priority or assignment

### Agent Features

- View all support tickets
- Search and filter tickets
- Update ticket status
- Update ticket priority
- Assign tickets to agents
- View ticket comments
- Add comments
- Access user listing

### Security

- JWT authentication
- Role-based authorization middleware
- Customer ticket ownership protection
- Password hashing with bcrypt
- Parameterized SQL queries
- Helmet security middleware
- Rate limiting
- CORS configuration
- Environment variables for sensitive configuration
- `.env` files excluded from Git

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcryptjs
- Helmet
- express-rate-limit
- CORS

### Database

- MySQL 8+
- mysql2

### Testing

- Jest
- Supertest
- Postman

### Deployment

- Vercel - Frontend
- Render - Backend API
- Aiven - MySQL Database
- GitHub - Source Code

---

## Project Structure

```text
support-ticket-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── postman/
│   └── collections/
│
├── tests/
│   └── README.md
│
├── .gitignore
└── README.md