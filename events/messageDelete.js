module.exports = {
  name: "messageDelete",
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    if (!message.client.snipeData) message.client.snipeData = new Map();

    const snipes = message.client.snipeData.get(message.channel.id) || [];

    snipes.unshift({
      içerik: message.content || "*[Boş mesaj]*",
      yazar: message.author,
      zaman: new Date()
    });

    if (snipes.length > 10) snipes.pop();

    message.client.snipeData.set(message.channel.id, snipes);
  }
};
