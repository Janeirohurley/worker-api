import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { requestLogger } from '../../src/middlewares/logger.middleware';

jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        errors: jest.fn(),
        json: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
        simple: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
}));

describe('Logger Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            method: 'GET',
            url: '/test',
            headers: {
                'user-agent': 'test-agent',
                'x-forwarded-for': '127.0.0.1',
            },
            ip: '127.0.0.1',
            get: jest.fn((header: string) => {
                if (header === 'set-cookie') return undefined as string[] | undefined;
                return req.headers?.[header.toLowerCase()] as string;
            }) as any,
        };

        res = {
            statusCode: 200,
            on: jest.fn(),
        };

        next = jest.fn();
    });

    it('should log incoming request and outgoing response', () => {
        const mockRes = res as any;
        mockRes.on.mockImplementation((event: string, callback: Function) => {
            if (event === 'finish') {
                callback();
            }
        });

        requestLogger(req as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalled();

        // Simulate response finish
        const finishCallback = mockRes.on.mock.calls.find((call: any) => call[0] === 'finish')[1];
        finishCallback();

        const mockLogger = (winston.createLogger as jest.Mock).mock.results[0]?.value;

        if (mockLogger) {
            expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', expect.objectContaining({
                method: 'GET',
                url: '/test',
                headers: expect.any(Object),
                ip: '127.0.0.1',
            }));

            expect(mockLogger.info).toHaveBeenCalledWith('Outgoing response', expect.objectContaining({
                method: 'GET',
                url: '/test',
                statusCode: 200,
                duration: expect.any(String),
            }));
        }
    });

    it('should handle errors in response', () => {
        const mockRes = res as any;
        mockRes.statusCode = 500;
        mockRes.on.mockImplementation((event: string, callback: Function) => {
            if (event === 'finish') {
                callback();
            }
        });

        requestLogger(req as Request, mockRes as Response, next);

        const finishCallback = mockRes.on.mock.calls.find((call: any) => call[0] === 'finish')[1];
        finishCallback();

        const mockLogger = (winston.createLogger as jest.Mock).mock.results[0]?.value;

        if (mockLogger) {
            expect(mockLogger.error).toHaveBeenCalledWith('Request error', expect.objectContaining({
                method: 'GET',
                url: '/test',
                statusCode: 500,
                duration: expect.any(String),
            }));
        }
    });
});
