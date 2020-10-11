const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 

dotenv.config({ path: './config/config.env'});

// Load models
const Boobcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');


// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Import data
const importData = async (path=`${__dirname}/_data/`) => {
    try {
        //Bootcamps
        const bootcamps_file = fs.readFileSync(path+'bootcamps.json', 'utf-8');
        const bootcamps_object = JSON.parse(bootcamps_file);
        await Boobcamp.create(bootcamps_object)
        console.log('Bootcamps Imported');

        // Course s
        const courses_file = fs.readFileSync(path+'courses.json', 'utf-8');
        const courses_object = JSON.parse(courses_file);
        await Course.create(courses_object)
        console.log('Courses Imported');

        // Users 
        const users_file = fs.readFileSync(path+'users.json', 'utf-8');
        const users_object = JSON.parse(users_file);
        await User.create(users_object)
        console.log('Users Imported');

        // Reviews 
        const reviews_file = fs.readFileSync(path+'reviews.json', 'utf-8');
        const reviews_object = JSON.parse(reviews_file);
        await Review.create(reviews_object)
        console.log('Reviews Imported');

        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Boobcamp.deleteMany();
        console.log('Bootcamps Deleted');

        await Course.deleteMany();
        console.log('Courses Deleted');

        await User.deleteMany();
        console.log('Users Deleted');

        await Review.deleteMany();
        console.log('Reviews Deleted');

        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if (process.argv.length > 1) {
    if (process.argv[2] === '-i')
        importData();
    else if (process.argv[2] === '-d')
        deleteData();
}