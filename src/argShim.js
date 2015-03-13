'use strict';

function typeOf(obj) {
  return Object.prototype.toString.call(obj).match(/\s(\w+)/)[1];
}

function isOfType(type, obj) {
  var objType = typeOf(obj);
  if(typeof type === 'string') {
    return objType === type;
  }
  if(Array.isArray(type)) {
    for(var i=0; i<type.length; i++) {
      if(objType === type[i]) {
        return true;
      }
    }
  }
  return false;
}

function getTypePattern(type, index) {
  if(typeof type === 'string') {
    return type;
  }
  if(Array.isArray(type)) {
    var pattern = "";
    type.forEach(function(singleType, index) {
      if(typeof singleType !== 'string') {
        throw new Error('Invalid type in type array at index '+index+'.');
      }
      if(index > 0) {
        pattern += "|";
      }
      pattern += singleType;
    });
    return pattern;
  }
  throw new Error('Invalid type at index '+index+'.');
}

function argPattern(argSpec, index) {
  if(argSpec.required && argSpec.optional) {
    throw new Error('Conflicting argument spec at index '+index+
                    ': required '+argSpec.required+
                    ' while specifying optional '+argSpec.optional+'.');
  }
  if(argSpec.required) {
    if(argSpec.default) {
      throw new Error('Required argument at index '+index+' specifies a default value.');
    }
    return "(\\[("+getTypePattern(argSpec.required, index)+"|Null):([0-9]+)\\])";
  }
  if(argSpec.optional) {
    if(argSpec.default && !isOfType(argSpec.optional, argSpec.default)) {
      throw new Error('Argument at index expects type "'+argSpec.optional+'" but default value is a "'+typeOf(argSpec.default)+'".');
    }
    return "(\\[("+getTypePattern(argSpec.optional)+"|Null):([0-9]+)\\])?";
  }
  throw new Error('Invalid argument spec at index '+index+': missing either required or optional type.');
}

function getCallSignature(callArguments) {
  var callSignature = "";
  for(var i=0; i<callArguments.length; i++) {
    callSignature += "["+typeOf(callArguments[i])+":"+i+"]";
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
  var signaturePattern = getSignaturePattern(argSpecs);
  var signatureRegex = new RegExp(signaturePattern);
  return function() {
    var callSignature = getCallSignature(arguments);
    var match = signatureRegex.exec(callSignature);
    if(match) {
      var actualArgs = [];
      for(var index=3; index<match.length; index+=3) {
        if(match[index]) {
          actualArgs.push(arguments[parseInt(match[index])]);
        }
        else {
          var argIndex = (index/3) - 1;
          actualArgs.push(argSpecs[argIndex].default);
        }
      }
      return actualFunction.apply(this, actualArgs);
    }
    throw new Error('Invalid call. Does not match '+JSON.stringify(argSpecs)+'.');
  };
}

module.exports = argShim([{required:'Array'},{required:'Function'}], argShim);
