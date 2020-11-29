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
const { google } = require("googleapis");


const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const accessToken = oauth2Client.getAccessToken();

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
});

mongoose.set("debug", true); */

server.use(formData.parse());

//server.use(cors(corsOptions));

/* server.use(cors());
 */

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

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

/* server.get("/freebies", (req, res) => {
  res.download('./assets/freebieGifs.zip', 'freebieGifs.zip', function(err) {
    if(err){
        console.log(err)    
    } else {
        console.log('File sent')
    }
})
}) */

// Save email to DB
server.get("/:email", (req, res) => {
/*   const newUser = new User();
  newUser.email = req.params.email;

  newUser.save((err, saved) => {
    if (err) {
      console.log(err);
    }
    res.json({ status: "OK" });
  }); */

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "thecottagedreamers@gmail.com", //your gmail account you used to set the project up in google cloud console"
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken //access token variable we defined earlier
    },
  });

  const options = {
    viewEngine: {
      partialsDir: __dirname + "/views/partials",
      layoutsDir: __dirname + "/views/layouts",
      extname: ".hbs",
    },
    extName: ".hbs",
    viewPath: "views",
  };

  transporter.use("compile", hbs(options));

  const mailOptions = {
    from: "thecottagedreamers@gmail.com",
    to: req.params.email,
    subject: "Here is your Gift from Us :)",
    template: "index",
    attachments: [{ path: "./assets/freebieGifs.zip" }],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent:" + info.response);
      res.send("OK");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server started! Listening on ${PORT}`);
});
