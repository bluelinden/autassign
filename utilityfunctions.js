/* eslint-disable no-unused-vars */
/**
 *
 * @param {array} a
 * @param {array} b
 * @return {object}
 */
function jobArrayToObject(a, b) {
  if (a.length != b.length) {
    throw new Error('Internal: Schema doesn\'t match data in sheet. Check the schema. Schema has '+a.length+' values, and job array has'+b.length+'.');
  } else if (a.length == 0) {
    throw new Error('Internal: The schema is missing. Where the heck is the schema?');
  } else if (b.length == 0) {
    throw new Error('Internal: The job array is missing.');
  }

  // Using the foreach method
  return Object.assign(...a.map((k, i)=>({[k]: b[i]}) ));
}

/**
 * @param {array} a
 * @param {array} b
 * @return {object}
 * @throws {Error}
 */
function articleArrayToObject(a, b) {
  if (a.length != b.length) {
    throw new Error('Internal: Schema doesn\'t match data in sheet. Check the schema. Schema has '+a.length+' values, and article row array has'+b.length+'.');
  } else if (a.length == 0) {
    throw new Error('Internal: The schema is missing. Where the heck is the schema?');
  } else if (b.length == 0) {
    throw new Error('Internal: The article row array is missing.');
  }

  // Using the foreach method
  return Object.assign(...a.map((k, i)=>({[k]: b[i]}) ));
}

/**
 * @param {array} a
 * @param {array} b
 * @return {object}
 * @throws {Error}
 */
function userArrayToObject(a, b) {
  if (a.length != b.length) {
    throw new Error('Internal: Schema doesn\'t match data in sheet. Check the schema. Schema has '+a.length+' values, and user row array has'+b.length+'.');
  } else if (a.length == 0) {
    throw new Error('Internal: The schema is missing. Where the heck is the schema?');
  } else if (b.length == 0) {
    throw new Error('Internal: The user row array is missing.');
  }

  // Using the foreach method
  return Object.assign(...a.map((k, i)=>({[k]: b[i]}) ));
}

/**
 * @param {string} message
 */
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
  const workArray = array.slice(); // slice the array so that we're working with our own copy

  let startIndex; let endIndex;

  for (let i = atIndex, len = workArray.length; i < len; i++) { // iterate forward from the starting point to get end index
    if (workArray[i] == workArray[atIndex]) { // if the value of this element and the original element match, this is part of a contiguous run of elements.
      endIndex = i; // just keep on setting the end index higher until it no longer matches
    } else {
      i = workArray.length; // prematurely break from the loop
    }
  }

  for (let i = atIndex, len = workArray.length; i > 0; i--) { // iterate backward from the starting point to get start index
    if (workArray[i] == workArray[atIndex]) { // if the value of this element and the original element match, this is part of a contiguous run of elements.
      startIndex = i; // just keep on setting the start index lower until it no longer matches
    } else {
      i = 0; // prematurely break from the loop
    }
  }

  const indices = {};
  indices.count = (endIndex + 1) - startIndex; // get count of elements in the run
  indices.start = startIndex;
  indices.end = endIndex;
  return indices;
}

/**
 * @function findInColumn
 * @description Finds the row number of a given value in a given column.
 * @param {object} sheet - The sheet to search.
 * @param {string} column - The column to search.
 * @param {string} data - The data to search for.
 * @return {number} - The row number of the data.
 * @throws {Error}
 */
function findInColumn(sheet, column, data) {
  const columnData = sheet.getRange(column + ':' + column); // like A:A
  const values = columnData.getValues();
  let row = 0;

  while (values[row] && values[row][0] !== data) {
    row++;
  }
  console.info('Found ' + data + ' in column ' + column + ' at row ' + (row + 1) + '.');
  if (values[row][0] === data) return row + 1;
  else throw new Error('Internal: Could not find ' + data + ' in column ' + column + '.');
}
