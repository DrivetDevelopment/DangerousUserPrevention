const Command = require('../../structures/Command');
const fetch = require('node-fetch');

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['lookup', 'search'],
            description: 'Checks the user\'s information in DDUB',
            usage: '<user>',
            examples: ['check 267386908382855169', 'check @GhostSlayer#0001']
        });
    }

    async run(message, args) {
        const match = args.toString().match(/\d{18}/);
        let member = match ? await this.bot.getRESTUser(match[0]) : message.member.user

        const user = await fetch(`https://discord.riverside.rocks/check.json.php?id=${member.id}`).then(res => res.json())
        const score = user.score.replace('%', '')
        let construct = []
        let whitelisted = false

        if (parseInt(score) === parseInt(0) && user.total_reports >= 1) {
            whitelisted = true
            construct.push({
                name: await message.translate('commands:check.safe'),
                value: match && member.id !== message.author.id ? await message.translate('commands:check.user.whitelistDesc', { memberName: member.username }) : await message.translate('commands:check.author.whitelistDesc')
            })

            construct.push({
                name: await message.translate('commands:check.note'),
                value: await message.translate('commands:check.user.noteDesc')
            })
        }

        if (!score || score <= 29 && !whitelisted) {
            construct.push({
                name: await message.translate('commands:check.safe'),
                value: match && member.id !== message.author.id ? await message.translate('commands:check.user.safeDesc', { memberName: member.username }) : await message.translate('commands:check.author.safeDesc')
            })
        }

        if (score >= 30 && score <= 49) {
            construct.push({
                name: await message.translate('commands:check.notTooDangerous'),
                value: match && member.id !== message.author.id ? await message.translate('commands:check.user.notTooDangerousDesc', { memberName: member.username }) : await message.translate('commands:check.author.notTooDangerousDesc')
            })
        }

        if (score >= 50 && score <= 100) {
            construct.push({
                name: 'Dangerous',
                value: match && member.id !== message.author.id ? await message.translate('commands:check.user.dangerousDesc', { memberName: member.username }) : await message.translate('commands:check.author.dangerousDesc')
            })
        }

        message.channel.createMessage({
            embed: {
                color: parseInt(this.bot.colors.BLURPLE),
                author: {
                    name: member.tag,
                    icon_url: member.dynamicAvatarURL()
                },
                url: `https://discord.riverside.rocks/check?id=${member.id}`,
                description: `[${await message.translate('commands:check.seeReports')}](https://discord.riverside.rocks/check?id=${member.id})`,
                fields: construct,
                footer: { text: user.total_reports ? match && member.id !== message.member.user ?
                        // if args
                        user.total_reports === 1 ?
                            await message.translate('commands:check.footer.user.reportedOneTime', { count: user.total_reports })
                            :
                            await message.translate('commands:check.footer.user.reportedMultipleTimes', { count: user.total_reports })
                        // if no args
                        : user.total_reports === 1 ?
                            await message.translate('commands:check.footer.author.reportedOneTime', { count: user.total_reports })
                            :
                            await message.translate('commands:check.footer.author.reportedMultipleTimes', { count: user.total_reports })
                        // if never reported
                        : match ?
                            await message.translate('commands:check.footer.user.reportedNever')
                            :
                            await message.translate('commands:check.footer.author.reportedNever')
                }
            }
        })

    }
};
