const { SlashCommand, CommandOptionType } = require('slash-create');
const fetch = require('node-fetch');
const REST = require('../../utils/rest')
const config = require('config').util.toObject();
const mysql = require('@drivet/database')

module.exports = class ReportCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'report',
            description: 'Report a user to DDUB',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'user',
                    required: true,
                    description: 'A user is needed'
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'reason',
                    required: false,
                    description: 'Reason for the report.'
                }
            ]
        });

        // Not required initially, but required for reloading with a fresh file.
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            const match = ctx.member.user.id !== ctx.options.user;
            let member = match ? await REST.getUser(ctx.options.user) : null

            if (ctx.member.user.id === ctx.options.user) return 'You can not report yourself!'
            if (!member) return 'The user was not found!'

            const report = await fetch(`https://discord.riverside.rocks/report.json.php?id=${ctx.options.user}&key=${config.ddubToken}&details=${ctx.options.reason ? ctx.options.reason : ''} (Reported by ${ctx.member.user.username})`).then(res => res.json())

            if (!report) return 'Report failed. DDUB didn\'t receive the request!'
            if (report.message === 'You can only report a user every 10 minutes.') return 'This user has been already reported within the 10 minutes!'

            const post = { author: ctx.member.user.id, 'reported_user': member.id, reason: ctx.options.reason }
            await mysql.query('INSERT INTO reports SET ?', post)

            return ({
                embeds: [{
                    color: 0x7289DA,
                    url: `https://discord.riverside.rocks/check?id=${member.id}`,
                    title: 'User Reported!',
                    description: `${member.username} was reported successfully!`
                }]
            })

        } catch (err) {
            console.log(err)
            return 'Sorry, something went wrong'
        }
    }
}
