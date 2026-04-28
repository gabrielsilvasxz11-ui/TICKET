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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// pega tudo do Railway
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CARGOS = process.env.CARGOS?.split(',') || [];

// comando com seleção de cargos
const commands = [
  new SlashCommandBuilder()
    .setName('suporte')
    .setDescription('Abrir painel de atendimento')
    .addRoleOption(option =>
      option.setName('cargo1').setDescription('Cargo de atendimento').setRequired(false))
    .addRoleOption(option =>
      option.setName('cargo2').setDescription('Cargo de atendimento').setRequired(false))
    .addRoleOption(option =>
      option.setName('cargo3').setDescription('Cargo de atendimento').setRequired(false))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();

client.once('ready', () => {
  console.log('Bot online!');
});

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'suporte') {

      // pega cargos escolhidos
      const cargosSelecionados = [
        interaction.options.getRole('cargo1'),
        interaction.options.getRole('cargo2'),
        interaction.options.getRole('cargo3')
      ].filter(Boolean);

      const embed = new EmbedBuilder()
        .setTitle('🎫 Atendimento via Tickets')
        .setDescription('Abra um ticket selecionando uma opção abaixo.')
        .setColor('#2b2d31');

      const menu = new StringSelectMenuBuilder()
        .setCustomId('tickets')
        .setPlaceholder('Selecione uma opção')
        .addOptions([
          { label: 'Suporte', value: 'suporte', emoji: '🛠️' },
          { label: 'Evento', value: 'evento', emoji: '🎉' },
          { label: 'Mediador', value: 'mediador', emoji: '🧑‍⚖️' },
          { label: 'Reembolso', value: 'reembolso', emoji: '💸' },
          { label: 'Divulgação', value: 'divulgacao', emoji: '📢' }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

      // salva cargos temporariamente
      client.cargosAtendimento = cargosSelecionados.map(c => c.id);
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'tickets') {

      const guild = interaction.guild;

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

      (client.cargosAtendimento || []).forEach(cargo => {
        permissoes.push({
          id: cargo,
          allow: [PermissionsBitField.Flags.ViewChannel]
        });
      });

      const canal = await guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: permissoes
      });

      await canal.send(`🎫 | ${interaction.user}, aguarde atendimento.`);

      await interaction.reply({
        content: `Ticket criado: ${canal}`,
        ephemeral: true
      });
    }
  }

});

client.login(TOKEN);
