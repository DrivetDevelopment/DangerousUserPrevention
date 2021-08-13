const { SlashCommand, CommandOptionType, ComponentType, ButtonStyle } = require('slash-create');
const mysql = require('@drivet/database');
const axios = require('axios');
const hastebin = require('hastebin.js');
const haste = new hastebin({ url: 'https://hastebin.com' });
const config = require('config').util.toObject();
const CatLoggr = require('cat-loggr');
const logger = new CatLoggr().setLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'info');

module.exports = class CheckCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
        name: 'massreport',
        description: 'Mass Report users to DDUB (Super User Only to prevent abuse)',
        options: [
          {
            type: CommandOptionType.STRING,
            name: 'haste',
            required: true,
            description: 'Hastebin ID full of User ID\'s. https://hastebin.com is allowed only!'
          },
          {
            type: CommandOptionType.STRING,
            name: 'reason',
            required: false,
            description: 'Reason for those reports, reason applies to every user'
          }
      ],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx) {
    const data = await mysql.rowQuery('SELECT id FROM superuser WHERE id = ?', ctx.member.user.id)
    const user = await mysql.rowQuery('SELECT token FROM tokens WHERE id = ?', ctx.member.user.id)
    const token = user && user.token ? user.token : null

    if (!data) return 'Sorry, this command is only for trusted users to prevent any abuse towards DDUB.'

    const hastecontent = await haste.get(ctx.options.haste);
    const users = hastecontent.toString().replace(/\r\n/g,'\n').split('\n');

    await ctx.send(`Reporting all the ${users.length} users!`)

    for(let id of users) {
      logger.info(`Reporting ${id}`)

      mysql.query('INSERT INTO reports SET ?', { id: id, author: ctx.member.user.id, reason: ctx.options.reason })

      await axios.get('https://discord.riverside.rocks/report.json.php', {
        params: {
          id,
          key: token ? token : config.ddubToken,
          details: `${ctx.options.reason ? ctx.options.reason : 'No Reason.'} ${!token ? `(Reported by ${ctx.member.user.username}#${ctx.member.user.discriminator})` : ''}`
        }
      }).catch(err => {})
    }
  }
}