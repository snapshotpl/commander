
import { expect } from "chai";

import { Commander } from '../../src/commander';
import { Command } from '../../src/commandBus';
import { Middleware, NextMiddleware } from '../../src/middlewares';


class CallbackMiddleware implements Middleware {
    constructor(
        private callback: (command: Command, next: NextMiddleware) => Promise<any>
    ) { }
    public run(command: Command, next: NextMiddleware): Promise<any> {
        return this.callback(command, next);
    }
}

describe("Commander", () => {

    const testCommand = new class implements Command { };


    it("should return promise", async () => {
        const commander = new Commander([]);
        const result = commander.handle(testCommand);

        expect(result).to.be.instanceOf(Promise);
    });

    it("should resolve with void when empty middlewares array is given", async () => {
        const commander = new Commander([]);
        const result = await commander.handle(testCommand);

        expect(result).to.be.undefined;
    });

    it("should resolve with value from Middleware", async () => {
        const commander = new Commander([
            new CallbackMiddleware(async () => 'foo bar')
        ]);

        const result = await commander.handle(testCommand);

        expect(result).to.be.equal('foo bar');
    });

    it("should launch all middlewares in order of middleware next() call", async () => {

        const createPusher = (array: any[], item: any) => {
            return async (command: Command, next: NextMiddleware) => {
                await Promise.resolve(true);
                await next();
                array.push(item);
            }
        }

        let counters: number[] = [];

        const commander = new Commander([
            new CallbackMiddleware(createPusher(counters, 0)),
            new CallbackMiddleware(createPusher(counters, 1)),
            new CallbackMiddleware(createPusher(counters, 2)),
        ]);

        await commander.handle(testCommand);

        expect(counters).to.deep.equal([2, 1, 0]);
    });

    it("should resolve value from last middleware if all middlewares return next()", async () => {

        const commander = new Commander([
            new CallbackMiddleware((command: Command, next: NextMiddleware) => {
                return next();
            }),
            new CallbackMiddleware((command: Command, next: NextMiddleware) => {
                return next();
            }),
            new CallbackMiddleware((command: Command, next: NextMiddleware) => {
                return next();
            }),

            new CallbackMiddleware(async (command: Command, next: NextMiddleware) => {
                await next();
                return 'foo bar';
            }),
        ]);

        const result = await commander.handle(testCommand);

        expect(result).to.be.equal('foo bar');
    });

});
