const sql = require('mssql');
const { DateTime } = require('luxon');
const { connectToDatabase } = require('../config/dbConnection');
const logger = require("../utils/logger");
const axios = require('axios');
const {SPREADSHEET_ID} = require('../utils/constant');
// const { appendSheet, updateGoogleSheet, deleteGoogleSheet } = require('../config/googleSheet');

exports.addMeeting = async (req,res)=>{
   

    const request = new sql.Request();
    const inputDateTime = req.body.start_time;
   
      // console.log(req.body)
      const {topic,duration,start_time,cname,
        cmobile,deptId,clientId,userId,isQuestionEnable1,
        isPollEnable1,isPosterRequired,roomUrl,virtualType,attendeeWebcastUrl1,speakerCount} = req.body
    
     console.log("req body", req.body);
   
    const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    //req.body.start_time = formattedDateTime;
   
   
    // console.log("inside createmetting",formattedDateTime)
   // req.body.timezone = 'UTC'
   // console.log(req.body)
   // console.log(formattedDateTime);
   // const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'Asia/Calcutta' }).toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
   //   req.body.start_time = formattedDateTime;
     req.body.timezone = 'Asia/Calcutta';
    // console.log(req.body);
   
       try {
         const zoomResponse = await axios.post(
           'https://api.zoom.us/v2/users/me/meetings',
           {topic,duration,start_time:formattedDateTime,timezone: 'Asia/Calcutta'}, // Pass any request data from your frontend
           {
             headers: {
               'Authorization': `Bearer ${req.zoomAccessToken}`,
               'Content-Type': 'application/json',
             },
           }
         );
     
   const mdata = zoomResponse.data;
   
   console.log("till zoom data", mdata)
   
   const luxonDateTime = DateTime.fromISO(formattedDateTime, { zone: 'Asia/Calcutta' });
   
   // Add  minutes
   const updatedDateTime = luxonDateTime.plus({ minutes: mdata.duration });
   
   // Convert the updated time back to a string in the same time zone
   const updatedTime = updatedDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss");
   
        // Parse the ISO date using Luxon
  const dt = DateTime.fromISO(formattedDateTime);

// Format the date and time
  const fdate = dt.toFormat("dd-MM-yyyy");
  const ftime = dt.toFormat("hh : mm a"); 
   
         //const query = 'insert into account_meeting_mst (meeting_date,account_id) values (?,?)'
         const now = DateTime.now();

          // Format the date using the desired format
          const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
          const meetingData = [mdata.id, fdate,ftime,mdata.duration,
            mdata.start_url,mdata.join_url,mdata.password, mdata.topic,mdata.host_email,createdAt]
         
   
         request.input('title', sql.VarChar, mdata.topic);
         request.input('sdate', sql.VarChar, formattedDateTime);
         request.input('edate', sql.VarChar, updatedTime);
         request.input('hostId', sql.VarChar, mdata.host_id);
         request.input('duration', sql.Int, mdata.duration);
         request.input('meetingId', sql.BigInt , mdata.id)
         request.input("cname", sql.VarChar, cname)
         request.input("cmobile", sql.VarChar, cmobile)
         request.input("clcode", sql.Int, clientId);
         request.input("depid", sql.Int, deptId);
         request.input("isQEnable", sql.Char, isQuestionEnable1);
         request.input("isPEnable", sql.Char, isPollEnable1);
         request.input("isPosterEnable", sql.Char, isPosterRequired);
         request.input("crdate", sql.VarChar,createdAt)
         request.input("eventType", sql.VarChar, "EVTVIRTUAL")
         request.input("passcode", sql.VarChar, mdata.password)

         request.input("joinUrl", sql.VarChar, mdata.join_url);
         request.input("startUrl", sql.VarChar, mdata.start_url)
         request.input("roomUrl", sql.VarChar, roomUrl)
         request.input("userId", sql.VarChar, userId);

         request.input("vtype", sql.VarChar, virtualType);
         request.input("attendeWebUrl", sql.VarChar, attendeeWebcastUrl1)
         request.input('speakerCount', sql.Int, speakerCount);
         
         


        // console.log("2",formattedDateTime,updatedTime)

         const query = `insert into Webcast_mst 
         (Title,Name,Mobile,EventDuration,IsQuestionEnable,
          IsPollEnable,IsPosterEnable,EventStartDateTime,EventEndDateTime,
          ClientCode,DeptId,Description,CreatedDate,CreatedBy,EventType,EventWebType,SpeakerCount)
         OUTPUT INSERTED.WcId, INSERTED.WcCode values 
         (@title,@cname,@cmobile,@duration, @isQEnable,@isPEnable,
          @isPosterEnable,
          @sdate,@edate,@clcode,@depid,@cname,@crdate,@userId,@eventType,@vtype,@speakerCount);`

         
          try {
             request.query(query,async(err,result)=>{
               if(err){
                console.log(err)
                logger.error(`Error in /controller/VirtualMeet/addMeeting: ${err.message}. SQL query: ${query}`);
                   res.send(err);
               }
               else{
                const wcid = result.recordset[0].WcId; // Convert to string              
                const pmid = result.recordset[0].WcCode;
               
                request.input('fkid', sql.BigInt, pmid);
                request.input("fkwcid", sql.VarChar, wcid)
                const query1 = `insert into Webcast_Webinar_Mst 
                (WcId,MeetingId,AccountId,Passcode,RoomUrl,PresenterUrl,ModeratorUrl,AttendeeUrl,CreatedDate,CreatedBy,start_date,end_date,fk_mid)
                values(@fkwcid,@meetingId,@hostId,@passcode,@roomUrl,@startUrl,@attendeWebUrl,@joinUrl,@crdate,@userId,@sdate,@edate,@fkid)`;

                  const result2 = await request.query(query1);
                  // await appendSheet(SPREADSHEET_ID, meetingData);
                   res.send({
                       message:"meeting created",
                       errorCode:"1",
                       pmid,wcid

                   })
               }
             })
          } catch (error) {
            logger.error(`Error in /controller/VirtualMeet/addMeeting: ${error.message}`);

           res.send(error)
          }
       } catch (error) {
        logger.error(`Error in /controller/VirtualMeet/addMeeting: ${error.message}`);

         res.status(500).json({ error: 'Failed to create a Zoom meeting' ,error});
       }
}

