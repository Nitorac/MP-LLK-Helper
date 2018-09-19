'use strict';
var fs = require('fs');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var utils = require('./utils.js');

var exosColleExec = require('./exosColleExecutor.js');

const request = require('request');
const path = require('path');

const BootBot = require('bootbot');

app.set('port', process.env.PORT)
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const bot = new BootBot({
  accessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: 'LAUL',
  appSecret: process.env.APP_SECRET
});

bot.module(require('./modules/echo.js'));
bot.module(require('./modules/giphy.js'));
bot.module(require('./modules/get_colle.js'));
bot.module(require('./modules/exos_colle.js'));
bot.module(require('./.data/hiddenCommands.js'));
bot.module(require('./modules/sites.js'));
bot.module(require('./modules/help.js'));

bot.on('authentication', (payload, chat, data) => {
    chat.say(`Pour voir la liste des commandes, tapez 'aide' ou 'help'`);
});

bot.on('attachment', (payload, chat, data) => {
  if(payload.message.sticker_id != undefined){
    if(payload.message.sticker_id == 369239263222822){
      chat.say(`👍 (oui bon désolé je suis pas équipé pour pouvoir envoyer un sticker Facebook :'(`);
    }
    return;
  }
    chat.say(`Il est possible qu'une mise à jour ait été appliquée avant l'envoi de votre document :/\nVeuillez réexécuter la commande !`);
});

bot.setGetStartedButton((payload, chat, data) => {
    chat.say(`Pour voir la liste des commandes, tapez 'aide' ou 'help'`);
});

app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
      console.log('Token validé !')
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error('Validation échouée. Les tokens ne sont pas identiques !');
      res.sendStatus(403);
    }
});

app.get('/colleursJSON', (req, res) => {
  res.sendFile(__dirname + "/.data/colleurs.json"); 
});

app.get('/elevesJSON', (req, res) => {
  res.sendFile(__dirname + "/.data/eleves.json"); 
});

app.post('/saveColleurs', (req, res) => {
  var data = req.body;
  if(data.pwd != process.env.PWD){
    res.send('Mauvais mot de passe !<br>Fichier non mis à jour !');
    return;
  }
  
  try{  
    fs.writeFile('./.data/colleurs.json', JSON.stringify(JSON.parse(data.json)), 'utf-8', function (err) {
        if (err) {
          res.send('Une erreur est survenue : ' + err);
          throw err;
        }
        res.send('Robot mis à jour !');
        utils.colleurs(true);
    });  
  }catch(err){
    res.send('Une erreur est survenue : ' + err);
  }
});

app.post('/webhook', (req, res) => {
  var data = req.body;
  if (data.object !== 'page') {
    return;
  }
  
  console.log(JSON.stringify(data));
  //bot.handleFacebookData(data);
  
  if(data.entry != undefined && data.entry.length != 0){
    for (var i = 0; i < data.entry.length; i++){
      var entry = data.entry[i];
      if(entry.messaging != undefined && entry.messaging.length != 0){
        for (var j = 0; j < entry.messaging.length; j++){
          if(entry.messaging[j].message != undefined){
            var msg = entry.messaging[j].message;
            var sender = entry.messaging[j].sender.id;
            switch(msg.text){
              case "colle":
              case "khôlle":
              case "khôlles":
              case "kholle":
              case "kholles":
                bot.say(sender, "Veuillez patienter ...");
                bot.say(sender, "Vos 2 prochaines colles sont :\n\n\n↬  M. Peruch le mercredi 19/09/2018 de 14h30 à 15h30 (Anglais)\n\n↬  M. Patte le mercredi 26/09/2018 de 14h30 à 15h30 (Maths)\n\nATTENTION Colles d'exemples !");
                break;
              case "help":
              case "aide":
              case "menu":
              case "commandes":
              case "Aidez-moi":
                bot.say(sender, "Ce robot sert à visualiser les colles.\nLes différentes commandes sont : \n\n↬ colle\n↬ khôlle\n↬ help\n↬ aide\n↬ exos");
                break;
              case "exos":
                bot.say(sender, "Il n'y a aucun exercice enregistré cette semaine !");
                break;
              default:
                bot.say(sender, "Je ne connais pas cette commande, tapez 'aide' ou 'help'");
            }
          }
        }
      }
    }
  }
  
  res.sendStatus(200);
});

app.use(express.static('public'));

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
});

module.exports = {
  bot: bot
}