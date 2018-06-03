
import { Command } from '../commandBus';

export type NextMiddleware = (command: Command) => Promise<any>;

export interface Middleware {
    run(command: Command, next: NextMiddleware): Promise<void>;
}

export * from './commandLogger';
export * from './commandExecution';
