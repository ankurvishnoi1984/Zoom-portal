const sql = require('mssql');
const logger = require('../utils/logger');
const { DateTime } = require('luxon');
exports.getFormFieldMandatory = async (req,res)=>{
    
    const request = new sql.Request();
    const {clientId} = req.body;

    request.input('y', sql.VarChar,"Y")
    request.input('m', sql.VarChar, "M");
    request.input('clcode', sql.BigInt,clientId)

    const query = `SELECT Field_Mst.FieldCode, Field_Mst.FieldName, Field_Mst.FieldType, Field_Mst.FieldInfo, Field_Mst.FieldMandatory,
    Client_Field_Mapping.ClientCode,Client_Field_Mapping.DisplayOrder From Field_Mst Inner Join Client_Field_Mapping on Field_Mst.FieldCode = Client_Field_Mapping.FieldCode 
    where Client_Field_Mapping.ClientCode = @clcode And Field_Mst.FieldMandatory = @m  And Client_Field_Mapping.Status = @y
    Order By Client_Field_Mapping.DisplayOrder;`
    
    try {

         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/formCont/getFormField: ${err.message}. SQL query: ${query}`);
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

                logger.info('FormField get successfully');
                res.status(200).json({ message: 'Fetch FormField successfully', errorCode:"1", data: result.recordset });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/formCont/getFormField: ${error.message}`);
      res.status(500).json(error);
    }
}


exports.getFormFieldOptional = async (req,res)=>{
    
  const request = new sql.Request();
    const {clientId} = req.body;

    request.input('y', sql.VarChar,"Y")
    request.input('o', sql.VarChar, "O");
    request.input('clcode', sql.BigInt,clientId)

    const query = `SELECT Field_Mst.FieldCode, Field_Mst.FieldName, Field_Mst.FieldType, Field_Mst.FieldInfo, Field_Mst.FieldMandatory,
    Client_Field_Mapping.ClientCode ,Client_Field_Mapping.DisplayOrder From Field_Mst Inner Join Client_Field_Mapping on Field_Mst.FieldCode = Client_Field_Mapping.FieldCode 
    where Client_Field_Mapping.ClientCode = @clcode And Field_Mst.FieldMandatory = @o  And Client_Field_Mapping.Status = @y
    Order By Client_Field_Mapping.DisplayOrder;`
    
    try {

         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/formCont/getFormFieldOptional: ${err.message}. SQL query: ${query}`);
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

                logger.info('FormFieldOPtional get successfully');
                res.status(200).json({ message: 'Fetch FormField successfully', errorCode:"1", data: result.recordset });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/formCont/getFormFieldOptional: ${error.message}`);
      res.status(500).json(error);
    }
}


exports.addHost = async (req,res)=>{
  const {hostUserName,hostPassword,fkmid} = req.body;
  const request = new sql.Request();

  const now = DateTime.now();

// Format the date using the desired format
  const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
  
  request.input("hostUserName", sql.VarChar, hostUserName)
  request.input("hostPassword", sql.VarChar, hostPassword)
  request.input("fkmid", sql.BigInt, fkmid)
  request.input("crdate", sql.VarChar,createdAt)
 


  const query = 'insert into webcast_host_login (wc_code,username,password,createddate) values (@fkmid,@hostUserName,@hostPassword,@crdate);'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/addHost: ${err.message}. SQL query: ${query}`);
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
            logger.info('Host Added Successfully')
            res.status(201).json({msg:'Host Added Successfully',errorCode:"1"})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/addHost: ${error.message}`);
      res.status(500).json(error);
  }
}


exports.getHostById = async (req,res)=>{
  const {fkmid} = req.body;
  const request = new sql.Request();

  
  request.input("fkmid", sql.BigInt, fkmid)
  request.input("y", sql.VarChar, "Y")
 


  const query = 'select wcmid, wc_code, username, password from webcast_host_login where wc_code = @fkmid and Status =@y'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/getHostById: ${err.message}. SQL query: ${query}`);
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
            logger.info('Host get by id successfully')
            res.status(201).json({msg:'Host get by id successfully',errorCode:"1",data:result.recordset})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/getHostById: ${error.message}`);
      res.status(500).json(error);
  }
}

