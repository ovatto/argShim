'use strict';

var argShim = require('../src/argShim');
var should  = require('should');

describe('argShim', function() {
  describe('Invalid parameter handling', function() {
    it('should throw when argument spec is missing', function(done) {
      should.throws(function() {
        argShim(function(){});
      });
      done();
    });
    it('should throw when wrapped function is missing', function(done) {
      should.throws(function() {
        argShim([{required:'SomeClass'}]);
      });
      done();
    });
    it('should throw when any of the given arguments are conflicting', function(done) {
      should.throws(function() {
        argShim([{optional:'SomeClass', required:'SomeClass'}], function(){});
      });
      done();
    });
    it('should throw when any of the given arguments are invalid (i.e. missing "required" or "optional")', function(done) {
      should.throws(function() {
        argShim([{}], function(){});
      });
      done();
    });
    it('should throw when "optional" property is not a string', function(done) {
      should.throws(function() {
        argShim([{optional:{}}], function(){});
      });
      done();
    });
    it('should throw when "required" property is not a string', function(done) {
      should.throws(function() {
        argShim([{required:{}}], function(){});
      });
      done();
    });
    it('should throw when "required" property has a default value', function(done) {
      should.throws(function() {
        argShim([{required:'String',default:'def value'}], function(){});
      });
      done();
    });
    it('should throw when "optional" property has a default value that does not match with the type', function(done) {
      should.throws(function() {
        argShim([{optional:'Number',default:'def value string'}], function(){});
      });
      done();
    });
  });

  describe('Calls with no args (for sake of API completeness)', function() {
    it('should call the wrapped function with no arguments', function(done) {
      var wrapped = argShim([], function() {
        should(arguments.length).equal(0);
        done();
      });
      wrapped();
    });
    it('should throw when function is called with any arguments', function(done) {
      var wrapped = argShim([], function() {});
      var argSets = [
        [ 'foo' ],
        [ 'bar', 11 ],
        [ function(){}, 'baz' ],
        [ 22 ]
      ];
      argSets.forEach(function(argSet) {
        should.throws(function() {
          wrapped.apply(this, argSet);
        });
      });
      done();
    });
  });

  describe('Calls with optional args ', function() {
    it('should call the wrapped function with the optional arguments', function(done) {
      var expectedArgs = [ undefined, undefined, undefined ];
      var wrapped = argShim([{optional:'String'}, {optional:'Number'}, {optional:'String'}], function() {
        should(arguments.length).equal(3);
        should(arguments[0]).equal(expectedArgs[0]);
        should(arguments[1]).equal(expectedArgs[1]);
        should(arguments[2]).equal(expectedArgs[2]);
      });
      wrapped();

      expectedArgs[0] = 'first string';
      wrapped('first string');

      expectedArgs[1] = 11;
      wrapped('first string', 11);

      expectedArgs[2] = 'second string';
      wrapped('first string', 11, 'second string');

      expectedArgs[0] = undefined;
      wrapped(11, 'second string');

      done();
    });
    it('should throw when function is called with invalid arguments', function(done) {
      var wrapped = argShim([{optional:'String'}, {optional:'Number'}, {optional:'String'}], function() {});
      var argSets = [
        [ 11, 22 ],
        [ 'foo', 'bar', 'baz' ],
        [ 11, 'foo', 'bar' ],
        [ 'foo', 11, 'bar', 'baz' ]
      ];
      argSets.forEach(function(argSet) {
        should.throws(function() {
          wrapped.apply(this, argSet);
        });
      });
      done();
    });
    it('should pass the default parameters', function(done) {
      var expectedArgs = [ 'a def value', 123, undefined ];
      var wrapped = argShim([{optional:'String',default:'a def value'}, {optional:'Number',default:123}, {optional:'String'}], function() {
        should(arguments.length).equal(3);
        should(arguments[0]).equal(expectedArgs[0]);
        should(arguments[1]).equal(expectedArgs[1]);
        should(arguments[2]).equal(expectedArgs[2]);
      });
      wrapped();

      expectedArgs[0] = 'first string';
      wrapped('first string');

      expectedArgs[1] = 11;
      wrapped('first string', 11);

      expectedArgs[2] = 'second string';
      wrapped('first string', 11, 'second string');

      expectedArgs[0] = 'a def value';
      wrapped(11, 'second string');

      done();
    });
    it('should allow multiple optional argument types', function(done) {
      var wrapped = argShim([{optional:['String','Number']}], function(optionalStringOrNumber) {
        (typeof optionalStringOrNumber).should.match(/^string|number$/);
      });
      should.doesNotThrow(function() {
        wrapped('a string value');
        wrapped(42);
      });
      done();
    });
    it('should allow defaults with multiple optional argument types', function(done) {
      var wrapped = argShim([{optional:['String','Number'],default:42}], function(optionalStringOrNumber) {
        optionalStringOrNumber.should.be.equal(42);
      });
      should.doesNotThrow(function() {
        wrapped();
      });
      done();
    });
    it('should verify the default with multiple optional argument types', function(done) {
      should.throws(function() {
        argShim([{optional:['String','Number'],default:function(){}}], function() {});
      });
      done();
    });
  });

  describe('Calls with required args ', function() {
    it('should call the wrapped function with the required arguments', function(done) {
      var expectedArgs = [ 'a string', 42 ];
      var wrapped = argShim([{required:'String'}, {required:'Number'}], function() {
        should(arguments.length).equal(2);
        should(arguments[0]).equal(expectedArgs[0]);
        should(arguments[1]).equal(expectedArgs[1]);
      });
      wrapped('a string', 42);
      done();
    });
    it('should throw when function is called with invalid arguments', function(done) {
      var wrapped = argShim([{required:'String'}, {required:'Number'}], function() {});
      var argSets = [
        [ ],
        [ 'foo' ],
        [ 11 ],
        [ 11, 'foo' ],
        [ 'foo', 11, 22 ],
        [ 'foo', 'bar', 11 ]
      ];
      argSets.forEach(function(argSet) {
        should.throws(function() {
          wrapped.apply(this, argSet);
        });
      });
      done();
    });
  });

  describe('Calls with mixed args', function() {
    it('should call the wrapped function with the mixed arguments', function(done) {
      var expectedArgs = [ undefined, 'a string', undefined, 42 ];
      var wrapped = argShim([{optional:'String'}, {required:'String'}, {optional:'Number'}, {required:'Number'}], function() {
        should(arguments.length).equal(4);
        should(arguments[0]).equal(expectedArgs[0]);
        should(arguments[1]).equal(expectedArgs[1]);
        should(arguments[2]).equal(expectedArgs[2]);
        should(arguments[3]).equal(expectedArgs[3]);
      });

      wrapped('a string', 42);

      expectedArgs[0] = 'first string';
      wrapped('first string', 'a string', 42);

      expectedArgs[2] = 11;
      wrapped('first string', 'a string', 11, 42);

      expectedArgs[0] = undefined;
      wrapped('a string', 11, 42);

      done();
    });
    it('should throw when function is called with invalid arguments', function(done) {
      var wrapped = argShim([{optional:'String'}, {required:'String'}, {optional:'Number'}, {required:'Number'}], function() {});
      var argSets = [
        [ 11, 'foo' ],
        [ 11, 22 ],
        [ 'foo', 'bar' ],
        [ 'foo', 'bar', 11, 'baz' ],
        [ 'foo', 'bar', 11, 22, 'baz' ]
      ];
      argSets.forEach(function(argSet) {
        should.throws(function() {
          wrapped.apply(this, argSet);
        });
      });
      done();
    });
  });

  describe('Function behaviour', function() {
    it('should return the value from wrapped function', function(done) {
      var wrapped = argShim([], function() {
        return 'the value from wrapped function';
      });
      should(wrapped()).equal('the value from wrapped function');
      done();
    });
    it('should allow null values for any type', function(done) {
      var wrapped = argShim([{required:'String'},{optional:'Number'}], function(str, num) {
        should.equal(str, null);
        should.equal(num, null);
      });
      wrapped(null, null);
      done();
    });
  });

});
