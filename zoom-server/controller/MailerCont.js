const nodemailer = require("nodemailer");
const path = require("path");
const { cwd } = process;

exports.SendMail = async (req,res)=>{

    const {email,meetingId,passcode,murl,url,title,eventStartDate,eventEndDate} = req.body;
    const filename = req.file && req.file.filename ? req.file.filename : null;
    console.log("till hereee",req.body)
    try {

        const transporter = nodemailer.createTransport({  
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            secureConnection: true,

            auth: {
                user:'dhananjaydhoke33@gmail.com',
                pass:'qetkjtijntaeatdt'
                //pass:'zszcolqkeqlptagp'
            },
            tls:{
                rejectUnauthorized:true
            }
          
        });
        
        let mailOptions;
        if(filename){
            mailOptions = {
               from:'dhananjaydhoke33@gmail.com',
               to: email,
               subject:"Meeting Details",
               html: `
                     <p> <strong>This is Meeting Details template by Netcast Service </strong></p>
                     <p><strong>Meeting Title :</strong> ${title},</p>
                     <p><strong>Meeting Start Date :</strong> ${eventStartDate},</p>
                     <p><strong>Meeting End Date :</strong> ${eventEndDate},</p>
                     <p><strong>Zoom Url :</strong> ${url},</p>
                     ${murl && murl !== 'null' ? `<p><strong>Meeting Url :</strong> ${murl},</p>` : ''}
                     <p><strong>Meeting Id :</strong> ${meetingId},</p>
                     <p><strong>Meeting Passcode :</strong> ${passcode},</p>
                     
                     <br>
         
                     <br>
                     <p>Thanks and regards,</p>
                     <p>Netcast Services</p>
                     <p>Mo. 8751256589</p>
                   `,
    
               attachments:[
                   {   // data uri as an attachment
                       path:path.join(cwd(), 'uploads', filename),
                       filename: filename
                   }
               ]
           }

        }
        else{
            mailOptions = {
                from:'dhananjaydhoke33@gmail.com',
                to: email,
                subject:"Meeting Details",
                html: `
                      <p> <strong>This is Meeting Details template by Netcast Service </strong></p>
                      <p><strong>Meeting Title :</strong> ${title},</p>
                      <p><strong>Meeting Start Date :</strong> ${eventStartDate},</p>
                      <p><strong>Meeting End Date :</strong> ${eventEndDate},</p>
                     <p><strong>Zoom Url :</strong> ${url},</p>
                     ${murl && murl !== 'null' ?  `<p><strong>Meeting Url :</strong> ${murl},</p>` : ''}
                      <p><strong>Meeting Id :</strong> ${meetingId},</p>
                      <p><strong>Meeting Passcode :</strong> ${passcode},</p>
                      
                      <br>
          
                      <br>
                      <p>Thanks and regards,</p>
                      <p>Netcast Services</p>
                      <p>Mo. 8751256589</p>
                    `,

            }
        }
         

        transporter.sendMail(mailOptions, function(error, info){ 
            if (error){
                throw Error(error);
            } 
            else{
                res.status(201).json({message:'email send sucsessfully',errorCode:'1'})
            }
               
        });
        
    } catch (error) {
       res.send(error) 
    }
}

