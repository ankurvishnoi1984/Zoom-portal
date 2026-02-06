const express = require('express');
const { getPoster, addPoster, getPosterById, updatePosterById, getFieldByPosterId, getSpeakerFieldByPosterId, getPosterPresent } = require('../controller/posterSelectCont');


const router = express.Router();


router.post('/getPoster', getPoster );
router.post('/addPoster', addPoster );
router.get('/getPosterById/:id', getPosterById);
router.patch('/updatePosterById/:id', updatePosterById);
router.post('/getFieldByPosterId', getFieldByPosterId);
router.post('/getSpeakerFieldByPosterId', getSpeakerFieldByPosterId);
router.post('/getPosterPresent', getPosterPresent);






module.exports = router;