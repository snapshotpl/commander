
import { expect } from "chai";

import { Command, Handler } from '../../../src/commandBus';
import { HandlerResolverInMemory } from '../../../src/resolvers';

describe("In Memory Handle Resolver", () => {
    let resolver: HandlerResolverInMemory;

    class FooCommand implements Command { }
    class BarCommand implements Command { }
    class TestCommandWithNoHandler implements Command { }

    class FooHandler implements Handler<FooCommand> {
        handle(c: FooCommand): Promise<void> {
            return Promise.resolve();
        }
    }

    class BarHandler implements Handler<BarCommand> {
        handle(c: FooCommand): Promise<void> {
            return Promise.resolve();
        }
    }

    beforeEach(() => {
        resolver = new HandlerResolverInMemory();
    })

    it("should throw Error when no handler was registered", async () => {
        expect(() => resolver.resolve(new FooCommand()))
            .to.throw(Error);
    });

    it("should throw Error when handler was not registered for given command", async () => {
        resolver.register(FooCommand, new FooHandler());

        expect(() => resolver.resolve(new TestCommandWithNoHandler()))
            .to.throw(Error);
    });

    it("resolve with registered handler", async () => {
        const givenHandler = new FooHandler();
        resolver.register(FooCommand, givenHandler);
        resolver.register(BarCommand, new BarHandler());

        const returnedHandler = resolver.resolve(new FooCommand());

        expect(returnedHandler).to.be.equal(givenHandler);
    });

    it("resolve with last registered handler for given command constructor", async () => {
        resolver.register(BarCommand, new BarHandler());
        resolver.register(FooCommand, new FooHandler());

        const lastHandler = new FooHandler();
        resolver.register(FooCommand, lastHandler);

        expect(resolver.resolve(new FooCommand()))
            .to.be.equal(lastHandler);
    });
});