exports.getMeeting = async (req,res)=>{
    
    const request = new sql.Request();

   
    request.input("Etype", sql.VarChar, "EVTVIRTUAL");
    request.input("y", sql.VarChar, "Y")
    //const query = 'SELECT WcCode, Title, EventStartDateTime, EventEndDateTime FROM Webcast_Mst where EventType = @Etype';
     
    const query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime, Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
    FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where Webcast_Mst.EventType = 'EVTVIRTUAL' and Webcast_Mst.EventStatus = @y`
    try {

         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/virtualMeetCont/getMeeting: ${err.message}. SQL query: ${query}`);
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
                
                const cdate = DateTime.now().setZone('utc')
                const luxonDatec = cdate.plus({ hours: 5, minutes: 30 });
                console.log("luxondatec",luxonDatec,luxonDate)
                const isPastEvent = luxonDate > luxonDatec
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
                    isPastEvent:isPastEvent
                };
            });
                
                logger.info('Virtual meeting get successfully');
                console.log("virtual meet formated result",formattedResult)
                res.status(200).json({ message: 'Fetch Virtual meeting successfully', data: formattedResult });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeeting: ${error.message}`);
      res.status(500).json(error);
    }
}


// get upcoming meeting 
exports.getMeetingWithStatus = async (req,res)=>{

  const {mtype,searchName,userId,roleId,sdate,edate} = req.body;
    
  const request = new sql.Request();
  
  const currentDateTime = DateTime.now();
  const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');
 
  request.input("Etype", sql.VarChar, "EVTVIRTUAL");
  request.input("y", sql.VarChar, "Y")
  request.input('formateddate', sql.VarChar, formattedDateTime)
  request.input('searchname', sql.VarChar, searchName)
  request.input('userId', sql.Int, userId);
  request.input('sdate', sql.VarChar, sdate);
  request.input('edate', sql.VarChar, edate);

  let query;

  if(sdate && edate){

    if(mtype==="upcoming"){
      
      if(roleId == "101"){
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate < Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
      }
      else{
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate < Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
      }
    }
  
    else{
      if(roleId == "101"){
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate > Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.EventEndDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
      }
      else{
       
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate > Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and  Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventEndDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
      }
    }
  }
  else{
    if(mtype==="upcoming"){
      
      if(roleId == "101"){
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate < Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
      }
      else{
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate < Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
      }
    }
  
    else{
      if(roleId == "101"){
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate > Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
      }
      else{
       
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
        @formateddate > Webcast_Mst.EventEndDateTime and
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and  Webcast_Mst.CreatedBy = @userId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
      }
    }
  }



  // const query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
  // Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId 
  // FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
  // Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where
  // @formateddate Between Webcast_Mst.EventStartDateTime and Webcast_Mst.EventEndDateTime and
  // Webcast_Mst.EventType = 'EVTVIRTUAL' and Webcast_Mst.EventStatus = @y`
 
  try {

       request.query(query,(err,result)=>{
          if(err){
            logger.error(`Error in /controller/virtualMeetCont/getMeetingWithStatus: ${err.message}. SQL query: ${query}`);
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
              
              logger.info('Virtual meeting with status get successfully');
              //console.log("virtual meet formated result",formattedResult)
              res.status(200).json({ message: 'Fetch Virtual meeting with status successfully', errorCode:"1", data: formattedResult });
          }
      })
      
  } catch (error) {
    console.error(error);
    logger.error(`Error in /controller/virtualMeetCont/getMeeting: ${error.message}`);
    res.status(500).json(error);
  }
}





