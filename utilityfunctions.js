function jobArrayToObject(a, b) {
    if(a.length != b.length) {
      throw new Error('Internal: Schema doesn\'t match data in sheet. Check the schema. Schema has '+a.length+' values, and job array has'+b.length+'.');
    } else if(a.length == 0) {
      throw new Error('Internal: The schema is missing. Where the heck is the schema?')
    } else if(b.length == 0) {
      throw new Error('Internal: The job array is missing.')
    }
      
    // Using the foreach method
    return Object.assign(...a.map((k, i)=>({[k]: b[i]}) ))
  }
  
  function articleArrayToObject(a, b){
    if(a.length != b.length) {
      throw new Error('Internal: Schema doesn\'t match data in sheet. Check the schema. Schema has '+a.length+' values, and article row array has'+b.length+'.');
    } else if(a.length == 0) {
      throw new Error('Internal: The schema is missing. Where the heck is the schema?')
    } else if(b.length == 0) {
      throw new Error('Internal: The article row array is missing.')
    }
      
    // Using the foreach method
    return Object.assign(...a.map((k, i)=>({[k]: b[i]}) ))
  }
  
  function userArrayToObject(a, b) {
    if(a.length != b.length) {
      throw new Error('Internal: Schema doesn\'t match data in sheet. Check the schema. Schema has '+a.length+' values, and user row array has'+b.length+'.');
    } else if(a.length == 0) {
      throw new Error('Internal: The schema is missing. Where the heck is the schema?')
    } else if(b.length == 0) {
      throw new Error('Internal: The user row array is missing.')
    }
      
    // Using the foreach method
    return Object.assign(...a.map((k, i)=>({[k]: b[i]}) ))
  }
  
  function toast(message) {
    SpreadsheetApp.getActiveSpreadsheet().toast(message);
  }
  
  /**
   * Returns information about a specific run of contiguous identical items within an array
   *
   * @author Blue Linden
   * @param {array} array The array to count contiguous elements within
   * @param {number} atIndex Index of the item to count around
   * @return {object} Object containing .start, .end and .count properties
   */
  function contiguousRange(array, atIndex) {
    
    var workArray = array.slice(); // slice the array so that we're working with our own copy
  
    var startIndex, endIndex
  
    for (var i = atIndex, len = workArray.length; i < len; i++) { // iterate forward from the starting point to get end index
      if(workArray[i] == workArray[atIndex]) { // if the value of this element and the original element match, this is part of a contiguous run of elements.
        endIndex = i // just keep on setting the end index higher until it no longer matches
      } else {
        i = workArray.length // prematurely break from the loop
      }
    }
  
    for(var i = atIndex, len = workArray.length; i > 0; i--) { // iterate backward from the starting point to get start index
      if(workArray[i] == workArray[atIndex]) { // if the value of this element and the original element match, this is part of a contiguous run of elements.
        startIndex = i // just keep on setting the start index lower until it no longer matches
      } else {
        i = 0 // prematurely break from the loop
      }
    }
  
    var indices = {}
    indices.count = (endIndex + 1) - startIndex // get count of elements in the run
    indices.start = startIndex
    indices.end = endIndex 
    return indices;
  }
  
  function compareScores( a, b ) {
    if ( a.score < b.score ){
      return -1;
    }
    if ( a.score > b.score ){
      return 1;
    }
    return 0;
  }
  