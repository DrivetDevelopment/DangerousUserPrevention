const { SlashCommand, CommandOptionType } = require('slash-create');
const axios = require('axios');
const mysql = require('@drivet/database');
const config = require('config').util.toObject()

module.exports = class CheckCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'token',
            description: 'Allows you to report users under your token instead of DUP\'s token',
            options: [{
                type: CommandOptionType.STRING,
                name: 'token',
                required: true,
                description: 'DDUB Token'
            }]
        });

        // Not required initially, but required for reloading with a fresh file.
        this.filePath = __filename;
    }

    async run(ctx) {
      const data = await axios.get('https://discord.riverside.rocks/auth.json.php', {
        params: {
          key: ctx.options.token
        }
      }).catch(err => {})

      if (!data) {
        await ctx.defer(true);
        return 'Invalid API key. You can grab your token from: <https://discord.riverside.rocks/dashboard>'
      }

      if (!config) {
        await mysql.query(`INSERT INTO tokens SET ?`, { id: ctx.member.user.id, token: ctx.options.token })
      } else {
        await mysql.query(`UPDATE tokens SET token = ? WHERE id = ?`, [ctx.options.token, ctx.member.user.id])
      }

      await ctx.defer(true);
      return 'All reports made by you will be under your token now! Please note that the token can\'t be removed unless you contact me. You can contact me at <https://ghostslayer.tk/contact>'
  
    }
}