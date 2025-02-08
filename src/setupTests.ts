import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  vi.useFakeTimers();
  // @ts-ignore
  globalThis.jest = vi;
  expect.hasAssertions();
});

afterEach(() => {
  vi.useRealTimers();
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});
