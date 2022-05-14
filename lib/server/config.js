const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',//'iwx_web_server',
  password: 'Magaji4132*',
  database: 'iwx'                                                 });                                                               connection.connect((err) => {                                       if (err)
    console.error('error: ' + err.message);                         else console.log('Connection successful!!!');
});

module.exports = connection;
