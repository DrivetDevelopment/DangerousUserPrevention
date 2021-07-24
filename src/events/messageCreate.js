const Event = require('../structures/Event');

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            name: "messageCreate",
        });
    }

    async run(message) {
        const mentionRegexPrefix = RegExp(`^<@!?${this.bot.user.id}>`);
        if (!message || message.author.bot) return;

        let config;
        if (message.guild) config = await this.bot.mysql.rowQuery(`SELECT * FROM guilds WHERE guildId = ?`, message.guild.id)

        let mainPrefix = config && config.prefix ? config.prefix : this.bot.config.bot.prefix;
        const prefix = message.content.match(mentionRegexPrefix) ?
        message.content.match(mentionRegexPrefix)[0] : mainPrefix;

        if (!message.content.startsWith(prefix)) return;

        const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = this.bot.commands.find(c => c.id === cmd.toLowerCase() || c.aliases.includes(cmd.toLowerCase()));

        if (command) {
            try {
                let blacklist = await this.bot.mysql.rowsQuery('SELECT id FROM blacklist')
                let blacklisted = false;

                blacklist.forEach(id => {
                    if (id.id === message.author.id || id.id === message.guild.id) return blacklisted = true;
                });

                if (blacklisted) return;

                if (command.disable) return message.channel.createMessage(`This command is disabled.`);

                if (command.ownerOnly) {
                    if (!['267386908382855169'].includes(message.author.id)) {
                        return message.channel.createMessage(`Only Developers can use this command!`)
                    }
                }

                if (command.botPermissions) {
                    if (!message.channel.memberHasPermission(this.bot.user.id, command.botPermissions)) {
                        return message.channel.createMessage(`I do not have the following permissions to do this action: \`${command.botPermissions}\``)
                    }
                }

                if (command.userPermissions) {
                    if (!message.channel.memberHasPermission(message.author.id, command.userPermissions)) {
                        return message.channel.createMessage(`You do not have the following permissions to do this action: \`${command.userPermissions}\``)
                    }
                }


                await command.run(message, args)
                console.log(`${message.content} (${command.id}) ran by ${message.author.tag} (${message.author.id})`)
            } catch(err) {
                if (err && err.code && err.code === 10007 || err.code === 10008 || err.code === 10011 || err.code === 10013 ||
                    err.code === 10026 || err.code === 50001 || err.code === 50007 || err.code === 50013 || err.code === 90001 || err === "timeout") return;

                console.log(err)

                return message.channel.createMessage('Sorry, an error occured..')
            }
        }
    }
};
