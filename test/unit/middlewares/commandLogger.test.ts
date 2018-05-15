
import { expect } from 'chai';
import { useFakeTimers, SinonFakeTimers } from 'sinon';

import { FakeLogger } from './../../fakes/fakeLogger';
import { Command } from '../../../src/commandBus';

import { CommandLoggerMiddleware, NextMiddleware } from '../../../src/middlewares';

class TestCommand implements Command {
}

describe("Command Logger Middleware", () => {
    let logger: FakeLogger;
    let commandLogger: CommandLoggerMiddleware;
    let clock: SinonFakeTimers;

    beforeEach(() => {
        logger = new FakeLogger();
        commandLogger = new CommandLoggerMiddleware(logger);
        clock = useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it("should log command dispatch and command execution time", async () => {
        const next: NextMiddleware = () => {
            clock.tick(25);
            return Promise.resolve('foo bar');
        }

        await commandLogger.run(new TestCommand(), next);

        const infos = logger.messages.filter((entry) => entry.level === 'info');
        const errors = logger.messages.filter((entry) => entry.level === 'errors');

        expect(infos.length).to.be.equal(2);
        expect(errors.length).to.be.equal(0);

        expect(infos[0].msg).to.equal("Command TestCommand dispatched");
        expect(infos[1].msg).to.equal("Command TestCommand time 25ms");
    });

    it("should resolve with same value as next()", async () => {
        const next: NextMiddleware = () => {
            return Promise.resolve('foo bar');
        }

        const promise = commandLogger.run(new TestCommand(), next);

        return expect(promise).to.eventually.be.equal('foo bar');
    });

    it("should reject with same error as next() rejects", async () => {
        const givenReason = new Error('foo bar');

        const next: NextMiddleware = () => {
            return Promise.reject(givenReason);
        }

        const promise = commandLogger.run(new TestCommand(), next);

        return expect(promise).to.eventually.be.rejectedWith(givenReason);
    });

    it("should log command dispatch, command execution time and error when occured", async () => {
        const next: NextMiddleware = () => {
            clock.tick(125);
            return Promise.reject(new Error('foo bar'));
        }

        try {
            await commandLogger.run(new TestCommand(), next);
        } catch (e) { }

        const infos = logger.messages.filter((entry) => entry.level === 'info');
        const errors = logger.messages.filter((entry) => entry.level === 'error');

        expect(infos.length).to.be.equal(2);
        expect(errors.length).to.be.equal(1);

        expect(infos[0].msg).to.equal("Command TestCommand dispatched");
        expect(infos[1].msg).to.equal("Command TestCommand time 125ms");

        expect(errors[0].msg).to.equal("Command TestCommand error. Error: foo bar");
    });

});
