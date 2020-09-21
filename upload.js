const IncomingForm = require("formidable").IncomingForm;

module.exports = function upload(req, res) {
    var form = new IncomingForm();

    form.on("file", (field, file) => {
        // Do something with the file
        // e.g. save it to the database
        // you can access it using file.path
        console.log(file)
        const promises = cloudinary.uploader.upload(file.path)

        Promise
            .all(promises)
            .then(results => {
                console.log(results)

                res.json(results)
            })
            .catch((err) => res.status(400).json(err))
        console.log('received')
    });
    form.on("end", () => {
        res.json();
    });
    form.parse(req);
};
