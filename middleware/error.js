const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    console.log(err);
    let error;
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not faund with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    } 
    // Mongoose duplicate key
    else if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }
    //Mongoose validation error
    else if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map( val => val.message);
        error = new ErrorResponse(message, 400);
    }
    else {
        error = err;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message
    });
};

module.exports = errorHandler;