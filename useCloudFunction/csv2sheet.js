const {google} = require("googleapis");
const {Storage} = require("@google-cloud/storage")

exports.csv2sheet = async (data, context) => {
  var fileName = data.name;
  // basic check that this is a *.csv file, etc...
  if (!fileName.endsWith(".csv")) {
    console.log("Not a .csv file, ignoring.");
    return;
  }
  // define name of new sheet
  const sheetName = fileName.slice(0, -4);
  console.log("the Sheet Name is: " + sheetName +".   ");
  // block on auth + getting the sheets API object
  const auth = await google.auth.getClient({
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/devstorage.read_only"
   ]
  });
  console.log("the auth is: " + auth +".   ");
  const sheetsAPI = google.sheets({version: 'v4', auth});
  console.log("the sheetsAPI is: " + sheetsAPI +".     ");
  const sheetId = await addEmptySheet(sheetsAPI, sheetName);
  console.log("the sheetId is: " + sheetId + ".     ");
  const theData = await readCSVContent(sheetsAPI, data, sheetName);
  console.log("the Data Content is: " + theData + ".     ");
  await populateAndStyle(sheetsAPI, theData, sheetId);
};


function addEmptySheet(sheetsAPI, sheetName) {
  return new Promise((resolve, reject) => {
    const emptySheetParams = {
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
                index: 1,
                gridProperties: {
                  rowCount: 2000,
                  columnCount: 26,
                  frozenRowCount: 1
                }
              }
            }
          }
        ]
      }
    };
    sheetsAPI.spreadsheets.batchUpdate( emptySheetParams, function(err, response) {
        if (err) {
          reject("The Sheets API returned an error: " + err);
        } else {
          const sheetId = response.data.replies[0].addSheet.properties.sheetId;
          console.log("Created empty sheet: " + sheetId);
          resolve(sheetId);
        }
      }
    );
  });
}

function readCSVContent(sheetsAPI, file, sheetName) {
  return new Promise((resolve, reject) => {
    const storage = new Storage();
    let fileContents = new Buffer('');
    storage.bucket(file.bucket).file(file.name).createReadStream()
    .on('error', function(err) {
      reject('The Storage API returned an error: ' + err);
    })
    .on('data', function(chunk) {
      fileContents = Buffer.concat([fileContents, chunk]);
    })
    .on('end', function() {
      let content = fileContents.toString('utf8');
      console.log("CSV content read as string : " + content );
      resolve(content);
    });
  });
}

function populateAndStyle(sheetsAPI, theData, sheetId) {
  return new Promise((resolve, reject) => {
    // Using 'batchUpdate' allows for multiple 'requests' to be sent in a single batch.
    // Populate the sheet referenced by its ID with the data received (a CSV string)
    // Style: set first row font size to 11 and to Bold. Exercise left for the reader: resize columns
    const dataAndStyle = {
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            pasteData: {
              coordinate: {
                sheetId: sheetId,
                rowIndex: 0,
                columnIndex: 0
              },
              data: theData,
              delimiter: ","
            }
          },
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: "userEnteredFormat(textFormat)"
            }
          }
        ]
      }
    };

    sheetsAPI.spreadsheets.batchUpdate(dataAndStyle, function(err, response) {
      if (err) {
        reject("The Sheets API returned an error: " + err);
      } else {
        console.log(sheetId + " sheet populated with " + theData.length + " rows and column style set.");
        resolve();
      }
    });
  });
}