exports.updateMeeting = async (req, res)=>{
  const WcCode = req.params.id;
  const {title,start_time,duration,cname,cmobile,isQuestionEnable,isPollEnable,roomUrl,userId,speakerCount} = req.body;
  //console.log("inside updatemetaing ",req.body,req.params.id)

 
  const inputDateTime = req.body.start_time;
  const meetingId = +req.body.meetingId

const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
//req.body.start_time = formattedDateTime;

const now = DateTime.now();

          // Format the date using the desired format
const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");
//console.log("inside updatemetting",formattedDateTime)

const dt = DateTime.fromISO(formattedDateTime);

// Format the date and time
  const fdate = dt.toFormat("dd-MM-yyyy");
  const ftime = dt.toFormat("hh : mm a"); 


  try {

       const zoomResponse = await axios.patch(`https://api.zoom.us/v2/meetings/${meetingId}`,
       {topic:title,duration,start_time:formattedDateTime}, // Pass any request data from your frontend
      {
        headers: {
          'Authorization': `Bearer ${req.zoomAccessToken}`,
          'Content-Type': 'application/json',
        },
      })



      const mdata = zoomResponse.data;
      const luxonDateTime = DateTime.fromISO(formattedDateTime, { zone: 'Asia/Calcutta' });
     
// Add 20 minutes
const updatedDateTime = luxonDateTime.plus({ minutes: duration });

// Convert the updated time back to a string in the same time zone
const updatedTime = updatedDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss");




const request = new sql.Request();
request.input("WcCode", sql.VarChar, req.params.id)
request.input("title", sql.VarChar, title)
request.input("sdate", sql.VarChar, formattedDateTime)
request.input("edate", sql.VarChar, updatedTime)
request.input('duration', sql.Int, duration)
request.input("meetingId", sql.BigInt, meetingId)
request.input("cname", sql.VarChar, cname);
request.input("cmobile", sql.VarChar, cmobile);
request.input("isQEnable", sql.Char, isQuestionEnable);
request.input("isPEnable", sql.Char, isPollEnable);
request.input("roomUrl",sql.VarChar,roomUrl)
request.input("userId",sql.VarChar,userId);
request.input("crdate",sql.VarChar,createdAt)
request.input('speakerCount', sql.Int, speakerCount)





const query = `update Webcast_Mst set Title = @title,
 Name = @cname, Mobile = @cmobile, IsQuestionEnable = @isQEnable,
  IsPollEnable = @isPEnable, EventStartDateTime = @sdate, 
  EventEndDateTime = @edate, EventDuration = @duration,
  ModifiedBy = @userId, ModifiedDate = @crdate , SpeakerCount = @speakerCount
   where WcCode = @WcCode`

try {

     request.query(query,async(err,result)=>{
        if(err){
            logger.error(`Error in /controller/virtualMeetCont/updateMeeting: ${err.message}. SQL query: ${query}`);
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

          const query1 = 'update Webcast_Webinar_Mst set RoomUrl= @roomUrl,start_date = @sdate , end_date = @edate where MeetingId = @meetingId'
          const result2 = await request.query(query1);

          const updatedData = [meetingId,fdate,ftime,duration,null,null,null,title,null,null];
         
          // Update Google Sheet
          // await updateGoogleSheet(SPREADSHEET_ID, meetingId, updatedData);
          logger.info('virtual Meeting Update Successfully')  
          res.status(200).json({msg:'virtual Meeting Update Successfully'})
        }
    })
    
} catch (error) {
    logger.error(`Error in /controller/virtualMeetCont/updateMeeting: ${error.message}`);
    res.status(500).json(error);
}


  } catch (error) {
    console.log(error)
     res.send(error) 
  }
}

// exports.deleteMeeting = async (req,res)=>{
    
   
//     const request = new sql.Request();

//    request.input('id', sql.Int, req.params.id);
//     const query = 'delete from meetingDetails where mid= @id'
    
//     try {

//         const zoomResponse = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`,
//         {
//            headers:{
//                'Authorization': `Bearer ${req.zoomAccessToken}`
//            }
//        })

//        try {

//         request.query(query,(err,result)=>{
//            if(err){
//               console.log(err)
//            }
//            else{
//              res.json({msg:'Delete meeting Successfully'})
//            }
//        })
       
//    } catch (error) {
//        console.log(error)
//    }

//        console.log(zoomResponse)
//    } catch (error) {
//       res.send(error) 
//    }

    
// }



// exports.updateMeeting = async (req,res)=>{
    
//   const {title,date,stime,etime,cname,cmobile} = req.body;
//   const request = new sql.Request();
  
//   request.input("id", sql.Int, req.params.id)
//   request.input("title", sql.VarChar, title)
//   request.input("date", sql.VarChar, date)
//   request.input("stime", sql.VarChar, stime)
//   request.input("etime", sql.VarChar, etime)
//   request.input("cname", sql.VarChar, cname)
//   request.input("cmobile", sql.VarChar, cmobile)

//   const query = 'update  physicalMeeting set title = @title, date = @date, stime = @stime, etime = @etime, cname = @cname, cmobile = @cmobile where pmid= @id'
  
//   try {

//        request.query(query,(err,result)=>{
//           if(err){
//               logger.error(`Error in /controller/physicalMeetCont/updateMeeting: ${err.message}. SQL query: ${query}`);
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
              
//             logger.info('Physical Meeting Update Successfully')  
//             res.status(200).json({msg:'Physical Meeting Update Successfully'})
//           }
//       })
      
//   } catch (error) {
//       logger.error(`Error in /controller/physicalMeetCont/updateMeeting: ${error.message}`);
//       res.status(500).json(error);
//   }
// }

