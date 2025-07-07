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
    .setDescription('Get server details'),

  new SlashCommandBuilder()
    .setName('send')
    .setDescription('📩 إرسال رسالة أو صورة في قناة معينة مع منشن')
    .addChannelOption(option =>
      option.setName('channel').setDescription('🧭 القناة التي تريد الإرسال إليها').setRequired(true))
    .addStringOption(option =>
      option.setName('message').setDescription('💬 محتوى الرسالة'))
    .addAttachmentOption(option =>
      option.setName('image').setDescription('🖼️ صورة اختيارية'))
    .addUserOption(option =>
      option.setName('user').setDescription('👤 منشن لشخص (اختياري)'))
    .addRoleOption(option =>
      option.setName('role').setDescription('🛡️ منشن لرول (اختياري)'))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();
