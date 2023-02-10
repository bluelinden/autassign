// Delligator by Blue Linden
// © 2023 Blue Linden
// The sole licensee with commercial rights is The Verdict; All other entities using this
// system must use it in a non commercial manner, as per CC BY-NC-SA.
/* eslint-disable max-len */

function getCurrentWebRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object
  const active = sheet.getActiveSheet();
  if (active.getName() != 'Website') { // if the current sheet ain't the website sheet,
    throw new Error('User: You need to be on the Website sheet.'); // throw an error.
  }
  const website = sheet.getSheetByName('Website'); // get the website sheet and dump it into an object
  const webActiveRange = website.getActiveRange(); // get the active range on the web sheet
  const row = webActiveRange.getRowIndex(); // get the row of the range
  if (row < 3) { // if row is not three or higher
    throw new Error('User: You need to be on a valid article\'s row.'); // throw an error
  }
  return row; // return the row number
}

function getArticleObject(rowNum) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object

  const article = {}; // define the article object
  if (CacheService.getScriptCache().get('articleSchema')) { // if the article schema is cached
    var schema = CacheService.getScriptCache().get('articleSchema').split(','); // get the article schema from the cache
  } else {
    const schemaStr = sheet.getRangeByName('articleSchema').getValue(); // get the article schema from the sheet
    var schema = schemaStr.split(','); // split the schema into an array
    CacheService.getScriptCache().put('articleSchema', schema.toString(), 21600); // cache the schema for 6 hours
  }


  // just define everything
  article.diff = {};
  article.transfer = {};
  article.art = {};
  article.verify = {};
  article.publish = {};

  const rawArticleDataArray = sheet.getRange('J' + rowNum + ':AB' + rowNum).getValues(); // get the article data from the sheet
  const rawArticleData = rawArticleDataArray[0]; // dump the array that is nested within into a variable
  const articleData = articleArrayToObject(schema, rawArticleData); // convert the array into an object

  article.row = rowNum; // article row

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

  return article; // return the article object
}

/**
 * 
 * @returns {object} jobs
 */
function fetchUserObjects() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object

  if (CacheService.getScriptCache().get('userSchema')) { // if the user schema is cached
    const schema = CacheService.getScriptCache().get('userSchema').split(','); // get the user schema from the cache
  } else {
    const schemaStr = sheet.getRangeByName('userSchema').getValue(); // get the user schema from the sheet
    const schema = schemaStr.split(','); // split the schema into an array
    CacheService.getScriptCache().put('userSchema', schema.toString(), 21600); // cache the schema for 6 hours
  }

  const rawUserDataArray = sheet.getRange('\'Web Team\'!A2:P1000').getValues(); // get the user data from the sheet
  const userData = rawUserDataArray.filter((e) => e.length); // filter out the empty rows
  let users = []; // define the users array
  userData.forEach((element) => { // for each user in the user data,
    let user = userArrayToObject(schema, element); // convert the array into an object
    if (user.name) { // if the user has a name,
      users.push(user); // push the user into the users array
    }
  });

  return users; // return the users array
}

function grabStatistics() {

}

function updateUserModel() {

}

function assignAllThis() {

}

function assignAllEvery() {

}

/**
 *
 * @param {number} row
 * @param {string} position
 */
function assignPositionToRow(row, position) {
  const article = getArticleObject(row); // get the article object
  const jobs = getJobsForRun(row); // get the jobs for the run
  const users = fetchUserObjects(); // get the user objects
  const scores = calculateScores(position, article, users, jobs); // calculate the scores for each user
  function compareScores(item1, item2) {
    if (item1.score > item2.score) {
      return -1;
    }
    if (item1.score < item2.score) {
      return 1;
    }
    return 0;
  }
  scores.sort( compareScores ); // sort the scores
  // get the user with the highest object score
  const user = scores[0].name;
  // assign the user to the article


  console.info('article:', JSON.stringify(article));
}

