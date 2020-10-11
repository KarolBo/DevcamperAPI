const express = require('express');
const User = require('../models/User');

// Middleware
const { authorize, protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');

const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/users');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'publisher'));

router.route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .post(updateUser)
    .delete(deleteUser);

module.exports = router;