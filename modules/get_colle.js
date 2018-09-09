'use strict';
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var db = low(new FileSync('.data/savedUsers.json'));

var colleurs = require('../.data/colleurs.json');
var eleves = require('../.data/eleves.json');
var planning = require('../.data/planning.json');
var executor = require('../planningExecutor.js');
var utils = require('../utils.js');
var accents = require('remove-accents');

const collesLimit = 20;

module.exports = (bot) => {
  
  bot.hear(/unset.*/i, (payload, chat) => {
    db.unset(payload.sender.id).write();
    chat.say(`Votre nom a bien été supprimé de la base de données !`);
  });
  
  bot.hear(/k?[ch][oô]ll?es? ([A-Za-z][A-Za-z]*)\s?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    const otherName = (data.match[1] != undefined) ? data.match[1] : "invalid";
    processHear(payload, chat, 2, otherName, false, otherName);
  });
  
  bot.hear(/k?[ch][oô]ll?es? ([0-9]+) ([A-Za-z][A-Za-z]*)\s?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    var num = parseInt(data.match[1]);
    if(isNaN(num)){
      chat.say("Vous n'avez pas entré un nombre valide en premier argument !");
      return;
    }
    
    if(num > collesLimit){
      chat.say("Le nombre de colles est trop grand !");
      return;
    }
    
    const otherName = (data.match[2] != undefined) ? data.match[2] : "invalid";
    processHear(payload, chat, num, otherName, false, otherName);
  });
  
  bot.hear(/k?[ch][oô]ll?es? ([0-9]+)/i, (payload, chat, data) => {
    if (data.captured) { return; }
    var num = parseInt(data.match[1]);
    console.log(data);
    if(isNaN(num)){
      chat.say("Vous n'avez pas entré un nombre valide en premier argument !");
      return;
    }
    if(num != undefined && num > collesLimit){
      chat.say("Le nombre de colles est trop grand !");
      return;
    }
    processHear(payload, chat, num, (db.has(payload.sender.id).value()) ? db.get(payload.sender.id).value() : undefined, true, undefined);
  });
  
  bot.hear(/k?[ch][oô]ll?es?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    processHear(payload, chat, 2, (db.has(payload.sender.id).value()) ? db.get(payload.sender.id).value() : undefined, true, undefined);
  });
  
  function processHear(payload, chat, n, name, hasToDefine, otherNameToDisplay){
    if(name == undefined){
      chat.conversation((convo) => {
        convo.say(`Je ne trouve pas votre nom dans la base de données...`);
        askName(convo, n);
      });
      return;
    }
    
    var actName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    if(!executor.checkName(actName) && hasToDefine){
      chat.conversation((convo) => {
        convo.say(`Je ne trouve pas votre identité dans la base de données...`);
        askName(convo, n);
      });
    }else if(!executor.checkName(actName)){
        chat.say('Le nom ' + actName + ' est introuvable dans la base de données\n(Si vous avez un nom composé, entrez juste le dernier mot de votre nom)');
    }else{
      showColle(chat, payload, n, actName, otherNameToDisplay); 
    }
  }
  
  function showColle(chatconv, payload, n, name, otherName){
    chatconv.say(`Veuillez patienter ...`);
    try {
      var result = executor.getnNextColles(eleves[name].Colle_groupe, n);
    }catch(error){
      chatconv.say(`Une erreur est survenue : ${error}\n\nVeuillez signaler cette erreur à Tony Ranini.`);
      return;
    }
    if(result.length == 0){
      chatconv.say(`Je ne vois pas d'autre colle dans la base de données.\n\nSi c'est une situation anormale, veuillez contacter Tony Ranini`);
      return;
    }
    var message = (otherName === undefined) ? utils.plural(n, `Votre prochaine colle est :\n`, `Vos ${n} prochaines colles sont :\n`) : utils.plural(n, `La prochaine colle de ${eleves[name].Prenom} est :\n`, `Les ${n} prochaines colles de ${eleves[name].Prenom} sont :\n`);
    for(var i = 0;i < result.length;i++){
      var c = result[i];
      var start = new Date(0);
      start.setUTCSeconds(c.absoluteEpoch);
      var end = new Date(0);
      end.setUTCSeconds(c.absoluteEpoch + c.DureeEpoch);
      var sub = '\n\n↬  ' + utils.getPrefix(c.Sexe) + c.Nom + " le " + utils.getFormattedDay(start.getUTCDay()) + " " + utils.formatDate(start) + 
          " de " + formattedHour(start.getUTCHours(), start.getUTCMinutes()) + 
          " à " + formattedHour(end.getUTCHours(), end.getUTCMinutes()) + " (" + c.Matiere + ")";
      message+=sub;
    }
    chatconv.say(message, {typing: true});
  }
  
  const askName = (convo, n, otherName, redirect) => {
    convo.ask(`Entrez votre nom de famille\n(En cas de nom composé, entrez le dernier mot du nom)`, (payload, convo, data) => {
      var actName = utils.capitalize(accents.remove(payload.message.text.trim()));
      console.log("Tentative d'association : " + actName);
      if(executor.checkName(actName)){
        convo.say(`Votre nom est donc ${actName}.`);
        convo.getUserProfile().then((user) => {
          db.set(payload.sender.id, actName).write();
          var json = db.get(payload.sender.id).value();
          var firstName = eleves[actName].Prenom;
          convo.say(`Salut ${firstName}, je vous ai trouvé dans la base de données !\nJe me souviendrai de votre nom.`);
          convo.end();
          setTimeout(function(){
            showColle(convo, payload, n, actName, otherName);
          }, 1000);
        });
      }else{
        convo.say(`Je ne connais pas ce nom, réessayez en vérifiant qu'il n'y a pas d'erreurs ...`).then(() => askName(convo, n, otherName));
      }
    });
  };
  
  function formattedHour(hour, minute){
    var forMin = (minute == 0) ? "" : utils.addZero(minute);
    return utils.addZero(hour) + "h" + forMin;
  }
};