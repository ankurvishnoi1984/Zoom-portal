const sql = require('mssql');
const express = require('express');
const app = express();
const { DateTime } = require('luxon');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require("path");
const { join } = require('path');
const { createWriteStream } = require('fs');
const querystring = require('querystring');

const helmet = require('helmet')

app.use(cors());


app.use(express.json()) 
app.use(helmet())
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
helmet({
  crossOriginResourcePolicy: false,
})

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

const PhysicalMeetRoute = require('./routes/physicalMeetRoute')
const VirtualMeetRoute = require('./routes/virtualMeetRoute')
const GenralRoute = require('./routes/globalRoute')
const AuthenticateRoute = require('./routes/authenticateRoute')
const SpeakerDetlRoute = require('./routes/speakerDetlRoute');
const FormRoute = require('./routes/fromRoute')
const PosterRoute = require('./routes/posterSelectRoute')
const AdminRoutes = require('./routes/adminRoutes')


const { connectToDatabase } = require('./config/dbConnection');
const { addSpeaker, updateSpeaker } = require('./controller/speakerDetlCont');
// const { appendSheet } = require('./config/googleSheet');

// multer configuration


const uploadsfile = path.join(__dirname, "./uploads/speaker");
app.use("/uploads/speaker",express.static(uploadsfile));


const posterImage = path.join(__dirname, "./uploads/poster");
app.use("/uploads/poster",express.static(posterImage));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,"./uploads"))
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now()+ Math.random().toString();
      cb(null, file.originalname)
    }
  })

  // file filter to set image type
const imageFilter = function (req, file, cb) {
  console.log("fldjsfkj",file);
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG files are allowed."), false);
  }
};


  // storage for speaker image upload 

  const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,"./uploads/speaker"))
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now()+ Math.random().toString();
      cb(null, uniquePrefix+file.originalname)
    }
  })

  const upload1 = multer({ storage: storage1,  limits:{fieldSize:1024*1024*5}})
  
  const upload = multer({ storage: storage ,  limits:{fieldSize:1024*1024*5}})


// All Routes

app.use('/physicalMeeting',PhysicalMeetRoute);
app.use('/virtualMeet', VirtualMeetRoute)

app.use('/genral',upload.single('image'), GenralRoute)

app.use('/auth',AuthenticateRoute)

app.use('/speaker', SpeakerDetlRoute)

app.use("/form",FormRoute)
app.use("/poster",PosterRoute)
app.use('/admin', AdminRoutes)


// routes with image upload 

app.post('/speaker/addSpeaker', upload1.single('image'),addSpeaker);
app.patch('/speaker/updateSpeaker/:id',upload1.single('image'),updateSpeaker)

// app.get('/', function (req, res) {
   
//     var sql = require("mssql");

//     // config for your database
//     var config = {
//         user: 'dhananjay',
//         password: 'test',
//         server: 'DESKTOP-JOBSO4H\\SQLEXPRESS', 
//         database: 'TestDB',
//         port:1433,
//         options: {
//             encrypt: true,
//             trustServerCertificate: true, // Add this line
//           }, 
//     };

//     // connect to your database
//     sql.connect(config, function (err) {
    
//         if (err) console.log(err);

//         // create Request object
//         var request = new sql.Request();
           
//         // query to the database and get the records
//         request.query('select * from test_table', function (err, recordset) {
            
//             if (err) console.log("inside error",err)

//             // send records as a response
//             res.send(recordset);
            
//         });
//     });
// });



// const generateZoomAccessToken = async(req, res, next) => {
      
//     console.log("inside genrate token",req.body)
//     let clientId;
//     let clientSecret;
//     let account_id;
//     if(req.body.hostId=='JisF5lPDS-KmvRZyjZJpsg'){
//       clientId = 'QOl4K_fVQjmiMRFM7GZVmA';
//       clientSecret = 'FgnJKucg3hKRe2qBRbp6AelGLu0PQYV4';
//       account_id = 'JoDFYK7KTnqqFAoeTnVtog'
//     }
//     else if(req.body.hostId =="HsfQ5vNsSoSgNbDhjHkWCg"){

