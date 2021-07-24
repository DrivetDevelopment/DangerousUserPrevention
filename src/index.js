require('eris-additions');
require('./helpers/extenders');

const DUPClient = require('./structures/Client');
const config = require('config').util.toObject();

let options = {
    restMode: true,
    intents: [
        'guilds',
        'guildMessages',
        'guildMessageReactions',
        'directMessages',
        'directMessageReactions',
    ],
}

new DUPClient(config.bot.token, options);
