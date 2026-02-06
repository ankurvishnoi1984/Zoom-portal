const { UserLogin, getRoleCode, getClient, getDepartMent, getClientAdmin, addClient, deleteClient, addDepartment, deleteDepartment, updateDepartment, updateClient } = require('../controller/authenticateCont')

const express  = require('express');

const router = express.Router();

router.post('/login',UserLogin);
router.post('/getRoleCode', getRoleCode)
router.get('/getClient', getClient)
router.post('/addClient', addClient)
router.post('/deleteClient',deleteClient)
router.post('/getClientAdmin', getClientAdmin)
router.post('/getDepartment', getDepartMent);
router.post('/addDepartment',addDepartment)
router.post('/deleteDepartment',deleteDepartment);
router.post('/updateDepartmentWithId',updateDepartment);
router.post('/updateClientWithId',updateClient)

module.exports = router;