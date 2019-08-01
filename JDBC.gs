function writeOneRecord(content,connection) 
{
  var stmt = connection.prepareStatement('INSERT INTO employees ' + '(emp_no, birth_date, first_name, last_name, gender, hire_date) values (?,?,?,?,?,?)');
  for(var i = 0; i < content[0].length; i++)
  {
    var x = content[0][i].toString();
    stmt.setString(i+1,content[0][i].toString());
  }
  Logger.log(stmt.toString());
  stmt.execute();
}

function QuerySQL(query,connection)
{
  var stmt = connection.createStatement();
  stmt.setMaxRows(100);
  var results = stmt.executeQuery(query);
  var numCols = results.getMetaData().getColumnCount();
  Logger.log(numCols);
  //Logger.log(results.getString(2));// getString() bu neng zhi jie yong, bi xu gen zai next() hou mian ma?
  while (results.next()) {
    var rowString = '';
    for (var col = 0; col < numCols; col++) {
      rowString += results.getString(col + 1) + '\t';
    }
    Logger.log(rowString);
  }
}

function WriteBatchRecords(connection)
{
  connection.setAutoCommit(false);
  var start = new Date();
 // var stmt = connection.prepareStatement('INSERT INTO titles '
 //     + '(emp_no,title,from_date,to_date) values (?, ?, ?, ?)');
  var stmt = connection.createStatement();
  stmt.setMaxRows(100);
  for (var i=1; i<=50; i++)
  {
    var update = 'INSERT INTO titles VALUES (1, "' + i + '", "1990-03-11", "2019-05-04")';
    Logger.log(update);
    stmt.executeUpdate(update);
  }
  
/*  for (var i = 1; i <= 50; i++) {
    stmt.setString(1, 1);
    stmt.setString(2,"Worker" + i);
    stmt.setString(3, "1990-03-11");
    stmt.setString(4,"2019-05-04");
    stmt.addBatch();
  }*/

 // var batch = stmt.executeBatch();
  connection.commit();

  var end = new Date();
  //Logger.log('Time elapsed: %sms for %s rows.', end - start, batch.length);
  
}


function main()
{
  var connectionName = 'scanning-database:australia-southeast1:dbtesting';
  var user = 'root';
  var userPwd = '';
  var db = 'employees';

  var dbUrl = 'jdbc:google:mysql://' + connectionName + '/' + db;
  var conn = Jdbc.getCloudSqlConnection(dbUrl, user, userPwd);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
//  var testContent = SpreadsheetApp.getActive().getRange('G1:L1').getDisplayValues();
//  writeOneRecord(testContent,conn);
//------------------------------------------------------------------
 // var query = 'SELECT employees.birth_date, employees.first_name, titles.title, titles.emp_no FROM employees INNER JOIN titles ON titles.emp_no = employees.emp_no;';
 // QuerySQL(query,conn);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  WriteBatchRecords(conn);
  //conn.commit();
  conn.close();
}
