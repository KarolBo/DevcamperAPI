const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const { query } = require('express');

exports.getBootcamps = asyncHandler(async (req, res, next) => {
        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort']

        // Delete the words from the query
        removeFields.forEach(param => delete reqQuery[param]);

        //Create query string
        let queryStr = JSON.stringify(reqQuery);

        //Create operators ($gt, $gte etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => '$'+match);
        console.log(queryStr);

        // Finding resources 
        let query = JSON.parse(queryStr);
        query = Bootcamp.find(query);

         // Select Fields
         if (req.query.select) {
            const fields = req.query.select.replace(',', ' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.replace(',', ' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Executing query
        const bootcamps = await query;

        // Response
        res.status(200).json({ 
            success: true,
            count: bootcamps.length,
            data: bootcamps
        });
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
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ 
        success: true, 
        data: bootcamp
    });
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp)
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));

    res.status(201).json({ 
        success: true, 
        data: bootcamp
    });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp)
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        
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