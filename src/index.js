const config = require('config').util.toObject()
const { SlashCreator, FastifyServer } = require('slash-create');
const path = require('path');
const CatLoggr = require('cat-loggr');
const logger = new CatLoggr().setLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'info');

const creator = new SlashCreator({
  applicationID: config.bot.clientId,
  publicKey: config.bot.publicKey,
  token: config.bot.token,
  serverPort: config.webserver.port
});

creator.on('debug', (message) => logger.log(message));
creator.on('warn', (message) => logger.warn(message));
creator.on('error', (error) => logger.error(error));
creator.on('synced', () => logger.info('Commands synced!'));
creator.on('commandRun', (command, _, ctx) => logger.info(`${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ran command ${command.commandName}`));
creator.on('commandRegister', (command) => logger.info(`Registered command ${command.commandName}`));
creator.on('commandError', (command, error) => logger.error(`Command ${command.commandName}:`, error));

creator
  .withServer(new FastifyServer())
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands()
  .startServer();

logger.info(`Server running on port ${config.webserver.port}`)