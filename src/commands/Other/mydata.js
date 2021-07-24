const Command = require('../../structures/Command');
const JSZip = require("jszip");
const zip = new JSZip();
const fs = require('fs');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            description: 'Request all your data that are saved on the database.',
        });
    }

    async run(message) {
        const info = await message.channel.createMessage('We are crawling your data..')
        const reports = await this.bot.mysql.rowsQuery('SELECT * FROM reports WHERE author = ?', message.author.id)
        const warnings = await this.bot.mysql.rowsQuery('SELECT * FROM warnings WHERE id = ?', message.author.id)

        zip.file("data/reports.json", JSON.stringify(reports, null, 2));
        zip.file("data/warnings.json", JSON.stringify(warnings, null, 2));

        zip.generateAsync({ type:"nodebuffer" }).then(function(content) {
            setTimeout(() => {
                info.delete()

                message.channel.createMessage('Here is all of your data that DUP has saved', {
                    file: content,
                    name: `${message.author.id}.zip`
                })
            }, 3000)
            //saveAs(content, "example.zip");
        });
    }

};
