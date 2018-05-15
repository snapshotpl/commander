
import { format } from 'util';
import { CommandLogger } from '../../src/middlewares';


export class FakeLogger implements CommandLogger {

    public messages: { level: string, msg: string, meta: any }[] = [];

    public log(level: string, msg: string, ...meta: any[]): CommandLogger {
        const placeholders: string[] = msg.match(/%[sdifjoO]/g) || [];
        const formatArgs: any[] = [msg].concat(
            meta.slice(0, Math.min(placeholders.length, meta.length))
        );

        msg = format.apply(null, formatArgs);

        this.messages.push({
            level: level,
            msg: msg,
            meta: placeholders.length === meta.length ? {} : meta[meta.length - 1]
        });

        return this;
    }
}
