require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to kick').setRequired(true)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to mute').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes')),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement')
    .addStringOption(opt => opt.setName('message').setDescription('The announcement message').setRequired(true)),

  new SlashCommandBuilder()
    .setName('server-info')
    .setDescription('Get server info'),

  new SlashCommandBuilder()
    .setName('send')
    .setDescription('📩 إرسال رسالة أو صورة في قناة معينة مع منشن')
    .addChannelOption(opt => opt.setName('channel').setDescription('🧭 القناة').setRequired(true))
    .addStringOption(opt => opt.setName('message').setDescription('💬 الرسالة'))
    .addAttachmentOption(opt => opt.setName('image').setDescription('🖼️ صورة'))
    .addUserOption(opt => opt.setName('user').setDescription('👤 منشن شخص'))
    .addRoleOption(opt => opt.setName('role').setDescription('🛡️ منشن رول'))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 Registering commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commands registered!');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
})();
