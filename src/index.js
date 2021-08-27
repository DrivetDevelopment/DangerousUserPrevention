require('newrelic');
const config = require('config').util.toObject();
const { SlashCreator, GatewayServer } = require('slash-create');
const path = require('path');
const CatLoggr = require('cat-loggr');
const logger = new CatLoggr().setLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'info');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const creator = new SlashCreator({
  applicationID: config.bot.clientId,
  publicKey: config.bot.publicKey,
  token: config.bot.token
});

creator.on('debug', (message) => logger.log(message));
creator.on('warn', (message) => logger.warn(message));
creator.on('error', (error) => logger.error(error));
creator.on('synced', () => logger.info('Commands synced!'));
creator.on('commandRun', (command, _, ctx) => logger.info(`${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ran command ${command.commandName}`));
creator.on('commandRegister', (command) => logger.info(`Registered command "${command.commandName}"`));
creator.on('commandError', (command, error) => logger.error(`Command "${command.commandName}":`, error));

client.on('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
});

creator
  .withServer(
    new GatewayServer(
      (handler) => client.ws.on('INTERACTION_CREATE', handler)
    )
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands()

client.login(config.bot.token);