//         clientId = 'F7SjQUPuQ_GQVSZt8APJZA';
//         clientSecret = 'GS6647LvZ2qOY3vCia6gYepTks9f2ivo';
//         account_id = 'ZylnKw9ARbiwIs8V8mLtrA'
//     }
//     else{
//         clientId = 'QOl4K_fVQjmiMRFM7GZVmA';
//         clientSecret = 'FgnJKucg3hKRe2qBRbp6AelGLu0PQYV4';
//         account_id = 'JoDFYK7KTnqqFAoeTnVtog' 
//     }
//     //const clientId = 'QOl4K_fVQjmiMRFM7GZVmA'; // Replace with your Zoom app's Client ID
//     //const clientSecret = 'FgnJKucg3hKRe2qBRbp6AelGLu0PQYV4'; // Replace with your Zoom app's Client Secret
    
//     // Define the Zoom OAuth token endpoint
//     const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${account_id}`;
    
//     // Create a Base64-encoded string for HTTP Basic Authentication
//     const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    
//     // Define the data to be sent in the request body
//     const requestData = querystring.stringify({
//       // Include any additional parameters as needed
//       // ...
//     });
    
//     // Define the headers for the POST request
//     const headers = {
//       'Authorization': authHeader,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     };
    
  
//       try {
//         // Send a POST request to the Zoom OAuth token endpoint
//         const response = await axios.post(tokenUrl, requestData, { headers });
    
//         // Extract the access token from the response
//         //console.log(response.data)
//         const accessToken = response.data.access_token;
//         req.zoomAccessToken = accessToken;
//         //console.log('Access Token:', accessToken);
    
//         // Handle the access token and use it for API requests
//         // ...
//       } catch (error) {
//         console.error('Error getting access token:', error);
//       }

//     next();
//   };


app.get('/', async (req, res) => {
    await connectToDatabase();

    const request = new sql.Request();
    request.query('SELECT * FROM account_id_mst', (err, recordset) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.send(recordset);
    });
});

// app.post('/createZoomMeeting', async (req, res) => {
    
//     await connectToDatabase();

//     const request = new sql.Request();
//     const inputDateTime = req.body.start_time;
   
//       // console.log(req.body)
//       const {topic,duration,start_time} = req.body
   
//     const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
//     //req.body.start_time = formattedDateTime;
   
   
//     console.log("inside createmetting",formattedDateTime)
//    // req.body.timezone = 'UTC'
//    // console.log(req.body)
//    // console.log(formattedDateTime);
//    // const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'Asia/Calcutta' }).toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
//    //   req.body.start_time = formattedDateTime;
//      req.body.timezone = 'Asia/Calcutta';
//      console.log(req.body);
   
//        try {
//          const zoomResponse = await axios.post(
//            'https://api.zoom.us/v2/users/me/meetings',
//            {topic,duration,start_time:formattedDateTime,timezone: 'Asia/Calcutta'}, // Pass any request data from your frontend
//            {
//              headers: {
//                'Authorization': `Bearer ${req.zoomAccessToken}`,
//                'Content-Type': 'application/json',
//              },
//            }
//          );
     
//    const mdata = zoomResponse.data;
   
//    const luxonDateTime = DateTime.fromISO(formattedDateTime, { zone: 'Asia/Calcutta' });
   
//    // Add 20 minutes
//    const updatedDateTime = luxonDateTime.plus({ minutes: mdata.duration });
   
//    // Convert the updated time back to a string in the same time zone
//    const updatedTime = updatedDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss");
   
//    //console.log("Updated time:", mdata); 
   
//          //const query = 'insert into account_meeting_mst (meeting_date,account_id) values (?,?)'
        
   
//          request.input('title', sql.VarChar, mdata.topic);
//          request.input('sdate', sql.DateTime, formattedDateTime);
//          request.input('edate', sql.DateTime, updatedTime);
//          request.input('hostId', sql.VarChar, mdata.host_id);
//          request.input('duration', sql.Int, mdata.duration);


//          const query = 'insert into meetingDetails (title,sdate,edate,hostId,duration) values (@title, @sdate, @edate, @hostId, @duration)'
//           try {
//              request.query(query,(err,result)=>{
//                if(err){
//                    console.log(err)
//                    res.send(err);
//                }
//                else{
//                    res.send({
//                        message:"meeting created",
//                        errorCode:"1"
//                    })
//                }
//              })
//           } catch (error) {
//            console.log(error)
//            res.send(error)
//           }
//        } catch (error) {
//          console.error(error);
//          res.status(500).json({ error: 'Failed to create a Zoom meeting' ,error});
//        }
//      });


