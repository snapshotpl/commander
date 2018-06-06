
import { Handler, Command } from '../commandBus';
import { HandlerResolver } from './index';

export type ConstructorOf<T> = new (...args: any[]) => T;

export class HandlerResolverInMemory implements HandlerResolver {
    private handlers = new Map<ConstructorOf<Command>, Handler<Command>>();

    public register<T>(commandConstructor: ConstructorOf<T>, handler: Handler<T>): HandlerResolverInMemory {
        this.handlers.set(commandConstructor, handler);
        return this;
    }

    public resolve<T>(command: Command): Handler<T> {
        const handler = this.handlers.get(command.constructor as ConstructorOf<Command>);

        if (!handler) {
            throw new Error(`Could not resolve handler for ${command.constructor.name}`);
        }

        return handler;
    }
}
