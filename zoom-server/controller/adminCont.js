const sql = require('mssql');
const logger = require('../utils/logger')
const { DateTime } = require('luxon');
const { roleData } = require('../utils/constant');

exports.UserLogin = async (req, res) => {
    const { username, password } = req.body;
    const request = new sql.Request();

    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);

    //const query = 'select username, password, userid from [user_mst] where username = @username  and password = @password';
     
    const query = `SELECT username, password, adminId, roleId,clientId,departmentId
    FROM admin_mst
    WHERE username = @username AND password = @password AND status = 'Y'`

    try {
        request.query(query, (err, result) => {
            if (err) {
                logger.error(`Error in /controller/adminCont/UserLogin: ${err.message}. SQL query: ${query}`);
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
                return res.json({
                    errorCode: "1",
                    errorDetail: "",
                    responseData: {
                        message: "Login successful",
                        userId: result?.recordset[0]?.adminId,
                        roleCode: result?.recordset[0]?.roleId,
                        clientCode: result?.recordset[0]?.clientId,
                        departmentCode: result?.recordset[0]?.departmentId,

                    },
                    status: "SUCCESS",
                    details: "",
                    getMessageInfo: ""
                });
            }
        });
    } catch (error) {
        logger.error(`Error in /controller/adminCont/UserLogin: ${error.message}.`);
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


exports.getAllMeetingCounts = async (req, res) => {
    const { sdate, edate, filterBy,roleId,clientId,departmentId} = req.body;
    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    const request = new sql.Request();
    
    const currentDateTime = DateTime.now();
    const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    request.input('event', sql.VarChar, 'EVTVIRTUAL');
    request.input('y', sql.VarChar, 'Y');
    request.input('formattedDate', sql.VarChar, formattedDateTime);
    request.input('sdate', sql.VarChar, start);
    request.input('edate', sql.VarChar, end);
    request.input('clientId', sql.VarChar, clientId);
    request.input('departmentId', sql.VarChar, departmentId);

    

    let totalMeetingQuery, totalUpcomingMeetingQuery, totalCompletedMeetingQuery;
    
    if(roleId == roleData.sRole){
        if (start && end) {
            totalMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE Webcast_Mst.EventStartDateTime BETWEEN @sdate AND @edate 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalUpcomingMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate < Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.EventStatus = @y 
                AND Webcast_Mst.EventStartDateTime BETWEEN @sdate AND @edate`;
    
            totalCompletedMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalCompletedMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate > Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.EventStatus = @y 
                AND Webcast_Mst.EventEndDateTime BETWEEN @sdate AND @edate`;
        } else {
            totalMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE Webcast_Mst.eventType = @event 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalUpcomingMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate < Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalCompletedMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalCompletedMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate > Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.EventStatus = @y`;
        }
    }
    else if(roleId == roleData.dRole){
        if (start && end) {
            totalMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE Webcast_Mst.EventStartDateTime BETWEEN @sdate AND @edate 
                AND Webcast_Mst.eventType = @event
                AND Webcast_Mst.DeptId = @departmentId 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalUpcomingMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate < Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.DeptId = @departmentId 
                AND Webcast_Mst.EventStatus = @y 
                AND Webcast_Mst.EventStartDateTime BETWEEN @sdate AND @edate`;
    
            totalCompletedMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalCompletedMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate > Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event
                AND Webcast_Mst.DeptId = @departmentId 
                AND Webcast_Mst.EventStatus = @y 
                AND Webcast_Mst.EventEndDateTime BETWEEN @sdate AND @edate`;
        } else {
            totalMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE Webcast_Mst.eventType = @event 
                AND Webcast_Mst.DeptId = @departmentId 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalUpcomingMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate < Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event
                AND Webcast_Mst.DeptId = @departmentId 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalCompletedMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalCompletedMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate > Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.DeptId = @departmentId 
                AND Webcast_Mst.EventStatus = @y`;
        } 
    }
    else{
        if (start && end) {
            totalMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE Webcast_Mst.EventStartDateTime BETWEEN @sdate AND @edate 
                AND Webcast_Mst.eventType = @event
                AND Webcast_Mst.ClientCode = @clientId 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalUpcomingMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate < Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.ClientCode = @clientId
                AND Webcast_Mst.EventStatus = @y 
                AND Webcast_Mst.EventStartDateTime BETWEEN @sdate AND @edate`;
    
            totalCompletedMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalCompletedMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate > Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event
                AND Webcast_Mst.ClientCode = @clientId 
                AND Webcast_Mst.EventStatus = @y 
                AND Webcast_Mst.EventEndDateTime BETWEEN @sdate AND @edate`;
        } else {
            totalMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE Webcast_Mst.eventType = @event 
                AND Webcast_Mst.ClientCode = @clientId
                AND Webcast_Mst.EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalUpcomingMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate < Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event
                AND Webcast_Mst.ClientCode = @clientId 
                AND Webcast_Mst.EventStatus = @y`;
    
            totalCompletedMeetingQuery = `
                SELECT COALESCE(COUNT(*), 0) AS totalCompletedMeeting 
                FROM Webcast_Mst 
                INNER JOIN Webcast_Webinar_Mst ON Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
                WHERE @formattedDate > Webcast_Mst.EventEndDateTime 
                AND Webcast_Mst.eventType = @event 
                AND Webcast_Mst.ClientCode = @clientId
                AND Webcast_Mst.EventStatus = @y`;
        }
    }
    

    try {
        // Execute all queries in parallel
        const [totalMeetingResult, totalUpcomingMeetingResult, totalCompletedMeetingResult] = await Promise.all([
            request.query(totalMeetingQuery),
            request.query(totalUpcomingMeetingQuery),
            request.query(totalCompletedMeetingQuery),
        ]);

        // Extract the counts from results
        const totalMeeting = totalMeetingResult.recordset[0].totalMeeting;
        const totalUpcomingMeeting = totalUpcomingMeetingResult.recordset[0].totalUpcomingMeeting;
        const totalCompletedMeeting = totalCompletedMeetingResult.recordset[0].totalCompletedMeeting;

        logger.info('All meeting counts fetched successfully');

        return res.status(200).json({
            msg: 'All Meeting Counts Fetched Successfully',
            errorCode: "1",
            data: {
                totalMeeting,
                totalUpcomingMeeting,
                totalCompletedMeeting,
            }
        });
    } catch (error) {
        logger.error(`Error in /controller/adminCont/getAllMeetingCounts: ${error.message}`);
        return res.status(500).json({
            errorCode: "",
            errorDetail: error.message,
            responseData: {},
            status: "ERROR",
            details: "An internal server error occurred",
            getMessageInfo: "An internal server error occurred"
        });
    }
};



exports.getAllPhysicalMeetingCounts = async (req, res) => {
    const { sdate, edate, filterBy,roleId,clientId,departmentId} = req.body;

    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    const request = new sql.Request();
    
    const currentDateTime = DateTime.now();
    const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    request.input('event', sql.VarChar, 'EVTPHYSICAL');
    request.input('y', sql.VarChar, 'Y');
    request.input('formateddate', sql.VarChar, formattedDateTime);
    request.input('sdate', sql.VarChar, start);
    request.input('edate', sql.VarChar, end);
    request.input('clientId', sql.VarChar, clientId);
    request.input('departmentId', sql.VarChar, departmentId);
    

    let totalMeetingQuery, totalUpcomingMeetingQuery, totalCompletedMeetingQuery;
    
    if(roleId == roleData.sRole){
        if (start && end) {
            totalMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst
                where EventStartDateTime between @sdate and @edate 
                and EventType = @event and EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst 
                where @formateddate < EventEndDateTime and EventStatus = @y 
                and EventStartDateTime between @sdate and @edate`;
    
            totalCompletedMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst
                 where @formateddate > EventEndDateTime and eventType = @event 
                 and EventStatus = @y and EventEndDateTime between @sdate and @edate`;
        } else {
            totalMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst 
                where eventType = @event and EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
               select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst 
               where @formateddate < EventEndDateTime and eventType = @event 
               and EventStatus = @y`;
    
            totalCompletedMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst 
                where @formateddate > EventEndDateTime and eventType = @event and EventStatus = @y`;
        }
    }

    else if(roleId == roleData.dRole){
        if (start && end) {
            totalMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst
                where EventStartDateTime between @sdate and @edate 
                and EventType = @event AND Webcast_Mst.DeptId = @departmentId  and EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst 
                where @formateddate < EventEndDateTime and EventStatus = @y 
                 AND Webcast_Mst.DeptId = @departmentId and EventStartDateTime between @sdate and @edate`;
    
            totalCompletedMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst
                 where @formateddate > EventEndDateTime and eventType = @event 
                 and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and EventEndDateTime between @sdate and @edate`;
        } else {
            totalMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst 
                where eventType = @event AND Webcast_Mst.DeptId = @departmentId and EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
               select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst 
               where @formateddate < EventEndDateTime and eventType = @event 
               AND Webcast_Mst.DeptId = @departmentId and EventStatus = @y`;
    
            totalCompletedMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst 
                where @formateddate > EventEndDateTime and eventType = @event AND Webcast_Mst.DeptId = @departmentId and EventStatus = @y`;
        }
    }

    else{
        if (start && end) {
            totalMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst
                where EventStartDateTime between @sdate and @edate 
                and EventType = @event AND Webcast_Mst.ClientCode = @clientId and EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst 
                where @formateddate < EventEndDateTime and EventStatus = @y 
                AND Webcast_Mst.ClientCode = @clientId and EventStartDateTime between @sdate and @edate`;
    
            totalCompletedMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst
                 where @formateddate > EventEndDateTime and eventType = @event 
                 and EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and EventEndDateTime between @sdate and @edate`;
        } else {
            totalMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalMeeting from Webcast_Mst 
                where eventType = @event AND Webcast_Mst.ClientCode = @clientId and EventStatus = @y`;
    
            totalUpcomingMeetingQuery = `
               select COALESCE(COUNT(*), 0) as totalUpcomingMeeting from Webcast_Mst 
               where @formateddate < EventEndDateTime and eventType = @event 
               AND Webcast_Mst.ClientCode = @clientId and EventStatus = @y`;
    
            totalCompletedMeetingQuery = `
                select COALESCE(COUNT(*), 0) as totalCompletedMeeting from Webcast_Mst 
                where @formateddate > EventEndDateTime and eventType = @event AND Webcast_Mst.ClientCode = @clientId and EventStatus = @y`;
        }
    }
    

    try {
        // Execute all queries in parallel
        const [totalMeetingResult, totalUpcomingMeetingResult, totalCompletedMeetingResult] = await Promise.all([
            request.query(totalMeetingQuery),
            request.query(totalUpcomingMeetingQuery),
            request.query(totalCompletedMeetingQuery),
        ]);

        // Extract the counts from results
        const totalMeeting = totalMeetingResult.recordset[0].totalMeeting;
        const totalUpcomingMeeting = totalUpcomingMeetingResult.recordset[0].totalUpcomingMeeting;
        const totalCompletedMeeting = totalCompletedMeetingResult.recordset[0].totalCompletedMeeting;

        logger.info('All meeting counts fetched successfully');

        return res.status(200).json({
            msg: 'All Meeting Counts Fetched Successfully',
            errorCode: "1",
            data: {
                totalMeeting,
                totalUpcomingMeeting,
                totalCompletedMeeting,
            }
        });
    } catch (error) {
        logger.error(`Error in /controller/adminCont/getAllMeetingCounts: ${error.message}`);
        return res.status(500).json({
            errorCode: "",
            errorDetail: error.message,
            responseData: {},
            status: "ERROR",
            details: "An internal server error occurred",
            getMessageInfo: "An internal server error occurred"
        });
    }
};

// all meeting with client
exports.getAllMeetingWithClientCounts = async (req, res) => {
    const { sdate, edate, filterBy, roleId, clientId,departmentId } = req.body;


    console.log("getAllMeetingWithClientCounts ",req.body)
    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    const request = new sql.Request();

    const currentDateTime = DateTime.now();
    const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    request.input('sdate', sql.DateTime, start || null);
    request.input('edate', sql.DateTime, end || null);
    request.input('formattedDate', sql.DateTime, formattedDateTime);
    request.input('eventType', sql.VarChar, 'EVTVIRTUAL');
    request.input('eventStatus', sql.VarChar, 'Y');
    
    let storedProcedureName;
    if(roleId == roleData.sRole){
        if(departmentId !== 'null' && departmentId){
            console.log("inside department")
            request.input('clientId', sql.VarChar, clientId);
            request.input('departmentId', sql.VarChar, departmentId);
            storedProcedureName = 'GetMeetingCountsByClientDept' 
        }
        else{
            console.log("inside")
            storedProcedureName = 'GetMeetingCountsByClientR'
        }
    }
    else if (roleId == roleData.dRole){
        request.input('clientId', sql.VarChar, clientId);
        request.input('departmentId', sql.VarChar, departmentId);
        storedProcedureName = 'GetMeetingCountsByClientDept' 
    }
    else{

        if(departmentId !== 'null' && departmentId){
            request.input('clientId', sql.VarChar, clientId);
            request.input('departmentId', sql.VarChar, departmentId);
            storedProcedureName = 'GetMeetingCountsByClientDept' 
        }
        else{
            request.input('clientId', sql.VarChar, clientId);
            storedProcedureName = 'GetMeetingCountsByClientRole' 
        }
       
        
    }

    try {
        const result = await request.execute(storedProcedureName);

        return res.status(200).json({
            msg: 'Meeting Counts Fetched Successfully Per Client',
            errorCode: "1",
            data: result.recordset
        });
    } catch (error) {
        logger.error(`Error in getAllMeetingWithClientCounts: ${error.message}`);
        return res.status(500).json({
            errorCode: "",
            errorDetail: error.message,
            responseData: {},
            status: "ERROR",
            details: "An internal server error occurred"
        });
    }
};


exports.getAllPhysicalMeetingWithClientCounts = async (req, res) => {
    const { sdate, edate, filterBy,roleId, clientId,departmentId} = req.body;

    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    const request = new sql.Request();

    const currentDateTime = DateTime.now();
    const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

    request.input('sdate', sql.DateTime, start || null);
    request.input('edate', sql.DateTime, end || null);
    request.input('formattedDate', sql.DateTime, formattedDateTime);
    request.input('eventType', sql.VarChar, 'EVTPHYSICAL');
    request.input('eventStatus', sql.VarChar, 'Y');

    let storedProcedureName;
    if(roleId == roleData.sRole){

        if(departmentId !== 'null' && departmentId){
            console.log("inside phyiscal");
            request.input('clientId', sql.VarChar, clientId);
            request.input('departmentId', sql.VarChar, departmentId);
            storedProcedureName = 'GetPhysicalMeetingCountsByClientDept'
        }
        else{
           storedProcedureName = 'GetPhysicalMeetingCountsByClientR'
        }
       
    }
    else if (roleId == roleData.dRole){
        request.input('clientId', sql.VarChar, clientId);
        request.input('departmentId', sql.VarChar, departmentId);
        storedProcedureName = 'GetPhysicalMeetingCountsByClientDept' 
    }
    else{

        if(departmentId !== 'null' && departmentId){
            console.log("inside phyiscal");
            request.input('clientId', sql.VarChar, clientId);
            request.input('departmentId', sql.VarChar, departmentId);
            storedProcedureName = 'GetPhysicalMeetingCountsByClientDept'
        }
        else{
            request.input('clientId', sql.VarChar, clientId);
            storedProcedureName = 'GetPhysicalMeetingCountsByClientRole' 
        }
        


    }


    try {
        const result = await request.execute(storedProcedureName);

        return res.status(200).json({
            msg: 'Meeting Counts Fetched Successfully Per Client',
            errorCode: "1",
            data: result.recordset
        });
    } catch (error) {
        logger.error(`Error in getAllPhysicalMeetingWithClientCounts: ${error.message}`);
        return res.status(500).json({
            errorCode: "",
            errorDetail: error.message,
            responseData: {},
            status: "ERROR",
            details: "An internal server error occurred"
        });
    }
};

// for getting virtual meeting list
exports.getVirtualMeetingList = async (req,res)=>{

    const {searchName,sdate,edate,filterBy,roleId,clientId,departmentId} = req.body;
      
    console.log("met ting data ", req.body);
    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    
    const request = new sql.Request();

   
    request.input("Etype", sql.VarChar, "EVTVIRTUAL");
    request.input("y", sql.VarChar, "Y")
    //request.input('formateddate', sql.VarChar, formattedDateTime)
    request.input('searchname', sql.VarChar, searchName)
    request.input('sdate', sql.VarChar, start);
    request.input('edate', sql.VarChar, end);
    request.input('clientId', sql.VarChar, clientId);
    request.input('departmentId', sql.VarChar, departmentId);
  
    let query;
  
    if(roleId==roleData.sRole){
        if(start && end){
       
            if(departmentId !=='null' && departmentId){
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Inner Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Inner Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Inner Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            Inner JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
            }

            else if(clientId !=='null' && clientId){
                console.log("inside client")
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
            }

            else {
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
            }
      
      }
      else{

        if(departmentId !=='null' && departmentId){
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
        Webcast_Mst.EventType,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
        Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
        Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
        zoom_ac_dtl.Account_name 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
        Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
        Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
        Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
        LEFT JOIN zoom_ac_dtl
        ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
        where
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
        }

        else if(clientId !=='null' && clientId){
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
        Webcast_Mst.EventType,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
        Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
        Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
        zoom_ac_dtl.Account_name 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
        Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
        Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
        Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
        LEFT JOIN zoom_ac_dtl
        ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
        where
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
        }

        else {
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.SpeakerCount,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId,
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName, User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
        
        }
          
           
      }
    }

    else if(roleId == roleData.dRole){
        if(start && end){
       
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y 
            AND Webcast_Mst.DeptId = @departmentId and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
      
      }
      else{
          
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.SpeakerCount,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId,
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName, User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y 
            AND Webcast_Mst.DeptId = @departmentId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
        
      }
    }
    else{

        
        if(start && end){

            if(departmentId !== 'null' && departmentId){
                
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y 
            AND Webcast_Mst.DeptId = @departmentId and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
            }
       
            else{
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y 
            AND Webcast_Mst.ClientCode = @clientId and Webcast_Mst.EventStartDateTime between @sdate and @edate and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
            }
      
      }
      else{ 

        if(departmentId !== 'null' && departmentId){
                
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y 
            AND Webcast_Mst.DeptId = @departmentId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
            }
          
           else{
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
            Webcast_Mst.CreatedDate,Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
            Webcast_Mst.SpeakerCount,Webcast_Mst.Name,Webcast_Mst.Mobile,
            Webcast_Mst.EventType,
            Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId,
            Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
            Client_Mst.FullName,Department_Mst.DeptName, User_mst.displayname,
            zoom_ac_dtl.Account_name 
            FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
            Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid 
            Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
            Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
            Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
            LEFT JOIN zoom_ac_dtl
            ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
            where
            Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y 
            AND Webcast_Mst.ClientCode = @clientId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime DESC`
           }
        
      }
    }
    try {
  
         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/adminCont/getMeetingList: ${err.message}. SQL query: ${query}`);
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
                const formattedDate = luxonDate.toFormat('dd-MM-yyyy');
               
                return {
                    ...item,
                    EventStartDateTime1:item.EventStartDateTime,
                    EventEndDateTime1:item.EventEndDateTime,
                    EventDate:formattedDate,
                    EventStartDate:luxonDate.toFormat("MMM d, yyyy"),
                    EventStartTime:luxonDate.toFormat("hh:mm a"),
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
                    EventEndDate:luxonDate1.toFormat("MMM d, yyyy"),
                    EventEndTime:luxonDate1.toFormat("hh:mm a"),
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
                
                res.status(200).json({ message: 'Fetch Virtual meeting with status successfully', errorCode:"1", data: formattedResult });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeeting: ${error.message}`);
      res.status(500).json(error);
    }
  }


// for getting physical meeting list

exports.getPhysicalMeetingList = async (req,res)=>{

    const {searchName,sdate,edate,filterBy,roleId,clientId,departmentId} = req.body;

      
    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    
      
    const request = new sql.Request();
   
    request.input("Etype", sql.VarChar, "EVTPHYSICAL");
    request.input("y", sql.VarChar, "Y")
    request.input('searchname', sql.VarChar, searchName);
    request.input('sdate', sql.VarChar, start);
    request.input('edate', sql.VarChar, end);
    request.input('clientId', sql.VarChar, clientId);
    request.input('departmentId', sql.VarChar, departmentId);
    let query;

    if(roleId == roleData.sRole){
        if(start && end){
              if(departmentId !=='null' && departmentId){
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
            Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
            Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
            Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
            FROM Webcast_Mst 
                  Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                  Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                  Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                where EventType = @Etype and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
              }

              else if (clientId !=='null' && clientId){
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                Webcast_Mst.EventEndDateTime, Webcast_Mst.EventType,
                Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                FROM Webcast_Mst 
                      Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                      Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                      Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                    where EventType = @Etype and EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
              }

              else{
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                Webcast_Mst.EventEndDateTime, Webcast_Mst.EventType,
                Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                FROM Webcast_Mst 
                      Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                      Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                      Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                    where EventType = @Etype and EventStatus = @y and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
              }


            }
            else{
                if(departmentId !=='null' && departmentId){
                    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                Webcast_Mst.EventEndDateTime, 
                Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                FROM Webcast_Mst 
                      Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                      Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                      Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                    where EventType = @Etype and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
                  }
    
                  else if (clientId !=='null' && clientId){
                    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                    Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
                    Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                    Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                    FROM Webcast_Mst 
                          Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                          Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                          Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                        where EventType = @Etype and EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
                  }
    
                  else{
                    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                    Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
                    Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                    Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                    FROM Webcast_Mst 
                          Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                          Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                          Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                        where EventType = @Etype and EventStatus = @y and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
                  }
    
            }
    }
    else if(roleId == roleData.dRole){
        if(start && end){
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
            Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
            Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
            Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
            FROM Webcast_Mst 
                  Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                  Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                  Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                where EventType = @Etype and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
            }
            else{
            query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
            Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
            Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
            Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
            FROM Webcast_Mst 
                  Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                  Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                  Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                where EventType = @Etype and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
            } 
    }
    else{
        if(start && end){

            if(departmentId !=='null' && departmentId){
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
            Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
            Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
            Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
            FROM Webcast_Mst 
                  Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                  Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                  Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                where EventType = @Etype and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
              }
              
              else{
                query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
                Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                FROM Webcast_Mst 
                      Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                      Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                      Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                    where EventType = @Etype and EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and EventEndDateTime between @sdate and @edate and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
              }
           
            }
            else{

                if(departmentId !=='null' && departmentId){
                    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
                Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
                Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
                Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
                FROM Webcast_Mst 
                      Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                      Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                      Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                    where EventType = @Etype and EventStatus = @y AND Webcast_Mst.DeptId = @departmentId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
                  }
                else{
                    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
            Webcast_Mst.EventEndDateTime, Webcast_Mst.EventType,
            Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
            Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname 
            FROM Webcast_Mst 
                  Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
                  Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
                  Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
                where EventType = @Etype and EventStatus = @y AND Webcast_Mst.ClientCode = @clientId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
                }
            }
    }
   
    try {
  
         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/adminCont/getMeetingWithStatus: ${err.message}. SQL query: ${query}`);
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
                const formattedDate = luxonDate.toFormat('dd-MM-yyyy');
                return {
                    ...item,
                    EventStartDateTime1:item.EventStartDateTime,
                    EventEndDateTime1:item.EventEndDateTime,
                    EventDate:formattedDate,
                    EventStartDate:luxonDate.toFormat("MMM d, yyyy"),
                    EventStartTime:luxonDate.toFormat("hh:mm a"),
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
                    EventEndDate:luxonDate1.toFormat("MMM d, yyyy"),
                    EventEndTime:luxonDate1.toFormat("hh:mm a"),
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
                
                res.status(200).json({ message: 'Fetch physical meeting with status successfully', errorCode:"1", data: formattedResult });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/adminCont/getMeeting: ${error.message}`);
      res.status(500).json(error);
    }
  }



// for meeting with clientCode

exports.getVirtualMeetingListWithClient = async (req,res)=>{

    const {searchName,sdate,edate,filterBy,clientCode,departmentId} = req.body;
      
    console.log(req.body)
    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    
    const request = new sql.Request();
    request.input("Etype", sql.VarChar, "EVTVIRTUAL");
    request.input("y", sql.VarChar, "Y")
    request.input('searchname', sql.VarChar, searchName)
    request.input('sdate', sql.VarChar, start);
    request.input('edate', sql.VarChar, end);
    request.input('clientCode',sql.BigInt,clientCode)
    request.input('departmentId', sql.BigInt,departmentId)
    
    let query;

    if(departmentId !== 'null' && departmentId){
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
        Webcast_Mst.EventType,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
        Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
        Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
        zoom_ac_dtl.Account_name 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
        Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
        Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
        Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
        LEFT JOIN zoom_ac_dtl
      ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
        where
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.DeptId = @departmentId and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
    }
    else{
    
        query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, 
        Webcast_Mst.EventStartDateTime, Webcast_Mst.EventEndDateTime,
        Webcast_Mst.CreatedDate,Webcast_Mst.Name,Webcast_Mst.Mobile,
        Webcast_Mst.EventType,
        Webcast_Webinar_Mst.MeetingId,Webcast_Webinar_Mst.AccountId, 
        Webcast_Webinar_Mst.PresenterUrl,Webcast_Webinar_Mst.AttendeeUrl,
        Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname,
        zoom_ac_dtl.Account_name 
        FROM Webcast_Mst Inner Join Webcast_Webinar_Mst on  
        Webcast_Mst.WcCode = Webcast_Webinar_Mst.fk_mid
        Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
        Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
        Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
        LEFT JOIN zoom_ac_dtl
      ON Webcast_Webinar_Mst.AccountId = zoom_ac_dtl.Account_id
        where
        Webcast_Mst.EventType = @Etype and Webcast_Mst.EventStatus = @y and Webcast_Mst.ClientCode = @clientCode and Webcast_Mst.Title LIKE '%' + @searchname + '%' ORDER BY Webcast_Mst.EventStartDateTime`
    }
  
        
    try {
  
         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/adminCont/getMeetingList: ${err.message}. SQL query: ${query}`);
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



                const formattedDate = luxonDate.toFormat('dd-MM-yyyy');
    
               
                return {
                    ...item,
                    EventDate:formattedDate,
                    EventStartDate:luxonDate.toFormat("MMM d, yyyy"),
                    EventStartTime:luxonDate.toFormat("hh:mm a"),
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
                    EventEndDate:luxonDate1.toFormat("MMM d, yyyy"),
                    EventEndTime:luxonDate1.toFormat("hh:mm a"),
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
                
                res.status(200).json({ message: 'Fetch Virtual meeting with status successfully', errorCode:"1", data: formattedResult });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/virtualMeetCont/getMeeting: ${error.message}`);
      res.status(500).json(error);
    }
  }


// for getting physical meeting list

exports.getPhysicalMeetingListWithClient = async (req,res)=>{

    const {searchName,sdate,edate,filterBy,clientCode,departmentId} = req.body;

      
    let start, end;
    const today = new Date();
    
    if (filterBy === "week") {
        start = new Date();
        start.setDate(today.getDate() - 7);
        end = new Date();
    } else if (filterBy === "month") {
        start = new Date();
        start.setDate(today.getDate() - 30);
        end = new Date();
    } else if (filterBy === "year") {
        start = new Date();
        start.setDate(today.getDate() - 365);
        end = new Date();
    } else if (filterBy === "date" && sdate && edate) {
        start = new Date(sdate);
        end = new Date(edate);
    }
    
    if(filterBy && filterBy !=="date"){

        
        // Format the dates to YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    start = formatDate(start);
    end = formatDate(end);
    }
    if(filterBy === 'date' && sdate && edate){
        const formatDate = (date) => date.toISOString().split('T')[0];
    
        start = formatDate(start);
        end = formatDate(end);
    }
    
      
    const request = new sql.Request();
   
    request.input("Etype", sql.VarChar, "EVTPHYSICAL");
    request.input("y", sql.VarChar, "Y")
    request.input('searchname', sql.VarChar, searchName);
    request.input('sdate', sql.VarChar, start);
    request.input('edate', sql.VarChar, end);
    request.input('clientCode',sql.BigInt,clientCode);
    request.input('departmentId', sql.BigInt,departmentId)


   let  query;

   if(departmentId !== 'null' && departmentId){

    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
    Webcast_Mst.EventEndDateTime,Webcast_Mst.EventType, 
    Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
    Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname
    FROM Webcast_Mst 
          Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
          Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
          Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
        where EventType = @Etype and EventStatus = @y and Webcast_Mst.DeptId = @departmentId and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
   }
   else{
    query = `SELECT Webcast_Mst.WcCode, Webcast_Mst.Title, Webcast_Mst.EventStartDateTime, 
    Webcast_Mst.EventEndDateTime, Webcast_Mst.EventType,
    Webcast_Mst.CreatedDate,Webcast_Mst.SpeakerCount,Webcast_Mst.Name,
    Webcast_Mst.Mobile,Client_Mst.FullName,Department_Mst.DeptName,User_mst.displayname
    FROM Webcast_Mst 
          Left Join Client_Mst on Webcast_Mst.ClientCode = Client_Mst.ClientCode
          Left Join Department_Mst on Webcast_Mst.DeptId = Department_Mst.DeptId
          Left Join User_mst on Webcast_Mst.CreatedBy = User_mst.userid
        where EventType = @Etype and EventStatus = @y and Webcast_Mst.ClientCode = @clientCode and Title LIKE '%' + @searchname + '%' ORDER BY EventStartDateTime DESC`
   }

   
    try {
  
         request.query(query,(err,result)=>{
            if(err){
              logger.error(`Error in /controller/adminCont/getMeetingWithStatus: ${err.message}. SQL query: ${query}`);
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
                const formattedDate = luxonDate.toFormat('dd-MM-yyyy');
                return {
                    ...item,
                    EventDate:formattedDate,
                    EventStartDate:luxonDate.toFormat("MMM d, yyyy"),
                    EventStartTime:luxonDate.toFormat("hh:mm a"),
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
                    EventEndDate:luxonDate1.toFormat("MMM d, yyyy"),
                    EventEndTime:luxonDate1.toFormat("hh:mm a"),
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
                
                res.status(200).json({ message: 'Fetch physical meeting with status successfully', errorCode:"1", data: formattedResult });
            }
        })
        
    } catch (error) {
      console.error(error);
      logger.error(`Error in /controller/adminCont/getMeeting: ${error.message}`);
      res.status(500).json(error);
    }
  }



  // all meeting with client
  // and department
// exports.getAllMeetingWithDepartmentCounts = async (req, res) => {
//     const { sdate, edate, filterBy, roleId, clientId,departmentId } = req.body;

//     let start, end;
//     const today = new Date();
    
//     if (filterBy === "week") {
//         start = new Date();
//         start.setDate(today.getDate() - 7);
//         end = new Date();
//     } else if (filterBy === "month") {
//         start = new Date();
//         start.setDate(today.getDate() - 30);
//         end = new Date();
//     } else if (filterBy === "year") {
//         start = new Date();
//         start.setDate(today.getDate() - 365);
//         end = new Date();
//     } else if (filterBy === "date" && sdate && edate) {
//         start = new Date(sdate);
//         end = new Date(edate);
//     }
    
//     if(filterBy && filterBy !=="date"){

        
//         // Format the dates to YYYY-MM-DD
//     const formatDate = (date) => date.toISOString().split('T')[0];
    
//     start = formatDate(start);
//     end = formatDate(end);
//     }
//     if(filterBy === 'date' && sdate && edate){
//         const formatDate = (date) => date.toISOString().split('T')[0];
    
//         start = formatDate(start);
//         end = formatDate(end);
//     }
//     const request = new sql.Request();

//     const currentDateTime = DateTime.now();
//     const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

//     request.input('sdate', sql.DateTime, start || null);
//     request.input('edate', sql.DateTime, end || null);
//     request.input('formattedDate', sql.DateTime, formattedDateTime);
//     request.input('eventType', sql.VarChar, 'EVTVIRTUAL');
//     request.input('eventStatus', sql.VarChar, 'Y');
    
//     let storedProcedureName;
//     if(roleId == roleData.sRole){
//        storedProcedureName = 'GetMeetingCountsByClient'
//     }
//     else if (roleId == roleData.dRole){
//         request.input('departmentId', sql.VarChar, departmentId);
//         storedProcedureName = 'GetMeetingCountsByClientDept' 
//     }
//     else{
//         request.input('clientId', sql.VarChar, clientId);
//         storedProcedureName = 'GetMeetingCountsByClientRole' 
//     }

//     try {
//         const result = await request.execute(storedProcedureName);

//         return res.status(200).json({
//             msg: 'Meeting Counts Fetched Successfully Per Client',
//             errorCode: "1",
//             data: result.recordset
//         });
//     } catch (error) {
//         logger.error(`Error in getAllMeetingCounts: ${error.message}`);
//         return res.status(500).json({
//             errorCode: "",
//             errorDetail: error.message,
//             responseData: {},
//             status: "ERROR",
//             details: "An internal server error occurred"
//         });
//     }
// };


// exports.getAllPhysicalMeetingWithClientCounts = async (req, res) => {
//     const { sdate, edate, filterBy,roleId, clientId,departmentId} = req.body;

//     let start, end;
//     const today = new Date();
    
//     if (filterBy === "week") {
//         start = new Date();
//         start.setDate(today.getDate() - 7);
//         end = new Date();
//     } else if (filterBy === "month") {
//         start = new Date();
//         start.setDate(today.getDate() - 30);
//         end = new Date();
//     } else if (filterBy === "year") {
//         start = new Date();
//         start.setDate(today.getDate() - 365);
//         end = new Date();
//     } else if (filterBy === "date" && sdate && edate) {
//         start = new Date(sdate);
//         end = new Date(edate);
//     }
    
//     if(filterBy && filterBy !=="date"){

        
//         // Format the dates to YYYY-MM-DD
//     const formatDate = (date) => date.toISOString().split('T')[0];
    
//     start = formatDate(start);
//     end = formatDate(end);
//     }
//     if(filterBy === 'date' && sdate && edate){
//         const formatDate = (date) => date.toISOString().split('T')[0];
    
//         start = formatDate(start);
//         end = formatDate(end);
//     }
//     const request = new sql.Request();

//     const currentDateTime = DateTime.now();
//     const formattedDateTime = currentDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

//     request.input('sdate', sql.DateTime, start || null);
//     request.input('edate', sql.DateTime, end || null);
//     request.input('formattedDate', sql.DateTime, formattedDateTime);
//     request.input('eventType', sql.VarChar, 'EVTPHYSICAL');
//     request.input('eventStatus', sql.VarChar, 'Y');

//     let storedProcedureName;
//     if(roleId == roleData.sRole){
//        storedProcedureName = 'GetPhysicalMeetingCountsByClient'
//     }
//     else if (roleId == roleData.dRole){
//         request.input('departmentId', sql.VarChar, departmentId);
//         storedProcedureName = 'GetPhysicalMeetingCountsByClientDept' 
//     }
//     else{
//         request.input('clientId', sql.VarChar, clientId);
//         storedProcedureName = 'GetPhysicalMeetingCountsByClientRole' 
//     }


//     try {
//         const result = await request.execute(storedProcedureName);

//         return res.status(200).json({
//             msg: 'Meeting Counts Fetched Successfully Per Client',
//             errorCode: "1",
//             data: result.recordset
//         });
//     } catch (error) {
//         logger.error(`Error in getAllMeetingCounts: ${error.message}`);
//         return res.status(500).json({
//             errorCode: "",
//             errorDetail: error.message,
//             responseData: {},
//             status: "ERROR",
//             details: "An internal server error occurred"
//         });
//     }
// };


