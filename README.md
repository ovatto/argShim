# argShim
Simple function shim that handles the optional argument processing.

## The problem

Parsing the optional arguments on a JavaScript function call can be a complex process when
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

ArgShim provides a simple function wrapper that can be used for encapsulating a function call
in a way that provides a consistent way for parsing and passing optional and required
arguments. For example:

```javascript
var argShim = require('argShim');


function functionWithOptionalArgs(optString, optNumber, optFunction) {
	...
}

var wrappedFunction = argShim([{optional:'String'}, {optional:'Number'}, {optional:'Function'}], functionWithOptionalArgs);
wrappedFunction('string val');               // function called with 'string val', undefined, undefined
wrappedFunction(42);                         // function called with undefined, 42, undefined
wrappedFunction(function(){});               // function called with undefined, undefined, function
wrappedFunction(42, function(){});           // function called with undefined, 42, function
wrappedFunction('string', 42, function(){}); // function called with 'string', 42, function


```
