const Command = require('../../structures/Command');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Show all reports by DUP',
        });
    }

    async run(message) {
        const query = await this.bot.mysql.rowsQuery('SELECT * FROM reports');
        const reports = query.reverse();

        let construct = []

        for (const report of reports.slice(0, 5)) {
            const reporter = await this.bot.getRESTUser(report.author)
            const reported = await this.bot.getRESTUser(report.reported_user)

            construct.push({
                name: `Reporter: ${reporter.username}#${reporter.discriminator} | Reported: ${reported.username}#${reported.discriminator}`,
                value: report.reason ? report.reason : 'No reason provided'
            })
        }

        message.channel.createMessage({
            embed: {
                title: 'All reports by DUP',
                fields: construct,
                footer: { text: `${message.translate('commands:reports.showingLatest')} · ${reports.length} reports total · Latest report: ${reports[0].timestamp}` }
            }
        })
    }
};