// app.post('/checkDate', async(req,res)=>{
//         //const {meetingDate} = req.body;
//         await connectToDatabase();

//         const request = new sql.Request();
//         console.log(req.body);
//         const inputDateTime = req.body.meetingDate;
    
//         const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
        
    
//        // const  acid = 'JisF5lPDS-KmvRZyjZJpsg';
//         //const query = 'select * from account_meeting_mst where meeting_date = ? and account_id=?'
//          console.log("insdie check date",formattedDateTime)
         
//         const query = 'SELECT DISTINCT hostId FROM meetingDetails WHERE @formattedDateTime BETWEEN sdate AND edate'
//         console.log('error start')
//         try {
//             request.input('formattedDateTime', sql.DateTime, formattedDateTime);
//             request.query(query,(err,result)=>{
//                 if(err){
//                     console.log("iside error",err)
//                     res.send({
//                         message:err,
//                         errorCode:'0'
//                     })
//                 }
//                 else{
//                     // console.log(result)
//                     // if(result.length===0){
//                     //     res.send({
//                     //         message:"no account found for meeting",
//                     //         errorCode:'0'
//                     //     }) 
//                     // }
//                     // else{
//                     //     res.send({
//                     //         data:result,
//                     //         message:"sucsess",
//                     //         errorCode:'1'
//                     //     })
//                     // }
//                     console.log("inside function",result)
//                     const arr = [];
//                     result.recordset.forEach((e)=> arr.push(e.hostId));
//                   console.log("isn",arr)
//                   let aquery;
//                   if(result.length==0){
//                     aquery = 'select * from account_id_mst';
//                   }
//                   else{
    
//                      //aquery = `select * from account_id_mst where account_id NOT IN (?)`;
//                      const placeholders = arr.map(() => '?').join(',');
//                     aquery = `select * from account_id_mst where account_id NOT IN (${placeholders})`;
//                     // console.log("inside a query",aquery)
                     
//                   }
//                     try {
//                         request.query(aquery,arr,(err,result1)=>{
//                           if(err){
//                               console.log(err)
//                               res.send(err);
//                           }
//                           else{
//                             console.log("both inside",aquery)
//                             console.log("result",result1)
    
//                             if(result1.length==0){
//                                 res.send({
                                    
//                                     message:"all account have meeting",
//                                     errorCode:'0'
//                                 })
//                             }
//                             else{
//                                 res.send({
//                                     data:result1,
//                                     message:"sucsess",
//                                     errorCode:'1'
//                                 })
//                             }
//                           }
//                         })
//                      } catch (error) {
//                       console.log(error)
//                       res.send(error)
//                      }
                    
//                 }
//             })
//         } catch (error) {
//             res.send(error)
//         }
//     })    

// app.post('/checkDate', async (req, res) => {
   

//     const request = new sql.Request();
//     console.log(req.body);
//     const inputDateTime = req.body.meetingDate;

//     const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");

//     const query = 'SELECT DISTINCT hostId FROM meetingDetails WHERE @formattedDateTime BETWEEN sdate AND edate';
//     console.log("inside check date", formattedDateTime);

//     try {
//         request.input('formattedDateTime', sql.DateTime, formattedDateTime);
//         request.query(query, async (err, result) => {
//             if (err) {
//                 console.log("inside error", err);
//                 res.send({
//                     message: err,
//                     errorCode: '0'
//                 });
//             } else {
//                 console.log("inside function", result);
//                 const arr = result.recordset.map(e => e.hostId);
//                 console.log("isn", arr);

//                 let aquery;

//                 if (arr.length === 0) {
//                     aquery = 'select * from account_id_mst';
//                 } else {
//                     const placeholders = arr.map(() => '?').join(',');
//                     console.log('placeholder',placeholders)
//                     aquery = `select * from account_id_mst where account_id NOT IN (${placeholders})`;
//                 }

