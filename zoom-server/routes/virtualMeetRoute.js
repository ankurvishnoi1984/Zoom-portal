const express = require('express');
const { addMeeting, getMeeting, deleteMeeting, getMeetingById, updateMeeting, getMeetingByIdWithDateFormat, softDeleteMeeting, getTotalMeeting, getTotalUpcomingMeeting, getTotalCompletedMeeting, deleteZoomMeeting, addAndUpdateZoomMeeting, getMeetingDataForDownload, getMeetingWithStatus, getMeetingInvitation, getMeetingType, getMessageType, getMeetingByIdWithDateFormat1, getMeetingTime } = require('../controller/virtualMeetCont');

const generateZoomAccessToken = require('../middleware/authenticate');

const router = express.Router();

router.post('/createMeeting',generateZoomAccessToken, addMeeting);
router.get('/getMeeting', getMeeting);
router.get('/getVirtualMeetingById/:id',getMeetingById);
router.patch('/updateVirtualMeeting/:id',generateZoomAccessToken, updateMeeting)
//router.delete('/deleteMeeting',generateZoomAccessToken,deleteMeeting)
router.post('/deleteMeeting',generateZoomAccessToken,softDeleteMeeting)

router.get('/getVirtualMeetingByIdWithDateFormat/:id', getMeetingByIdWithDateFormat)
router.get('/getVirtualMeetingByIdWithDateFormat1/:id', getMeetingByIdWithDateFormat1)


router.post('/getTotalMeet', getTotalMeeting)
router.post('/getTotalUpcoming', getTotalUpcomingMeeting)
router.post('/getTotalCompleted', getTotalCompletedMeeting);
router.post('/getMeetingData', getMeetingDataForDownload)

router.post('/getMeetingWithStatus', getMeetingWithStatus)

router.post('/deleteZoomMeeting', generateZoomAccessToken, deleteZoomMeeting)
router.post('/createZoomMeetAndUpdate', generateZoomAccessToken, addAndUpdateZoomMeeting)

// for meeting invitation
router.post('/getMeetingInvitation', generateZoomAccessToken, getMeetingInvitation);

// for meeting type 

router.get('/getMeetingType', getMeetingType);
router.get('/getMessageType', getMessageType);
router.get('/getMeetingTime',getMeetingTime);

module.exports = router;