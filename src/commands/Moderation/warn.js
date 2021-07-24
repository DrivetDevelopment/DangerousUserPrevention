const Command = require('../../structures/Command');
const fetch = require('node-fetch');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Gives a warning to a user',
            usage: '<user> [reason]',
            examples: ['warn 267386908382855169 Breaking the bot', 'warn @GhostSlayer#0001'],
            userPermissions: 'administrator'
        });
    }

    async run(message, args) {
        if (!args.length) return message.channel.createMessage('Please give a user\'s id to report!')
        const match = args.toString().match(/\d{18}/);

        const member = match ? await this.bot.getRESTGuildMember(message.guild.id, match[0]) : null
        const reason = args.slice(1).join(' ')

        if (!member) return message.deny('errors:userNotFound')

        try {
            const query = { id: member.id, guild: message.guild.id, reason: reason ? reason : '' }
            this.bot.mysql.query('INSERT INTO warnings SET ?', [query])

            member.createMessage(await message.translate('commands:warn.dm', { serverName: message.guild.name, reason })).catch(() => {})
        } finally {
            return message.accept('commands:warn.success', { memberName: member.username })
        }
    }

};