//                 try {
//                     const result1 = await request.query(aquery, arr);
//                     console.log("both inside", aquery);
//                     console.log("result", result1);

//                     if (result1.recordset.length === 0) {
//                         res.send({
//                             message: "all account have a meeting",
//                             errorCode: '0'
//                         });
//                     } else {
//                         res.send({
//                             data: result1.recordset,
//                             message: "success",
//                             errorCode: '1'
//                         });
//                     }
//                 } catch (error) {
//                     console.log(error);
//                     res.send(error);
//                 }
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         res.send(error);
//     }
// });


// app.post('/checkDate', async (req, res) => {
//   const request = new sql.Request();
//   console.log("inside meeting check",req.body);
//   const inputDateTime = req.body.meetingDate;

//   const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
//   console.log("inside check date",formattedDateTime)
//   request.input("formattedDateTime", sql.VarChar, formattedDateTime)
//   request.input('y', sql.VarChar, "Y");

//   const query = 'SELECT DISTINCT AccountId FROM Webcast_Webinar_Mst WHERE @formattedDateTime BETWEEN start_date AND end_date AND Status = @y';

//   try {
//     const result = await request.query(query, { formattedDateTime });
      
//     console.log("result",result)
//     if (result.recordset.length === 0) {

//       const query1 = 'select * from zoom_ac_dtl where Status = @y';

//       const result1 =  await request.query(query1)
//       // No meetings found for the given date
//       res.send({ message: 'No meetings found for this date.', errorCode: '1',data:result1.recordset });
//     } else {
//       const AccountIds = result.recordset.map(row => row.AccountId);

//       console.log("host id", AccountIds);
//       const placeholders = AccountIds.map((_, index) => `@id${index}`).join(',');

//       // Build and execute the second query
//       const aquery = `SELECT * FROM zoom_ac_dtl
//                       WHERE Account_id NOT IN (${placeholders}) and Status = @y`;

//       // Pass each hostId as a separate parameter
//       AccountIds.forEach((AccountId, index) => {
//         request.input(`id${index}`, sql.VarChar, AccountId);
//       });

//       const availableAccounts = await request.query(aquery);

//       if (availableAccounts.recordset.length === 0) {
//         // All accounts have meetings on this date
//         res.send({ message: 'All accounts have meetings on this date.', errorCode: '0' });
//       } else {
//         // Available accounts for the meeting
//         res.send({ message: 'Success', errorCode: '1', data: availableAccounts.recordset });
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     res.send({ message: 'Internal server error.', errorCode: '0' });
//   } 
// });
app.post('/checkDate', async (req, res) => {
  const request = new sql.Request();
  console.log(req.body);
  const inputDateTime = req.body.meetingDate;
  const deptId = req.body.deptId; 

  const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
  console.log("inside check date", formattedDateTime);

  request.input("formattedDateTime", sql.VarChar, formattedDateTime);
  request.input('y', sql.VarChar, "Y");

  const query = 'SELECT DISTINCT AccountId FROM Webcast_Webinar_Mst WHERE @formattedDateTime BETWEEN start_date AND end_date AND Status = @y';

  try {
    const result = await request.query(query);
    console.log("result", result);
    
    if (result.recordset.length === 0) {
    
      const query1 = 'SELECT * FROM zoom_ac_dtl WHERE Status = @y AND DeptId = @deptId';
      request.input('deptId', sql.Int, deptId ?? 0); 
      const result1 = await request.query(query1);
      res.send({ message: 'No meetings found for this date.', errorCode: '1', data: result1.recordset });
    } else {
      const AccountIds = result.recordset.map(row => row.AccountId);
      console.log("host id", AccountIds);
      const placeholders = AccountIds.map((_, index) => `@id${index}`).join(',');
      
      const aquery = `SELECT * FROM zoom_ac_dtl 
                      WHERE Account_id NOT IN (${placeholders}) AND Status = @y AND DeptId = @deptId`;
      
      AccountIds.forEach((AccountId, index) => {
        request.input(`id${index}`, sql.VarChar, AccountId);
      });
      request.input('deptId', sql.Int, deptId ?? 0); 
      
      const availableAccounts = await request.query(aquery);
      
      if (availableAccounts.recordset.length === 0) {
        res.send({ message: 'All accounts have meetings on this date.', errorCode: '0' });
      } else {
        res.send({ message: 'Success', errorCode: '1', data: availableAccounts.recordset });
      }
    }
  } catch (error) {
    console.error(error);
    res.send({ message: 'Internal server error.', errorCode: '0' });
  }
});