exports.getMeetingById = async (req, res) => {
    
  const request = new sql.Request();

  request.input('id',sql.VarChar, req.params.id);
  request.input("y", sql.VarChar, "Y")

  //const query = 'SELECT WcCode, Name, Mobile, Title, EventDuration, EventStartDateTime, EventEndDateTime FROM Webcast_Mst where WcCode = @id';

  const query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.ClientCode,Webcast_Mst.DeptId,
  Webcast_Mst.WcId, Webcast_Mst.Title, Webcast_Mst.Name, Webcast_Mst.EventDuration, Webcast_Mst.Mobile,
  Webcast_Mst.IsQuestionEnable,Webcast_Mst.IsPollEnable,Webcast_Mst.IsPosterEnable,
  Webcast_Mst.SpeakerCount,
  Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,Webcast_Mst.EventWebType,
  Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId,Webcast_Webinar_Mst.RoomUrl,
  Webcast_Webinar_Mst.MessageType, Webcast_Webinar_Mst.Message 
  FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid where Webcast_Mst.WcCode = @id and Webcast_Mst.EventStatus =@y`

  try {
      request.query(query, (err, result) => {
          if (err) {
              logger.error(`Error in /controller/VirtualMeetCont/getMeetingById: ${err.message}. SQL query: ${query}`);
              return res.status(500).json({
                  errorCode: "",
                  errorDetail: err,
                  responseData: {},
                  status: "ERROR",
                  details: "An internal server error occurred",
                  getMessageInfo: "An internal server error occurred"
              });
          } else {
          //   const formattedResult = result.recordset.map((item) => {
          //     const rawDate = new Date(item.sdate);
          //     const luxonDate = DateTime.fromJSDate(rawDate, { zone: 'utc' });

          //     const rawDate1 = new Date(item.edate);
          //     const luxonDate1 = DateTime.fromJSDate(rawDate1, { zone: 'utc' });
          //     return {
          //         ...item,
          //         sdate: luxonDate
          //         .setLocale('en-US')
          //         .toLocaleString({
          //           day: 'numeric',
          //           month: 'short',
          //           year: 'numeric',
          //           hour: '2-digit',
          //           minute: '2-digit',
          //           hour12: true,
          //         }),
          //         edate: luxonDate1
          //         .setLocale('en-US')
          //         .toLocaleString({
          //           day: 'numeric',
          //           month: 'short',
          //           year: 'numeric',
          //           hour: '2-digit',
          //           minute: '2-digit',
          //           hour12: true,
          //         })
          //     };
          // });

              logger.info('virtual meeting with Id get successfully');
              res.status(200).json({ message: 'Fetch meeting With Id successfully', data:result.recordset });
          }
      });
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/VirtualMeetCont/getMeetingWithId: ${error.message}`);
      res.status(500).json(error);
  }
};





exports.deleteMeeting = async (req, res) => {

  // console.log(req.query)
  // console.log(req.body)
  const meetingId = +req.query.mid;
 
  const wcid = req.query.wcid;
  const request = new sql.Request();
  //request.input('meetingId', sql.VarChar, meetingId);

  request.input('id', sql.VarChar, wcid);
   console.log(req.params)
    const query = 'delete from  Webcast_Mst where  WcCode = @id'

  try {
      // Make a request to the Zoom API to delete the meeting
      const zoomResponse = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
          headers: {
              'Authorization': `Bearer ${req.zoomAccessToken}`
          }
      });

      // Check if the Zoom meeting deletion was successful
      if (zoomResponse.status !== 204) {
          throw new Error(`Failed to delete Zoom meeting. Zoom API returned status: ${zoomResponse.status}`);
      }

      // If Zoom meeting deletion was successful, delete the meeting from the database
      const result = await request.query(query);

      // Check if the database deletion was successful
      if (result.rowsAffected[0] !== 1) {
          throw new Error(`Failed to delete meeting from the database. No rows affected.`);
      }

      res.json({ msg: 'Delete meeting successfully',errorCode:"1" });
  } catch (error) {
    console.log(error)
      console.error(`Error in /controller/meetingCont/deleteMeeting: ${error.message}`);
      res.status(500).json({
          errorCode: "",
          errorDetail: error.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
      });
  }
};


// for formated date 

exports.getMeetingByIdWithDateFormat = async (req, res) => {
    
  const request = new sql.Request();

  request.input('id',sql.VarChar, req.params.id);
  request.input("y", sql.VarChar, "Y")

  //console.log("inside get meeting ", req.params.id);

  //const query = 'SELECT WcCode, Name, Mobile, Title, EventStartDateTime, EventEndDateTime FROM Webcast_Mst where WcCode = @id';

  const query = `SELECT Webcast_Mst.WcCode,Webcast_Mst.Name, Webcast_Mst.Mobile,
  Webcast_Mst.Title, Webcast_Mst.EventStartDateTime,
   Webcast_Mst.EventEndDateTime,Webcast_Mst.IsPosterEnable, Webcast_Mst.EventWebType,
  Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.Passcode,
  Webcast_Webinar_Mst.AccountId, 
  Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,Webcast_Webinar_Mst.ModeratorUrl,
  zoom_ac_dtl.Account_no,zoom_ac_dtl.Account_name,webcast_host_login.username,webcast_host_login.password,
  Client_Mst.FullName, Department_Mst.DeptName  
  FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
  Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
  Left Join zoom_ac_dtl on Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
  Left Join webcast_host_login on Webcast_Mst.WcCode = webcast_host_login.wc_code
  Inner Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
  Inner Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId 
  where 
  Webcast_Mst.WcCode = @id and Webcast_Mst.EventStatus =@y`


  try {
      request.query(query, (err, result) => {
          if (err) {
              logger.error(`Error in /controller/virtualMeetCont/getMeetingByIdFormatDate: ${err.message}. SQL query: ${query}`);
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

              logger.info('virtual meeting with Date Format get successfully');
              res.status(200).json({ message: 'Fetch meeting With Date Format successfully', data:formattedResult});
          }
      });
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeetingWithDateFormat: ${error.message}`);
      res.status(500).json(error);
  }
};


exports.getMeetingByIdWithDateFormat1 = async (req, res) => {
    
  const request = new sql.Request();

  request.input('id',sql.VarChar, req.params.id);
  request.input("y", sql.VarChar, "Y")

  //console.log("inside get meeting ", req.params.id);

  //const query = 'SELECT WcCode, Name, Mobile, Title, EventStartDateTime, EventEndDateTime FROM Webcast_Mst where WcCode = @id';

  const query = `SELECT Webcast_Mst.WcCode,Webcast_Mst.Name, Webcast_Mst.Mobile,Webcast_Mst.EventWebType,
  Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,Webcast_Mst.IsPosterEnable,
  Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,Webcast_Webinar_Mst.ModeratorUrl
  FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
  Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
  where 
  Webcast_Mst.WcCode = @id and Webcast_Mst.EventStatus =@y`


  try {
      request.query(query, (err, result) => {
          if (err) {
              logger.error(`Error in /controller/virtualMeetCont/getMeetingByIdFormatDate: ${err.message}. SQL query: ${query}`);
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

              logger.info('virtual meeting with Date Format get successfully');
              res.status(200).json({ message: 'Fetch meeting With Date Format successfully', data:formattedResult});
          }
      });
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeetingWithDateFormat: ${error.message}`);
      res.status(500).json(error);
  }
};



