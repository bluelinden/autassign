/* eslint-disable max-len */
// Autassign by Blue Linden
// © 2023 Blue Linden
// The sole licensee with commercial rights is The Verdict; All other entities using this system must use it in a non commercial manner, as per CC BY-NC-SA.

const autassignVersion = '2023.3.5';

/**
 * Gets the current selected row on the web
 * @return {number} row
 */
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

/**
 * Gets the article from a specified row
 * @param {number} rowNum
 * @return {object} article
 */
function getArticleObject(rowNum) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object

  const article = {}; // define the article object
  let schema; // define the schema variable
  if (CacheService.getScriptCache().get('articleSchema')) { // if the article schema is cached
    schema = CacheService.getScriptCache().get('articleSchema').split(','); // get the article schema from the cache
  } else {
    schemaStr = sheet.getRangeByName('articleSchema').getValue(); // get the article schema from the sheet
    schema = schemaStr.split(','); // split the schema into an array
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
 * @return {object} jobs
 */
function fetchUserObjects() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object
  let schema; // define the schema variable
  if (CacheService.getScriptCache().get('userSchema')) { // if the user schema is cached
    schema = CacheService.getScriptCache().get('userSchema').split(','); // get the user schema from the cache
  } else {
    const schemaStr = sheet.getRangeByName('userSchema').getValue(); // get the user schema from the sheet
    schema = schemaStr.split(','); // split the schema into an array
    CacheService.getScriptCache().put('userSchema', schema.toString(), 21600); // cache the schema for 6 hours
  }

  const rawUserDataArray = sheet.getRange('\'Web Team\'!A2:Q1000').getValues(); // get the user data from the sheet
  const userData = rawUserDataArray.filter((e) => e.length); // filter out the empty rows
  const users = []; // define the users array
  userData.forEach((element) => { // for each user in the user data,
    const user = userArrayToObject(schema, element); // convert the array into an object
    if (user.name) { // if the user has a name,
      users.push(user); // push the user into the users array
    }
  });

  return users; // return the users array
}


/**

 */
function assignAllThis() {
  // assign all positions to the current row
  const row = getCurrentWebRow();
  assignPositionToRow(row, 'transfer');
  assignPositionToRow(row, 'art');
  assignPositionToRow(row, 'verify');
  assignPositionToRow(row, 'publish');
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
  /**
   * @param {object} item1
   * @param {object} item2
   * @return {number}
   * @description compare the scores of two objects
   */
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

  /**
   *
   * @param {object} user
   * @return {string}
   */
  function getUserStr(user) {
    if (user.score == -32767) {
      return `${user.name} (ineligible)`;
    } else 
      return `${user.name} (with ${user.score} points and ${user.jobCount} jobs)`;
    }
  }
  // pop up a dialog box with the top users, allowing you to pick one
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
      `Assigning ${position} to ${article.name}`,

      `The top users are:
      1. ${getUserStr(scores[0])}
      2. ${getUserStr(scores[1])}
      3. ${getUserStr(scores[2])}
      4. ${getUserStr(scores[3])}
      5. ${getUserStr(scores[4])}
      6. ${getUserStr(scores[5])}
      7. ${getUserStr(scores[6])}
      8. ${getUserStr(scores[7])}

      Who should be assigned? Type a number 1-8 or 0 to cancel.
      (Autassign is open-source and maintained by blue linden.)`,
      ui.ButtonSet.OK_CANCEL,
  );
  // Process the user's response.
  const button = result.getSelectedButton();
  const text = result.getResponseText();
  console.info('button:', button, 'text:', text);
  switch (button) {
    case ui.Button.OK:
    // User clicked "OK".
      if (text) {
        const userArrayPosition = parseInt(text, 10) - 1;
        if (userArrayPosition >= -1 && userArrayPosition < 7) {
          const userPicked = scores[userArrayPosition];
          assignUserToArticle(userPicked, article, position);
        } else {
          toast('Assignment ignored.');
        }
      } else {
        toast('Assignment ignored.');
      }
      break;
    case ui.Button.CANCEL:
      // User clicked "Cancel".
      toast('Assignment ignored.');
      break;
    case ui.Button.CLOSE:
      // User clicked X in the title bar.
      throw new Error('Assignment abandoned, ending autassign session.');
      break;
    default:
      toast('Assignment cancelled.');
  }

  console.info('article:', JSON.stringify(article));
}

/**
 * @param {object} user
 * @param {object} article
 * @param {string} position
 * @description assign a user to an article
 * @return {void}
 * @throws {Error}
 */
function assignUserToArticle(user, article, position) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the current spreadsheet and dump it into an object
  const row = article.row; // get the row number
  // put the user's name in the appropriate column
  switch (position) {
    case 'transfer':
      sheet.getRange('\'Website\'!Q' + row).setValue(user.name);
      break;
    case 'art':
      sheet.getRange('\'Website\'!S' + row).setValue(user.name);
      break;
    case 'verify':
      sheet.getRange('\'Website\'!U' + row).setValue(user.name);
      break;
    case 'publish':
      sheet.getRange('\'Website\'!W' + row).setValue(user.name);
      break;
    default:
      throw new Error('Autassign: Applying: Invalid position.');
  }
}


