import { Middleware } from './middlewares';
import { CommandBus, Command } from './commandBus';

type ExecutionChain = (command: Command) => Promise<any>;

export class Commander implements CommandBus {

    private executionChain: ExecutionChain;

    constructor(middlewares: Middleware[]) {
        this.executionChain = this.createExecutionChain(middlewares);
    }

    public async handle(command: Command): Promise<void> {
        await this.executionChain(command);
    }

    private createExecutionChain(middlewares: Middleware[]): ExecutionChain {
        const last = () => {
            // last callback in chain is no-op
            return Promise.resolve();
        };

        const reducer = (
            next: ExecutionChain,
            middleware: Middleware
        ): ExecutionChain => {
            return (command: Command): Promise<void> => {
                return middleware.run(command, () => next(command));
            }
        };

        return middlewares.reverse().reduce(reducer, last);
    }
}