// fro soft delete 

// exports.softDeleteMeeting = async (req, res) => {

//   // console.log(req.query)
//    console.log("inside delete meeting",req.body)
//   const meetingId = +req.body.mid;
 
//   const wcid = +req.body.wcid;
//   const request = new sql.Request();
//   //request.input('meetingId', sql.VarChar, meetingId);

//   request.input('id', sql.BigInt, wcid);
   
//     request.input('n', sql.VarChar, "N")
  
//     const query1 = 'update  Webcast_Mst set EventStatus= @n where  WcCode = @id'
//     const query2 = 'update  Webcast_Webinar_Mst set Status= @n where  fk_mid = @id'
//     const query3 = 'update Webcast_Speaker_Detail set Status = @n where Sk_mid = @id';
//     const query4 = 'update Webcast_Poster_Mapping set Status = @n where fk_mid = @id';

//   try {
//       // Make a request to the Zoom API to delete the meeting
//       const zoomResponse = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
//           headers: {
//               'Authorization': `Bearer ${req.zoomAccessToken}`
//           }
//       });

//       // Check if the Zoom meeting deletion was successful
//       if (zoomResponse.status !== 204) {
//           throw new Error(`Failed to delete Zoom meeting. Zoom API returned status: ${zoomResponse.status}`);
//       }

//       // If Zoom meeting deletion was successful, delete the meeting from the database
//       const result1 = await request.query(query1);
//       const result2 = await request.query(query2);
//       const result3 = await request.query(query3);



//       // Check if the database deletion was successful
//       if (result1.rowsAffected[0] !== 1) {
//           throw new Error(`Failed to delete meeting from the database. No rows affected1.`);
//       }
//       if (result2.rowsAffected[0] !== 1) {
//         throw new Error(`Failed to delete meeting from the database. No rows affected2.`);
//       }
//       if (result3.rowsAffected[0] !== 1) {
//         throw new Error(`Failed to delete meeting from the database. No rows affected3.`);
//       }

//       res.json({ msg: 'Delete meeting successfully',errorCode:"1" });
//   } catch (error) {
//     console.log(error)
//       console.error(`Error in /controller/meetingCont/deleteMeeting: ${error.message}`);
//       res.status(500).json({
//           errorCode: "",
//           errorDetail: error.message,
//           responseData: {},
//           status: "ERROR",
//           details: "An internal server error occurred",
//           getMessageInfo: "An internal server error occurred"
//       });
//   }
// };

exports.softDeleteMeeting = async (req, res) => {

  // console.log(req.query)
   console.log("inside delete meeting",req.body)
  const meetingId = +req.body.mid;
  const userId = req.body.userId;
 
  const wcid = +req.body.wcid;
  const request = new sql.Request();
  //request.input('meetingId', sql.VarChar, meetingId);
  const now = DateTime.now();

  // Format the date using the desired format
  const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");

  request.input('id', sql.BigInt, wcid);
  
   
    request.input('n', sql.VarChar, "N")
    request.input('ddate', sql.VarChar, createdAt)
    request.input('userId', sql.VarChar, userId)

  
    const query1 = 'update  Webcast_Mst set EventStatus= @n, DeletedDate=@ddate, DeletedBy= @userId where  WcCode = @id'
    const query2 = 'update  Webcast_Webinar_Mst set Status= @n where  fk_mid = @id'
    const query3 = 'update Webcast_Speaker_Detail set Status = @n where fk_mid = @id';
    const query4 = 'update Webcast_Poster_Mapping set Status = @n where fk_mid = @id';
     
    

  try {
      // Make a request to the Zoom API to delete the meeting
      const zoomResponse = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
          headers: {
              'Authorization': `Bearer ${req.zoomAccessToken}`
          }
      });

      // Check if the Zoom meeting deletion was successful
      if (zoomResponse.status !== 204) {
          throw new Error(`Failed to delete Zoom meeting. Zoom API returned status: ${zoomResponse.status}`);
      }

    
        const results = await Promise.all([
            request.query(query1),
            request.query(query2),
            request.query(query3),
            request.query(query4)
        ]);

        

        // Check if any query failed
        const isError = results.some((result) => result instanceof Error);

        if (isError) {
            const errorMessages = results.map((result) => result instanceof Error ? result.message : null);
            logger.error(`Error in /controller/virtualMeetCont/deleteMeeting: ${errorMessages.join(', ')}`);
            return res.status(500).json({
                errorCode: "",
                errorDetail: errorMessages,
                responseData: {},
                status: "ERROR",
                details: "An internal server error occurred",
                getMessageInfo: "An internal server error occurred"
            });
        } else {
          // await deleteGoogleSheet(SPREADSHEET_ID, meetingId);
            logger.info('Virtual Meeting Delete Successfully');
            res.status(200).json({ msg: 'Virtual Meeting Delete Successfully', errorCode: "1" });
        }
    
  } catch (error) {
    console.log("error deleting zoom meeting",error.response);
      console.error(`Error in /controller/VirtualMeet/deleteMeeting: ${error.message}`);
      res.status(500).json({
          errorCode: "",
          errorDetail: error.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
      });
  }
};


