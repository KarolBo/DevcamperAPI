const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db')


// Load env vars
dotenv.config({ path: './config/config.env'});

connectDB();

const logger = require('./middleware/logger');

// Route files
const bootcamps = require('./routes/bootcamps');

const app = express();

// Body parser
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
    app.use(logger);
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/bootcamps', bootcamps);

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