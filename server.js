const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error');


// Load env vars
dotenv.config({ path: './config/config.env'});

connectDB();

const logger = require('./middleware/logger');

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(logger);
    app.use(morgan('dev'));
}

// File upload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

//Prevent XSS
app.use(xss());

// Set rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/bootcamps', bootcamps);
app.use('/api/courses', courses);
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/reviews', reviews);

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send("Hello there!");
});

const server = app.listen(
    process.env.PORT || 5000, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`)
    );

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});