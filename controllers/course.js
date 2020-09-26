const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get courses
// @route   GET /api/courses
// @route   GET /api/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });;

    if(!course) {
        return next(new ErrorResponse(`No course of id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Add course
// @route   POST /api/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    // Add bootcamp and user to req.body
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp of id of ${req.params.bootcampId}`, 404));
    }

    // Check if the user is the bootcamp owner
    if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin')
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add courses this bootcamp`, 404));

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!course)
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));

    // Check if the user is the course owner
    if (req.user.id !== course.user.toString() && req.user.role !== 'admin')
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 404));

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course)
        return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));

    // Check if the user is the course owner
    if (req.user.id !== course.user.toString() && req.user.role !== 'admin')
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 404));
        
    course.remove();

    res.status(201).json({ 
        success: true, 
        data: course
    });
});