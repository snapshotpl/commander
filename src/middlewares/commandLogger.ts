
import { Middleware, NextMiddleware } from './index';
import { Command } from '../commandBus';


export interface CommandLogger {
    log(level: string, msg: string): CommandLogger;
    log(level: string, msg: string, meta: any): CommandLogger;
    log(level: string, msg: string, ...meta: any[]): CommandLogger;
}

export interface CommandLoggerOptions {
    level?: string;
    errorLevel?: string;
}

export class CommandLoggerMiddleware implements Middleware {
    private logger: CommandLogger;
    private level: string;
    private errorLevel: string;

    constructor(logger: CommandLogger, options: CommandLoggerOptions = {}) {
        this.logger = logger;
        this.level = options.level || 'info';
        this.errorLevel = options.errorLevel || 'error';
    }

    public async run(command: Command, next: NextMiddleware): Promise<void> {
        const start = Date.now();
        const commandName = command.constructor.name;

        this.logger.log(this.level, 'Command %s dispatched', commandName);

        try {
            return await next();
        } catch (err) {
            this.logger.log(this.errorLevel, 'Command %s error. %s', commandName, err);
            throw err;
        } finally {
            const time = Date.now() - start;
            this.logger.log(this.level, 'Command %s time %dms', commandName, time);
        }
    }
}
