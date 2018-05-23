
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

    type Person = {id: number, firstName: string, lastName: string};
    type PersonRepository = Person[];

    class AddPersonCommand implements Command {
        constructor(
            public firstName: string,
            public lastName: string
        ) { }
    }

    class AddPersonHandler implements Handler<AddPersonCommand> {
        private lastId = 123;

        constructor(
            private repository: any[]
        ) {}

        public async handle(addPerson: AddPersonCommand): Promise<void> {
            if (
                addPerson.firstName.length === 0 ||
                addPerson.lastName.length === 0
            ) {
                throw new Error('firstName and lastName cannot be empty string');
            }

            this.repository.push({
                id: ++ this.lastId,
                firstName: addPerson.firstName,
                lastName: addPerson.lastName,
            });
        }
    }

    let logger: FakeLogger;
    let commander: Commander;
    let resolver: HandlerResolverInMemory;
    let personRepository: PersonRepository;

    beforeEach(() => {
        personRepository = [];
        logger = new FakeLogger();
        resolver = new HandlerResolverInMemory();

        resolver.register(AddPersonCommand, new AddPersonHandler(personRepository));

        commander = new Commander([
            new CommandLoggerMiddleware(logger),
            new CommandExecutionMiddleware(resolver),
        ]);
    });

    it("should resolve with value from handler", async () => {
        await commander.handle(new AddPersonCommand('John', 'Doe'));

        expect(personRepository).to.be.deep.equal([{
            id: 124,
            firstName: 'John',
            lastName: 'Doe',
        }]);
    });

    it("should write info logs", async () => {
        await commander.handle(new AddPersonCommand('John', 'Doe'));

        const infos = logger.Messages.filter(entry => entry.level === 'info');

        expect(infos.length).to.be.greaterThan(0);
    });

    it("should reject when handler rejects", async () => {
        const promise = commander.handle(new AddPersonCommand('John', ''));

        return expect(promise).to.eventually.be.rejectedWith(
            Error,
            'firstName and lastName cannot be empty string'
        );
    });

    it("should write error logs when handler rejects", async () => {
        try {
            await commander.handle(new AddPersonCommand('John', ''));
        } catch (err) { }

        const errors = logger.Messages.filter(entry => entry.level === 'error');

        expect(errors.length).to.be.greaterThan(0);
    });

});
