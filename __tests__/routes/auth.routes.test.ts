import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import { prisma } from '../../src/prisma/client';

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes Integration', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Utilisateur créé avec succès');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe('john@example.com');
        });

        it('should return error for duplicate email', async () => {
            // First register
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });

            // Try to register again
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'john@example.com',
                    password: 'password456',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email déjà utilisé');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Register a user for login tests
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });
        });

        it('should login successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Connexion réussie');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
        });

        it('should return error for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Mot de passe incorrect');
        });

        it('should return error for non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Utilisateur non trouvé');
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let token: string;

        beforeEach(async () => {
            // Register and login to get token
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });

            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123',
                });

            token = loginResponse.body?.data?.token;
        });

        it('should return user data with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('john@example.com');
        });

        it('should return error without token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
