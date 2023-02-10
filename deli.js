// Delligator by Blue Linden
// © 2023 Blue Linden
// The sole licensee with commercial rights is The Verdict; All other entities using this 
// system must use it in a non commercial manner, as per CC BY-NC-SA.

function getCurrentWebRow() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object
    var active = sheet.getActiveSheet();
    if (active.getName() != 'Website') { // if the current sheet ain't the website sheet,
      throw new Error('User: You need to be on the Website sheet.') // throw an error.
    }
    var website = sheet.getSheetByName('Website'); // get the website sheet and dump it into an object
    var webActiveRange = website.getActiveRange(); // get the active range on the web sheet
    var row = webActiveRange.getRowIndex(); // get the row of the range
    if (row < 3) { // if row is not three or higher
      throw new Error('User: You need to be on a valid article\'s row.') // throw an error
    }
    return row; // return the row number
  }
  
  function getArticleObject(rowNum) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object
  
    var article = {}
    if (CacheService.getScriptCache().get('articleSchema')) {
      var schema = CacheService.getScriptCache().get('articleSchema').split(',');
    } else {
      var schemaStr = sheet.getRangeByName('articleSchema').getValue();
      var schema = schemaStr.split(',');
      CacheService.getScriptCache().put('articleSchema', schema.toString(), 21600);
    }
  
  
    // just define everything
    article.diff = {}
    article.transfer = {}
    article.art = {}
    article.verify = {}
    article.publish = {}
  
    var rawArticleDataArray = sheet.getRange("J" + rowNum + ":AB" + rowNum).getValues();
    var rawArticleData = rawArticleDataArray[0];
    var articleData = articleArrayToObject(schema, rawArticleData);
    article.row = rowNum;
  
    article.name = articleData.name; // article name
    article.authors = articleData.author; // article authors
    article.distribution = articleData.distribution; // article distribution
  
  
    article.diff.number = articleData.diffNumber; // article difficulty number
    article.diff.code = articleData.diffCode; // article difficulty code
  
  
    article.transfer.assignedTo = articleData.transfer; // article transfer assignee
    article.art.assignedTo = articleData.articleArt; // article art assignee
    article.verify.assignedTo = articleData.verification; // article verify assignee
    article.publish.assignedTo = articleData.publication; // article publish assignee
  
  
    article.transfer.isDone = articleData.transferDone; // article transfer status
    article.art.isDone = articleData.articleArtDone; // article art status
    article.verify.isDone = articleData.verificationDone; // article verify status
    article.publish.isDone = articleData.publicationDone; // article publish status
  
    return article;
  }
  
  function fetchUserObjects() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object
    var users = {}
  
    if (CacheService.getScriptCache().get('userSchema')) {
      var schema = CacheService.getScriptCache().get('userSchema').split(',');
    } else {
      var schemaStr = sheet.getRangeByName('userSchema').getValue();
      var schema = schemaStr.split(',');
      CacheService.getScriptCache().put('userSchema', schema.toString(), 21600);
    }
  
    var rawUserDataArray = sheet.getRange("'Web Team'!A2:P1000").getValues();
    var userData = rawUserDataArray.filter(e => e.length);
    var users = []
    userData.forEach((element) => {
      var user = userArrayToObject(schema, element);
      if (user.name) {
        users.push(user);
      }
    })
  
    return users;
  }
  
  function grabUsers() {
  
  }
  
  function grabStatistics() {
  
  }
  
  function updateUserModel() {
  
  }
  
  function assignAllThis() {
  
  }
  
  function assignAllEvery() {
  
  }
  
  function assignPositionToRow(row, position) {
  
    var article = getArticleObject(row);
    var jobs = getJobsForRun(row);
    var users = fetchUserObjects();
    var scores = calculateScores(position, article, users, jobs);
    scores.sort( compareScores );
    console.log("winner:", JSON.stringify(winningStaff))
    SpreadsheetApp.getActiveSpreadsheet().toast('The winner is ' + winningStaff.name + '! With ' + winningStaff.score + ' points!', 'Winner', -1);
    console.info("article:", JSON.stringify(article));
  }
  
  function calculateScores(job, article, userArray, jobArray) {
    var jobs = countJobs(jobArray);
    var users = userArray.slice();
    var user
    users.forEach((element, index) => { // for each user in our system,
      user = element // create a user variable so that the code doesn't get confusing with two 'element' variables
      user.jobCount = -100 // set the amount of jobs each user has to zero
      jobs[job].forEach((element) => { // for each job, grab 
        var jobInQuestion = element
        if (user.name == jobInQuestion.name) {
          user.jobCount++
        }
      })
  
      user.jobScore = 1 - ((user.jobCount * 6) / jobs.jobCount)
      user.diffScore = (user.skill / 100) - (article.diff.number / 15)
      user.score = 100 * (user.jobScore + (0.08 * user.diffScore))
  
      if ((article.diff.code.includes('L') && !user.doesWebLayout)
        || (article.diff.code.includes('I') && !user.doesArticleArt)
        || (article.diff.code.includes('T') && !user.doesWebTech)) {
        user.score = user.score - 30
      }
  
  
      if ((job == "transfer" && !element.canTransfer)
        || (job == "art" && !element.doesArticleArt)
        || (job == "verify" && !element.canVerify)
        || (job == "publish" && !element.canPublish)) {
        user.score = 0
      }
  
      console.info("user", user.name, "jobscore", user.jobScore, "jobcount", user.jobCount, "jobstotal", jobs.jobCount, "diff", user.diffScore, "score", user.score);
    })
    return users;
  }
  
  function countJobs(jobArray) {
    var jobs = {}
    jobs.transfer = []
    jobs.art = []
    jobs.verify = []
    jobs.publish = []
  
    jobs.jobCount = jobArray.length * 4
  
    jobArray.forEach((element) => {
      jobs.transfer.push({ "name": element.transfer, "done": element.transferDone });
      jobs.art.push({ "name": element.art, "done": element.artDone });
      jobs.verify.push({ "name": element.verify, "done": element.verifyDone });
      jobs.publish.push({ "name": element.publish, "done": element.publishDone });
    })
    return jobs;
  }
  
  function clearAll() {
  
  }
  
  function assignTransfer() {
    assignPositionToRow(getCurrentWebRow(), "transfer");
  }
  
  function assignArt() {
    assignPositionToRow(getCurrentWebRow(), "art");
  }
  
  function assignVerify() {
    assignPositionToRow(getCurrentWebRow(), "verify");
  }
  
  function assignPublish() {
    assignPositionToRow(getCurrentWebRow(), "publish");
  }
  
  
  
  function getJobsForRun(row) {
    row = 12
    var issueColumn = "K"
    var assignColumnStart = "Q", assignColumnEnd = "X"
    var schema = ["transfer", "transferDone", "art", "artDone", "verify", "verifyDone", "publish", "publishDone"]
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var website = sheet.getSheetByName("Website");
    var rawIssueColumn = website.getRange(issueColumn + "1:" + issueColumn + website.getLastRow()).getValues();
    var issueColumnData = []
    rawIssueColumn.forEach((element) => {
      issueColumnData.push(element[0]);
    });
    var issueRange = contiguousRange(issueColumnData, row - 1);
    var range = issueRange
  
    range.start = issueRange.start + 1
    range.end = issueRange.end + 1
  
    var names = website.getRange(assignColumnStart + range.start + ":" + assignColumnEnd + range.end).getValues();
    var jobs = []
    names.forEach((element, index) => {
      jobs.push(jobArrayToObject(schema, element));
    });
  
    return jobs;
  }
  
  // MISC FUNCTIONS
  
  function destroyArticleSchemaCache() {
    CacheService.getScriptCache().remove('articleSchema');
    toast('Article schema purged. On next run it will be pulled again.');
  }
  
  function destroyUserSchemaCache() {
    CacheService.getScriptCache().remove('userSchema');
    toast('User schema purged. On next run it will be pulled again.');
  }
  
  
  