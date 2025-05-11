const { Client, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const messageDeleteEvent = require('./events/messageDelete');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});


const komutlar = new Map();
const komutDosyaları = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of komutDosyaları) {
  try {
    const komut = require(path.join(__dirname, 'commands', file));
    if (komut.name) {
      komutlar.set(komut.name, komut);
      if (komut.aliases) komut.aliases.forEach(alias => komutlar.set(alias, komut));
    } else console.error(`Komut dosyasında eksik alan: ${file}`);
  } catch (err) {
    console.error(`Komut yüklenirken hata oluştu: ${file}`, err);
  }
}

client.once('ready', () => console.log(`Bot aktif: ${client.user.tag}`));
client.on('messageDelete', messageDeleteEvent.execute);

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

 
  if (message.channel.id === config.kanalId) {
    config.mesajSayaç = config.mesajSayaç || {};
    config.mesajSayaç[message.channel.id] = (config.mesajSayaç[message.channel.id] || 0) + 1;
    if (config.mesajSayaç[message.channel.id] >= config.iltifatAraligi) {
      config.mesajSayaç[message.channel.id] = 0;
      const random = Math.floor(Math.random() * config.iltifatlar.length);
      const iltifat = config.iltifatlar[random];
      const taggedUser = message.mentions.users.first() || message.author;
      const sent = await message.channel.send(`**${taggedUser}** ${iltifat}`);
      setTimeout(() => sent.delete().catch(() => {}), 25000);
    }
  }

  
  if (!message.content.startsWith(config.prefiix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  
  const komut = komutlar.get(cmdName);
  if (komut) {
    try {
     
    } catch (err) {
      console.error('Komut çalıştırılırken hata oluştu:', err);
      const hata = await message.reply('❌ Komut işlenirken hata oluştu!');
      setTimeout(() => { message.delete().catch(() => {}); hata.delete().catch(() => {}); }, 5000);
    }
    return;
  }

  
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const ozelPath = path.join(dataDir, 'ozelkomutlar.json');
  if (!fs.existsSync(ozelPath)) fs.writeFileSync(ozelPath, '{}');
  let ozel = {};
  try { ozel = JSON.parse(fs.readFileSync(ozelPath, 'utf8')); } catch (e) { console.error('Özel komut dosyası okunamadı:', e); }

  if (!ozel.hasOwnProperty(cmdName)) return;
  const roleId = ozel[cmdName];
  const role = message.guild.roles.cache.get(roleId);
  if (!role) {
    const errMsg = await message.reply('❌ Tanımlı rol bulunamadı.');
    setTimeout(() => { message.delete().catch(() => {}); errMsg.delete().catch(() => {}); }, 5000);
    return;
  }

  
  let member = message.mentions.members.first();
  if (!member && args[0]) {
    member = await message.guild.members.fetch(args[0]).catch(() => null);
  }
  if (!member) member = message.member;

  
  try {
    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      const reply = await message.reply(`🗑️ ${member} kullanıcısından <@&${role.id}> rolü alındı.`);
      setTimeout(() => { message.delete().catch(() => {}); reply.delete().catch(() => {}); }, 5000);
    } else {
      await member.roles.add(role);
      const reply = await message.reply(`✅ ${member} kullanıcısına <@&${role.id}> rolü verildi.`);
      setTimeout(() => { message.delete().catch(() => {}); reply.delete().catch(() => {}); }, 5000);
    }
  } catch (err) {
    console.error('Rol işlemi başarısız:', err);
    const fail = await message.reply('❌ Rol işlemi gerçekleştirilemedi.');
    setTimeout(() => { message.delete().catch(() => {}); fail.delete().catch(() => {}); }, 7000);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  const komutlarPath = path.join(__dirname, 'data', 'ozelkomutlar.json');
  if (!fs.existsSync(komutlarPath)) fs.writeFileSync(komutlarPath, '{}');
  let komutlarJson = JSON.parse(fs.readFileSync(komutlarPath, 'utf8'));

  if (interaction.isButton()) {
    if (interaction.customId.startsWith('duzenle_')) {
      const name = interaction.customId.replace('duzenle_', '');
      const old = komutlarJson[name];
      const modal = new ModalBuilder().setCustomId(`modal_duzenle_${name}`).setTitle(`Komut Düzenle: ${name}`);
      const input = new TextInputBuilder().setCustomId('yeni').setLabel('Yeni Rol ID').setStyle(TextInputStyle.Paragraph).setRequired(true).setValue(old);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }
    if (interaction.customId.startsWith('sil_')) {
      const name = interaction.customId.replace('sil_', '');
      delete komutlarJson[name];
      fs.writeFileSync(komutlarPath, JSON.stringify(komutlarJson, null, 2));
      return interaction.reply({ content: `🗑️ \`${name}\` komutu silindi.`, ephemeral: true });
    }
  }
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_duzenle_')) {
    const name = interaction.customId.replace('modal_duzenle_', '');
    const value = interaction.fields.getTextInputValue('yeni');
    komutlarJson[name] = value;
    fs.writeFileSync(path.join(__dirname, 'data', 'ozelkomutlar.json'), JSON.stringify(komutlarJson, null, 2));
    return interaction.reply({ content: `✅ \`${name}\` güncellendi.`, ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`${client.user.tag} başarıyla giriş yaptı!`);

  client.user.setPresence({
    activities: [
      {
        name: 'Harleywashere?',
        type: 0  
      }
    ],
    status: 'dnd'
  });
});

client.login(config.token);
