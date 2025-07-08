require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.systemChannel;
  if (channel) {
    channel.send(`👋 أهلاً بك في السيرفر، ${member}!`);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'kick') {
    const member = interaction.options.getMember('user');
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: "🚫 لا تملك صلاحية الطرد", ephemeral: true });
    }
    if (!member) return interaction.reply({ content: "⚠️ العضو غير موجود", ephemeral: true });

    await member.kick();
    interaction.reply(`✅ تم طرد ${member.user.tag}`);
  }

  if (commandName === 'mute') {
    const member = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return interaction.reply({ content: "🚫 لا تملك صلاحية الكتم", ephemeral: true });
    }

    let muteRole = interaction.guild.roles.cache.find(r => r.name === 'Muted');
    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({ name: 'Muted', permissions: [] });
      interaction.guild.channels.cache.forEach(channel => {
        channel.permissionOverwrites.create(muteRole, {
          SendMessages: false,
          Speak: false
        });
      });
    }

    await member.roles.add(muteRole);
    interaction.reply(`🔇 ${member.user.tag} تم كتمه لمدة ${duration || 'غير محددة'} دقيقة`);

    if (duration) {
      setTimeout(async () => {
        await member.roles.remove(muteRole);
      }, duration * 60 * 1000);
    }
  }

  if (commandName === 'announce') {
    const msg = interaction.options.getString('message');
    const embed = new EmbedBuilder()
      .setTitle("📢 إعلان")
      .setDescription(msg)
      .setColor(0xf39c12)
      .setFooter({ text: `من طرف ${interaction.user.username}` })
      .setTimestamp();
    interaction.channel.send({ embeds: [embed] });
    interaction.reply({ content: '✅ تم إرسال الإعلان!', ephemeral: true });
  }

  if (commandName === 'server-info') {
    const embed = new EmbedBuilder()
      .setTitle("📊 معلومات السيرفر")
      .addFields(
        { name: 'اسم السيرفر', value: interaction.guild.name, inline: true },
        { name: 'عدد الأعضاء', value: `${interaction.guild.memberCount}`, inline: true },
        { name: 'أنشئ في', value: `<t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:F>`, inline: true }
      )
      .setThumbnail(interaction.guild.iconURL())
      .setColor(0x3498db)
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'send') {
    const channel = interaction.options.getChannel('channel');
    const msg = interaction.options.getString('message') || '';
    const image = interaction.options.getAttachment('image');
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    let mention = '';
    if (user) mention += `<@${user.id}> `;
    if (role) mention += `<@&${role.id}> `;

    const options = {
      content: `${mention}${msg}`
    };

    if (image) options.files = [image.url];

    try {
      await channel.send(options);
      interaction.reply({ content: '✅ تم الإرسال بنجاح', ephemeral: true });
    } catch (err) {
      console.error(err);
      interaction.reply({ content: '❌ فشل الإرسال', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