exports.deleteZoomMeeting = async (req, res) => {

  
   const meetingId = +req.body.meetingId;
 

  try {
     
      const zoomResponse = await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
          headers: {
              'Authorization': `Bearer ${req.zoomAccessToken}`
          }
      });

      // Check if the Zoom meeting deletion was successful
      if (zoomResponse.status !== 204) {
          throw new Error(`Failed to delete Zoom meeting. Zoom API returned status: ${zoomResponse.status}`);

      }
      res.status(200).json({ msg: 'Zoom Meeting Delete Successfully', errorCode: "1" });


  } catch (error) {
    console.log(error)
      console.error(`Error in /controller/VirtualMeet/deleteZoomMeeting: ${error.message}`);
      res.status(500).json({
          errorCode: "",
          errorDetail: error.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
      });
  }
};


exports.addAndUpdateZoomMeeting = async (req, res)=>{
  
  
  // console.log(req.body)
  const {topic,duration,start_time,cname,cmobile,meetingId} = req.body
  
   const inputDateTime = start_time;
   
    const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
    
     req.body.timezone = 'Asia/Calcutta';
   
   
       try {
         const zoomResponse = await axios.post(
           'https://api.zoom.us/v2/users/me/meetings',
           {topic,duration,start_time:formattedDateTime,timezone: 'Asia/Calcutta'}, // Pass any request data from your frontend
           {
             headers: {
               'Authorization': `Bearer ${req.zoomAccessToken}`,
               'Content-Type': 'application/json',
             },
           }
         );
     
   const mdata = zoomResponse.data;
      const luxonDateTime = DateTime.fromISO(formattedDateTime, { zone: 'Asia/Calcutta' });

// Add 20 minutes
const updatedDateTime = luxonDateTime.plus({ minutes: duration });

// Convert the updated time back to a string in the same time zone
const updatedTime = updatedDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss");

console.log("Updated time:", updatedTime);
const request = new sql.Request();
request.input("WcCode", sql.VarChar, req.body.id)
request.input("title", sql.VarChar, topic)
request.input("sdate", sql.VarChar, formattedDateTime)
request.input("edate", sql.VarChar, updatedTime)
request.input('duration', sql.Int, duration)
request.input("meetingId", sql.BigInt, meetingId)
request.input("cname", sql.VarChar, cname);
request.input("cmobile", sql.VarChar, cmobile);
request.input("hostId", sql.VarChar, mdata.host_id);
request.input("mid", sql.BigInt, mdata.id);
request.input("jurl", sql.VarChar, mdata.join_url);
request.input("surl", sql.VarChar, mdata.start_url);





const query = 'update Webcast_Mst set Title = @title, Name = @cname, Mobile = @cmobile, EventStartDateTime = @sdate, EventEndDateTime = @edate, EventDuration = @duration where WcCode = @WcCode'

try {

     request.query(query,async(err,result)=>{
        if(err){
            logger.error(`Error in /controller/virtualMeetCont/updateMeeting: ${err.message}. SQL query: ${query}`);
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

          const query1 = 'update Webcast_Webinar_Mst set MeetingId = @mid, AccountId = @hostId, PresenterUrl = @surl ,AttendeeUrl = @jurl, start_date = @sdate , end_date = @edate where MeetingId = @meetingId'
          const result2 = await request.query(query1);
          console.log(result2)
          logger.info('virtual Meeting Update Successfully')  
          res.status(200).json({msg:'virtual Meeting Update Successfully',errorCode:"1"})
        }
    })
    
} catch (error) {
    logger.error(`Error in /controller/virtualMeetCont/updateMeeting: ${error.message}`);
    res.status(500).json(error);
}


  } catch (error) {
    console.log(error)
     res.send(error) 
  }
}


// get meeting count logic 


exports.getTotalMeeting = async (req,res)=>{
  
  const {sdate,edate, userId,roleId} = req.body
  const request = new sql.Request();
  request.input('event', sql.VarChar, 'EVTVIRTUAL');
  request.input('y', sql.VarChar, 'Y')
  request.input('sdate', sql.VarChar, sdate);
  request.input('edate', sql.VarChar, edate);
  request.input('userId', sql.Int, userId); 
  let query 
  if(sdate && edate){
    if(roleId == "101"){
      query = `select COALESCE(COUNT(*), 0) as totalMeeting  FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
       where Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y`
      
    }
    else{
      query = `select COALESCE(COUNT(*), 0) as totalMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.eventType = @event and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStatus = @y`

    }
  }
  else{
    if(roleId == "101"){
      
      query = `select COALESCE(COUNT(*), 0) as totalMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y`
    }
    else{
      query = `select COALESCE(COUNT(*), 0) as totalMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where Webcast_Mst.eventType = @event and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStatus = @y`

    }
  }

  try {

      request.query(query,(err,result)=>{
         if(err){
             logger.error(`Error in /controller/virtualMeetCont/getTotalMeeting: ${err.message}. SQL query: ${query}`);
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
             
           logger.info('Virtual Meeting Total get Successfully')  
           res.status(200).json({msg:'Virtual Meeting Total get Successfully',errorCode:"1",data:result.recordset})
         }
     })
     
 } catch (error) {
     logger.error(`Error in /controller/virtualMeetCont/getTotalMeeting: ${error.message}`);
     res.status(500).json(error);
 }
}


