'use strict';
var utils = require('../utils.js');
var querystring = require("querystring");
var http = require('http');
var bot = require('../bot.js').bot;
var moment = require('moment');
var exosExecutor = require('../exosColleExecutor.js');

module.exports = (bot) => {
  
  bot.hear(/exos? ([A-Za-z][A-Za-z]*) (.*)/i, (payload, chat, data) => {
    if (data.captured) { return; }
    processHear(payload, chat, (data.match[1] != undefined) ? data.match[1] : "", (data.match[2] != undefined) ? data.match[2] : "");
  });
  
  bot.hear(/exos? ([A-Za-z][A-Za-z]*)/i, (payload, chat, data) => {
    if (data.captured) { return; }
    processHear(payload, chat, (data.match[1] != undefined) ? data.match[1] : "", "");
  });
  
  bot.hear(/exos?/i, (payload, chat, data) => {
    if (data.captured) { return; }
    showSubHelp(chat);
  });
  
  function showSubHelp(chat){
    chat.say('Il faut exécuter la commande avec un des arguments existants :\n\n ↬ exos envoyer\n ↬ exos voir\n ↬ exos supprimer');
  }
  
  function processHear(payload, chat, command, rawArgs){
    switch (command.toLowerCase()){
      case 'envoyer':
      case 'env':
        if(exosExecutor.hasSenderAlreadySentExo(payload.sender.id).length != 0 && !utils.isAdmin(payload.sender.id)){
          console.log(payload.sender.id);
          chat.say(`Vous avez déjà envoyé un exo de colle pour cette semaine, utilisez 'exos supprimer' pour supprimer l'ancien.`);
          return;
        }
        chat.conversation((convo) => {
          initAsk(convo);
        });
        break;
      case 'supprimer':
        var potential = exosExecutor.hasSenderAlreadySentExo(payload.sender.id);
        if(potential.length == 0){
          chat.say(`Vous n'avez envoyé aucun exo de colle pour cette semaine !`);
          return;
        }
        chat.conversation((convo) => {
          confirmDeleteAsk(convo, potential);
        });
        break;
      case 'voir':
      case 'consulter':
        voirExos(chat, payload);
        break;
      default:
        showSubHelp(chat);
    }
  }
  
  function voirExos(chat, payload){
    var exosWeek = exosExecutor.getExosCurWeek();
    var nbExos = exosWeek.length;
    if(nbExos == 0){
      chat.say(`Désolé, il n'y a aucun exo mis en ligne pour l'instant :(`);
      return;
    }
    
    var repliesLayer = [];
    var date = new Date(0);
    date.setUTCSeconds(exosWeek[0].MondayEpoch);
    var msg = `Il y a ` + nbExos + " " + utils.plural(nbExos, "exo") + ` de colle cette semaine (` + utils.formatDate(date) + `) :\n(Envoyer 'Fin' pour quitter le visionnage)\n(Cliquez sur ou envoyez le/les numéro(s) des colles que vous voulez voir)\n\n`;
    var randomIntsNoFollow = utils.getRandomNoFollow(0, utils.puce_rnd_colors.length - 1, utils.puce_rnd_colors.length);
    for(var i = 0; i<nbExos; i++){
      msg += (i+1) + ` ▶  ` + ((exosWeek[i].Title.length >= 54) ? exosWeek[i].Title.substring(0, 53) + "..." : exosWeek[i].Title) + "\n";
      repliesLayer.push({title: String(i+1), image_url: utils.puce_rnd_colors[randomIntsNoFollow[i]]});
    }
    repliesLayer.push({title: "Fin", image_url: "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Fif_Close_Icon_Dark_1398917.png?1520894772010"});
    chat.conversation((convo) => showMenu(convo, exosWeek, msg, repliesLayer));
  }
  
  const showMenu = (convo, exosWeek, msg, repliesLayer, redirect) => {
    convo.ask({text: msg, quickReplies: repliesLayer}, (payload, convo, data) => {
      var txt = payload.message.text;
      if(txt.trim().toUpperCase() == "FIN"){
        convo.say(`Fin du visionnage !`);
        convo.end();
        return;
      }
      if(!/^[0-9 ]+$/gi.test(txt)){
        convo.say(`Entrez un nombre ou une suite de nombre séparée par des espaces seulement !`).then(() => showMenu(convo, exosWeek, msg, repliesLayer));
        return;
      }
      
      var splitted = txt.split(" ")
                        .filter(function(e) {var el = parseInt(e); return !isNaN(el) && el < exosWeek.length+1 && el != 0})
                        .filter(function(elem, pos,arr) {
                          return arr.indexOf(elem) == pos;
                        });
      if(splitted.length == 0){
        convo.say(`Entrez des numéros valides !`).then(() => showMenu(convo, exosWeek, msg, repliesLayer));
        return;
      }else if(splitted.length > 5){
        convo.say("Pour éviter de surcharger mon petit serveur, vous ne pouvez pas demander plus de 5 exercices à la fois !");
        splitted = splitted.slice(0, 5);
      }
      sendFormattedShowExo(convo, exosWeek, splitted, 0, msg, repliesLayer);
    });
  };
  
  const confirmDeleteAsk = (convo, potential, redirect) => {
      convo.ask(`Voulez-vous vraiment supprimer votre exo de colle de cette semaine ? (Oui / Non)`, (payload, convo, data) => {
        var msg = payload.message.text;
        if(msg == undefined || (msg.trim().toUpperCase() != "OUI" && msg.trim().toUpperCase() != "NON")){
          convo.say('Entrez une réponse valide !').then(() => confirmDeleteAsk(convo, potential));
          return;
        }
        
        if(msg.trim().toUpperCase() == "OUI"){
          exosExecutor.deleteExo(convo, potential, payload.sender.id);
        }else{
          convo.say('Suppression annulée !');
        }
        convo.end();
      });
  };

  const initAsk = (convo, redirect) => {
      convo.ask(`Envoyez la photo de votre exo de colle\n(1 seule photo autorisée)\n(Envoyez 'Annuler' pour annuler)`, (payload, convo, data) => {
        if(payload.message.text != undefined && payload.message.text.trim().toUpperCase() === "ANNULER"){
          convo.say('Envoi annulé :(');
          convo.end();
          return;
        }
        
        if(payload.message.attachments === undefined || payload.message.attachments[0].type != "image"){
          convo.say('Entrez une image valide !').then(() => initAsk(convo));
          return;
        }
        
        convo.set(`url`, payload.message.attachments[0].payload.url);
        titleAsk(convo);
      });
  };
  
  var titleAsk = (convo, redirect) => {
      convo.ask(`Entrez un titre résumé de l'exo\n(80 caractères max)\n(Envoyez 'Annuler' pour annuler)`, (payload, convo, data) => {
        var title = payload.message.text;
        if(title != undefined && (title = title.trim()).toUpperCase() === "ANNULER"){
          convo.say('Envoi annulé :(');
          convo.end();
          return;
        }
        if(!Boolean(title) || title.length > 80){
          convo.say('Entrez un titre valide !').then(() => titleAsk(convo));
          return;
        }
        convo.set(`title`, title);
        infosAsk(convo);
      });
  };
  
  var infosAsk = (convo, redirect) => {
      convo.ask(`Entrez des infos complémentaires\n(indices etc ..., sinon envoyez : 'Rien')\n(Envoyez 'Annuler' pour annuler)`, (payload, convo, data) => {
        var infos = payload.message.text;
        if(infos != undefined && (infos = infos.trim()).toUpperCase() === "ANNULER"){
          convo.say('Envoi annulé :(');
          convo.end();
          return;
        }
        
        if(!Boolean(infos)){
          convo.say('Entrez des informations valides !').then(() => infosAsk(convo));
          return;
        }
        
        infos = (infos.toUpperCase() === "RIEN") ? "" : infos;
        
        convo.say(`Enregistrement de l'exo de colle ...`).then(() => {
          exosExecutor.executeFileSaving(convo, payload.sender.id, convo.get(`url`), convo.get(`title`), infos);
          convo.end();
        });
      });
  };
  
  function sendFormattedShowExo(conv, exosWeek, splitted, i, msg, repliesLayer){
    var currentRow = exosWeek[parseInt(splitted[i]) - 1];
    var url = currentRow.Path.split("éù ")[0];
      return conv.say(`Titre : ` + currentRow.Title + ((currentRow.Infos == "") ? `\n\nAucune info complémentaire :(` : `\n\nInfos complémentaires : ` + currentRow.Infos)).then(() => {
        conv.say({attachment: 'image', url: url}).then(() => {
          bot.getUserProfile(currentRow.SenderID).then((user) => {
            var date = new Date(0);
            date.setSeconds(currentRow.Epoch);
            var formatted = moment(date.toLocaleString('en-US', { timeZone: "Europe/Paris" }), 'M/D/YYYY[,] h:m:s a').format("DD/MM/YYYY [à] HH:mm:ss");
            conv.say(`Envoyé par ${user.first_name} ${user.last_name} le ` + formatted).then(() => {
              if(i >= splitted.length-1){
                showMenu(conv, exosWeek, msg, repliesLayer);
              }else{
                sendFormattedShowExo(conv, exosWeek, splitted, i+1, msg, repliesLayer);
              }
            });
          });
        });
      });
  }
};