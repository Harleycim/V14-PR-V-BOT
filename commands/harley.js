module.exports = {
    name: 'harleycimm',
    description: 'Komut çalıştığı zaman arka arkaya mesaj atar',
    async execute(message, args) {
      let count = 0;
      const maxMessages = 40; 
  
      while (count < maxMessages) {
        await message.channel.send('Harleywashere?');
        count++;
      }
    }
  };
  