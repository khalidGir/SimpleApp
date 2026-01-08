// Mock Resend package
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

const request = require('supertest');
const { app } = require('../server');

// Mock the db module
jest.mock('../db', () => ({
  initDb: jest.fn(),
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  getUserUrls: jest.fn(),
  findUserById: jest.fn(),
  upgradeUserToPro: jest.fn(),
}));

// Mock the schedule module
jest.mock('../schedule', () => ({
  startScheduler: jest.fn(),
  addUrl: jest.fn(),
}));

// Mock the alerts module (avoids Resend initialization)
jest.mock('../alerts', () => ({
  sendAlert: jest.fn(),
}));

// Mock Chapa
jest.mock('../chapa', () => ({
  initializePayment: jest.fn(),
  verifySignature: jest.fn(),
}));

describe('Server Endpoints', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('POST /register should return 201 on success', async () => {
    // Mock database response
    const { createUser, findUserByEmail } = require('../db');
    findUserByEmail.mockResolvedValue(null); // User does not exist
    createUser.mockResolvedValue({ id: 1, email: 'test@example.com' });

    const res = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
  });
});