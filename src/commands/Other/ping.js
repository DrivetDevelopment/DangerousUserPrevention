const Command = require('../../structures/Command');
const fetch = require('node-fetch');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['pong'],
            description: 'Check\'s the latency of DUP',
        });
    }

    async run(message) {
        const msg = await message.channel.createMessage('Doing hacker\'s stuff.. please wait sometime while we are getting DDUB\'s ping');

        const latency = msg.timestamp - message.timestamp;

        const startDDUB = process.hrtime();
        fetch(`https://discord.riverside.rocks/check.json.php?id=${message.author.id}`).then(res => res.json())
        const DDUBuptime = process.hrtime(startDDUB);

        const startDB = process.hrtime();
        this.bot.mysql.query('SELECT * FROM reports')
        const DBuptime = process.hrtime(startDB);

        msg.edit({
            content: '',
            embed: {
                title: 'DUP Ping',
                fields: [
                    {
                        name: 'Time Taken',
                        value: `${latency}ms`,
                    },
                    {
                        name: 'Discord API',
                        value: `${message.channel.guild.shard.latency}ms`,
                    },
                    {
                        name: 'DDUB Ping',
                        value: `${(DDUBuptime[0] * 1000 + DDUBuptime[1] / 1e6).toFixed(2)}ms`,
                    },
                    {
                        name: 'Database Ping',
                        value: `${(DBuptime[0] * 1000 + DBuptime[1] / 1e6).toFixed(2)}ms`,
                    }
                ]
            }
        })
    }

};
