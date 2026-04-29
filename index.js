const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const CARGOS = process.env.CARGOS?.split(',') || [];

client.once('clientReady', () => {
  console.log('Bot online!');
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!painel') {

    const embed = new EmbedBuilder()
      .setTitle('🎫 Atendimento via Tickets')
      .setDescription(
        'Para obter atendimento abra um ticket selecionando uma opção no menu abaixo.\n\nFique à vontade para escolher uma opção de acordo com a necessidade.'
      )
      .setColor('#2b2d31')
      .setImage('COLE_AQUI_LINK_DA_LOGO');

    const menu = new StringSelectMenuBuilder()
      .setCustomId('tickets')
      .setPlaceholder('Selecione uma opção')
      .addOptions([
        {
          label: 'Suporte',
          emoji: { name: 'suporte~1', id: 'ID_EMOJI_SUPORTE' },
          value: 'suporte'
        },
        {
          label: 'Evento',
          emoji: { name: 'evento9', id: 'ID_EMOJI_EVENTO' },
          value: 'evento'
        },
        {
          label: 'Mediador',
          emoji: { name: 'mediador', id: 'ID_EMOJI_MEDIADOR' },
          value: 'mediador'
        },
        {
          label: 'Reembolso',
          emoji: '💸',
          value: 'reembolso'
        },
        {
          label: 'Divulgação',
          emoji: { name: 'easyyyyyfoguete', id: 'ID_EMOJI_DIVULGACAO' },
          value: 'divulgacao'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'tickets') {

    const escolha = interaction.values[0];
    const guild = interaction.guild;

    const nomeCanal = `ticket-${escolha}-${interaction.user.username}`;

    let permissoes = [
      {
        id: guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel],
      }
    ];

    CARGOS.forEach(cargo => {
      permissoes.push({
        id: cargo,
        allow: [PermissionsBitField.Flags.ViewChannel]
      });
    });

    const canal = await guild.channels.create({
      name: nomeCanal,
      type: ChannelType.GuildText,
      permissionOverwrites: permissoes
    });

    await canal.send(`🎫 | ${interaction.user}, seu ticket foi criado! Aguarde atendimento.`);

    await interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });
  }

});

client.login(TOKEN);
