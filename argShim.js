'use strict'

function classOf(obj) {
  return Object.prototype.toString.call(obj).match(/\s(\w+)/)[1];
}

function argPattern(argSpec) {
  if(argSpec.required) {
    return "("+argSpec.required+":([0-9]+))";
  }
  else if(argSpec.optional) {
    return "("+argSpec.optional+":([0-9]+))?";
  }
  return "";
}

function getCallSignature(callArguments) {
  var callPattern = "";
  for(var i=0; i<callArguments.length; i++) {
    callPattern += classOf(callArguments[i])+":"+i;
  }
  return callPattern;
}

function getSignaturePattern(argSpecs) {
  var signaturePattern = "^";
  argSpecs.forEach(function(argSpec, index) {
    signaturePattern += argPattern(argSpec);
  });
  signaturePattern += "$";
  return signaturePattern;
}

function argShim(argSpecs, actualFunction) {
  var signaturePattern = getSignaturePattern(argSpecs);
  var regex = new RegExp(signaturePattern);
  return function() {
    var callSignature = getCallSignature(arguments);
    var match = regex.exec(callSignature);
    if(match) {
      var realArgs = [];
      for(var index=2; index<match.length; index+=2) {
        if(match[index]) {
          realArgs.push(arguments[parseInt(match[index])]);
        }
        else {
          realArgs.push(undefined);
        }
      }
      actualFunction.apply(this, realArgs);
    }
    else {
      // Fail miserably
      console.log("NO MATCH");
    }
  };
}

module.exports = argShim;
