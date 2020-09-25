const express = require('express');
const { getBootcamps, 
        getBootcamp, 
        createBootcamp, 
        updateBootcamp, 
        deleteBootcamp,
        getBootcampsInRadius,
        bootcampPhotoUpload } = require('../controllers/bootcamp');

// Apply advanced results
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Reroute
router.use('/:bootcampId/courses', courseRouter);

router.route('/')
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(protect, createBootcamp);

router.route('/:id')
.get(getBootcamp)
.put(protect, updateBootcamp)
.delete(protect, deleteBootcamp);

router.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

module.exports = router;