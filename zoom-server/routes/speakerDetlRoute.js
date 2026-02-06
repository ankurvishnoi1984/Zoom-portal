const express = require('express');
const { getSpeaker, deleteSpeaker, getSpeakerById } = require('../controller/speakerDetlCont');

const router = express.Router();

router.get("/getSpeaker/:fkmid",getSpeaker)
//router.delete('/deleteSpeaker/:id', deleteSpeaker)
router.patch('/deleteSpeaker/:id', deleteSpeaker)

router.get('/getSpeakerById/:id', getSpeakerById)


module.exports = router;