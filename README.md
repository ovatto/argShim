# argShim
Simple function shim that handles the optional argument processing.

## The problem

Parsing the optional arguments on a JavaScript function calls can be a complex process when
number of arguments increases. Usually the code ends up looking.

```javascript
function functionWithOptionalArgs(optString, optNumber, optFunction) {
	if(typeof optNumber === 'function') {
		optFunction = optNumber;
		optNumber = undefined;
	}
	if(typeof optString === 'function') {
		optFunction = optString;
		optString = undefined;
	}
	if(typeof optString === 'number') {
		optNumber = optString;
		optString = undefined;
	}
	...
}
```

## Solution

The *argShim* provides a simple function wrapper that can be used for encapsulating a function call
in a way that provides a consistent way for parsing and passing optional and required
arguments. For example:

```javascript
var argShim = require('argShim');

function functionWithOptionalArgs(optString, optNumber, optFunction) {
	...
}

var argSpecs = [
  {optional:'String'},
  {optional:'Number'},
  {optional:'Function'}
];
var fn = argShim(argSpecs, functionWithOptionalArgs);
fn('str');                   // function called with 'str', undefined, undefined
fn(42);                      // function called with undefined, 42, undefined
fn(function(){});            // function called with undefined, undefined, function
fn(42, function(){});        // function called with undefined, 42, function
fn('str', 42, function(){}); // function called with 'str', 42, function
```

Basically *argShim* ensures that the wrapped function is always called with full list of
arguments and all missing arguments will be passed as *undefined*.
