const express = require('express');
const { SendMail, SendMailForPhysical } = require('../controller/MailerCont');

const router = express.Router();


router.post('/sendMail',SendMail);
router.post('/sendMailForPhysical', SendMailForPhysical)

module.exports = router;