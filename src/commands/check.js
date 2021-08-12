const { SlashCommand, CommandOptionType, ComponentType, ButtonStyle } = require('slash-create');
const REST = require('../utils/rest');
const { default: axios } = require('axios');

module.exports = class CheckCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
        name: 'check',
        description: 'Checks the user\'s information in DDUB',
        options: [{
            type: CommandOptionType.USER,
            name: 'user',
            required: true,
            description: 'A user is needed'
        }],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx) {
    let whitelisted = false

    try {
      const match = ctx.member.user.id !== ctx.options.user;
      let member = match ? await REST.getUser(ctx.options.user) : ctx.member.user

      const user = await axios.get('https://discord.riverside.rocks/check.json.php', {
        params: {
            id: ctx.options.user
        }
      })

      const score = user.data.score.replace('%', '')
      let construct = []

      if (parseInt(score) === parseInt(0) && user.data.total_reports >= 1) {
        whitelisted = true
        construct.push({
          name: 'Safe',
          value: match && member.id !== ctx.member.user.id ? `${member.username} is a whitelisted user.` : 'Your account is whitelisted.'
        })

        construct.push({
          name: 'Note',
          value: 'While the user appears to be whitelisted, it does not mean the user is safe all the time.'
        })
      }

      if (!score || score <= 29 && !whitelisted) {
        construct.push({
          name: 'Safe',
          value: match && member.id !== ctx.member.user.id ? `${member.username} is completely safe.` : 'Your account is completely safe'
        })
      }

      if (score >= 30 && score <= 49) {
        construct.push({
          name: 'Dunno',
          value: match && member.id !== ctx.member.user.id ? `${member.username} might be dangerous` : 'Your account might be dangrous'
        })
      }

      if (score >= 50 && score <= 100) {
        construct.push({
          name: 'Dangerous',
          value: match && member.id !== ctx.member.user.id ? `${member.username} is dangerous! Ban that user fast as possible!` : 'Your account is dangerous!!'
        })
      }
  

      let embed = {
          author: {
            name: `${member.username}#${member.discriminator}`,
            icon_url: member.avatar ? `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}` : 'https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png'
          },
          fields: construct,
          footer: {
            text: user.data.total_reports ? match ?
              // if args
              `This user has been reported ${user.data.total_reports === 1 ? '1 time' : `${user.data.total_reports} times`}`
              // if no args
              : `You have been reported ${user.data.total_reports === 1 ? '1 time' : `${user.data.total_reports} times`}`
              // if never reported
              : match ? 'This user have never been reported' : 'You have never been reported'
          }
      }

      return ({ 
        embeds: [embed],
        components: [{
          type: ComponentType.ACTION_ROW,
          components: [{
            type: ComponentType.BUTTON,
            style: ButtonStyle.LINK,
            label: 'View all Reports',
            url: `https://discord.riverside.rocks/check.php?id=${member.id}`,
          }]
        }]
      })
    } 

    catch (err) {
        console.log(err)
        return 'Sorry, something went wrong'
    }
  }
}