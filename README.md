# argShim
Simple function shim that handles the optional argument processing.

## The problem

Parsing the optional arguments on a JavaScript function call can be a complex process when
number of arguments increases. Usually the code ends up looking.

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

## Solution
