const fs = require('fs');
const path = require('path');
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const config = require('../config');


const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const komutlarDosyasi = path.join(dataDir, 'ozelkomutlar.json');
if (!fs.existsSync(komutlarDosyasi)) fs.writeFileSync(komutlarDosyasi, '{}');
let komutlar = JSON.parse(fs.readFileSync(komutlarDosyasi, 'utf8'));

module.exports = {
    name: 'özelkomut',
    description: 'Rol atayan özel komutları ayarla',
    async execute(message, args) {
        const isSahip = message.author.id === config.botSahibiId;
        const hasRole = message.member.roles.cache.has(config.ozelRolId);

        
        if (!isSahip && !hasRole) {
            const reply = await message.reply('❌ Bu komutu sadece yetkili kişiler kullanabilir.');
            setTimeout(() => { message.delete().catch(() => {}); reply.delete().catch(() => {}); }, 5000);
            return;
        }

        const subCommand = args[0];
        
        komutlar = JSON.parse(fs.readFileSync(komutlarDosyasi, 'utf8'));

        
        if (subCommand === 'ekle') {
            const komutAdi = args[1];
            const rol = message.mentions.roles.first();
            if (!komutAdi || !rol) {
                const yanit = await message.reply('Kullanım: `.özelkomut ekle <komutAdı> @Rol`');
                setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 7000);
                return;
            }

            komutlar[komutAdi] = rol.id;
            fs.writeFileSync(komutlarDosyasi, JSON.stringify(komutlar, null, 2));
            const yanit = await message.reply(`✅ \`${komutAdi}\` komutu artık <@&${rol.id}> rolünü veriyor.`);
            setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 5000);
            return;
        }

        
        if (subCommand === 'sil') {
            const komutAdi = args[1];
            if (!komutAdi || !komutlar[komutAdi]) {
                const yanit = await message.reply('❌ Böyle bir özel komut yok.');
                setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 5000);
                return;
            }

            delete komutlar[komutAdi];
            fs.writeFileSync(komutlarDosyasi, JSON.stringify(komutlar, null, 2));
            const yanit = await message.reply(`🗑️ \`${komutAdi}\` özel komutu silindi.`);
            setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 5000);
            return;
        }

        
        if (subCommand === 'liste') {
            if (Object.keys(komutlar).length === 0) {
                const yanit = await message.reply('📭 Hiç özel komut yok.');
                setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 7000);
                return;
            }

            let liste = '';
            for (const [k, r] of Object.entries(komutlar)) liste += `\`${k}\` → <@&${r}>\n`;
            const yanit = await message.reply(`📜 Özel Komutlar:\n${liste}`);
            setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 15000);
            return;
        }

        // Yardım
        const yanit = await message.reply(
            '**Kullanım:**\n' +
            '`.özelkomut ekle <komut> @Rol`\n' +
            '`.özelkomut sil <komut>`\n' +
            '`.özelkomut liste`'
        );
        setTimeout(() => { message.delete().catch(() => {}); yanit.delete().catch(() => {}); }, 10000);
    }
};
