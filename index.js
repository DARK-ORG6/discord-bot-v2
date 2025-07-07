require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot is online as: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'kick') {
    const member = interaction.options.getMember('user');
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: "❌ You don't have permission to kick.", ephemeral: true });
    }
    if (!member) return interaction.reply({ content: "❗ Member not found.", ephemeral: true });

    try {
      await member.kick();
      interaction.reply(`🚫 ${member.user.tag} has been kicked.`);
    } catch (err) {
      console.error(err);
      interaction.reply({ content: "❌ Failed to kick member.", ephemeral: true });
    }
  }

  if (commandName === 'mute') {
    const member = interaction.options.getMember('user');
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return interaction.reply({ content: "❌ You don't have permission to mute.", ephemeral: true });
    }

    let muteRole = interaction.guild.roles.cache.find(role => role.name === "Muted");
    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({
        name: "Muted",
        permissions: [],
      });

      interaction.guild.channels.cache.forEach(channel => {
        channel.permissionOverwrites.create(muteRole, {
          SendMessages: false,
          Speak: false
        });
      });
    }

    await member.roles.add(muteRole);
    interaction.reply(`🔇 ${member.user.tag} has been muted.`);
  }

  if (commandName === 'announce') {
    const content = interaction.options.getString('message');
    const embed = new EmbedBuilder()
      .setTitle("📢 Announcement")
      .setDescription(content || "No content provided.")
      .setColor(0xf1c40f)
      .setFooter({ text: "Sent by " + interaction.user.username })
      .setTimestamp();

    interaction.channel.send({ embeds: [embed] });
    interaction.reply({ content: '✅ Announcement sent!', ephemeral: true });
  }

  if (commandName === 'server-info') {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle('📊 Server Information')
      .setColor(0x3498db)
      .addFields(
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Locale', value: guild.preferredLocale, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);