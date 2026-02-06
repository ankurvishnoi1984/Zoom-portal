const sql = require('mssql');
const { DateTime } = require('luxon');
const { connectToDatabase } = require('../config/dbConnection');
const logger = require("../utils/logger");



exports.addMeeting = async (req,res)=>{
    const {title,sdate,edate,venue,cname,cmobile,deptId,clientId,userId,speakerCount} = req.body;
    const request = new sql.Request();

    const formattedDateTime1 = DateTime.fromISO(sdate, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    const formattedDateTime2 = DateTime.fromISO(edate, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");

    const now = DateTime.now();

// Format the date using the desired format
const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");


    
    request.input("title", sql.VarChar, title)
    request.input("sdate", sql.VarChar, formattedDateTime1)
    request.input("edate", sql.VarChar, formattedDateTime2)
    request.input("cname", sql.VarChar, cname)
    request.input("venue", sql.VarChar, venue)
    request.input("cmobile", sql.VarChar, cmobile)
    request.input("clcode", sql.Int, clientId);
    request.input("depid", sql.Int, deptId);
    request.input("crdate", sql.VarChar,createdAt)
    request.input("eventType", sql.VarChar, "EVTPHYSICAL")
   // request.input('isPosterEnable', sql.Char, isPosterRequired);
    request.input("userId", sql.VarChar, userId);
    request.input("speakerCount", sql.Int, speakerCount);


    // const query = `insert into Webcast_mst (Title,Name,Mobile,EventStartDateTime,
    //     EventEndDateTime,ClientCode,DeptId,Description,CreatedDate,EventType,
    //     EventLocation) values (@title,@cname,@cmobile,@sdate,@edate,@clcode,
    //     @depid,@cname,@crdate,@eventType,@venue); SELECT SCOPE_IDENTITY() AS id;
    //     `

    const query = `
  INSERT INTO Webcast_mst (
    Title, Name, Mobile, EventStartDateTime, EventEndDateTime,
    ClientCode, DeptId, Description,CreatedDate,CreatedBy, EventType, EventLocation,SpeakerCount
  ) 
  OUTPUT INSERTED.WcId, INSERTED.WcCode
  VALUES (
    @title, @cname, @cmobile, @sdate, @edate,
    @clcode, @depid, @cname, @crdate,@userId, @eventType, @venue, @speakerCount
  );
`;
    
    try {

         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/physicalMeetCont/addMeeting: ${err.message}. SQL query: ${query}`);
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
              logger.info('Physical Meeting Add Successfully')
            
              const wcid = result.recordset[0].WcId; // Convert to string              
              const pmid = result.recordset[0].WcCode;
              
              res.status(201).json({msg:'Physical Meeting Add Successfully',errorCode:"1",pmid,wcid})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/physicalMeetCont/addMeeting: ${error.message}`);
        res.status(500).json(error);
    }
}




exports.getMeeting = async (req, res) => {
    
    const request = new sql.Request();

    request.input("Etype", sql.VarChar, "EVTPHYSICAL");
    request.input("y", sql.VarChar, "Y");

    const query = 'SELECT WcCode, Title, EventStartDateTime, EventEndDateTime FROM Webcast_Mst where EventType = @Etype and EventStatus = @y';

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/physicalMeetCont/getMeeting: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                const formattedResult = result.recordset.map((item) => {
                    const rawDate = new Date(item.EventStartDateTime);
                    
                   // const currentDate = DateTime.now().toFormat('yyyy-MM-dd\'T\'HH:mm:ss');
                    //console.log(currentDate>rawDate)
                    //console.log("rawdata",rawDate);
                    //console.log("event startdate", item.EventStartDateTime)
                    const luxonDate = DateTime.fromJSDate(rawDate, { zone: 'utc' });
                      
                    const cdate = DateTime.now().setZone('utc')
                    const luxonDatec = cdate.plus({ hours: 5, minutes: 30 });
                    
                    const isPastEvent = luxonDate > luxonDatec
                    //console.log("isPastEvent",isPastEvent);

                    const rawDate1 = new Date(item.EventEndDateTime);
                    const luxonDate1 = DateTime.fromJSDate(rawDate1, { zone: 'utc' });
                    return {
                        ...item,
                        EventStartDateTime: luxonDate
                        .setLocale('en-US')
                        .toLocaleString({
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }),
                        EventEndDateTime: luxonDate1
                        .setLocale('en-US')
                        .toLocaleString({
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }),
                        isPastEvent: isPastEvent
                    };
                });
                

                logger.info('physical meeting get successfully');
                res.status(200).json({ message: 'Fetch meeting successfully', data: formattedResult });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/physicalMeetCont/getMeeting: ${error.message}`);
        res.status(500).json(error);
    }
};

exports.getMeetingWithStatus = async (req,res)=>{

    const {mtype,searchName,userId,roleId,sdate,edate} = req.body;
      
    const request = new sql.Request();
    
    const currentDateTime = DateTime.now();
    const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');
   
    request.input("Etype", sql.VarChar, "EVTPHYSICAL");
    request.input("y", sql.VarChar, "Y")
    request.input('formateddate', sql.VarChar, formattedDateTime)
    request.input('searchname', sql.VarChar, searchName);
    request.input('userId', sql.Int, userId);
    request.input('sdate', sql.VarChar, sdate);
    request.input('edate', sql.VarChar, edate);

    let query;

    if(sdate && edate){
        if(mtype==="upcoming"){
            if(roleId == "101"){
                
                query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
                where  @formateddate < EventEndDateTime and EventType = @Etype and EventStatus = @y and EventStartDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime`
            }
            else{
                query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
                where  @formateddate < EventEndDateTime and EventType = @Etype and EventStatus = @y and CreatedBy = @userId and EventStartDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime`
            }
        }
      
        else{
          if(roleId == "101"){
              query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
              where  @formateddate > EventEndDateTime and EventType = @Etype and EventStatus = @y and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
            }
            else{
              query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
              where  @formateddate > EventEndDateTime and EventType = @Etype and EventStatus = @y and CreatedBy = @userId and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
          }
        }
    }
    else{

        if(mtype==="upcoming"){
            if(roleId == "101"){
                
                query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
                where  @formateddate < EventEndDateTime and EventType = @Etype and EventStatus = @y and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime`
            }
            else{
                query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
                where  @formateddate < EventEndDateTime and EventType = @Etype and EventStatus = @y and CreatedBy = @userId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime`
            }
        }
      
        else{
          if(roleId == "101"){
              query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
              where  @formateddate > EventEndDateTime and EventType = @Etype and EventStatus = @y and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
            }
            else{
              query = `SELECT WcCode, Title, EventStartDateTime, EventEndDateTime, CreatedDate FROM Webcast_Mst
              where  @formateddate > EventEndDateTime and EventType = @Etype and EventStatus = @y and CreatedBy = @userId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
          }
        }
    }
   
    try {
  
         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/physicalMeetCont/getMeetingWithStatus: ${err.message}. SQL query: ${query}`);
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
  
  
              const formattedResult = result.recordset.map((item) => {
                const rawDate = new Date(item.EventStartDateTime);
                const luxonDate = DateTime.fromJSDate(rawDate, { zone: 'utc' });
                
                const rawDate1 = new Date(item.EventEndDateTime);
                const luxonDate1 = DateTime.fromJSDate(rawDate1, { zone: 'utc' });
                
                const rawDate2 = new Date(item.CreatedDate);
                const luxonDate2 = DateTime.fromJSDate(rawDate2, { zone: 'utc' });

                return {
                    ...item,
                    EventStartDateTime: luxonDate
                    .setLocale('en-US')
                    .toLocaleString({
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }),
                    EventEndDateTime: luxonDate1
                    .setLocale('en-US')
                    .toLocaleString({
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }),
                    CreatedDateTime: luxonDate2
                  .setLocale('en-US')
                  .toLocaleString({
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                  
                };
            });
                
                logger.info('physical meeting with status get successfully');
                //console.log("virtual meet formated result",formattedResult)
                res.status(200).json({ message: 'Fetch physical meeting with status successfully', errorCode:"1", data: formattedResult });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/physicalMeetCont/getMeeting: ${error.message}`);
      res.status(500).json(error);
    }
  }


