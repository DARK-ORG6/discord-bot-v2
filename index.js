require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

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

// ترحيب تلقائي
client.on('guildMemberAdd', member => {
  const channel = member.guild.systemChannel;
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("🎉 Welcome!")
      .setDescription(`أهلاً بك ${member.user}, نورت السيرفر!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
    channel.send({ embeds: [embed] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'kick') {
    const member = interaction.options.getMember('user');
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: "❌ لا تملك صلاحية الطرد.", ephemeral: true });
    }
    if (!member) return interaction.reply({ content: "❗ العضو غير موجود.", ephemeral: true });

    try {
      await member.kick();
      interaction.reply(`🚫 ${member.user.tag} تم طرده.`);
    } catch (err) {
      console.error(err);
      interaction.reply({ content: "❌ فشل في الطرد.", ephemeral: true });
    }
  }

  else if (commandName === 'mute') {
    const member = interaction.options.getMember('user');
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return interaction.reply({ content: "❌ لا تملك صلاحية الكتم.", ephemeral: true });
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
    interaction.reply(`🔇 ${member.user.tag} تم كتمه.`);
  }

  else if (commandName === 'announce') {
    const content = interaction.options.getString('message');
    const embed = new EmbedBuilder()
      .setTitle("📢 إعلان")
      .setDescription(content || "لا يوجد محتوى.")
      .setColor(0xf1c40f)
      .setFooter({ text: `مرسل من ${interaction.user.username}` })
      .setTimestamp();

    interaction.channel.send({ embeds: [embed] });
    interaction.reply({ content: '✅ تم إرسال الإعلان!', ephemeral: true });
  }

  else if (commandName === 'server-info') {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle('📊 معلومات السيرفر')
      .setColor(0x3498db)
      .addFields(
        { name: 'اسم السيرفر', value: guild.name, inline: true },
        { name: 'ID السيرفر', value: guild.id, inline: true },
        { name: 'عدد الأعضاء', value: `${guild.memberCount}`, inline: true },
        { name: 'تاريخ الإنشاء', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'اللغة', value: guild.preferredLocale, inline: true }
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'send') {
    const targetChannel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message') || '';
    const image = interaction.options.getAttachment('image');
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    let mention = '';
    if (user) mention += `<@${user.id}> `;
    if (role) mention += `<@&${role.id}> `;

    const sendContent = `${mention}${message}`;

    const options = {
      content: sendContent
    };

    if (image) {
      options.files = [image.url];
    }

    try {
      await targetChannel.send(options);
      await interaction.reply({ content: '✅ تم الإرسال بنجاح!', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ فشل في الإرسال.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
