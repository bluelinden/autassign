
/**
 * @function doIngest
 * @description Moves values from the Editorial sheet to the Website sheet.
 */
function doIngest() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const editorial = sheet.getSheetByName('Editorial');
  const website = sheet.getSheetByName('Website');
  SpreadsheetApp.setActiveSheet(editorial, true);
  const edActiveRange = editorial.getActiveRange();
  const edRow = edActiveRange.getRowIndex();
  const edValues = {};
  const pubNumber = editorial.getRange(edRow, 9).getValue();
  edValues.name = sheet.getRange('A' + edRow).getValue();
  edValues.source = sheet.getRange('B' + edRow).getValue();
  edValues.author = sheet.getRange('C' + edRow).getValue();
  edValues.webStatus = sheet.getRange('G' + edRow).getValue();
  SpreadsheetApp.setActiveSheet(website, true);
  const active = sheet.getActiveSheet();
  const webRow = findInColumn(website, 'AB', pubNumber);
  active.getRange('J' + webRow).setValue(edValues.name);
  active.getRange('L' + webRow).setValue(edValues.author);
  active.getRange('M' + webRow).setValue(edValues.webStatus);
  active.getRange('AA' + webRow).setValue(edValues.source);
  SpreadsheetApp.setActiveSheet(editorial, true);
}

/**
 * @function doSafeIngest
 * @description Moves values from the Editorial sheet to the Website sheet, but only if the destination value is empty. Otherwise, it leaves the destination value alone.
 */
function doSafeIngest() {
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .alert('I haven\'t implemented this yet. This will move values from this sheet and dump them into the Website sheet. It will do so without changing any data that is already present.');
}

/**
 * @function doCleanIngest
 * @description Clears the destination row, then moves values from the Editorial sheet to the Website sheet.
 * @todo Implement this.
 * @todo Add a confirmation dialog.
 */
function doCleanIngest() { // eslint-disable-line no-unused-vars
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .alert('I haven\'t implemented this yet. This will move values from this sheet and dump them into the Website sheet. It will do so and clear the ENTIRE destination row so that it is a "clean" start.');
}

/**
 * @function doRemove
 * @description Clears the destination row.
 * @todo Implement this.
 * @todo Add a confirmation dialog.
 */
function doRemove() { // eslint-disable-line no-unused-vars
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .alert('This will clear the destination row.');
  // clear the row that would otherwise be the destination row.
}

/**
 * @function aboutIngestor
 * @description Displays an alert with information about the Ingestor.
 * @todo Add a link to the GitHub repo.
 * @todo Add a link to the documentation.
 */
function aboutIngestor() { // eslint-disable-line no-unused-vars
  SpreadsheetApp.getUi()
      .alert('In-Jester version 0.3.2 by Blue Linden, Web Manager at The Verdict.');
}


