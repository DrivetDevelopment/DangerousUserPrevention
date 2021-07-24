const Command = require('../../structures/Command');
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['halp', 'bothelp', 'commands'],
            description: 'Displays every available command and information.',
            usage: 'help [command]',
            examples: [ 'help hello' ]
        });
    }

    async run(message, args) {
        const guildSettings = await this.bot.mysql.rowQuery('SELECT * FROM guilds WHERE guildId = ?', message.guild.id);
        const prefix = guildSettings && guildSettings.prefix ? guildSettings.prefix : this.bot.config.bot.prefix
        // Finds a command
        let cmd;
        if (args) cmd = this.bot.commands.find(c => c.id.toLowerCase() === args.join(" ").toLowerCase() || c.aliases.includes(args.join(" ").toLowerCase()));

        // If no command, send a list of commands
        if (!cmd) {
            let categories = [];

            // Hides owner & disabled cmds
            this.bot.commands.forEach(c => {
                if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category);
            });

            const sortedcategories = [];

            // Sorts categories
            categories = categories.sort((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            });

            // Current channel help
            categories.forEach(e => {
                sortedcategories[categories.indexOf(e)] = this.capitalise(e)
            });

            message.channel.createMessage({
                embed: {
                    color: parseInt(this.bot.colors.BLURPLE),
                    author: {
                        name: await message.translate('commands:help.title'),
                        icon_url: this.bot.user.avatarURL
                    },
                    description: await message.translate('commands:help.description', { prefix }),
                    fields: categories.map(category => ({
                        name: sortedcategories[categories.indexOf(category)],
                        value: this.bot.commands.map(c => {
                            if (c.category !== category) return;
                            return `\`${c.id}\``;
                        }).join(" "),
                    })),
                    footer: {
                        icon_url: message.author.dynamicAvatarURL(),
                    },
                },
            });
        } else {
            // Specific command help
            const construct = [];
            if (cmd.aliases.length) {
                construct.push({
                    name: await message.translate('commands:help.aliases'),
                    value: `${cmd.aliases.map(alias => `\`${alias}\``).join(" ")}`,
                    inline: false,
                });
            }

            if (cmd.examples.length) {
                construct.push({
                    name: await message.translate('commands:help.examples'),
                    value: `${cmd.examples.map(example => `\`${example}\``).join("\n")}`,
                    inline: false,
                });
            }

            if (cmd.usage) construct.push({
                name: await message.translate('commands:help.usage'),
                value: `\`${cmd.usage}\``,
                inline: false
            });

            if (cmd.botPermissions && cmd.botPermissions !== "embedLinks") {
                construct.push({
                    name: await message.translate('commands:help.bot_permissions'),
                    value: cmd.botPermissions,
                    inline: true,
                });
            }

            if (cmd.userPermissions) construct.push({
                name: await message.translate('commands:help.required_permissions'),
                value: cmd.userPermissions,
                inline: true
            });
            if (cmd.ownerOnly) construct.push({
                name: await message.translate('commands:help.owner_only'),
                value: cmd.ownerOnly ? 'Yes' : 'No',
                inline: true
            });

            message.channel.createMessage({
                embed: {
                    color: parseInt(this.bot.colors.BLURPLE),
                    title: `${cmd.category}:${cmd.id}`,
                    description: cmd.description || await message.translate('commands:help.no_desc'),
                    fields: construct,
                },
            });
        }
    }

    capitalise(string) {
        return string
            .split(" ")
            .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
            .join(" ");
    }
};
