const sql = require('mssql');
const logger = require('../utils/logger')
const { DateTime } = require('luxon');


exports.UserLogin = async (req, res) => {
    const { username, password } = req.body;
    const request = new sql.Request();

    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);

    //const query = 'select username, password, userid from [user_mst] where username = @username  and password = @password';
     
    const query = `SELECT u.username, u.password, u.userid, r.role_code
    FROM [user_mst] u
    INNER JOIN [User_Role_Mapping] r ON u.userid = r.userid
    WHERE u.username = @username AND u.password = @password`

    try {

        logger.info(`Incoming request: ${req.method} ${req.url},
         Request body: ${JSON.stringify(req.body)}`);
       
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/authenticateCont/UserLogin: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else if (result.recordset.length === 0) {
                logger.warn('Invalid Username or Password');
                return res.status(401).json({
                    errorCode: "0",
                    errorDetail: "Invalid Username or Password",
                    responseData: {},
                    status: "ERROR",
                    details: "UNAUTHORIZED",
                    getMessageInfo: "Invalid Username or Password"
                });
            } else {
                console.log(result);
                return res.json({
                    errorCode: "1",
                    errorDetail: "",
                    responseData: {
                        message: "Login successful",
                        userId: result?.recordset[0]?.userid,
                        roleCode: result?.recordset[0]?.role_code

                    },
                    status: "SUCCESS",
                    details: "",
                    getMessageInfo: ""
                });
            }
        });
    } catch (error) {
        logger.error(`Error in /controller/UserLogin: ${error.message}.`);
        return res.status(500).json({
            errorCode: "0",
            errorDetail: error.message,
            responseData: {},
            status: "ERROR",
            details: "An internal server error occurred",
            getMessageInfo: "An internal server error occurred"
        });
    }
};


exports.getRoleCode = async (req, res) => {
    
    const request = new sql.Request();

    const {userId} = req.body;

    request.input("userId", sql.BigInt, userId);
   

    const query = 'SELECT userid,role_code from User_Role_Mapping WHERE userid = @userId';

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/authenticateCont/getRoleCode: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                
                logger.info('Role Code get successfully');
                res.status(200).json({ message: 'Role Code get successfully', errorCode:"1", data:result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/getRoleCode: ${error.message}`);
        res.status(500).json(error);
    }
};


exports.getClient = async (req, res) => {
    
    const searchName = req.query.searchName || '';
    const request = new sql.Request();
    request.input("y", sql.VarChar, "Y");
    request.input('searchname', sql.VarChar, searchName);

    const query = `SELECT ClientCode, FullName, ContactPerson, ContactNumber from Client_Mst Where Status = @y and FullName Like '%' + @searchname+ '%'`;

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/authenticateCont/getClient: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                
                logger.info('Role Code get successfully');
                res.status(200).json({ message: 'Client get successfully', errorCode:"1", data:result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/getClient: ${error.message}`);
        res.status(500).json(error);
    }
};

exports.getClientAdmin = async (req, res) => {
    
    const {userId} = req.body;

    const request = new sql.Request();
    request.input("y", sql.VarChar, "Y");
    request.input("userId", sql.BigInt, userId);
    

    const query = 'SELECT client_code from user_client_mapping Where userid= @userId And Status = @y';

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/authenticateCont/getClientAdmin: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                
                logger.info('client Code get successfully');
                res.status(200).json({ message: 'Client get successfully', errorCode:"1", data:result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/getClientAdmin: ${error.message}`);
        res.status(500).json(error);
    }
};


exports.getDepartMent = async (req, res) => {
    
    const {clientId}= req.body

    const searchName = req.query.searchName || '';
    const request = new sql.Request();
    request.input("y", sql.VarChar, "Y");
    request.input("clientId", sql.BigInt, clientId);
    request.input('searchname', sql.VarChar, searchName);



    const query = `SELECT DeptId, DeptName,DeptUrl from Department_Mst Where ClientCode = @clientId and Status = @y and DeptName Like '%' + @searchname+ '%'`;

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/authenticateCont/getDepartMent: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                
                logger.info('Role Code get successfully');
                res.status(200).json({ message: 'Client get successfully', errorCode:"1", data:result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/getDepartMent: ${error.message}`);
        res.status(500).json(error);
    }
};


// client and department curd operation

