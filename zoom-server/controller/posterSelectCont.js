const sql = require('mssql');
const logger = require("../utils/logger");
const { DateTime } = require('luxon');

exports.getPoster = async (req, res) => {
    const {clientId,deptId,spkCount} = req.body
    const request = new sql.Request();

    request.input("clientId", sql.BigInt, clientId);
    request.input("deptId", sql.BigInt, deptId);
    request.input("spkCount", sql.Int , spkCount);


   const query = 'select poster_id, poster_name from Webcast_poster_mst where client_id = @clientId and dept_id = @deptId and Spk_Count = @spkCount'

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/posterSelectCont/getPoster: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               
                logger.info('get poster successfully');
                res.status(200).json({ message: 'Fetch poster successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/getPoster: ${error.message}`);
        res.status(500).json(error);
    }
};


exports.addPoster = async (req, res) => {
    const {pname,fkmid,fkpid,fkwcid} = req.body
    const request = new sql.Request();

    const now = DateTime.now();

    

    // Format the date using the desired format
    const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");

    request.input("pname", sql.VarChar, pname);
    request.input("fkmid", sql.BigInt, fkmid);
    request.input("fkpid", sql.BigInt, fkpid);
    request.input("fkwcid", sql.VarChar, fkwcid)
    request.input("createdDate", sql.VarChar, createdAt)


   const query = 'insert into Webcast_Poster_Mapping (poster_name,WcId,fk_mid,fk_pid,created_date) values(@pname,@fkwcid,@fkmid,@fkpid,@createdDate)'

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/posterSelectCont/addPoster: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               
                logger.info('add poster successfully');
                res.status(200).json({ message: 'Add poster successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/addPoster: ${error.message}`);
        res.status(500).json(error);
    }
};


exports.getPosterById = async (req, res) => {
     
    const fkid = req.params.id
    const request = new sql.Request();
   
    request.input("fkid", sql.BigInt, fkid);
  


   //const query = 'select pm_id, poster_name from Webcast_poster_mapping where fk_mid = @fkid'
   
   const query = `SELECT Webcast_Poster_Mst.client_id, Webcast_Poster_Mst.height, Webcast_Poster_Mst.width, Webcast_Poster_Mapping.fk_mid,
   Webcast_Poster_Mapping.fk_pid, Webcast_Poster_Mapping.poster_name from Webcast_Poster_Mst inner join Webcast_Poster_Mapping on
   Webcast_Poster_Mst.poster_id = Webcast_Poster_Mapping.fk_pid where Webcast_Poster_Mapping.fk_mid = @fkid;`
    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/posterSelectCont/getPosterById: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               
                logger.info('get poster by id successfully');
                res.status(200).json({ message: 'Fetch poster  by id successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/getPosterById: ${error.message}`);
        res.status(500).json(error);
    }
};


exports.getFieldByPosterId = async (req, res) => {
     
    const pid = req.body.pid
    const request = new sql.Request();
   
    request.input("pid", sql.BigInt, pid);
    request.input("y", sql.Char, 'Y')


   const query = 'select * from Webcast_Poster_Field where pid = @pid and status = @y order by displayorder'
   

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/posterSelectCont/getFieldByPosterId: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               
                logger.info('getFieldByPosterId successfully');
                res.status(200).json({ message: 'getFieldByPosterId successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/getFieldByPosterId: ${error.message}`);
        res.status(500).json(error);
    }
};



exports.getSpeakerFieldByPosterId = async (req, res) => {
     
    const pid = req.body.pid
    const request = new sql.Request();
   
    request.input("pid", sql.BigInt, pid);
    request.input("y", sql.Char, 'Y')


   const query = 'select * from Webcast_Poster_Speaker_Field where pid = @pid and status = @y order by displayorder'
   

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/posterSelectCont/getSpeakerFieldByPosterId: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               
                logger.info('getSpeakerFieldByPosterId successfully');
                res.status(200).json({ message: 'getSpeakerFieldByPosterId successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/getFieldByPosterId: ${error.message}`);
        res.status(500).json(error);
    }
};


// exports.updatePosterById = async (req, res) => {
     
//     const id = req.params.id
//     const request = new sql.Request();
//     const {pname,fkpid} = req.body;
   
//     request.input("fkmid", sql.BigInt, id);
//     request.input("fkpid", sql.BigInt, fkpid);
//     request.input("pname", sql.VarChar, pname);


//    const query = 'update Webcast_poster_mapping set poster_name=@pname, fk_pid = @fkpid where fk_mid = @fkmid'

//     try {
//         request.query(query, (err, result) => {
//             if (err) {
//                 logger.error(`Error in /controller/posterSelectCont/updatePosterById: ${err.message}. SQL query: ${query}`);
//                 return res.status(500).json({
//                     errorCode: "",
//                     errorDetail: err,
//                     responseData: {},
//                     status: "ERROR",
//                     details: "An internal server error occurred",
//                     getMessageInfo: "An internal server error occurred"
//                 });
//             } else {
               
//                 logger.info('update poster by id successfully');
//                 res.status(200).json({ message: 'update poster  by id successfully', errorCode:"1", data: result.recordset });
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         logger.error(`Error in /controller/posterSelectCont/UpdatePosterById: ${error.message}`);
//         res.status(500).json(error);
//     }
// };


exports.updatePosterById = async (req, res) => {
    const id = req.params.id;
    const request = new sql.Request();
    const { pname, fkpid,fkwcid } = req.body;


    const now = DateTime.now();
    // Format the date using the desired format
    const createdAt = now.toFormat("yyyy-MM-dd HH:mm:ss.SSS");

    request.input("fkmid", sql.BigInt, id);
    request.input("fkpid", sql.BigInt, fkpid);
    request.input("pname", sql.VarChar, pname);
    request.input("createdDate", sql.VarChar, createdAt)
    request.input("fkwcid", sql.VarChar, fkwcid)

    const checkExistingQuery = 'SELECT * FROM Webcast_poster_mapping WHERE fk_mid = @fkmid';

    try {
        // Check if a record with the specified fk_mid exists
        const existingRecord = await request.query(checkExistingQuery);

        if (existingRecord.recordset.length > 0) {
            // If a record exists, update it
            const updateQuery = 'UPDATE Webcast_poster_mapping SET poster_name = @pname, fk_pid = @fkpid WHERE fk_mid = @fkmid';

            request.query(updateQuery, (err, result) => {
                if (err) {
                    logger.error(`Error in /controller/posterSelectCont/updatePosterById: ${err.message}. SQL query: ${updateQuery}`);
                    return res.status(500).json({
                        errorCode: "",
                        errorDetail: err,
                        responseData: {},
                        status: "ERROR",
                        details: "An internal server error occurred",
                        getMessageInfo: "An internal server error occurred"
                    });
                } else {
                    logger.info('Update poster by id successfully');
                    res.status(200).json({ message: 'Update poster by id successfully', errorCode: "1", data: result.recordset });
                }
            });
        } else {
            // If no record exists, insert a new one

            const insertQuery = 'insert into Webcast_Poster_Mapping (poster_name,WcId,fk_mid,fk_pid,created_date) values(@pname,@fkwcid,@fkmid,@fkpid,@createdDate)'
            request.query(insertQuery, (err, result) => {
                if (err) {
                    logger.error(`Error in /controller/posterSelectCont/updatePosterById: ${err.message}. SQL query: ${insertQuery}`);
                    return res.status(500).json({
                        errorCode: "",
                        errorDetail: err,
                        responseData: {},
                        status: "ERROR",
                        details: "An internal server error occurred",
                        getMessageInfo: "An internal server error occurred"
                    });
                } else {
                    logger.info('Insert new poster successfully');
                    res.status(200).json({ message: 'Insert new poster successfully', errorCode: "1", data: result.recordset });
                }
            });
        }
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/UpdatePosterById: ${error.message}`);
        res.status(500).json(error);
    }
};

exports.getPosterPresent = async (req, res) => {
    const {deptId} = req.body
    const request = new sql.Request();

    
    request.input("deptId", sql.BigInt, deptId);
   


   const query = "select DISTINCT Spk_count from Webcast_poster_mst where dept_id = @deptId and Status = 'Y' ORDER BY Spk_Count"

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/posterSelectCont/getPosterPresent: ${err.message}. SQL query: ${query}`);
                return res.status(500).json({
                    errorCode: "",
                    errorDetail: err,
                    responseData: {},
                    status: "ERROR",
                    details: "An internal server error occurred",
                    getMessageInfo: "An internal server error occurred"
                });
            } else {
               
                logger.info('get getPosterPresent successfully');
                res.status(200).json({ message: 'Fetch posterPresent successfully', errorCode:"1", data: result.recordset });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error(`Error in /controller/posterSelectCont/getPosterPresent: ${error.message}`);
        res.status(500).json(error);
    }
};

