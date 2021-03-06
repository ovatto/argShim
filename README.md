# argShim
JavaScript module for handling properly typed optional function arguments.

## The problem

Parsing the optional arguments on a JavaScript function call can be a complex process when
number of arguments increases. Usually the code ends up looking something like this:

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

The **argShim** provides a simple function wrapper that can be used for encapsulating a function call
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

Basically **argShim** ensures that the wrapped function is always called with full list of
arguments and all missing arguments will be passed as **undefined**.

Required arguments can be specified by using **required** attribute on the argument specification
objects:

```javascript
...
var argSpecs = [
  {optional:'String'},
  {required:'Number'},
  {optional:'Function'}
];
var fn = argShim(argSpecs, functionWithOptionalArgs);
fn('str');                   // throws an error, required number is missing
fn(42);                      // function called with undefined, 42, undefined
fn(function(){});            // throws an error, required number is missing
fn(42, function(){});        // function called with undefined, 42, function
fn('str', 42, function(){}); // function called with 'str', 42, function
```

Default values for optional arguments can be specified with the **default** attribute:

```javascript
...
var argSpecs = [
  {optional:'String', default:'foo'},
  {required:'Number'},
  {optional:'Function'}
];
var fn = argShim(argSpecs, functionWithOptionalArgs);
fn('str');                   // throws an error, required number is missing
fn(42);                      // function called with 'foo', 42, undefined
fn(function(){});            // throws an error, required number is missing
fn(42, function(){});        // function called with 'foo', 42, function
fn('str', 42, function(){}); // function called with 'str', 42, function
```

## Module API

The **argShim** module exports a single function that has the following signature:

```javascript
argShim(argSpecs, wrappedFunction)
```

### Parameters

**argSpecs**:
An array of objects that define the arguments for the resulting function. Each object must
have either 1) **required** or 2) **optional** property and the property value must be 1) a
string that defines the name of the class for the object or 2) an array of strings that
defines all types for the object that can be accepted as the parameter at the given slot.
If argument is optional it can specify an additional property called **default** that will
be passed instead of the **undefined** when optional argument is missing from the call. The
value must have the same type that was specified in the **optional** string or string array.

**wrappedFunction**:
Function that will be called with the parsed arguments.

### Description

The return value of the **argShim** call is a new function that will accept all calls
that specify the required and optional parameters. Issued a valid call the function will
call the wrapped function with a value for each parameter. Missing parameters will
have value **undefined**.

The resulting function will throw an **Error** if the function is called with
arguments that do not match with the specified argument array.

If **argShim** is called with invalid parameters (e.g. with a non-array as the first parameter
or without the wrapped function) the function will throw an **Error**.

