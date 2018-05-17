
import { expect } from "chai";

import { Commander } from '../../src/commander';
import { Command, Handler } from '../../src/commandBus';
import {
    CommandLoggerMiddleware,
    CommandExecutionMiddleware
} from '../../src/middlewares';

import { HandlerResolverInMemory } from '../../src/resolvers'
import { FakeLogger } from '../fakes/fakeLogger';


describe("Commander with middlewares combo", () => {

    class HelloCommand implements Command {
        constructor(
            public firstName: string,
            public lastName: string
        ) { }
    }

    class HelloHandler implements Handler<HelloCommand> {
        public wait(timeout: number): Promise<void> {
            return new Promise(resolve => setTimeout(resolve, timeout));
        }

        public async handle(hello: HelloCommand): Promise<string> {
            await this.wait(10); // simulate I/O waiting

            if (hello.lastName.length === 0) {
                throw new Error('lastName is empty string');
            }

            return `Hello, ${hello.firstName} ${hello.lastName}`;
        }
    }

    let logger: FakeLogger;
    let commander: Commander;
    let resolver: HandlerResolverInMemory;

    beforeEach(() => {
        logger = new FakeLogger();
        resolver = new HandlerResolverInMemory();

        resolver.register(HelloCommand, new HelloHandler());

        commander = new Commander([
            new CommandLoggerMiddleware(logger),
            new CommandExecutionMiddleware(resolver),
        ]);
    });

    it("should resolve with value from handler", async () => {
        const promise = commander.handle(new HelloCommand('John', 'Doe'));

        return expect(promise).to.eventually.be.equal('Hello, John Doe');
    });

    it("should write info logs", async () => {
        await commander.handle(new HelloCommand('John', 'Doe'));

        const infos = logger.messages.filter(entry => entry.level === 'info');

        expect(infos.length).to.be.greaterThan(0);
    });

    it("should reject when handler rejects", async () => {
        const promise = commander.handle(new HelloCommand('John', ''));

        return expect(promise).to.eventually.be.rejectedWith(Error, 'lastName is empty string');
    });

    it("should write error logs when handler rejects", async () => {
        try {
            await commander.handle(new HelloCommand('John', ''));
        } catch (err) { }

        const errors = logger.messages.filter(entry => entry.level === 'error');

        expect(errors.length).to.be.greaterThan(0);
    });

});
