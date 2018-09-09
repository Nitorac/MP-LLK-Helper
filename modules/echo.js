'use strict';
module.exports = (bot) => {
  
  bot.hear(/^mercis?|^mersis/i, (payload, chat, data) => {
      if (data.captured) { return; }
      chat.say(`Mais de rien ;)`);
  });
  
  bot.hear(/Fin|Retour/i, (payload, chat, data) => {
    if (data.captured) { return; }
    chat.say(`Vous avez déjà quitté l'aide/le visionnage ou une mise à jour a été appliquée et vous en a automatiquement sorti`);
  });
  
  bot.on('message', (payload, chat, data) => {
    if (data.captured) { return; }
    const text = payload.message.text;
    chat.say(`Commande inconnue :(\nPour voir l'aide, tapez 'aide' ou 'help'\n\n(Il est possible qu'une mise à jour ait remis à zéro votre discussion avec moi :/ )`);
  });
};