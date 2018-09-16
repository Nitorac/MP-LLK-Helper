'use strict';
var utils = require('./utils.js');

function checkName(request){
  return utils.eleves().hasOwnProperty(request);
}

function getClonedStore(jsonObj){
  return JSON.parse(JSON.stringify(jsonObj));
}

function getCellFromEpoch(epoch,colle_gpe){
   return getClonedStore(utils.planning())[epoch][colle_gpe];
}

function getnNextColles(colle_gpe, n, offset, res){
  if(res == undefined){
    res = [];
  }
  if(offset == undefined){
    offset = 0;
  }
  
  var mondayEpoch = utils.getMondayEpoch(offset);
  if(mondayEpoch == undefined){
    return res;
  }
  
  if(mondayEpoch == "-1"){
    return getnNextColles(colle_gpe, n, offset+1, res);
  }

  var tempRes = [];
  getSortedWeekColles(mondayEpoch, colle_gpe).filter(function(n){ return n != undefined }).forEach(function(element){
    var absoluteEpoch = mondayEpoch + element.Epoch;
    if(utils.nowEpochGmt() < absoluteEpoch){
      element.absoluteEpoch = absoluteEpoch;
      tempRes.push(element);
    }
  });
  
  res = res.concat(tempRes);
  
  if(res.length < n){
    return getnNextColles(colle_gpe, n, offset+1, res);
  }
  
  return res.slice(0, n);
}

function getSortedWeekColles(epoch, gpe){
  var reperes = getCellFromEpoch(epoch, gpe).split('-');
  var copiedColleursStore = getClonedStore(utils.colleurs());
  var colles = [];
  reperes.forEach(function(el){
    colles.push(copiedColleursStore[el]);
  });
  return colles.sort(function (a,b){
    return (a.Epoch > b.Epoch) ? 1 : -1;
  });
}

/*function getnNextColles(colle_gpe, n){
  var offset = 0;
  var result = [];
  while(result.length < n+2 || Object.keys(planning)){
    console
    var mondayEpoch = utils.getMondayEpoch(offset);
    if(isNaN(mondayEpoch)){
      break;
    }
    
    if(planning[mondayEpoch] == undefined){
      offset++;
      continue;
    }
    var cells = getCellFromEpoch(mondayEpoch, colle_gpe).split("-");
    var copiedColleursStore = getClonedStore(colleurs);
    var colles = [copiedColleursStore[cells[0]], copiedColleursStore[cells[1]]].sort(function (a,b){
      return (a.Epoch > b.Epoch) ? 1 : -1;
    });
        
    for(var i = 0;i<colles.length;i++){
      if(colles[i] === undefined){
        console.log("Colle défaillante : monday=" + mondayEpoch);
        return result;
      }
      var absoluteEpoch = mondayEpoch + parseInt(colles[i].Epoch);
      if(utils.nowEpochGmt() < absoluteEpoch && result.length < n && !(colles[i] === undefined)){
        colles[i].absoluteEpoch = absoluteEpoch;
        result.push(colles[i]);
      }
    }
    offset++;
  }
          
  return result.filter(function(n){ return n != undefined });
}*/

module.exports = {
  checkName: checkName,
  getCellFromEpoch: getCellFromEpoch,
  getnNextColles: getnNextColles
}