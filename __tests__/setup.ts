import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
    // Connect to database
    await prisma.$connect();
});

afterAll(async () => {
    // Disconnect from database
    await prisma.$disconnect();
});

beforeEach(async () => {
    // Clean up database before each test
    await prisma.user.deleteMany();
});