function calculateScores(job, article, userArray, jobArray) {
  const jobs = countJobs(jobArray); // count the jobs present in the Job Array
  const users = userArray.slice(); // copy the user array so that we don't modify the original
  let user = {}; // create a user variable so that the code doesn't get confusing with two 'element' variables
  users.forEach((element, index) => { // for each user in our system,
    user = element; // update the variable for each user
    user.jobCount = 0; // set the amount of jobs each user has to zero
    jobs[job].forEach((element) => { // for each job, check if the user has it
      const jobInQuestion = element; // create a variable for the job so that the code doesn't get confusing
      if (user.name == jobInQuestion.name) { // if the user has the job,
        user.jobCount++; // add one to the job count
      }
    });

    user.jobScore = 1 - ((user.jobCount * 6) / jobs.jobCount); // calculate the job score
    user.diffScore = (user.skill / 100) - (article.diff.number / 15); // calculate the difficulty score
    user.score = 100 * (user.jobScore + (0.08 * user.diffScore)); // calculate the total score

    if ((article.diff.code.includes('L') && !user.doesWebLayout) || // if the article has complex layout and the user doesn't do layout
        (article.diff.code.includes('I') && !user.doesArticleArt) || // if the article requires images and the user doesn't do art
        (article.diff.code.includes('T') && !user.doesWebTech)) { // if the article requires technical knowledge and the user doesn't do tech
      user.score = user.score - 30; // subtract 30 points from the user's score
    }


    if ((job == 'transfer' && !element.canTransfer) || // if the user can't do article transfers
        (job == 'art' && !element.doesArticleArt) || // if the user can't do article art
        (job == 'verify' && !element.canVerify) || // if the user can't do article verification
        (job == 'publish' && !element.canPublish)) { // if the user can't do article publication
      user.score = 0; // set the user's score to zero
    }

    console.info('user', user.name, 'jobscore', user.jobScore, 'jobcount', user.jobCount, 'jobstotal', jobs.jobCount, 'diff', user.diffScore, 'score', user.score); // log the user's score and other details
  });
  return users; // return the users array
}

function countJobs(jobArray) { // count the jobs of each type present in the Job Array
  const jobs = {}; // create a jobs object
  jobs.transfer = []; // create an array for transfer jobs
  jobs.art = []; // create an array for art jobs
  jobs.verify = []; // create an array for verification jobs
  jobs.publish = []; // create an array for publication jobs

  jobs.jobCount = jobArray.length * 4; // calculate the total number of jobs loosely by multiplying the number of articles by 4

  jobArray.forEach((element) => { // for each article in the job array,
    jobs.transfer.push({'name': element.transfer, 'done': element.transferDone}); // add the transfer status to the transfer array
    jobs.art.push({'name': element.art, 'done': element.artDone}); // add the art status to the art array
    jobs.verify.push({'name': element.verify, 'done': element.verifyDone}); // add the verification status to the verification array
    jobs.publish.push({'name': element.publish, 'done': element.publishDone}); // add the publication status to the publication array
  });
  return jobs; // return the jobs object
}

function clearAll(runRow) { // clear all assignments of run
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the active spreadsheet
  const website = sheet.getSheetByName('Website'); // get the website sheet
  const assignColumnStart = 'Q'; const assignColumnEnd = 'X'; // set the start and end columns for the assignment columns
  const assignColumn = assignColumnStart + ':' + assignColumnEnd; // set the assignment column range
  const rawIssueColumn = website.getRange(issueColumn + '1:' + issueColumn + website.getLastRow()).getValues();
  const issueColumnData = [];
  rawIssueColumn.forEach((element) => {
    issueColumnData.push(element[0]);
  });
  const run = contiguousRange(issueColumnData, runRow - 1);
  const assignRange = assignColumnStart + (run.start + 1) + assignColumnEnd + (run.end + 1); // set the assignment range to clear
  website.getRange(assignRange).clearContent(); // clear the assignment range
}

function assignTransfer() { // assign transfer
  assignPositionToRow(getCurrentWebRow(), 'transfer'); // assign the transfer position to the current row
}

function assignArt() { // assign art
  assignPositionToRow(getCurrentWebRow(), 'art'); // assign the art position to the current row
}

function assignVerify() { // assign verification
  assignPositionToRow(getCurrentWebRow(), 'verify'); // assign the verification position to the current row
}

function assignPublish() { // assign publication
  assignPositionToRow(getCurrentWebRow(), 'publish'); // assign the publication position to the current row
}


function getJobsForRun(row) {
  row = 12;
  const issueColumn = 'K';
  const assignColumnStart = 'Q'; const assignColumnEnd = 'X';
  const schema = ['transfer', 'transferDone', 'art', 'artDone', 'verify', 'verifyDone', 'publish', 'publishDone'];
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const website = sheet.getSheetByName('Website');
  const rawIssueColumn = website.getRange(issueColumn + '1:' + issueColumn + website.getLastRow()).getValues();
  const issueColumnData = [];
  rawIssueColumn.forEach((element) => {
    issueColumnData.push(element[0]);
  });
  const issueRange = contiguousRange(issueColumnData, row - 1);
  const range = issueRange;

  range.start = issueRange.start + 1;
  range.end = issueRange.end + 1;

  const names = website.getRange(assignColumnStart + range.start + ':' + assignColumnEnd + range.end).getValues();
  const jobs = [];
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