exports.getTotalUpcomingMeeting = async (req,res)=>{
  
  const {sdate,edate,userId,roleId} = req.body 
 const request = new sql.Request();
 const currentDateTime = DateTime.now();

// Format the date and time in the desired format
const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

  request.input('event', sql.VarChar, 'EVTVIRTUAL');
  request.input('y', sql.VarChar, 'Y')
  request.input('formateddate', sql.VarChar, formattedDateTime)
  request.input('sdate', sql.VarChar, sdate);
  request.input('edate', sql.VarChar, edate);
  request.input('userId', sql.Int, userId); 

  let query 
  if(sdate && edate){
    if(roleId == "101"){
      query = `select COALESCE(COUNT(*), 0) as totalUpcomingMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
      where @formateddate < Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y and Webcast_Mst.EventStartDateTime between @sdate and @edate`
      
    }
    else{
      
      query = `select COALESCE(COUNT(*), 0) as totalUpcomingMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where @formateddate < Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStartDateTime between @sdate and @edate`
    }
  }
  else{
    if(roleId == "101"){
      
      query = `select COALESCE(COUNT(*), 0) as totalUpcomingMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where @formateddate < Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y`
    }
    else{
      
      query = `select COALESCE(COUNT(*), 0) as totalUpcomingMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where @formateddate < Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStatus = @y`
    }
  }


  try {

      request.query(query,(err,result)=>{
         if(err){
             logger.error(`Error in /controller/virtualMeetCont/getTotalUpcomingMeeting: ${err.message}. SQL query: ${query}`);
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
             
           logger.info('getTotalMeeting Virtual Successfully')  
           res.status(200).json({msg:'getTotalMeeting Virtual Successfully',errorCode:"1", data:result.recordset})
         }
     })
     
 } catch (error) {
     logger.error(`Error in /controller/virtualMeetCont/getTotalUpcomingMeeting: ${error.message}`);
     res.status(500).json(error);
 }
}


exports.getTotalCompletedMeeting = async (req,res)=>{
  const {sdate,edate,userId,roleId} = req.body 
  const request = new sql.Request();

  
  // Get the current date and time
const currentDateTime = DateTime.now();

// Format the date and time in the desired format
const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

  request.input('event', sql.VarChar, 'EVTVIRTUAL');
  request.input('y', sql.VarChar, 'Y')
  request.input('formateddate', sql.VarChar, formattedDateTime)
  request.input('sdate', sql.VarChar, sdate);
  request.input('edate', sql.VarChar, edate);
  request.input('userId', sql.Int, userId); 

  if(sdate && edate){
  if(roleId == "101"){
    
    query = `select COALESCE(COUNT(*), 0) as totalCompletedMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
    where @formateddate > Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y and Webcast_Mst.EventEndDateTime between @sdate and @edate`
  } 
  else{
    query = `select COALESCE(COUNT(*), 0) as totalCompletedMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
    where @formateddate > Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStatus = @y and Webcast_Mst.EventEndDateTime between @sdate and @edate`

  }   
  }
  else{
    if(roleId == "101"){
      
      query = `select COALESCE(COUNT(*), 0) as totalCompletedMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
      where @formateddate > Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.EventStatus = @y`
    }
    else{
      query = `select COALESCE(COUNT(*), 0) as totalCompletedMeeting FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
      Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid  
      where @formateddate > Webcast_Mst.EventEndDateTime and Webcast_Mst.eventType = @event and Webcast_Mst.CreatedBy = @userId and Webcast_Mst.EventStatus = @y`

    }
  }


  try {

      request.query(query,(err,result)=>{
         if(err){
             logger.error(`Error in /controller/virtualMeetCont/getTotalCompletedMeeting: ${err.message}. SQL query: ${query}`);
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
             
           logger.info('getTotalCompletedMeeting Virtual Successfully')  
           res.status(200).json({msg:'getTotalCompletedMeeting Virtual Successfully',errorCode:"1", data:result.recordset})
         }
     })
     
 } catch (error) {
     logger.error(`Error in /controller/virtualMeetCont/getTotalCompletedMeeting: ${error.message}`);
     res.status(500).json(error);
 }
}


