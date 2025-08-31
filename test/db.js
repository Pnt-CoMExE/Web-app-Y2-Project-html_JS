const mysql = require("msql2");

const con = mysql.createConection({
    host: 'localhost',
    user: 'root',
    password : '',
    database : 'Motor Rental' 
});

module.exports = con;