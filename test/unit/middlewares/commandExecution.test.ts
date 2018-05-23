
import { expect } from 'chai';
import { stub } from 'sinon';

import { CommandExecutionMiddleware, NextMiddleware } from '../../../src/middlewares';
import { Command } from '../../../src/commandBus';

import { FakeResolver } from '../../fakes/fakeResolver';

describe("Command Execution Middleware", () => {

    const noop: NextMiddleware = () => Promise.resolve('no op');
    const testCommand = new class implements Command { };


    it("should resolve after handler resolves", async () => {
        const orderArr: string[] = [];

        const executor = new CommandExecutionMiddleware(
            new FakeResolver(() => {
                return Promise.resolve()
                    .then(() => orderArr.push('resolver'))
            })
        );

        await executor.run(testCommand, noop)
            .then(() => orderArr.push('after executor'));

        expect(orderArr).to.be.deep.equal([
            'resolver',
            'after executor'
        ]);
    });

    it("should reject when handler rejects with the same reason", async () => {

        const givenReason = new Error();

        const executor = new CommandExecutionMiddleware(
            new FakeResolver(() => Promise.reject(givenReason))
        );

        const promise = executor.run(testCommand, noop);

        return expect(promise).to.eventually.be.rejectedWith(givenReason);
    });

    it("should resolve efter next() resolves", async () => {
        const executor = new CommandExecutionMiddleware(
            new FakeResolver(() => Promise.resolve())
        );

        const next = stub();
        next.resolves();

        const last = stub();

        await executor.run(testCommand, next).then(last);

        expect(last.calledImmediatelyAfter(next)).to.be.true;
    });

    it("should call next() exacly once", async () => {

        const executor = new CommandExecutionMiddleware(
            new FakeResolver(() => Promise.resolve())
        );

        const next = stub();
        next.resolves();

        await executor.run(testCommand, next);

        expect(next.calledOnce).to.be.true;
    });

    it("should reject promise when next() rejects with same reason", async () => {

        const executor = new CommandExecutionMiddleware(
            new FakeResolver(() => Promise.resolve())
        );

        const givenReason = new Error();

        const next = stub();
        next.rejects(givenReason);

        const promise = executor.run(testCommand, next);

        return expect(promise).to.eventually.be.rejectedWith(givenReason);
    });
});
