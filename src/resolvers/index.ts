
import { Handler, Command } from '../commandBus';

export interface HandlerResolver {
    resolve<C extends Command>(command: C): Handler<C>
}

export * from './memory';
