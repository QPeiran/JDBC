function writeOneRecord(content) 
{
  var stmt = conn.prepareStatement('INSERT INTO employees '
      + '(emp_no, birth_date, first_name, last_name, gender, hire_date) values (?,?,?,?,?,?)');
  for(var i = 0; i < content[0].length; i++)
  {
    var x = content[0][i].toString();
    Logger.log(x);
    stmt.setString(i+1,content[0][i].toString());
  }
  
//stmt.execute();

}

function QuerySQL(query,connection)
{
  var stmt = connection.createStatement();
  stmt.setMaxRows(100);
  var resultss = stmt.executeQuery(query);
  var numCols = results.getMetaData().getColumnCount();
  Logger.log(numCols);
  Logger.log(results.getString(2));// getString() bu neng zhi jie yong, bi xu gen zai next() hou mian ma?
  while (results.next()) {
    var rowString = '';
    for (var col = 0; col < numCols; col++) {
      rowString += results.getString(col + 1) + '\t';
    }
    Logger.log(rowString);
  }
  
  
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
  //var testContent = SpreadsheetApp.getActive().getRange('G1:L1').getDisplayValues();
  //writeOneRecord(testContent);
//______________________________________________________________________________________  
  var query = 'SELECT employees.birth_date, employees.first_name, titles.title, titles.emp_no FROM employees INNER JOIN titles ON titles.emp_no = employees.emp_no;';
  QuerySQL(query,conn);
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
  //conn.commit();
  conn.close();
}
