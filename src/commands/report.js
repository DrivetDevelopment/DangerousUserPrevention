const { SlashCommand, CommandOptionType } = require('slash-create');
const REST = require('../utils/rest')
const config = require('config').util.toObject();
const mysql = require('@drivet/database');
const axios = require('axios');

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
        ],
      });
    }

    async run(ctx) {
      const user = await mysql.rowQuery('SELECT token FROM tokens WHERE id = ?', ctx.member.user.id)

      try {
          const match = ctx.member.user.id !== ctx.options.user;
          let member = match ? await REST.getUser(ctx.options.user) : null

          if (ctx.member.user.id === ctx.options.user) return 'You can not report yourself!'
          if (!member) return 'The user was not found!'

          const token = user && user.token ? user.token : null

          const report = await axios.get('https://discord.riverside.rocks/report.json.php', {
              params: {
                id: ctx.options.user,
                key: token ? token : config.ddubToken,
                details: `${ctx.options.reason ? ctx.options.reason : 'No Reason.'} ${!token ? `(Reported by ${ctx.member.user.username}#${ctx.member.user.discriminator})` : ''}`
              }
          })

          if (!report) return 'Report failed. DDUB didn\'t receive the request!'
          if (report.message === 'You can only report a user every 10 minutes.') return 'This user has been already reported within the 10 minutes!'

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