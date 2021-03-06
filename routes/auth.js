const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDeteils, updatePassword, logout } = require('../controllers/auth');


const router = express.Router();

const { protect } = require('../middleware/auth');

router
.post('/register', register)
.post('/login', login)
.get('/logout', logout)
.get('/me', protect, getMe)
.post('/forgotpassword', forgotPassword)
.put('/resetpassword/:token', resetPassword)
.put('/updatedetails', protect, updateDeteils)
.put('/updatepassword', protect, updatePassword);

module.exports = router;