exports.updateHostById = async (req,res)=>{
  const {fkmid,hostUserName,hostPassword} = req.body;
  console.log(req.body)
  const request = new sql.Request();

  request.input("hostUserName", sql.VarChar, hostUserName)
  request.input("hostPassword", sql.VarChar, hostPassword)
  request.input("fkmid", sql.BigInt, fkmid)
  request.input("y", sql.VarChar, "Y")
 


  const query = 'update webcast_host_login set username = @hostUserName , password = @hostPassword where wc_code = @fkmid and Status =@y'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/updateHostById: ${err.message}. SQL query: ${query}`);
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
            logger.info('Host update by id successfully')
            res.status(201).json({msg:'Host update by id successfully',errorCode:"1"})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/updateHostById: ${error.message}`);
      res.status(500).json(error);
  }
}



// exports.addFormField = async (req,res)=>{
  
//   const {data,fkmid} = req.body;
//   const request = new sql.Request();

//   const now = DateTime.now();
//   const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");

// // Format the date using the desired format
  
 
//     for (const row of data){


//     }


//   //const query = 'insert into webcast_host_login (wc_code,username,password,createddate) values (@fkmid,@hostUserName,@hostPassword,@crdate);'
  
//   try {

//        request.query(query,(err,result)=>{
//           if(err){
//               logger.error(`Error in /controller/formCont/addFormField: ${err.message}. SQL query: ${query}`);
//               return res.status(500).json({
//                   errorCode: "",
//                   errorDetail: err,
//                   responseData: {},
//                   status: "ERROR",
//                   details: "An internal server error occurred",
//                   getMessageInfo: "An internal server error occurred"
//               });
//           }
//           else{
//             logger.info('FormField Added Successfully')
//             res.status(201).json({msg:'FormField Added Successfully',errorCode:"1"})
//           }
//       })
      
//   } catch (error) {
//       console.log(error);
//       logger.error(`Error in /controller/formCont/addFormField: ${error.message}`);
//       res.status(500).json(error);
//   }
// }