exports.getMeetingById = async (req, res) => {
    
    const request = new sql.Request();

    request.input('id',sql.VarChar, req.params.id);
    request.input("y", sql.VarChar, "Y");
    //console.log("inside get meeting ", req.params.id);

    const query = 'SELECT WcCode, WcId, ClientCode, DeptId, Name, Mobile, Title, EventStartDateTime, IsPosterEnable, EventEndDateTime, EventLocation, SpeakerCount FROM Webcast_Mst where WcCode = @id and EventStatus = @y';



    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/physicalMeetCont/getMeetingById: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                // const formattedResult = result.recordset.map((item) => {
                //     const rawDate = new Date(item.date);
                //     const luxonDate = DateTime.fromJSDate(rawDate, { zone: 'utc' });
                //     return {
                //         ...item,
                //         date: luxonDate.toFormat("yyyy-MM-dd'T'HH:mm:ss"),
                //     };
                // });

                logger.info('physical meeting with Id get successfully');
                res.status(200).json({ message: 'Fetch meeting With Id successfully', data:result.recordset});
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/physicalMeetCont/getMeetingWithId: ${error.message}`);
        res.status(500).json(error);
    }
};



exports.updateMeeting = async (req,res)=>{
    
    const {title,sdate,edate,venue,cname,cmobile,userId,speakerCount} = req.body;
    const request = new sql.Request();

    const formattedDateTime1 = DateTime.fromISO(sdate, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    const formattedDateTime2 = DateTime.fromISO(edate, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    
    const now = DateTime.now();

    // Format the date using the desired format
    const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");

    request.input("id", sql.Int, req.params.id)
    request.input("title", sql.VarChar, title)
    request.input("sdate", sql.VarChar, formattedDateTime1)
    request.input("edate", sql.VarChar, formattedDateTime2)
    request.input("cname", sql.VarChar, cname)
    request.input("venue", sql.VarChar, venue)
    request.input("cmobile", sql.VarChar, cmobile)
    request.input("userId", sql.VarChar, userId)
    request.input("mdate", sql.VarChar, createdAt)
    request.input("speakerCount", sql.Int, speakerCount)
    
 

    const query = `update Webcast_Mst set Title = @title, EventStartDateTime = @sdate,
     EventEndDateTime = @edate, Name = @cname, Mobile = @cmobile,
     ModifiedBy = @userId, ModifiedDate = @mdate, 
     EventLocation = @venue, SpeakerCount = @speakerCount where WcCode= @id`
    
    try {

         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/physicalMeetCont/updateMeeting: ${err.message}. SQL query: ${query}`);
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
                
              logger.info('Physical Meeting Update Successfully')  
              res.status(200).json({msg:'Physical Meeting Update Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        logger.error(`Error in /controller/physicalMeetCont/updateMeeting: ${error.message}`);
        res.status(500).json(error);
    }
}


