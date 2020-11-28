require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary");
const formData = require("express-form-data");
const upload = require("./upload");
const cors = require("cors");
const mongoose = require("mongoose");
const Image = require("./models/image");
const User = require("./models/user");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const {google} = require("googleapis"); 
const OAuth2 = google.auth.OAuth2; 

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
)

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken()

const PORT = process.env.PORT || 8080;
const server = express();

/* cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
}); */

/* var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}; */

// MongoDB Connection
/* mongoose.connect(process.env.MONGODB_URI, (error) => {
  if (error) {
    console.error("Please make sure Mongodb is installed and running!"); // eslint-disable-line no-console
    throw error;
  }
}); */

/* mongoose.set("debug", true); */

server.use(formData.parse());

//server.use(cors(corsOptions));

/* server.use(cors());
 */

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  next()
})

server.get("/", function (req, res) {
  res.send("Welcome at the cottage dream");
});

server.post("/upload", upload);

server.post("/image-upload", (req, res) => {
  const values = Object.values(req.files);
  const promises = values.map((image) =>
    cloudinary.uploader.upload(image.path)
  );

  Promise.all(promises)
    .then((results) => {
      console.log(results);
      const newImage = new Image(results[0]);
      newImage.userId = req.body.userId;
      newImage.save((err, saved) => {
        if (err) {
          res.status(500).send(err);
        }
        res.json({ image: saved });
      });
    })
    .catch((err) => res.status(400).json(err));
});

server.get("/freebies", (req, res) => {
  res.download('./assets/gifs.rar', 'freebieGifs.rar', function(err) {
    if(err){
        console.log(err)
    } else {
        console.log('File sent')
    }
})
})

// Save email to DB 
server.get("/:email", (req, res) => {

    const newUser = new User();
    newUser.email = req.params.email;
    newUser.save((err, saved) => {
      if(err){
        console.log(err)
      }
      res.json({ status: 'OK' });
    });
  
  
});

server.listen(PORT, () => {
  console.log(`Server started! Listening on ${PORT}`);
});
