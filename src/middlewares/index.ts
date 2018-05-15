
import { Command } from '../commandBus';

export type NextMiddleware = () => Promise<any>;

export interface Middleware {
    run(command: Command, next: NextMiddleware): Promise<any>;
}

export * from './commandLogger';
export * from './commandExecution';
