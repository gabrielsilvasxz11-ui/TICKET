const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// REGISTRAR COMANDO /suporte
const commands = [
  new SlashCommandBuilder()
    .setName('suporte')
    .setDescription('Abrir painel de atendimento')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('Comando registrado!');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`Logado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  // COMANDO
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'suporte') {

      const embed = new EmbedBuilder()
        .setTitle('🎫 Atendimento via Tickets')
        .setDescription(
          'Para obter atendimento abra um ticket selecionando uma opção no menu abaixo.\n\nFique à vontade para escolher uma opção de acordo com a necessidade.'
        )
        .setColor('#2b2d31')
        .setImage('COLE_LINK_DA_LOGO_AQUI');

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

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // MENU
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'tickets') {

      const escolha = interaction.values[0];
      const guild = interaction.guild;

      const canalNome = `ticket-${escolha}-${interaction.user.username}`;

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

      config.cargoAtendimento.forEach(cargo => {
        permissoes.push({
          id: cargo,
          allow: [PermissionsBitField.Flags.ViewChannel]
        });
      });

      const canal = await guild.channels.create({
        name: canalNome,
        type: ChannelType.GuildText,
        permissionOverwrites: permissoes
      });

      await canal.send({
        content: `🎫 | ${interaction.user} seu ticket foi criado!\nUm atendente irá te ajudar em breve.`
      });

      await interaction.reply({
        content: `✅ Ticket criado: ${canal}`,
        ephemeral: true
      });
    }
  }

});

client.login(config.token);
