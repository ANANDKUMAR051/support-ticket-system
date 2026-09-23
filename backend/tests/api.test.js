process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../src/app');

describe('Support Ticket API', () => {
  let customerToken;
  let customer2Token;
  let agentToken;
  let customerTicketId;

  beforeAll(async () => {
    // Customer login
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'Password@123'
      });

    expect(customerLogin.statusCode).toBe(200);
    customerToken = customerLogin.body.token;

    // Second customer login
    const customer2Login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer2@example.com',
        password: 'Password@123'
      });

    expect(customer2Login.statusCode).toBe(200);
    customer2Token = customer2Login.body.token;

    // Agent login
    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@example.com',
        password: 'Password@123'
      });

    expect(agentLogin.statusCode).toBe(200);
    agentToken = agentLogin.body.token;
  });

  test('GET /api/health returns OK', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('GET /api/tickets without token returns 401', async () => {
    const response = await request(app)
      .get('/api/tickets');

    expect(response.statusCode).toBe(401);
  });

  test('GET /api/users without token returns 401', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.statusCode).toBe(401);
  });

  test('POST /api/auth/login validates required fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(response.statusCode).toBe(400);
  });

  test('POST /api/auth/register validates required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
      });

    expect(response.statusCode).toBe(400);
  });

  test('Customer can create a ticket', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        subject: 'Automated Test Ticket',
        description: 'Ticket created during automated API testing.',
        priority: 'MEDIUM'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.subject).toBe('Automated Test Ticket');

    customerTicketId = response.body.id;
  });

  test('Customer can access their own ticket', async () => {
    const response = await request(app)
      .get(`/api/tickets/${customerTicketId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(customerTicketId);
  });

  test('Customer cannot access another customer ticket', async () => {
    const response = await request(app)
      .get(`/api/tickets/${customerTicketId}`)
      .set('Authorization', `Bearer ${customer2Token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden');
  });

  test('Agent can update ticket status and priority', async () => {
    const response = await request(app)
      .put(`/api/tickets/${customerTicketId}`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('IN_PROGRESS');
    expect(response.body.priority).toBe('HIGH');
  });

  test('Customer cannot modify agent-controlled priority field', async () => {
    const response = await request(app)
      .put(`/api/tickets/${customerTicketId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        priority: 'LOW'
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message)
      .toBe('Customers cannot modify this ticket field');
  });

  test('Unknown route returns 404 JSON', async () => {
    const response = await request(app)
      .get('/api/does-not-exist');

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toMatch(/Route not found/);
  });
});