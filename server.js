const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const logger = require('./middleware/logger');

// Route files
const bootcamps = require('./routes/bootcamps');

// Load env vars
dotenv.config({ path: './config/config.env'});

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(logger);
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

app.get('/', (req, res) => {
    res.send("Hello there!");
});

app.listen(process.env.PORT || 5000, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));