app.post('/checkUpdate/:id', async(req,res)=>{

  const request = new sql.Request();

  //const meetingId = req.params.id;
  const meetingId = req.body.meetingId;
  //console.log(req.body,meetingId);
  const inputDateTime = req.body.meetingDate;
  const hostId = req.body.hostId
  const formattedDateTime = DateTime.fromISO(inputDateTime, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
  console.log("formated date",formattedDateTime)


   request.input('formattedDateTime', sql.VarChar, formattedDateTime);
   request.input('meetingId', sql.VarChar, meetingId);
   request.input('hostId', sql.VarChar, hostId);
   request.input('y', sql.VarChar, "Y");


  const query = 'SELECT DISTINCT AccountId FROM Webcast_Webinar_Mst WHERE @formattedDateTime BETWEEN start_date AND end_date AND AccountId = @hostId AND NOT MeetingId = @meetingId AND Status = @y'
  try {
      
      request.query(query,(err,result)=>{
          if(err){
              res.send({
                  message:err,
                  errorCode:'0'
              })
          }
          else{
              
              if(result.recordset.length===0){
                  res.send({
                      message:"update the meeting",
                      errorCode:'1'
                  }) 
              }
              else{
                console.log(result)
                  res.send({
                      message:"Create meeting in another account",
                      errorCode:'2'
                  })
              }
            }  
      })
  } catch (error) {
      res.send(error)
  }
})


// calender sheduling logic

app.post('/generate-ics-file', (req, res) => {
  const { EventStartDateTime, EventEndDateTime, AttendeeUrl, Title } = req.body;
  const calData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${Title.replace(/,/g, '\\,')}`, // Escape commas
    `DTSTART:${EventStartDateTime}`,
    `DTEND:${EventEndDateTime}`,
    `LOCATION:${AttendeeUrl.replace(/,/g, '\\,')}`, // Escape commas
    `DESCRIPTION:${Title.replace(/,/g, '\\,')}`, // Escape commas
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n'); // Use CRLF for line breaks

   const filePath = join(__dirname, 'event.ics');

  // // Create and write the ICS file
  const stream = createWriteStream(filePath);
  stream.write(calData);
  stream.end();

  // res.json({ filePath });

  res.setHeader('Content-Type', 'text/calendar;charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=event.ics');

  
  res.send(calData);


});

app.post('/generate-google-calendar-url', (req, res) => {
  const { EventStartDateTime, EventEndDateTime, AttendeeUrl, Title, Name } = req.body;

  const formattedDate = `${EventStartDateTime}/${EventEndDateTime}`;
  // Construct the Google Calendar URL
  const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?dates=${formattedDate}&ctz=${"Asia/Kolkata"}&location=${encodeURIComponent(
    AttendeeUrl
  )}&text=${encodeURIComponent(Title)}&details=${encodeURIComponent(Name)}`;

  res.json({ calendarUrl });
});

app.post('/generate-yahoo-calendar-url', (req, res) => {
  const { EventStartDateTime, EventEndDateTime, AttendeeUrl, Title} = req.body;

  // Construct the Yahoo Calendar URL
  const calendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(
    Title
    )}&st=${EventStartDateTime}&et=${EventEndDateTime}&desc=${encodeURIComponent(
      Title
    )}&in_loc=${encodeURIComponent(AttendeeUrl)}`

  res.json({ calendarUrl });
});



app.post('/addData', async (req, res) => {
    const name =  "ajay"
    const email = "jay@gmail.com"
    const phone = "5452512585"

    // Add data to Google Sheets
    // await appendSheet('1W1jP6-wmjaqQKZ4__QxdO1PyQVmF3sjDmyXN70hUP_U', [name, email, phone]);

    res.status(200).json({ message: 'Data added successfully' });
  
});




// 404 Middleware
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});


const server = app.listen(5000, function () {
    console.log(`Server is running.. on port ${5000}`);
    connectToDatabase();
});