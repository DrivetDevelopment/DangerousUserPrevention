const Eris = require('eris');
const emojis = require('../settings/config.json').emojis
const colors = require('../settings/config.json').colors
const i18n = require('./i18n');
const mysql = require('@drivet/database');

Object.defineProperty(Eris.Message.prototype, "accept", {
    value: async function(key, args) {
        let translations = await i18n();
        const query = this.guild ? await mysql.rowQuery('SELECT language FROM guilds WHERE guildId = ?', this.guild.id) : null
        const language = translations.get(this.guild ? query.language : "en-US");

        if (!language) throw "Message: Invalid language set in data.";

        return this.channel.createMessage({
            embed: {
                description: `${emojis.accept} ${language(key, args)}`,
                color: parseInt(colors.GREEN)
            }
        })
    }
});

Object.defineProperty(Eris.Message.prototype, "deny", {
    value: async function(key, args) {
        let translations = await i18n();
        const query = this.guild ? await mysql.rowQuery('SELECT language FROM guilds WHERE guildId = ?', this.guild.id) : null
        const language = translations.get(this.guild ? query.language : "en-US");

        if (!language) throw "Message: Invalid language set in data.";

        return this.channel.createMessage({
            embed: {
                description: `${emojis.deny} ${language(key, args)}`,
                color: parseInt(colors.RED)
            }
        })
    }
});

Object.defineProperty(Eris.Message.prototype, "translate", {
    value: async function(key, args) {
        let translations = await i18n();

        const query = this.guild ? await mysql.rowQuery('SELECT language FROM guilds WHERE guildId = ?', this.guild.id) : null
        const language = translations.get(this.guild ? query.language : "en-US");

        if (!language) throw "Message: Invalid language set in data.";
        return language(key, args);
    }
});