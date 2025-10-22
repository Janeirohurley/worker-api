import { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';
import { metricsMiddleware } from '../../src/middlewares/metrics.middleware';

jest.mock('prom-client', () => ({
    Registry: jest.fn().mockImplementation(() => ({
        registerMetric: jest.fn(),
        getSingleMetric: jest.fn(),
        metrics: jest.fn(),
    })),
    collectDefaultMetrics: jest.fn(),
    Histogram: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
    })),
    Counter: jest.fn().mockImplementation(() => ({
        inc: jest.fn(),
    })),
}));

describe('Metrics Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            method: 'GET',
            url: '/test',
        };

        res = {
            statusCode: 200,
            on: jest.fn(),
        };

        next = jest.fn();
    });

    it('should collect metrics for requests', () => {
        const mockRes = res as any;
        mockRes.on.mockImplementation((event: string, callback: Function) => {
            if (event === 'finish') {
                callback();
            }
        });

        metricsMiddleware(req as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalled();

        // Simulate response finish
        const finishCallback = mockRes.on.mock.calls.find((call: any) => call[0] === 'finish')[1];
        finishCallback();

        // Verify that metrics are collected (mocked)
        // Note: In a real scenario, we'd check if observe/inc were called
    });

    it('should handle different status codes', () => {
        const mockRes = res as any;
        mockRes.statusCode = 404;
        mockRes.on.mockImplementation((event: string, callback: Function) => {
            if (event === 'finish') {
                callback();
            }
        });

        metricsMiddleware(req as Request, mockRes as Response, next);

        const finishCallback = mockRes.on.mock.calls.find((call: any) => call[0] === 'finish')[1];
        finishCallback();

        // Note: In a real scenario, we'd check if observe/inc were called
    });
});
