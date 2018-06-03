
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

    it("should resolve after launching all middlewares in order of middleware next() call", async () => {

        const createPusher = (array: any[], item: any) => {
            return async (command: Command, next: NextMiddleware) => {
                await Promise.resolve(true);
                await next(command);
                array.push(item);
            }
        }

        let counters: number[] = [];

        const commander = new Commander([
            new CallbackMiddleware(createPusher(counters, 'first')),
            new CallbackMiddleware(createPusher(counters, 'second')),
            new CallbackMiddleware(createPusher(counters, 'third')),
        ]);

        const promise = commander.handle(testCommand);

        expect(counters.length).to.be.equal(0);
        await promise;
        expect(counters).to.be.deep.equal(['third', 'second', 'first']);
    });
});
