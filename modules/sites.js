'use strict';
var utils = require('../utils.js');

module.exports = (bot) => {
  bot.hear(/sites? (.*)/i, (payload, chat, data) => {
    if (data.captured) { return; }
    var text = data.match[1];
    if(text === undefined){
      chat.say(`Les arguments ne sont pas valides.`);
      return;
    }
    
    switch (text.trim().toLowerCase()){
      case 'info':
        chat.say(`Le site du prof d'informatique est http://infolakanal.pagesperso-orange.fr/`);
        break;
      case 'si':
        chat.say(`Le site du prof de SI est http://s2i.cpge.achard.free.fr/`);
        break;
      case 'physique':
        chat.say(`Le site du prof de physique (M. Bouillon) est http://lakanal-mpsi59.webnode.fr/`);
        break;
      default:
        chat.say(`Le site demandé n'existe pas :/`);
    }
  });
  
  bot.hear(/sites?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    chat.say(`Les différents sites possibles sont :\n\nsite si\nsite info\nsite physique`);
  });
};