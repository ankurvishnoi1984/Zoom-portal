const express = require('express');
const { getFormField, getFormFieldOptional, getFormFieldMandatory, addHost, addFormField, addFormField1, getHostById, updateHostById, updateFormField, addMessage, getMessageById, updateMessageById, updateWebcastUrl, addDepartment } = require('../controller/formCont');


const router = express.Router();

router.post("/getFormFieldMandatory",getFormFieldMandatory);
router.post("/getFormFieldOptional", getFormFieldOptional);
router.post("/addHost",addHost);
router.post("/addFormField",addFormField1);
router.post("/updateFormField", updateFormField);
router.post("/getHostById", getHostById);
router.post('/updateHostById', updateHostById)
router.post('/addMessage', addMessage)
router.post("/getMessageById", getMessageById);
router.post('/updateMessageById', updateMessageById)
router.post('/updateWebcastUrl', updateWebcastUrl)
router.post('/addDepartment', addDepartment)




module.exports = router;