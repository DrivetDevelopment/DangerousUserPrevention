const { SlashCommand, ComponentType, ButtonStyle } = require('slash-create');

module.exports = class ReportCommand extends SlashCommand {
    constructor(creator) {
      super(creator, {
        name: 'status',
        description: 'Do you feel like DUP is having issues? I can send my statuspage url!',
      });
    }

    async run(ctx) {
      await ctx.defer(true)
      return ({
        content: 'Heya! Check my statuspage by clicking the button below!',
        components: [{
          type: ComponentType.ACTION_ROW,
          components: [{
            type: ComponentType.BUTTON,
            style: ButtonStyle.LINK,
            label: 'Check Drivet\'s statuspage',
            url: `https://status.drivet.xyz`,
          }]
        }]
      })
    }
}