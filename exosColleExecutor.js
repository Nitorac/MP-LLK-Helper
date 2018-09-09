'use strict';
var utils = require('./utils.js');
var querystring = require('querystring');
var http = require('http');
var Database = require('better-sqlite3');
var db = new Database('.data/exos_colles.db');

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

// Returns empty array for true and the array else 
function hasSenderAlreadySentExo(senderId){
  var potential = db.prepare('SELECT * FROM registry WHERE SenderID = ? AND MondayEpoch = ?').all(senderId, utils.getMondayEpoch(0));
  return potential;
}

function deleteExo(chat, potential, senderId){
  for(var i = 0;i<potential.length;i++){
    cloudinary.v2.uploader.destroy(potential[i].Path.split("éù ")[1], function(error, result){console.log(result)});
  }
  db.prepare('DELETE FROM registry WHERE SenderID = ? AND MondayEpoch = ?').run(senderId, utils.getMondayEpoch(0));
  chat.say(`Votre exo de colle a bien été supprimé !`);
}

function executeFileSaving(conv, senderId, url, title, infos){
  cloudinary.v2.uploader.upload(url, function(error, result) { 
    if(error != undefined){
      console.log(error);
      return;
    }
    
    db.prepare('INSERT INTO registry(SenderID, Path, Title, Epoch, MondayEpoch, Infos) VALUES (?, ?, ?, ?, ?, ?)').run(senderId, result.url + "éù " + result.public_id, title, utils.nowEpoch(), utils.getMondayEpoch(0), infos);
    conv.say(`Exo enregistré avec succès ! Merci 😘`);
  });
}

function getExosCurWeek(){
  var rows = db.prepare('SELECT * FROM registry WHERE MondayEpoch = ? ORDER BY Epoch').all(utils.getMondayEpoch(0));
  return rows;
}

module.exports = {
  deleteExo: deleteExo,
  getExosCurWeek: getExosCurWeek,
  hasSenderAlreadySentExo: hasSenderAlreadySentExo,
  executeFileSaving: executeFileSaving
}