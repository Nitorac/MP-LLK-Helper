'use strict';

const topics = {
 "replaceQuest": "Appuyez sur la commande qui vous intéresse",
 "prologue": "Tapez sur la commande qui vous intéresse :\n\n ↬ colle\n ↬ exos\n ↬ site\n ↬ gif\n ↬ source\n ↬ fin",
 "layer": {
  "Colle": {
   "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfe b307c812e%2FChalk-icon.png?1520888648669",
   "text2display": "Lors de la première utilisation, le bot va associer votre compte \nfacebook à votre nom de famille.\n Utilisation :\n\n ⇝ 'colle': \nAffiche vos 2 prochaines colle\n\n ⇝ 'colle <n>': n un nombre, \nAffiche vos n prochaines colle\n\n ⇝ 'colle <nom>': Affiche les 2 \nprochaines colles du nom demandé\n\n ⇝ 'colle <n> <nom>': \nAffiche les n prochaines colles du nom demandé",
   "layer": {
    "Exemples": {
     "text2display": "⇝ colle\n⇝ khôlles\n⇝ colles 4\n⇝ colles Ranini\n⇝ khôlles 5 Ranini"
    }
   }
  },
  "Exos": {
   "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Ffitness.png?1521996763418",
   "text2display": "Cette commande gère les exercices de colle. Elle se découpe en 3 sous-commandes qui ne possèdent chacune aucun argument : \n\n ↬ exos envoyer\n ↬ exos voir\n ↬ exos supprimer",
   "replaceQuest": "Appuyez sur la sous-commande qui vous intéresse",
   "layer": {
    "Envoyer": {
     "text2display": "Cette commande sert à envoyer un exo de colle. Vous avez juste à suivre les instructions demandées (envoie de la photo, puis d'un titre, puis d'infos éventuelles). Pour l'instant, une seule photo par personne est autorisée, mais si il est effectivement plus pratique d'avoir les réponses en photo, le système changera.",
     "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2FPaper_Plane-128.png?1521997862664"
    },
    "Voir": {
     "text2display": "Cette commande sert à obtenir la liste des colles existantes. Une interface est crée pour vous orienter au mieux.\nLorsque la liste des exos de colle apparaît, vous pouvez choisir de cliquez sur le numéro de votre choix ou bien d'envoyer manuellement une liste de numéros séparés par des espaces que le robot comprendra comme une liste d'exos de colle à afficher.\n\nATTENTION : Essayez de ne pas surcharger le robot par des demandes rapides et répétées, cela pourrait retarder l'interface des autres utilisateurs.",
     "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Feye_2-128.png?1521997754150"
    },
    "Supprimer": {
     "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Fdelete_black_128x128.png?1521997462678",
     "text2display": "Cette commande permet de supprimer un exercice de colle et ainsi de réautoriser l'envoi d'un exo de colle.\nDe même que pour la sous-commande Voir, il ne faut pas abuser de la suppression sous peine de retarder les autres utilisateurs."
    }
   }
  },
  "Site": {
   "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Fdomain.png?1521332000958",
   "text2display": "Affiche le site du prof correspondant  à la demande.\nUtilisation:\n\n ⇝ site si : Affiche le site du prof de SI\n ⇝ site info : Affiche le site du prof d'info\n ⇝ site physique : Affiche le site du prof de physique"
  },
  "Gif": {
   "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Fgif-icon.png?1521327920500",
   "text2display": "Cette commande vous envoie un gif correspondant au sujet demandé. Les sujets posés en anglais seront plus pertinents que ceux posés en français.\nUtilisation :\n\n ⇝ 'gif <sujet>': Envoie un gif correspondant au sujet",
   "layer": {
    "Exemples": {
     "text2display": "⇝ gif cats\n⇝ gifs dog\n⇝ gif nyan cat\n⇝ gifs what the hell is that"
    }
   }
  },
  "Source": {
   "image_url": "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Fweb-code.png?1521495166822",
   "text2display": "Pour une totale transparence, le code source de ce robot est disponible ici :\nhttps://glitch.com/edit/#!/mp-llk-helper\nPour toutes modifications / corrections, envoyez-moi un message."
  }
 }
};

  const layerAsk = (convo, pastLayers, currentLayer, oldDeeperLayer) => {
    var repliesLayer = [];
    var layer = (currentLayer != undefined) ? ((pastLayers.length == 0) ? currentLayer.layer : currentLayer) : {};
    var keysLayer = Object.keys(layer);
    
    for(var i = 0;i < keysLayer.length;i++){
        repliesLayer.push({title: keysLayer[i], image_url: (layer[keysLayer[i]].hasOwnProperty('image_url')) ? layer[keysLayer[i]].image_url : ""});
    }
    
    if(pastLayers.length != 0){
        repliesLayer.push({title: "Retour", image_url: "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Farrow_back_black_144x144.png?1520894578661"});
    }
    repliesLayer.push({title: "Fin", image_url: "https://cdn.glitch.com/5189a7e5-bc3d-4b91-bd26-dfeb307c812e%2Fif_Close_Icon_Dark_1398917.png?1520894772010"});
    
    convo.say(currentLayer != undefined && (currentLayer.hasOwnProperty('prologue')) ? currentLayer.prologue : "").then(() => {
      convo.ask({text: (oldDeeperLayer.hasOwnProperty('replaceQuest')) ? oldDeeperLayer.replaceQuest : `Faîtes un choix`, quickReplies: repliesLayer}, (payload, convo) => {
        const answer = payload.message.text;
        if(!layer.hasOwnProperty(answer) && answer != "Retour" && answer != "Fin"){
          convo.say(`Réponse non valide, réessayez ... \n(Il faut quitter (Fin) l'aide pour tester les commandes)`).then(() => {
            layerAsk(convo, pastLayers, layer, oldDeeperLayer);
          });
          return;
        }

        var deeperLayer = layer[answer];
        if(answer === "Fin"){
            convo.say("Fin de l'aide !");
            convo.end();
            return;
        }
        convo.say((deeperLayer != undefined && deeperLayer.hasOwnProperty('text2display')) ? deeperLayer.text2display : "").then(() => {
          if(answer === "Retour"){
            var backLayer = topics;
            pastLayers.pop();
            
            for(var i = 0;i<pastLayers.length;i++){
              backLayer = backLayer.layer[pastLayers[i]];
            }
            
            if(pastLayers.length == 0){
              layerAsk(convo, pastLayers, backLayer, backLayer);
            }else{
              layerAsk(convo, pastLayers, backLayer.layer, backLayer);
            }
          }else{
            pastLayers.push(answer);
            layerAsk(convo, pastLayers, deeperLayer.layer, deeperLayer);
          }
        });
      });
    });
	};

module.exports = (bot) => {
  
  bot.hear(/^aide|^help/i, (payload, chat, data) => {
    if (data.captured) { return; }
    chat.conversation((convo) => {
      layerAsk(convo, [], topics, topics);
	  });
  }); 
};
