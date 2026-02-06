const express = require('express');
const { addMeeting, getMeeting, deleteMeeting, getMeetingById, updateMeeting, getMeetingByIdWithDateFormat, softDeleteMeeting, getTotalMeeting, getTotalUpcomingMeeting, getTotalCompletedMeeting, getMeetingDataForDownload, getMeetingWithStatus } = require('../controller/physicalMeetCont');


const router = express.Router();

router.post('/createMeeting', addMeeting);
router.get('/getMeeting', getMeeting);
//router.delete('/deleteMeeting/:id',deleteMeeting)
router.post('/deleteMeeting',softDeleteMeeting)
router.get('/getPhysicalMeetingById/:id', getMeetingById)
router.patch('/updatePhysicalMeeting/:id', updateMeeting)
router.get('/getPhysicalMeetingByIdWithDateFormat/:id', getMeetingByIdWithDateFormat)

router.post('/getTotalMeet', getTotalMeeting)
router.post('/getTotalUpcoming', getTotalUpcomingMeeting)
router.post('/getTotalCompleted', getTotalCompletedMeeting)
router.post('/getMeetingData', getMeetingDataForDownload)
router.post('/getMeetingWithStatus', getMeetingWithStatus)

module.exports = router;

