/**
 * @function onOpen
 * @description Adds a menu to the spreadsheet when it is opened. Only runs once every time the spreadsheet is opened.
 */
function onOpen() { // eslint-disable-line no-unused-vars
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Ingest')
      .addItem('Push Row', 'doIngest')
      .addItem('Push Row Safely', 'doSafeIngest')
      .addItem('Push Row and Clean', 'doCleanIngest')
      .addItem('Reset Row', 'doRemove')
      .addSeparator()
      .addItem('About...', 'aboutIngestor')
      .addToUi();
  ui.createMenu('Assign')
      .addItem('All to This Article', 'assignAllThis' )
      .addSeparator()
      .addSubMenu(ui.createMenu('To this article')
          .addItem('Transfer', 'assignTransfer')
          .addItem('Article Art', 'assignArt')
          .addItem('Verification', 'assignVerify')
          .addItem('Publication', 'assignPublish'))
      .addItem('Clear all current', 'clearAll')
      .addSubMenu(ui.createMenu('Reload')
          .addItem('Article schema cache', 'destroyArticleSchemaCache')
          .addItem('User schema cache', 'destroyUserSchemaCache')
          .addSeparator()
          .addItem('Web Team cache', 'grabUsers')
          .addItem('Statistics', 'grabStatistics'))
      .addSeparator()
      .addItem('About...', 'aboutAutassign')
      .addToUi();
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

  if (values[row][0] === data) return row + 1;
  else throw new Error('Internal: Could not find ' + data + ' in column ' + column + '.');
}

