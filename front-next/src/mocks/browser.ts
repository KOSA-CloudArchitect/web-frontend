import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker with our request handlers
export const worker = setupWorker(...handlers); 