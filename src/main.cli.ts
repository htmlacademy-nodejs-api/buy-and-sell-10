#!/usr/bin/env node
import { CLIApplication, HelpCommand, ImportCommand, VersionCommand } from './cli/index.js';

async function bootstrap() {
  const cliApplication = new CLIApplication();
  cliApplication.registerCommands([
    new HelpCommand(),
    new VersionCommand(),
    new ImportCommand(),
  ]);

  await cliApplication.processCommand(process.argv);
}

await bootstrap();
