const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 

dotenv.config({ path: './config/config.env'});

const Boobcamp = require('./models/Bootcamp');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

const importBootcamps = async (path=`${__dirname}/_data/bootcamps.json`) => {
    try {
        const bootcamps_file = fs.readFileSync(path, 'utf-8');
        const bootcamps_object = JSON.parse(bootcamps_file);
        await Boobcamp.create(bootcamps_object)
        console.log('Bootcamps Imported');
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

const deleteBootcamps = async () => {
    try {
        await Boobcamp.deleteMany();
        console.log('Bootcamps Deleted');
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