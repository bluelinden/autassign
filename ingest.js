

function doIngest() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var editorial = sheet.getSheetByName('Editorial');
    var website = sheet.getSheetByName('Website');
    SpreadsheetApp.setActiveSheet(editorial, true);
    var edActiveRange = editorial.getActiveRange();
    var edRow = edActiveRange.getRowIndex();
    var edValues = {}
    var pubNumber = editorial.getRange(edRow, 9).getValue();
    edValues.name = sheet.getRange("A" + edRow).getValue();
    edValues.source = sheet.getRange("B" + edRow).getValue();
    edValues.author = sheet.getRange("C" + edRow).getValue();
    edValues.webStatus = sheet.getRange("G" + edRow).getValue();
    SpreadsheetApp.setActiveSheet(website, true);
    var active = sheet.getActiveSheet();
    var edRow = findInColumn(website, "AB", pubNumber);
    active.getRange("J" + edRow).setValue(edValues.name);
    active.getRange("L" + edRow).setValue(edValues.author);
    active.getRange("M" + edRow).setValue(edValues.webStatus);
    active.getRange("AA" + edRow).setValue(edValues.source);
    SpreadsheetApp.setActiveSheet(editorial, true);
  }
  
  function doSafeIngest() {
    SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
       .alert('I haven\'t implemented this yet. This will move values from this sheet and dump them into the Website sheet. It will do so without changing any data that is already present.');
  }
  
  function doCleanIngest() {
    SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
       .alert('I haven\'t implemented this yet. This will move values from this sheet and dump them into the Website sheet. It will do so and clear the ENTIRE destination row so that it is a "clean" start.');
  }
  
  function doRemove() {
    SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
       .alert('This will clear the destination row.');
  }
  
  function aboutIngestor() {
    SpreadsheetApp.getUi()
      .alert('In-Jester version 0.3.2 by Blue Linden, Web Manager at The Verdict.')
  }
  
  