exports.getMeetingDataForDownload = async (req, res) => {
  const {sdate,edate,userId,roleId} = req.body 
  const request = new sql.Request();

  request.input("Etype", sql.VarChar, "EVTVIRTUAL");
  request.input("y", sql.VarChar, "Y");
  request.input('sdate', sql.VarChar, sdate);
  request.input('edate', sql.VarChar, edate);
  request.input('userId', sql.Int, userId); 
  let query;
  if(sdate && edate){
    
   if(roleId == "101"){
     query = `SELECT Webcast_Mst.Title,Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
     Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
     Webcast_Speaker_Detail.Bio3
     FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
     and Webcast_Speaker_Detail.Status = @y
     where Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y;`;
    }
    else{
      query = `SELECT Webcast_Mst.Title,Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
      Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
      Webcast_Speaker_Detail.Bio3
      FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
      and Webcast_Speaker_Detail.Status = @y
      where Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y
      and Webcast_Mst.CreatedBy = @userId;`;
    }
  }
  else{
      
    if(roleId == "101"){
      query = `SELECT Webcast_Mst.Title,Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
      Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
      Webcast_Speaker_Detail.Bio3
      FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
      and Webcast_Speaker_Detail.Status = @y
      where Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y;`;
    }
    else{
      query = `SELECT Webcast_Mst.Title,Webcast_Mst.WcCode,Webcast_Mst.Name ,Webcast_Mst.Mobile, Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
      Webcast_Speaker_Detail.SpkName,Webcast_Speaker_Detail.SpkDesignation,Webcast_Speaker_Detail.Bio1,Webcast_Speaker_Detail.Bio2,
      Webcast_Speaker_Detail.Bio3
      FROM Webcast_Mst Left Join Webcast_Speaker_Detail on Webcast_Mst.WcCode = Webcast_Speaker_Detail.fk_mid 
      and Webcast_Speaker_Detail.Status = @y
      where Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y
      and Webcast_Mst.CreatedBy = @userId;`;
    }
  }


  try {
      request.query(query, (err, result) => {
          if (err) {
              logger.error(`Error in /controller/VirtualMeetCont/getMeetingData: ${err.message}. SQL query: ${query}`);
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
                        // hour: '2-digit',
                        // minute: '2-digit',
                        // hour12: true,
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
              
            
              logger.info('virtual meeting data get successfully');
              res.status(200).json({ message: 'virtual meeting fetch successfully', data: formattedResult });
          }
      });
  } catch (error) {
      console.log(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeetingData: ${error.message}`);
      res.status(500).json(error);
  }
};


exports.getMeetingInvitation = async (req, res) => {
  
  console.log(req.body)
   const meetingId = +req.body.meetingId
  try {
      // Make a request to the Zoom API to delete the meeting
      const zoomResponse = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}/invitation`, {
          headers: {
              'Authorization': `Bearer ${req.zoomAccessToken}`
          }
      });
      
      res.json({ msg: 'get meeting Invitation successfully',errorCode:"1",data:zoomResponse.data});
  } catch (error) {
    console.log(error)
      console.error(`Error in /controller/virtualMeetCont/getMeetingInvitation: ${error.message}`);
      res.status(500).json({
          errorCode: "",
          errorDetail: error.message,
          responseData: {},
          status: "ERROR",
          details: "An internal server error occurred",
          getMessageInfo: "An internal server error occurred"
      });
  }
};

exports.getMeetingType = async (req,res)=>{
    
  const request = new sql.Request();

    request.input('y', sql.VarChar,"Y");
    request.input('code', sql.VarChar,"METTYPE");

  

    const query = `SELECT BasicId, Code, Description from Basic_Mst where Status = @y
     and IdentifierCode = @code order by DisplayOrder;`
    
    try {

         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/virtualMeetCont/getMeetingType: ${err.message}. SQL query: ${query}`);
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

                logger.info('Meeting Type get successfully');
                res.status(200).json({ message: 'Fetch Meeting Type successfully', errorCode:"1", data: result.recordset });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeetingType: ${error.message}`);
      res.status(500).json(error);
    }
}

exports.getMessageType = async (req,res)=>{
    
  const request = new sql.Request();

    request.input('y', sql.VarChar,"Y");
    request.input('code', sql.VarChar,"MSGTYPE");

  

    const query = `SELECT BasicId, Code, Description from Basic_Mst where Status = @y
     and IdentifierCode = @code order by DisplayOrder;`
    
    try {

         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/virtualMeetCont/getMessageType: ${err.message}. SQL query: ${query}`);
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

                logger.info('Meessage Type get successfully');
                res.status(200).json({ message: 'Fetch Meessage Type successfully', errorCode:"1", data: result.recordset });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/virtualMeetCont/getMessageType: ${error.message}`);
      res.status(500).json(error);
    }
}


exports.getMeetingTime = async (req, res) => {
  try {
    // Define meeting time options
    const meetingTime = [
      { mtid: 1, desc: "15 min", min: 15 },
      { mtid: 2, desc: "30 min", min: 30 },
      { mtid: 3, desc: "40 min", min: 40 }, // Fixed typo "40 hour" to "40 min"
      { mtid: 4, desc: "1 hour", min: 60 },
      { mtid: 5, desc: "2 hours", min: 120 },
      { mtid: 6, desc: "3 hours", min: 180 },
      { mtid: 7, desc: "4 hours", min: 240 },
      { mtid: 8, desc: "4 hours", min: 240 },
      { mtid: 9, desc: "4 hours", min: 240 },
      { mtid: 10, desc: "4 hours", min: 240 },

    ];

    // Log success message
    logger.info("Meeting time data fetched successfully");

    // Send response
    return res.status(200).json({
      message: "Fetched meeting time successfully",
      errorCode: "1",
      data: meetingTime,
    });
  } catch (error) {
    logger.error(`Error in /controller/virtualMeetCont/getMeetingTime: ${error.message}`);
    return res.status(500).json({
      errorCode: "500",
      errorDetail: error.message,
      status: "ERROR",
      details: "An internal server error occurred",
    });
  }
};






