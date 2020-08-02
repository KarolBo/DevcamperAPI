exports.getBootcamps = (req, res) => {
     res.status(200).json({ success: true, msg: "show all bootcamps"});
}

exports.getBootcamp = (req, res) => {
    res.status(200).json({ success: true, msg: `show bootcamp ${req.params.id}`});
}

exports.createBootcamp = (req, res) => {
    res.status(200).json({ success: true, msg: "create new bootcamp"});
}

exports.updateBootcamp = (req, res) => {
    res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}`});
}

exports.deleteBootcamp = (req, res) => {
    res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}`});
}