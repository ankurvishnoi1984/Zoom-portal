
const express  = require('express');
const { UserLogin, getAllMeetingCounts, getAllPhysicalMeetingCounts, getAllMeetingWithClientCounts, getVirtualMeetingList, getPhysicalMeetingList, getAllPhysicalMeetingWithClientCounts, getVirtualMeetingListWithClient, getPhysicalMeetingListWithClient } = require('../controller/adminCont');

const router = express.Router();

router.post('/login',UserLogin);
router.post('/getVirtualMeetingCount',getAllMeetingCounts)
router.post('/getPhysicalMeetingCount',getAllPhysicalMeetingCounts)
router.post('/getAllMeetingWithClient', getAllMeetingWithClientCounts)
router.post('/getPhysicalMeetingWithClient',getAllPhysicalMeetingWithClientCounts)
router.post('/getAllVirtualMeetingWithClient', getVirtualMeetingList)
router.post('/getAllPhysicalMeetingWithClient', getPhysicalMeetingList)
router.post('/getVirtualMeetingWithClientId', getVirtualMeetingListWithClient)
router.post('/getPhysicalMeetingWithClientId', getPhysicalMeetingListWithClient)


module.exports = router;