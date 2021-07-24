const { SlashCommand } = require('slash-create');
const mysql = require('@drivet/database')

module.exports = class ReportCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'reports',
            description: 'Show all reports by DUP',
        });

        // Not required initially, but required for reloading with a fresh file.
        this.filePath = __filename;
    }

    async run() {
        try {
            const query = await mysql.rowsQuery('SELECT * FROM reports');
            const reports = query.reverse();

            let construct = []

            reports.slice(0, 5).forEach((report) => {
                construct.push({
                    name: report.reported_user,
                    value: report.reason ? report.reason : 'No reason provided'
                })
            })

            return ({
                embeds: [{
                    color: 0x7289DA,
                    title: 'All reports by DUP',
                    fields: construct,
                    footer: { text: 'Showing the latest 5 reports'}
                }]
            })
        } catch (err) {
            console.log(err)
            return 'Sorry, something went wrong'
        }
    }
}
