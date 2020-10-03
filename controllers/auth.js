const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');


// @desc Register User
// @route POST /api/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create User
    const user = await User.create({
        name, 
        email, 
        password, 
        role
    });

    sendTokenResponse(user, 200, res);
});

// @desc Login User
// @route POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password)
        return next(new ErrorResponse('Please provide an email and password', 400));

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return next(new ErrorResponse('Invalid credentials', 401));

    // Check if passwords matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) 
        return next(new ErrorResponse('Invalid credentials', 401));

    sendTokenResponse(user, 200, res);
});

// @desc Update user details
// @route POST /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc Get current logged user
// @route PUT /api/auth/updatedetails
// @access Private
exports.updateDeteils = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name, 
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true, 
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc Update user password
// @route PUT  /api/auth/updatepassword
// @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await (await User.findById(req.user.id).select('+password'));

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword)))
        return next(new ErrorResponse('Password incorrect', 401));
    
    user.password = req.body.newPassword;
    user.save();

    sendTokenResponse(user, 200, res);
});

// @desc Forgot password
// @route POST /api/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
        return next(new ErrorResponse('There is no user with this e-mail', 404));

    // Get reset token
    const resetToken = await user.getResetPasswordToken(); 

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `Siema Eniu! Dobry Muzyn z Afryka! \n\n${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Passwort reset token',
            message
        });

        res.status(200).json({
            success: true, data: 'Email sent'
        })
    } catch (error) {
        console.log(error);
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }

    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc Reset password
// @route PUT /api/auth/resetpasswort/:resettoken
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Ger hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    
    const user = await User.findOne({ 
        resetPasswordToken, 
        resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user)
        return next(new ErrorResponse('Invalid token', 400));

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create toket - user is a method, not a static
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 3600 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
        success: true,
        token
    });
}