exports.addClient = async (req,res)=>{
  const {clientName,contactPerson,contactNumber} = req.body;
  
  const request = new sql.Request();
  const now = DateTime.now();

// Format the date using the desired format
  const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
  
  request.input("clientName", sql.VarChar, clientName)
  request.input("contactPerson", sql.VarChar, contactPerson)
  request.input("contactNumber", sql.VarChar, contactNumber)
  request.input("crdate", sql.VarChar,createdAt)
 


  const query = 'insert into Client_Mst (FullName,ContactPerson,ContactNumber,CreatedDate) values (@clientName,@contactPerson,@contactNumber,@crdate);'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/authenticateCont/addClient: ${err.message}. SQL query: ${query}`);
              return res.status(500).json({
                  errorCode: "",
                  errorDetail: err,
                  responseData: {},
                  status: "ERROR",
                  details: "An internal server error occurred",
                  getMessageInfo: "An internal server error occurred"
              });
          }
          else{
            
            res.status(201).json({msg:'Client Added Successfully',errorCode:"1"})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/authenticateCont/addClient: ${error.message}`);
      res.status(500).json(error);
  }
}

exports.deleteClient = async (req,res)=>{
    const {clientId} = req.body;
    console.log("req body",clientId);
    const request = new sql.Request();

    request.input("clientId", sql.BigInt, clientId)
    request.input("y", sql.VarChar, "N")
  
    const query = 'update Client_Mst set Status = @y where ClientCode = @clientId;'
    
    try {
  
         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/authenticateCont/deleteClient: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else{
              
              res.status(201).json({msg:'Client Deleted Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/addClient: ${error.message}`);
        res.status(500).json(error);
    }
}


exports.addDepartment = async (req,res)=>{
    const {clientId,departmentName} = req.body;
    const request = new sql.Request();
  
    const now = DateTime.now();
  
  // Format the date using the desired format
    const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
    
    request.input("clientid", sql.Int, clientId)
    request.input("deptitle", sql.VarChar, departmentName)
    request.input("crdate", sql.VarChar,createdAt)
   
  
  
    const query = `insert into Department_Mst 
    (ClientCode,DeptShortCode,DeptName,DeptTitle,CreatedDate)
    OUTPUT INSERTED.DeptId 
     values (@clientid,@deptitle,@deptitle,@deptitle,@crdate);`
    
    try {
  
         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/authenticateCont/addDepartment: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else{
              const insertedDeptId = result.recordset[0].DeptId; // Fetch the inserted DeptId
    
                  res.status(201).json({ msg: 'Department Added Successfully', errorCode: "1", deptId: insertedDeptId });
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/addDepartment: ${error.message}`);
        res.status(500).json(error);
    }
  }


  exports.deleteDepartment = async (req,res)=>{
    const {departmentId} = req.body;
    const request = new sql.Request();

    request.input("departmentId", sql.BigInt, departmentId)
    request.input("n", sql.VarChar, "N")
  
    const query = 'update Department_Mst set Status = @n where DeptId = @departmentId;'
    
    try {
  
         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/authenticateCont/deleteDepartment: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else{
              
              res.status(201).json({msg:'Department Deleted Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/Department: ${error.message}`);
        res.status(500).json(error);
    }
}  

exports.updateDepartment = async (req,res)=>{
    const {departmentId,name} = req.body;
    const request = new sql.Request();

    request.input("departmentId", sql.BigInt, departmentId)
    request.input("name",sql.VarChar, name)
  
    const query = 'update Department_Mst set DeptName = @name where DeptId = @departmentId;'
    
    try {
  
         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/authenticateCont/updateDepartment: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else{
              
              res.status(201).json({msg:'Department updated Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/updateDepartment: ${error.message}`);
        res.status(500).json(error);
    }
}  

exports.updateClient = async (req,res)=>{
    const {clientName,contactPerson,contactNumber,clientId} = req.body;
  
    const request = new sql.Request();
    
    request.input("clientName", sql.VarChar, clientName)
    request.input("contactPerson", sql.VarChar, contactPerson)
    request.input("contactNumber", sql.VarChar, contactNumber)
    request.input("clientId", sql.BigInt,clientId)
   
  
  
    const query = 'update Client_Mst set FullName = @clientName,ContactPerson = @contactPerson,ContactNumber = @contactNumber where ClientCode = @clientId'
    
    try {
  
         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/authenticateCont/updateClient: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            }
            else{
              
              res.status(201).json({msg:'Client updated Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/authenticateCont/updateClient: ${error.message}`);
        res.status(500).json(error);
    }
}  