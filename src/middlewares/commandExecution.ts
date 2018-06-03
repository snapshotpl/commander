
import { Middleware, NextMiddleware } from './index';
import { Command, Handler } from '../commandBus';
import { HandlerResolver } from '../resolvers'

export class CommandExecutionMiddleware implements Middleware {
    constructor(
        private handlerResolver: HandlerResolver
    ) { }

    public async run(command: Command, next: NextMiddleware): Promise<void> {
        const handler: Handler<Command> = this.handlerResolver.resolve(command);
        await handler.handle(command);
        await next(command);
    }
}
