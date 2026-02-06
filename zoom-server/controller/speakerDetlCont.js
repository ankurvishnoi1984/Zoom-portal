const sql = require('mssql');
const { DateTime } = require('luxon');
const logger = require("../utils/logger");
const fs = require('fs')


exports.addSpeaker = async (req,res)=>{
    const {name,qualification,line1,line2,line3,fkmid,fkwcid} = req.body;
    const request = new sql.Request();
    const filename = req.file && req.file.filename ? req.file.filename : null;

    request.input("name", sql.VarChar, name)
    request.input("qualification", sql.VarChar, qualification)
    request.input("speakerImg",sql.VarChar, filename)
     request.input("line1", sql.VarChar, line1)
     request.input("line2", sql.VarChar, line2)
     request.input("line3", sql.VarChar, line3)
    request.input("fkmid", sql.Int, fkmid)
    request.input("fkwcid", sql.VarChar, fkwcid)



    const query = 'insert into Webcast_Speaker_Detail (WcId,SpkName,SpkDesignation,SpkImage,Bio1,Bio2,Bio3,fk_mid) values (@fkwcid,@name,@qualification,@speakerImg,@line1,@line2,@line3,@fkmid)'
    
    try {

         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/speakerDetl/addSpeaker: ${err.message}. SQL query: ${query}`);
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
              logger.info('Speaker Add Successfully')  
              res.status(201).json({msg:'Speaker Add Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/speakerDetl/addSpeaker: ${err.message}`);
        res.status(500).json(error);
    }
}


exports.getSpeaker = async (req, res) => {
    
    const request = new sql.Request();
    
    request.input('fkmid',sql.Int, req.params.fkmid);
    request.input("y", sql.VarChar, "Y");

    const query = 'SELECT  Id , SpkName, SpkImage, SpkDesignation,Bio1,Bio2,Bio3 FROM Webcast_Speaker_Detail where fk_mid = @fkmid and Status= @y';

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/speakerDetlCont/getSpeaker: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               

                logger.info('Speaker Details get successfully');
                res.status(200).json({ message: 'Fetch speaker successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/speakerDetlCont/getSpeaker: ${error.message}`);
        res.status(500).json(error);
    }
};


exports.getSpeakerById = async (req, res) => {
    
    const request = new sql.Request();

    request.input('id',sql.Int, req.params.id);
    request.input("y", sql.VarChar, "Y");
    const query = 'SELECT  Id , SpkName, SpkImage, SpkDesignation , Bio1,Bio2,Bio3 FROM Webcast_Speaker_Detail where Id = @id and Status= @y';

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/speakerDetlCont/getSpeakerById: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
                

                logger.info('Speaker with Id get successfully');
                res.status(200).json({ message: 'Fetch Speaker With Id successfully', errorCode:"1", data:result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/speakerDetlCont/getSpeakerById: ${error.message}`);
        res.status(500).json(error);
    }
};



exports.updateSpeaker = async (req,res)=>{
    const {name,qualification,line1,line2,line3,imgname} = req.body;
    const request = new sql.Request();
    const filename = req.file && req.file.filename ? req.file.filename : null;

    request.input("id", sql.Int, req.params.id)
    request.input("name", sql.VarChar, name)
    request.input("qualification", sql.VarChar, qualification)
    request.input("speakerImg",sql.VarChar, filename)
    request.input("line1", sql.VarChar, line1)
    request.input("line2", sql.VarChar, line2)
    request.input("line3", sql.VarChar, line3)

    if (filename) {
        
        fs.unlink(`./uploads/speaker/${imgname}`, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting image: ', unlinkErr);
          }
        });
    }
    
    let query;
    if(filename){

      query = 'update Webcast_Speaker_Detail set SpkName = @name, SpkDesignation = @qualification, SpkImage = @speakerImg, Bio1= @line1, Bio2 = @line2, Bio3 = @line3 where Id = @id'
    }
    else{
        query = 'update Webcast_Speaker_Detail set SpkName = @name, SpkDesignation = @qualification , Bio1= @line1, Bio2 = @line2, Bio3 = @line3  where Id = @id'

    }

    
    try {

         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/speakerDetl/UpdateSpeaker: ${err.message}. SQL query: ${query}`);
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
              logger.info('Speaker Update Successfully')  
              res.status(201).json({msg:'Speaker Update Successfully',errorCode:"1"})
            }
        })
        
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/speakerDetl/updateSpeaker: ${err.message}`);
        res.status(500).json(error);
    }
}


exports.deleteSpeaker = async (req,res)=>{
    
    const request = new sql.Request();

    const {imgname} = req.body;

   request.input('id', sql.Int, req.params.id);
   request.input("n", sql.VarChar, "N");
    //const query = 'delete from  Webcast_Speaker_Detail where Id = @id'
    
    const query = 'update Webcast_Speaker_Detail set Status=@n where Id = @id'
    try {

         request.query(query,(err,result)=>{
            if(err){
                logger.error(`Error in /controller/speakerDetlCont/deleteSpeaker: ${err.message}. SQL query: ${query}`);
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
                
              logger.info('Speaker Delete Successfully')  
              res.status(200).json({msg:'Speaker Delete Successfully',errorCode:"1"})
              fs.unlink(`./uploads/speaker/${imgname}`, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting image: ', unlinkErr);
                }
              });
            }
        })
        
    } catch (error) {
        logger.error(`Error in /controller/speakerDetlCont/deleteSpeaker: ${error.message}`);
        res.status(500).json(error);
    }
}


