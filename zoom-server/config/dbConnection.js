const sql = require("mssql");

const config = {
    // user: 'dhananjay',
    // password: 'test',
    // server: 'DESKTOP-JOBSO4H\\SQLEXPRESS', 
    // database: 'TestDB',
    // port:1433,
    // options: {
    //     encrypt: true,
    //     trustServerCertificate: true, // Add this line
    //   }, 

    user: 'dev',
    password: 'Dev@2023',
    server: '216.48.176.144', 
    database: 'NetcastDbNew',
    port:1433,
    options: {
        encrypt: true,
        trustServerCertificate: true, // Add this line
      }, 
};


const connectToDatabase = async () => {
    try {
        await sql.connect(config);
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

module.exports = {
    connectToDatabase,
};