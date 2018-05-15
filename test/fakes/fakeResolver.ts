
import { HandlerResolver } from '../../src/resolvers';
import { Command, Handler } from '../../src/commandBus';

/**
 * Always resolve with handler which will return result from given callback.
 */
export class FakeResolver implements HandlerResolver {
    constructor(
        private handlerCallback: (c: Command) => Promise<any>
    ) { }

    resolve<C extends Command>(command: C): Handler<C> {
        const callback = this.handlerCallback;

        return new class implements Handler<C> {
            handle(c: C): Promise<any> {
                return callback(c);
            }
        };
    }
}
