const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 

dotenv.config({ path: './config/config.env'});

// Load models
const Boobcamp = require('./models/Bootcamp');
const Courses = require('./models/Course');


// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Import data
const importBootcamps = async (path=`${__dirname}/_data/`) => {
    try {
        //Bootcamps
        const bootcamps_file = fs.readFileSync(path+'bootcamps.json', 'utf-8');
        const bootcamps_object = JSON.parse(bootcamps_file);
        await Boobcamp.create(bootcamps_object)
        console.log('Bootcamps Imported');

        // Courses 
        const courses_file = fs.readFileSync(path+'courses.json', 'utf-8');
        const courses_object = JSON.parse(courses_file);
        await Courses.create(courses_object)
        console.log('Courses Imported');

        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// Delete data
const deleteBootcamps = async () => {
    try {
        await Boobcamp.deleteMany();
        console.log('Bootcamps Deleted');

        await Courses.deleteMany();
        console.log('Courses Deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv.length > 1) {
    if (process.argv[2] === '-i')
        importBootcamps();
    else if (process.argv[2] === '-d')
        deleteBootcamps();
}