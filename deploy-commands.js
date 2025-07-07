require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to kick').setRequired(true)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to mute').setRequired(true)),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement')
    .addStringOption(option =>
      option.setName('message').setDescription('The announcement message').setRequired(true)),

  new SlashCommandBuilder()
    .setName('server-info')
    .setDescription('Get server details')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔁 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
})();