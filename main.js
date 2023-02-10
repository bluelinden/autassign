function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Ingest')
        .addItem('Push Row', 'doIngest')
        .addItem('Push Row Safely', 'doSafeIngest')
        .addItem('Push Row and Clean', 'doCleanIngest')
        .addItem('Reset Row', 'doRemove')
        .addSeparator()
        .addItem('About...', 'aboutIngestor')
        .addToUi();
    ui.createMenu('Assign')
        .addItem('All to This Article','assignAllThis' )
        .addItem('All to Every Article','assignAllEvery')
        .addSeparator()
        .addSubMenu(ui.createMenu('To this article')
        .addItem('Transfer', 'assignTransfer')
        .addItem('Article Art', 'assignArt')
        .addItem('Verification', 'assignVerify')
        .addItem('Publication', 'assignPublish'))
        .addItem('Clear all current','clearAll')
        .addSubMenu(ui.createMenu('Reload')
        .addItem('Article schema cache', 'destroyArticleSchemaCache')
        .addItem('User schema cache', 'destroyUserSchemaCache')
        .addSeparator()
        .addItem('Web Team cache', 'grabUsers')
        .addItem('Statistics', 'grabStatistics'))
        .addToUi();
    
  }
  
  function findInColumn(sheet, column, data) {
    var column = sheet.getRange(column + ':' + column); // like A:A
    var values = column.getValues();
    var row = 0;
  
    while (values[row] && values[row][0] !== data) {
      row++;
    }
  
    if (values[row][0] === data) return row + 1;
    else return -1;
  }
  