const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
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

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/bootcamps', bootcamps);
app.use('/api/courses', courses);
app.use('/api/auth', auth);

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