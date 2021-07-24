const Command = require('../../structures/Command');
const fetch = require('node-fetch');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Report a user to DDUB',
            usage: '<user> [reason]',
            examples: ['report 267386908382855169 Spamming', 'report @GhostSlayer#0001']
        });
    }

    async run(message, args) {
        if (!args.length) return message.deny('commands:report.noArgs')
        const match = args.toString().match(/\d{18}/);
        let member = match ? await this.bot.getRESTUser(match[0]) : null

        let reason = args.slice(1).join(' ')
        const user = await this.bot.mysql.rowQuery('SELECT token FROM tokens WHERE id = ?', message.author.id)

        if (!member) return message.deny('commands:report.notFound')
        if (member.id === message.author.id) return message.deny('commands:report.cantReportSelf')

        const token = user && user.token ? user.token : null

        const report = await fetch(`https://discord.riverside.rocks/report.json.php?id=${member.id}&key=${token ? token : this.bot.config.ddubToken}&details=${reason ? reason : 'No reason'} ${!token ? `(Reported by ${message.author.username})` : ''}`).then(res => res.json())

        if (!report) return message.deny('commands:report.reportFailed')
        if (report.message === 'You can only report a user every 10 minutes.') return message.deny('commands:report.alreadyReported')

        const post = { author: message.author.id, 'reported_user': member.id, reason }
        await this.bot.mysql.query('INSERT INTO reports SET ?', post)

        message.channel.createMessage({
            embed: {
                color: parseInt(this.bot.colors.BLURPLE),
                url: `https://discord.riverside.rocks/check?id=${member.id}`,
                title: await message.translate('commands:report.successTitle'),
                description: await message.translate('commands:report.successDescription', { user: member.username }),

            }
        })
        if (!token) {
            message.channel.createMessage('Want to report users with whitelabel? Use the `d!token` command! https://cdn.drivet.xyz/dupwhitelabel.png')
        }
    }
};
