const fetch = require('node-fetch');
const config = require('config').util.toObject()

async function getUser(discordId) {
    const response = await fetch(`https://discord.com/api/v6/users/${discordId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${config.bot.token}`
        }
    });
    return response.json();
}

module.exports = { getUser }