import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only';

beforeAll(async () => {
  // Global test setup
});

afterEach(() => {
  // Clean up after each test
});

afterAll(async () => {
  // Global test cleanup
});