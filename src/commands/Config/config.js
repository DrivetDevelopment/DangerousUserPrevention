const Command = require('../../structures/Command');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Shows the whole server configuration in JSON format',
            userPermissions: 'administrator',
        });
    }

    async run(message, args) {
        const config = await this.bot.mysql.rowQuery('SELECT * FROM guilds WHERE guildId = ?', message.guild.id)
        const _cfg = JSON.stringify(config, null, 2);

        message.channel.createMessage('```json\n' +
            _cfg +
            '\n```'
        )
    }
};