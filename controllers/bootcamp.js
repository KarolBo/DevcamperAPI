const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp)
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    res.status(200).json({ 
        success: true,
        data: bootcamp
    });
});

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check for poblished bootcamps
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one cootcamp
    if (publishedBootcamp && req.user.role != 'admin')
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 404));

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ 
        success: true, 
        data: bootcamp
    });
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp)
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));

    // Check if the user is the bootcamp owner
    if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin')
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 404));

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({ 
        success: true, 
        data: bootcamp
    });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp)
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));

    // Check if the user is the bootcamp owner
    if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin')
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 404));
        
    bootcamp.remove();

    res.status(201).json({ 
        success: true, 
        data: bootcamp
    });
});

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get coordinates from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calculate radius using radians
    // Divide distance by radius of Earth (6 378.1 km)
    const radius = distance / 6378.1;
 
    const bootcamps = await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
    });

    res.status(200).json({
        success: true, 
        conut: bootcamps.length,
        data: bootcamps
    });
});

// @desc Upload photo for bootcamp
// @route PUT /api/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp)
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        
    // Check if the user is the bootcamp owner
    if (req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin')
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to upload a photo to this bootcamp`, 404));

    if(!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please uploat an image file', 400));
    }

    if(!file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please uploat an image less than ${MAX_FILE_UPLOAD}`, 400));
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.log(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        await Bootcamp.findOneAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            date: file.name
        });
    })
});