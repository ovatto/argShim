'use strict';

function classOf(obj) {
  return Object.prototype.toString.call(obj).match(/\s(\w+)/)[1];
}

function argPattern(argSpec, index) {
  if(argSpec.required && argSpec.optional) {
    throw new Error('Conflicting argument spec at index '+index+
                    ': required '+argSpec.required+
                    ' while specifying optional '+argSpec.optional+'.');
  }
  if(argSpec.required) {
    if(typeof argSpec.required !== 'string') {
      throw new Error('Invalid required type at index '+index+'.');
    }
    return "("+argSpec.required+":([0-9]+))";
  }
  if(argSpec.optional) {
    if(typeof argSpec.optional !== 'string') {
      throw new Error('Invalid required type at index '+index+'.');
    }
    return "("+argSpec.optional+":([0-9]+))?";
  }
  throw new Error('Invalid argument spec at index '+index+': missing either required or optional type.');
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
    signaturePattern += argPattern(argSpec, index);
  });
  signaturePattern += "$";
  return signaturePattern;
}

function argShim(argSpecs, actualFunction) {
  if(!Array.isArray(argSpecs)) {
    throw new Error("argSpecs must be an array.");
  }
  if(typeof actualFunction !== 'function') {
    throw new Error("actualFunction must be a function.");
  }
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
      return actualFunction.apply(this, realArgs);
    }
    throw new Error('Invalid call. Does not match pattern '+signaturePattern+'.');
  };
}

module.exports = argShim;
