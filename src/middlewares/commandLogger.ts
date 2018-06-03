
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

class Timer {
    private start = Date.now();

    public getTime(): number {
        return Date.now() - this.start;
    }
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
        const commandName = command.constructor.name;

        this.logger.log(this.level, 'Command %s dispatched', commandName);

        const timer = new Timer();

        try {
            const res = await next(command);
            this.logger.log(this.level, 'Command %s succeeded (%dms)', commandName, timer.getTime());
            return res;
        } catch (err) {
            this.logger.log(this.errorLevel, 'Command %s failed (%dms): %s', commandName, timer.getTime(), err);
            throw err;
        }
    }
}
