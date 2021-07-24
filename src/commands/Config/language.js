const Command = require('../../structures/Command');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Sets the preferred language for the server',
            userPermissions: 'administrator',
            usage: '<language>',
            examples: ['language finnish', 'language en-US']
        });
    }

    async run(message, args) {
        const language = args.join(" ").replace('_', '-');

        if (!this.bot.enabledLanguages.some((l) => l.name.toLowerCase() === language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(language.toLowerCase()))){
            return message.channel.createMessage(this.bot.enabledLanguages.map((l) => `${l.flag} | \`${l.name}\` (${l.aliases[0]})`).join("\n"))
        }

        const newLanguage = this.bot.enabledLanguages.find((l) => l.name.toLowerCase() === language.toLowerCase() || (l.aliases.map((a) => a.toLowerCase())).includes(language.toLowerCase())).name;

        this.bot.mysql.query('UPDATE guilds SET language = ? WHERE guildId = ?', [newLanguage, message.guild.id])
        message.accept('config/language:success')
    }
};