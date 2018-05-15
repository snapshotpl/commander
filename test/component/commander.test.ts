
import { expect } from "chai";

import { Commander } from '../../src/commander';
import { Command, Handler } from '../../src/commandBus';
import {
    CommandLoggerMiddleware,
    CommandExecutionMiddleware
} from '../../src/middlewares';

import { HandlerResolverInMemory } from '../../src/resolvers'
import { FakeLogger } from '../fakes/fakeLogger';


describe("Commander combo", () => {

    class HelloCommand implements Command {
        public firstName: string = '';
        public lastName: string = '';
    }

    class HelloHandler implements Handler<HelloCommand> {
        public async handle(hello: HelloCommand): Promise<string> {
            return `Hello, ${hello.firstName} ${hello.lastName}`;
        }
    }

    let logger: FakeLogger;

    beforeEach(() => {
        logger = new FakeLogger();
    });

    it("should work", async () => {
        const resolver = new HandlerResolverInMemory();
        resolver.register(HelloCommand, new HelloHandler());

        const commander = new Commander([
            new CommandLoggerMiddleware(logger),
            new CommandExecutionMiddleware(resolver),
        ]);

        const hello = new HelloCommand();
        hello.firstName = 'John';
        hello.lastName = 'Doe';

        const promise = commander.handle(hello);

        return expect(promise).to.eventually.be.equal('Hello, John Doe');
    });
});
