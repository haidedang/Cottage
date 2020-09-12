require('dotenv').config()
const express = require("express");
const cloudinary = require('cloudinary')
const formData = require('express-form-data')
const upload = require("./upload");
const cors = require("cors");
const mongoose = require('mongoose')
const Image = require('./models/image')
const server = express();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})


var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

// MongoDB Connection
mongoose.connect("mongodb+srv://haidedang:Haidang91@cottagecore.qyveh.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority", error => {
    if (error) {
        console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
        throw error;
    }
});

mongoose.set('debug', true);

server.use(formData.parse())


server.use(cors(corsOptions));

server.post("/upload", upload);

server.post('/image-upload', (req, res) => {

    const values = Object.values(req.files)
    const promises = values.map(image => cloudinary.uploader.upload(image.path))

    Promise
        .all(promises)
        .then(results => {
            console.log(results)
            const newImage = new Image(results[0])
            newImage.userId= req.body.userId
            newImage.save((err, saved) => {
                if (err) {
                    res.status(500)
                        .send(err)
                }
                res.json({ image: saved })
            })

        })
        .catch((err) => res.status(400).json(err))
})

server.listen(8080, "0.0.0.0" ,() => {
    console.log("Server started!");
});
