'use strict';
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var utils = require('./utils.js');
var exosColleExec = require('./exosColleExecutor.js');

const request = require('request');
const path = require('path');

var fs = require('fs');

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

app.post('/saveNewColleurs19241070', (req, res) => {
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

  bot.handleFacebookData(data);
  
  res.sendStatus(200);
});

app.use(express.static('public'));

app.listen(app.get('port'), function(){
  console.log('Started on port', app.get('port'))
});

module.exports = {
  bot: bot
}