exports.addFormField1= async (req, res) => {
  
     const now = DateTime.now();
   const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
  try {
  

    // Iterate over each item in the 'data' array and insert into the table
    for (const item of req.body.data) {
      try {
        const result = await sql.query`
          INSERT INTO Webcast_Field_Mapping (WcId,FieldCode, IsMandate, PlaceHolder, DisplayOrder,createdDate,Fk_mid)
          VALUES (${req.body.fkwcid},${item.fcode}, ${item.fman}, ${item.fname}, ${item.fdis}, ${createdAt}, ${req.body.fkmid})
        `;
      } catch (error) {
        logger.error(`Error in /controller/formCont/addFormField: ${error.message}. SQL query: ${query}`);
        console.error('Error inserting item:', error);
        return res.status(500).json({ error: 'Failed to insert data' });
      }
     
    }
    logger.info('FormField Added Successfully')
    res.status(200).json({ message: 'Data inserted successfully', errorCode:"1" });
  } catch (error) {
    logger.error(`Error in /controller/formCont/addFormField: ${error.message}. SQL query: ${query}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updateFormField = async (req, res) => {
  const now = DateTime.now();
  const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
  
  const transaction = new sql.Transaction();

  try {

    await transaction.begin()
    // Delete existing form fields for the given fkmid
    await sql.query`
      DELETE FROM Webcast_Field_Mapping
      WHERE Fk_mid = ${req.body.fkmid}
    `;

    // Iterate over each item in the 'data' array and insert into the table
    for (const item of req.body.data) {
      try {
        const result = await sql.query`
          INSERT INTO Webcast_Field_Mapping (WcId,FieldCode, IsMandate, PlaceHolder, DisplayOrder, createdDate, Fk_mid)
          VALUES (${req.body.fkwcid},${item.fcode}, ${item.fman}, ${item.fname}, ${item.fdis}, ${createdAt}, ${req.body.fkmid})
        `;
        // Optionally, log successful insertions
        //logger.info(`Inserted form field with FieldCode ${item.fcode}`);
      } catch (insertError) {
        // Log the error
        await transaction.rollback()
        logger.error(`Error inserting form field: ${insertError.message}`);
        // Respond with an error to the client
        return res.status(500).json({ error: 'Failed to insert data' });
      }
    }


    await transaction.commit();
    // Respond with success if all insertions were successful
    logger.info('Form Fields Added Successfully');
    res.status(200).json({ message: 'Data inserted successfully', errorCode: '1' });
  } catch (deleteError) {
    // Log the error
    await transaction.rollback()
    logger.error(`Error deleting existing form fields: ${deleteError.message}`);
    // Respond with an error to the client
    res.status(500).json({ error: 'Failed to delete existing form fields' });
  }
};


exports.addMessage = async (req,res)=>{
  const {message,messageType,fkmid} = req.body;
  const request = new sql.Request();


  
  request.input("message", sql.VarChar, message)
  request.input("messageType", sql.VarChar, messageType)
  request.input("fkmid", sql.BigInt, fkmid)
 

  const query = 'update Webcast_Webinar_Mst set Message = @message , MessageType = @messageType where fk_mid = @fkmid'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/addMessage: ${err.message}. SQL query: ${query}`);
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
            logger.info('Message Added Successfully')
            res.status(201).json({msg:'Message Added Successfully',errorCode:"1"})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/addMessage: ${error.message}`);
      res.status(500).json(error);
  }
}

exports.getMessageById = async (req,res)=>{
  const {fkmid} = req.body;
  const request = new sql.Request();

  
  request.input("fkmid", sql.BigInt, fkmid)
  request.input("y", sql.VarChar, "Y")
 


  const query = 'select Message,MessageType from Webcast_Webinar_Mst where fk_mid = @fkmid and Status =@y'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/getMessageById: ${err.message}. SQL query: ${query}`);
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
            logger.info('Message get by id successfully')
            res.status(201).json({msg:'Message get by id successfully',errorCode:"1",data:result.recordset})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/getMessageById: ${error.message}`);
      res.status(500).json(error);
  }
}

exports.updateMessageById = async (req,res)=>{
  const {fkmid,message,messageType} = req.body;
  const request = new sql.Request();

  request.input("message", sql.VarChar, message)
  request.input("messageType", sql.VarChar, messageType)
  request.input("fkmid", sql.BigInt, fkmid)
  request.input("y", sql.VarChar, "Y")
 


    const query = 'update Webcast_Webinar_Mst set Message = @message , MessageType = @messageType where fk_mid = @fkmid'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/updateMessageById: ${err.message}. SQL query: ${query}`);
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
            logger.info('Message update by id successfully')
            res.status(201).json({msg:'Host update by id successfully',errorCode:"1"})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/updateMessageById: ${error.message}`);
      res.status(500).json(error);
  }
}



exports.updateWebcastUrl = async (req,res)=>{
  const {deptId, clientId,attendeeWebcastUrl} = req.body;
 
  const request = new sql.Request();

  request.input("depid", sql.Int, deptId);
  request.input("clientid", sql.Int, clientId);
  request.input("url", sql.VarChar, attendeeWebcastUrl);


  const query = 'update Department_Mst set DeptUrl = @url where DeptId = @depid and ClientCode = @clientid'
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/updateUrl: ${err.message}. SQL query: ${query}`);
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
            logger.info('Url updated successfully')
            res.status(201).json({msg:'Url updated successfully',errorCode:"1"})
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/updateUrl: ${error.message}`);
      res.status(500).json(error);
  }
}


exports.addDepartment = async (req,res)=>{
  const {clientId,deptTitle,attendeeWebcastUrl} = req.body;
  const request = new sql.Request();

  const now = DateTime.now();

// Format the date using the desired format
  const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
  
  request.input("clientid", sql.Int, clientId)
  request.input("deptitle", sql.VarChar, deptTitle)
  request.input("attendeurl", sql.VarChar, attendeeWebcastUrl);
  request.input("crdate", sql.VarChar,createdAt)
 


  const query = `insert into Department_Mst 
  (ClientCode,DeptShortCode,DeptName,DeptTitle,DeptUrl,CreatedDate)
  OUTPUT INSERTED.DeptId 
   values (@clientid,@deptitle,@deptitle,@deptitle,@attendeurl,@crdate);`
  
  try {

       request.query(query,(err,result)=>{
          if(err){
              logger.error(`Error in /controller/formCont/addDepartment: ${err.message}. SQL query: ${query}`);
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
                logger.info('Department Added Successfully');
                res.status(201).json({ msg: 'Department Added Successfully', errorCode: "1", deptId: insertedDeptId });
          }
      })
      
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/formCont/addDepartment: ${error.message}`);
      res.status(500).json(error);
  }
}