exports.deleteMeeting = async (req,res)=>{
    
    const request = new sql.Request();

   request.input('id', sql.Int, req.params.id);
   console.log(req.params)
    const query = 'delete from  Webcast_Mst where  WcCode = @id'
    
    try {

         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/physicalMeetCont/deleteMeeting: ${err.message}. SQL query: ${query}`);
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
                
              logger.info('Physical Meeting Delete Successfully')  
              res.status(200).json({msg:'Physical Meeting Delete Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        logger.error(`Error in /controller/physicalMeetCont/deleteMeeting: ${error.message}`);
        res.status(500).json(error);
    }
}


// for formated date 

exports.getMeetingByIdWithDateFormat = async (req, res) => {
    
    const request = new sql.Request();

    request.input('id',sql.VarChar, req.params.id);
    request.input("y", sql.VarChar, "Y");

    //console.log("inside get meeting ", req.params.id);

    const query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Name, Webcast_Mst.Mobile,
    Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
    Webcast_Mst.EventLocation, Webcast_Mst.IsPosterEnable,
    Client_Mst.FullName, Department_Mst.DeptName
    FROM Webcast_Mst 
    Inner Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
    Inner Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId 
    where 
    WcCode = @id and EventStatus = @y`;



    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/physicalMeetCont/getMeetingByIdFormatDate: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                const formattedResult = result.recordset.map((item) => {
                    const rawDate = new Date(item.EventStartDateTime);
                    const luxonDate = DateTime.fromJSDate(rawDate, { zone: 'utc' });

                    const rawDate1 = new Date(item.EventEndDateTime);
                    const luxonDate1 = DateTime.fromJSDate(rawDate1, { zone: 'utc' });
                    return {
                        ...item,
                        EventStartDateTime: luxonDate
                        .setLocale('en-US')
                        .toLocaleString({
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }),
                        EventEndDateTime: luxonDate1
                        .setLocale('en-US')
                        .toLocaleString({
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }),
                        EventDate: luxonDate
                      .setLocale('en-US')
                      .toLocaleString({
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        // hour: '2-digit',
                        // minute: '2-digit',
                        // hour12: true,
                      }),
                      EventTime: luxonDate
                      .setLocale('en-US')
                      .toLocaleString({
                        // day: 'numeric',
                        // month: 'short',
                        // year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    };
                });

                logger.info('physical meeting with Date Format get successfully');
                res.status(200).json({ message: 'Fetch meeting With Date Format successfully', data:formattedResult});
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/physicalMeetCont/getMeetingWithDateFormat: ${error.message}`);
        res.status(500).json(error);
    }
};


// soft delete logic 

exports.softDeleteMeeting = async (req, res) => {

    
    const request = new sql.Request();

    const now = DateTime.now();

  // Format the date using the desired format
  const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
   
    request.input('id', sql.Int, req.body.id);
    request.input('ddate', sql.VarChar, createdAt);
    request.input('userId', sql.VarChar, req.body.userId);


    request.input('n', sql.Char, "N");
    console.log(req.params);

    const query1 = 'update  Webcast_Mst set EventStatus = @n,DeletedDate=@ddate, DeletedBy= @userId where  WcCode = @id';
    const query2 = 'update Webcast_Speaker_Detail set Status = @n where fk_mid = @id';
    const query3 = 'update Webcast_Poster_Mapping set Status = @n where fk_mid = @id';

    try {
        

        // Use Promise.all to execute all queries concurrently
        const results = await Promise.all([
            request.query(query1),
            request.query(query2),
            request.query(query3)
        ]);

        // Check if any query failed
        const isError = results.some((result) => result instanceof Error);

        if (isError) {

          
            const errorMessages = results.map((result) => result instanceof Error ? result.message : null);
            logger.error(`Error in /controller/physicalMeetCont/deleteMeeting: ${errorMessages.join(', ')}`);
            return res.status(500).json({
                errorCode: "",
                errorDetail: errorMessages,
                responseData: {},
                status: "ERROR",
                details: "An internal server error occurred",
                getMessageInfo: "An internal server error occurred"
            });
        } else {
            
           
            logger.info('Physical Meeting Delete Successfully');
            res.status(200).json({ msg: 'Physical Meeting Delete Successfully', errorCode: "1" });
        }
    } catch (error) {
       
        logger.error(`Error in /controller/physicalMeetCont/deleteMeeting: ${error.message}`);
        res.status(500).json(error);
    }
};

// exports.softDeleteMeeting = async (req, res) => {
//     const transaction = new sql.Transaction();

//     try {
//         await transaction.begin();

//         const request = new sql.Request(transaction);

//         request.input('id', sql.Int, req.params.id);
//         request.input('n', sql.Char, "N");

//         const query1 = 'UPDATE Webcast_Mst SET EventStatus = @n WHERE WcCode = @id';
//         const query2 = 'UPDATE Webcast_Speaker_Detail SET Status = @n WHERE fk_mid = @id';
//         const query3 = 'UPDATE Webcast_Poster_Mapping SET Status = @n WHERE fk_mid = @id';

//         // Use Promise.all to execute all queries sequentially within the transaction
//         await request.query(query1);
//         await request.query(query2);
//         await request.query(query3);

//         await transaction.commit();
//         logger.info('Physical Meeting Delete Successfully');
//         res.status(200).json({ msg: 'Physical Meeting Delete Successfully', errorCode: "1" });
//     } catch (error) {
//         await transaction.rollback();
//         logger.error(`Error in /controller/physicalMeetCont/deleteMeeting: ${error.message}`);
//         res.status(500).json(error);
//     } finally {
//         await sql.close(); // Close the connection pool
//     }
// };




// get meeting count logic 


// exports.getTotalMeeting = async (req,res)=>{
//     const request = new sql.Request();

//     request.input('event', sql.VarChar, 'EVTPHYSICAL');
//     request.input('y', sql.VarChar, 'Y')

//    const query = 'select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst where eventType = @event and EventStatus = @y'

//     try {

//         request.query(query,(err,result)=>{
//            if(err){
//                logger.error(`Error in /controller/physicalMeetCont/getTotalMeeting: ${err.message}. SQL query: ${query}`);
//                return res.status(500).json({
//                    errorCode: "",
//                    errorDetail: err,
//                    responseData: {},
//                    status: "ERROR",
//                    details: "An internal server error occurred",
//                    getMessageInfo: "An internal server error occurred"
//                });
//            }
//            else{
               
//              logger.info('Physical Meeting Total get Successfully')  
//              res.status(200).json({msg:'Physical Meeting Total get Successfully',errorCode:"1",data:result.recordset})
//            }
//        })
       
//    } catch (error) {
//        logger.error(`Error in /controller/physicalMeetCont/getTotalMeeting: ${error.message}`);
//        res.status(500).json(error);
//    }
// }

exports.getTotalMeeting = async (req,res)=>{
     const {sdate,edate,userId,roleId} = req.body
        const request = new sql.Request();
    
        request.input('event', sql.VarChar, 'EVTPHYSICAL');
        request.input('y', sql.VarChar, 'Y');
        request.input('sdate', sql.VarChar, sdate);
        request.input('edate', sql.VarChar, edate);
        request.input('userId', sql.Int, userId);
        let query;
        if(sdate && edate){
            
            if(roleId == "101"){
                query = 'select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst where EventStartDateTime between @sdate and @edate and EventType = @event and EventStatus = @y'
            }
            else{
                query = 'select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst where EventStartDateTime between @sdate and @edate and EventType = @event and CreatedBy = @userId and EventStatus = @y'
            }

        }
        else{
            
            if(roleId == "101"){
                
                query = 'select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst where eventType = @event and EventStatus = @y'
            }
            else{
                query = 'select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst where eventType = @event and CreatedBy = @userId and EventStatus = @y'

            }
        }
    
        try {
    
            request.query(query,(err,result)=>{
               if(err){
                   logger.error(`Error in /controller/physicalMeetCont/getTotalMeeting: ${err.message}. SQL query: ${query}`);
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
                   
                 logger.info('Physical Meeting Total get Successfully')  
                 res.status(200).json({msg:'Physical Meeting Total get Successfully',errorCode:"1",data:result.recordset})
               }
           })
           
       } catch (error) {
           logger.error(`Error in /controller/physicalMeetCont/getTotalMeeting: ${error.message}`);
           res.status(500).json(error);
       }
    }


// exports.getTotalUpcomingMeeting = async (req,res)=>{
//     const request = new sql.Request();
//     // Get the current date and time
// const currentDateTime = DateTime.now();

// // Format the date and time in the desired format
// const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

//     request.input('event', sql.VarChar, 'EVTPHYSICAL');
//     request.input('y', sql.VarChar, 'Y')
//     request.input('formateddate', sql.VarChar, formattedDateTime)


//    const query = 'select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst where @formateddate < EventEndDateTime and eventType = @event and EventStatus = @y'

//     try {

//         request.query(query,(err,result)=>{
//            if(err){
//                logger.error(`Error in /controller/physicalMeetCont/getTotalUpcomingMeeting: ${err.message}. SQL query: ${query}`);
//                return res.status(500).json({
//                    errorCode: "",
//                    errorDetail: err,
//                    responseData: {},
//                    status: "ERROR",
//                    details: "An internal server error occurred",
//                    getMessageInfo: "An internal server error occurred"
//                });
//            }
//            else{
               
//              logger.info('getTotalMeeting Physical Successfully')  
//              res.status(200).json({msg:'getTotalMeeting Physical Successfully',errorCode:"1", data:result.recordset})
//            }
//        })
       
//    } catch (error) {
//        logger.error(`Error in /controller/physicalMeetCont/getTotalUpcomingMeeting: ${error.message}`);
//        res.status(500).json(error);
//    }
// }

exports.getTotalUpcomingMeeting = async (req,res)=>{
    const {sdate,edate,userId,roleId} = req.body
    const request = new sql.Request();
    const currentDateTime = DateTime.now();
    
    
// Format the date and time in the desired format
const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    request.input('event', sql.VarChar, 'EVTPHYSICAL');
    request.input('y', sql.VarChar, 'Y')
    request.input('formateddate', sql.VarChar, formattedDateTime)
    request.input('sdate', sql.VarChar, sdate);
    request.input('edate', sql.VarChar, edate);
    request.input('userId', sql.Int, userId);
    let query
    if(sdate && edate){
     if(roleId =="101"){
         query = 'select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst where @formateddate < EventEndDateTime and eventType = @event and EventStatus = @y and EventStartDateTime between @sdate and @edate '
    }
    else{
        query = 'select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst where @formateddate < EventEndDateTime and eventType = @event and CreatedBy = @userId and EventStatus = @y and EventStartDateTime between @sdate and @edate '
     }

    }
    else{

        if(roleId == "101"){
            query = 'select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst where @formateddate < EventEndDateTime and eventType = @event and EventStatus = @y'
            
        }
        else{
            query = 'select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst where @formateddate < EventEndDateTime and eventType = @event and CreatedBy = @userId and EventStatus = @y'

        }

    }


    try {

        request.query(query,(err,result)=>{
           if(err){
               logger.error(`Error in /controller/physicalMeetCont/getTotalUpcomingMeeting: ${err.message}. SQL query: ${query}`);
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
               
             logger.info('getTotalMeeting Physical Successfully')  
             res.status(200).json({msg:'getTotalMeeting Physical Successfully',errorCode:"1", data:result.recordset})
           }
       })
       
   } catch (error) {
       logger.error(`Error in /controller/physicalMeetCont/getTotalUpcomingMeeting: ${error.message}`);
       res.status(500).json(error);
   }
}


// exports.getTotalCompletedMeeting = async (req,res)=>{
//     const request = new sql.Request();
//     // Get the current date and time
// const currentDateTime = DateTime.now();

// // Format the date and time in the desired format
// const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

//     request.input('event', sql.VarChar, 'EVTPHYSICAL');
//     request.input('y', sql.VarChar, 'Y')
//     request.input('formateddate', sql.VarChar, formattedDateTime)


//    const query = 'select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst where @formateddate > EventEndDateTime and eventType = @event and EventStatus = @y'

//     try {

//         request.query(query,(err,result)=>{
//            if(err){
//                logger.error(`Error in /controller/physicalMeetCont/getTotalCompletedMeeting: ${err.message}. SQL query: ${query}`);
//                return res.status(500).json({
//                    errorCode: "",
//                    errorDetail: err,
//                    responseData: {},
//                    status: "ERROR",
//                    details: "An internal server error occurred",
//                    getMessageInfo: "An internal server error occurred"
//                });
//            }
//            else{
               
//              logger.info('getTotalCompletedMeeting Physical Successfully')  
//              res.status(200).json({msg:'getTotalCompletedMeeting Physical Successfully',errorCode:"1", data:result.recordset})
//            }
//        })
       
//    } catch (error) {
//        logger.error(`Error in /controller/physicalMeetCont/getTotalCompletedMeeting: ${error.message}`);
//        res.status(500).json(error);
//    }
// }

exports.getTotalCompletedMeeting = async (req,res)=>{
 
 const {sdate,edate,userId,roleId} = req.body;
 const request = new sql.Request();
 const currentDateTime = DateTime.now();

// Format the date and time in the desired format
const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    request.input('event', sql.VarChar, 'EVTPHYSICAL');
    request.input('y', sql.VarChar, 'Y')
    request.input('formateddate', sql.VarChar, formattedDateTime)
    request.input('sdate', sql.VarChar, sdate);
    request.input('edate', sql.VarChar, edate);
     request.input('userId', sql.Int, userId);
    let query;
    if(sdate && edate){
     if(roleId == "101"){
         
         query = 'select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst where @formateddate > EventEndDateTime and eventType = @event and EventStatus = @y and EventEndDateTime between @sdate and @edate'
        }
        else{
         query = 'select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst where @formateddate > EventEndDateTime and eventType = @event and EventStatus = @y and CreatedBy = @userId and EventEndDateTime between @sdate and @edate'

     }
    }
    else{

        if(roleId == "101"){
            
            query = 'select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst where @formateddate > EventEndDateTime and eventType = @event and EventStatus = @y'
        }
        else{
            query = 'select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst where @formateddate > EventEndDateTime and eventType = @event and CreatedBy = @userId and EventStatus = @y'

        }

    }

    try {

        request.query(query,(err,result)=>{
           if(err){
               logger.error(`Error in /controller/physicalMeetCont/getTotalCompletedMeeting: ${err.message}. SQL query: ${query}`);
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
               
             logger.info('getTotalCompletedMeeting Physical Successfully')  
             res.status(200).json({msg:'getTotalCompletedMeeting Physical Successfully',errorCode:"1", data:result.recordset})
           }
       })
       
   } catch (error) {
       logger.error(`Error in /controller/physicalMeetCont/getTotalCompletedMeeting: ${error.message}`);
       res.status(500).json(error);
   }
}


exports.getMeetingDataForDownload = async (req, res) => {
    const {sdate,edate,roleId,userId} = req.body 
    const request = new sql.Request();

    request.input("Etype", sql.VarChar, "EVTPHYSICAL");
    request.input("y", sql.VarChar, "Y");
    request.input('sdate', sql.VarChar, sdate);
    request.input('edate', sql.VarChar, edate);
    request.input('userId', sql.Int, userId); 
    let query;
    if(sdate && edate){
       if(roleId == "101"){
           query = `SELECT Webcast_Mst.Title,Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventLocation, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
           Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
           Webcast_Speaker_Detail.Bio3
           FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
           and Webcast_Speaker_Detail.Status = @y
           where Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y
           `;
    }
    else{
        query = `SELECT Webcast_Mst.Title,Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventLocation, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
        Webcast_Speaker_Detail.Bio3
        FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
        and Webcast_Speaker_Detail.Status = @y
        where Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y
        and Webcast_Mst.CreatedBy = @userId`;
       }
    }
    else{

        if(roleId == "101"){
            query = `SELECT Webcast_Mst.Title, Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventLocation, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
            Webcast_Speaker_Detail.Bio3
            FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid
            and Webcast_Speaker_Detail.Status = @y 
            where Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y
            `;
        }
        else{
            query = `SELECT Webcast_Mst.Title, Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventLocation, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
            Webcast_Speaker_Detail.Bio3
            FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
            and Webcast_Speaker_Detail.Status = @y
            where Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y
            and Webcast_Mst.CreatedBy = @userId `;
        }
        
    }

    
    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/physicalMeetCont/getMeetingData: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                const formattedResult = result.recordset.map((item) => {
                    const rawDate = new Date(item.EventStartDateTime);
                    
                  
                    const luxonDate = DateTime.fromJSDate(rawDate, { zone: 'utc' });
                      
    

                    const rawDate1 = new Date(item.EventEndDateTime);
                    const luxonDate1 = DateTime.fromJSDate(rawDate1, { zone: 'utc' });
                    return {
                        ...item,
                        EventStartDate: luxonDate
                        .setLocale('en-US')
                        .toLocaleString({
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          
                        }),
                        EventStartTime: luxonDate
                        .setLocale('en-US')
                        .toLocaleString({
                          
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }),
                        EventEndDate: luxonDate1
                        .setLocale('en-US')
                        .toLocaleString({
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          // hour: '2-digit',
                          // minute: '2-digit',
                          // hour12: true,
                        }),
                        EventEndTime: luxonDate1
                        .setLocale('en-US')
                        .toLocaleString({
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }),
                        
                    };
                });
                

                logger.info('physical meeting data get successfully');
                res.status(200).json({ message: 'Physical meeting fetch successfully', data: formattedResult });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/physicalMeetCont/getMeetingData: ${error.message}`);
        res.status(500).json(error);
    }
};

