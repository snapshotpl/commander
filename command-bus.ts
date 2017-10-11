interface Command {

}


interface CommandHandler {
  handle(commmand: Command): any;
}


interface NextMiddleware {
  executeNext(command: Command): any;
}


interface Middleware {
  execute(command: Command, next: NextMiddleware): any;
}


interface CommandNameExtractor {
  extract(command: Command): string;
}


interface HandlerLocator {
  getHandlerForCommand(commandName: string): CommandHandler;
}


interface CommandBus {
  handle(comand: Command): void;
}


class CommandHandlerMiddleware implements Middleware
{
  constructor(readonly handlerLocator: HandlerLocator, readonly commandNameExtractor: CommandNameExtractor) {
  }

  execute(command: Command, next: NextMiddleware): any
  {
    let className: string = this.commandNameExtractor.extract(command);

    return this.handlerLocator.getHandlerForCommand(className).handle(command);
  }
}


class InMemoryCommandBus implements CommandBus {
  readonly commands: Command[];

  handle(command: Command): void {
    this.commands.push(command);
  }
}


class Commander implements CommandBus {
  private middlewareChain;

  constructor(readonly middlewares: Middleware[]) {
    this.middlewareChain = this.createExcecutionChain(middlewares);
  }

  handle(command: Command): void {
    this.middlewareChain.executeNext(command);
  }

  private createExcecutionChain(middlewares: Middleware[]): NextMiddleware {
    let lastCallable: NextMiddleware = (new class implements NextMiddleware {
      executeNext(command: Command): any {
      }
    });

    for(let i: number = middlewares.length; i >= 0; i--) {
      lastCallable = (new class implements NextMiddleware {
        executeNext(command: Command): any {
          return middlewares[i].execute(command, lastCallable);
        }
      });
    }
    return lastCallable;
  }
}