/**
 *
 * @param {*} job
 * @param {*} article
 * @param {*} userArray
 * @param {*} jobArray
 * @return {array}
 */
function calculateScores(job, article, userArray, jobArray) {
  /**
   *
   * @param {*} jobArray
   * @return {object}
   */
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

    user.jobScore = 1 - ((user.jobCount * 6) / jobs.jobCount) - (user.dogPile/100); // calculate the job score
    user.diffScore = (user.skill / 100) - (article.diff.number / 15); // calculate the difficulty score
    user.score = 100 * (user.jobScore + (0.08 * user.diffScore)); // calculate the total score

    if ((article.diff.code.includes('L') && !user.doesWebLayout) || // if the article has complex layout and the user doesn't do layout
        (article.diff.code.includes('I') && !user.doesArticleArt) || // if the article requires images and the user doesn't do art
        (article.diff.code.includes('T') && !user.doesWebTech)) { // if the article requires technical knowledge and the user doesn't do tech
      user.score = user.score - 30; // subtract 30 points from the user's score
    }


    if ((job == 'transfer' && !user.canTransfer) || // if the user can't do article transfers
        (job == 'art' && !user.doesArticleArt) || // if the user can't do article art
        (job == 'verify' && !user.canVerify) || // if the user can't do article verification
        (job == 'publish' && !user.canPublish)) { // if the user can't do article publication
      user.score = -32767 // set the user's score to negative thirty thousand
    }

    // round the user score to one decimal place
    user.score = Math.round(user.score * 10) / 10;

    console.info('user', user.name, 'jobscore', user.jobScore, 'jobcount', user.jobCount, 'jobstotal', jobs.jobCount, 'diff', user.diffScore, 'score', user.score); // log the user's score and other details
  });
  return users; // return the users array
}


/**
 * Clear all assignments for a given row-run.
 * @param {number} runRow
 */
function clearAll(runRow) { // eslint-disable-line no-unused-vars
  const sheet = SpreadsheetApp.getActiveSpreadsheet(); // get the active spreadsheet
  const website = sheet.getSheetByName('Website'); // get the website sheet
  const assignColumnStart = 'Q'; const assignColumnEnd = 'X'; // set the start and end columns for the assignment columns
  const rawIssueColumn = website.getRange(issueColumn + '1:' + issueColumn + website.getLastRow()).getValues();
  const issueColumnData = [];
  rawIssueColumn.forEach((element) => {
    issueColumnData.push(element[0]);
  });
  const run = contiguousRange(issueColumnData, runRow - 1);
  const assignRange = assignColumnStart + (run.start + 1) + assignColumnEnd + (run.end + 1); // set the assignment range to clear
  website.getRange(assignRange).clearContent(); // clear the assignment range
}

/**
 * Note: This function is a wrapper for assignPositionToRow. It is used to assign transfer to the current row.
 */
function assignTransfer() { // eslint-disable-line no-unused-vars
  assignPositionToRow(getCurrentWebRow(), 'transfer'); // assign the transfer position to the current row
}

/**
 * Note: This function is a wrapper for assignPositionToRow. It is used to assign art to the current row.
 */
function assignArt() { // eslint-disable-line no-unused-vars
  assignPositionToRow(getCurrentWebRow(), 'art'); // assign the art position to the current row
}

/**
 * Note: This function is a wrapper for assignPositionToRow. It is used to assign verification to the current row.
 */
function assignVerify() { // eslint-disable-line no-unused-vars
  assignPositionToRow(getCurrentWebRow(), 'verify'); // assign the verification position to the current row
}

/**
 * Note: This function is a wrapper for assignPositionToRow. It is used to assign publication to the current row.
 */
function assignPublish() { // eslint-disable-line no-unused-vars
  assignPositionToRow(getCurrentWebRow(), 'publish'); // assign the publication position to the current row
}

/**
 * @param {number} row
 * Gets the jobs for the current run.
 * @return {array}
 */
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


/**
 * Destroy article schema cache
 */
function destroyArticleSchemaCache() { // eslint-disable-line no-unused-vars
  CacheService.getScriptCache().remove('articleSchema');
  toast('Article schema purged. On next run it will be pulled again.');
}

/**
 * Destroy user schema cache
 */
function destroyUserSchemaCache() { // eslint-disable-line no-unused-vars
  CacheService.getScriptCache().remove('userSchema');
  toast('User schema purged. On next run it will be pulled again.');
}

/**
 * About Autassign
 * @return {void}
 */
function aboutAutassign() { // eslint-disable-line no-unused-vars
  const ui = SpreadsheetApp.getUi();
  ui.alert('About Autoassign', 'Autoassign is a script that automatically assigns web article tasks to users based on their skill level and current workload. The tool is maintained by Blue Linden. Tool version is ' + autassignVersion, ui.ButtonSet.OK);
}
