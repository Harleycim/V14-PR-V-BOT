const fs = require('fs');
const path = require('path');


client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/\s+/);
  const cmdName = args.shift().toLowerCase();

  
  const komut = komutlar.get(cmdName);
  if (komut) {
    try {
      await komut.execute(message, args, client);
    } catch (err) {
      console.error('Komut hata:', err);
      message.react('❌').catch(()=>{});
    }
    return;
  }

  
  const dataDir = path.join(__dirname, 'data');
  const ozelPath = path.join(dataDir, 'ozelkomutlar.json');
  let ozel = {};
  try {
    ozel = JSON.parse(fs.readFileSync(ozelPath, 'utf8'));
  } catch (e) {
    console.error('Özel komut dosyası okunamadı:', e);
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(ozel, cmdName)) return;

  const roleId = ozel[cmdName];
  const role = message.guild.roles.cache.get(roleId);
  if (!role) {
    console.error(`Rol bulunamadı: ${roleId}`);
    message.react('❌').catch(()=>{});
    return;
  }

  
  let member = message.mentions.members.first();
  if (!member && args[0]) {
    member = await message.guild.members.fetch(args[0]).catch(()=>null);
  }
  if (!member) member = message.member;

  
  member.roles.add(role)
    .then(() => message.react('✅').catch(()=>{}))
    .catch(err => {
      console.error('Rol verilemedi:', err);
      message.react('❌').catch(()=>{});
    });
});
