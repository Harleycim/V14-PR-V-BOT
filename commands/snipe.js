const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "snipe",
  description: "Silinen son mesajı havalı bir şekilde gösterir.",
  async execute(message) {
    const snipes = message.client.snipeData?.get(message.channel.id);
    if (!snipes || snipes.length === 0) {
      return message.reply("😕 Bu kanalda silinen bir mesaj bulunamadı.")
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const data = snipes[0];
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: data.yazar.tag, iconURL: data.yazar.displayAvatarURL({ dynamic: true }) })
      .setDescription(`🗑️ **Silinen Mesaj:**\n> ${data.içerik}`)
      .addFields(
        { name: "👤 Yazan Kişi", value: `${data.yazar}`, inline: true },
        { name: "🕒 Silinme Zamanı", value: `<t:${Math.floor(new Date(data.zaman).getTime() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `Bu mesaj 10 saniye sonra yok olacak...` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("refresh_snipe")
        .setLabel("Yenile")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔄")
        .setDisabled(true)
    );

    const sent = await message.reply({ embeds: [embed], components: [row] });

    setTimeout(() => {
      sent.delete().catch(() => {});
    }, 10000);
  }
};