// working code
exports.SendMailForPhysical = async (req,res)=>{

    const {email,title,eventStartDate,eventEndDate,eventLocation} = req.body;
    const filename = req.file && req.file.filename ? req.file.filename : null;
    //console.log("till hereee",req.body)
    try {

        const transporter = nodemailer.createTransport({  
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            secureConnection: true,

            auth: {
                user:'dhananjaydhoke33@gmail.com',
                pass:'qetkjtijntaeatdt'
                //pass:'zszcolqkeqlptagp'
            },
            tls:{
                rejectUnauthorized:true
            }
          
        });
        
        let mailOptions;
        if(filename){
            mailOptions = {
               from:'dhananjaydhoke33@gmail.com',
               to: email,
               subject:"Meeting Details",
               html: `
                     <p> <strong>This is Meeting Details template by Netcast Service </strong></p>
                     <p><strong>Meeting Title :</strong> ${title},</p>
                     <p><strong>Meeting Start Date :</strong> ${eventStartDate},</p>
                     <p><strong>Meeting End Date :</strong> ${eventEndDate},</p>
                     <p><strong>Meeting Location :</strong> ${eventLocation},</p>
                     
                     <br>
         
                     <br>
                     <p>Thanks and regards,</p>
                     <p>Netcast Services</p>
                     <p>Mo. 8751256589</p>
                   `,
    
               attachments:[
                   {   // data uri as an attachment
                       path:path.join(cwd(), 'uploads', filename),
                       filename: filename
                   }
               ]
              
           }

        }
        else{
            mailOptions = {
                from:'dhananjaydhoke33@gmail.com',
                to: email,
                subject:"Meeting Details",
                html: `
                      <p> <strong>This is Meeting Details template by Netcast Service </strong></p>
                      <p><strong>Meeting Title :</strong> ${title},</p>
                      <p><strong>Meeting Start Date :</strong> ${eventStartDate},</p>
                      <p><strong>Meeting End Date :</strong> ${eventEndDate},</p>
                      <p><strong>Meeting Location :</strong> ${eventLocation},</p>
                      
                      <br>
          
                      <br>
                      <p>Thanks and regards,</p>
                      <p>Netcast Services</p>
                      <p>Mo. 8751256589</p>
                    `,

            }
        }
         

        transporter.sendMail(mailOptions, function(error, info){ 
            if (error){
                throw Error(error);
            } 
            else{
                res.status(201).json({message:'email send sucsessfully',errorCode:'1'})
            }
               
        });
        
    } catch (error) {
       res.send(error) 
    }
}


// exports.SendMailForPhysical = async (req,res)=>{

//     const {email,title,eventStartDate,eventEndDate,eventLocation} = req.body;
//     const filename = req.file && req.file.filename ? req.file.filename : null;
//     console.log("till hereee",req.body)
//     try {

//         const transporter = nodemailer.createTransport({  
//             service: 'gmail',
//             host: 'smtp.gmail.com',
//             port: 465,
//             secure: true,
//             secureConnection: true,

//             auth: {
//                 user:'dhananjaydhoke33@gmail.com',
//                 pass:'qetkjtijntaeatdt'
//                 //pass:'zszcolqkeqlptagp'
//             },
//             tls:{
//                 rejectUnauthorized:true
//             }
          
//         });
        
//         let mailOptions;
//         if(filename){
//             mailOptions = {
//                from:'dhananjaydhoke33@gmail.com',
//                to: email,
//                subject:"Meeting Details",
//                html: `
//                      <p> <strong>This is Meeting Details template by Netcast Service </strong></p>
//                      <p><strong>Meeting Title :</strong> ${title},</p>
//                      <p><strong>Meeting Start Date :</strong> ${eventStartDate},</p>
//                      <p><strong>Meeting End Date :</strong> ${eventEndDate},</p>
//                      <p><strong>Meeting Location :</strong> ${eventLocation},</p>
                     
//                      <br>
         
//                      <br>
//                      <p>Thanks and regards,</p>
//                      <p>Netcast Services</p>
//                      <p>Mo. 8751256589</p>
//                    `,
    
//                attachments: [
//                 {
//                     filename: 'qrcode.png',
//                     content: image.split(';base64,').pop(),
//                     encoding: 'base64'
//                 }
//             ]
//            }

//         }
//         else{
//             mailOptions = {
//                 from:'dhananjaydhoke33@gmail.com',
//                 to: email,
//                 subject:"Meeting Details",
//                 html: `
//                       <p> <strong>This is Meeting Details template by Netcast Service </strong></p>
//                       <p><strong>Meeting Title :</strong> ${title},</p>
//                       <p><strong>Meeting Start Date :</strong> ${eventStartDate},</p>
//                       <p><strong>Meeting End Date :</strong> ${eventEndDate},</p>
//                       <p><strong>Meeting Location :</strong> ${eventLocation},</p>
                      
//                       <br>
          
//                       <br>
//                       <p>Thanks and regards,</p>
//                       <p>Netcast Services</p>
//                       <p>Mo. 8751256589</p>
//                     `,
//                     attachments: [
//                         {
//                             filename: 'qrcode.png',
//                             content: image.split(';base64,').pop(),
//                             encoding: 'base64'
//                         }
//                     ]
//             }
//         }
         

//         transporter.sendMail(mailOptions, function(error, info){ 
//             if (error){
//                 console.log(error)
//                 throw Error(error);
//             } 
//             else{
//                 res.status(201).json({message:'email send sucsessfully',errorCode:'1'})
//             }
               
//         });
        
//     } catch (error) {
//        res.send(error) 
//     }
// }