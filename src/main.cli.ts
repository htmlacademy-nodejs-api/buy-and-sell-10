import { CLIApplication, HelpCommand, VersionCommand } from './cli/index.js';

async function bootstrap() {
  const cliApplication = new CLIApplication();
  cliApplication.registerCommands([
    new HelpCommand(),
    new VersionCommand()
  ]);

  await cliApplication.processCommand(process.argv);
}

await bootstrap();
