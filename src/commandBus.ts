
export interface Command { } // marking interface

export interface Handler<C extends Command> {
    handle(command: C): Promise<any>;
}

export interface CommandBus {
    handle(command: Command): Promise<any>
}
