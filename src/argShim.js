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
    if(argSpec.default) {
      throw new Error('Required argument at index '+index+' specifies a default value.');
    }
    return "("+argSpec.required+":([0-9]+))";
  }
  if(argSpec.optional) {
    if(typeof argSpec.optional !== 'string') {
      throw new Error('Invalid optional type at index '+index+'.');
    }
    if(argSpec.default && classOf(argSpec.default) !== argSpec.optional) {
      throw new Error('Argument at index expects type "'+argSpec.optional+'" but default value is a "'+classOf(argSpec.default)+'".');
    }
    return "("+argSpec.optional+":([0-9]+))?";
  }
  throw new Error('Invalid argument spec at index '+index+': missing either required or optional type.');
}

function getCallSignature(callArguments) {
  var callSignature = "";
  for(var i=0; i<callArguments.length; i++) {
    callSignature += classOf(callArguments[i])+":"+i;
  }
  return callSignature;
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
  var signatureRegex = new RegExp(signaturePattern);
  return function() {
    var callSignature = getCallSignature(arguments);
    var match = signatureRegex.exec(callSignature);
    if(match) {
      var actualArgs = [];
      for(var index=2; index<match.length; index+=2) {
        if(match[index]) {
          actualArgs.push(arguments[parseInt(match[index])]);
        }
        else {
          var argIndex = (index/2) - 1;
          actualArgs.push(argSpecs[argIndex].default);
        }
      }
      return actualFunction.apply(this, actualArgs);
    }
    throw new Error('Invalid call. Does not match '+JSON.stringify(argSpecs)+'.');
  };
}

module.exports = argShim;
