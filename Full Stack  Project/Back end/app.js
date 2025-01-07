const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const multer = require('multer');

const app = express();

const { v4: uuidv4 } = require('uuid');
     
const fileStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
    app.use(
        multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
      );
      
//app.use(BodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); //application/json
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

app.use('/feed',feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {

    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message})

})
mongoose.connect('')
.then(result => {
    let server=app.listen(8000);
    const io = require('socket.io')(server, {
        cors: {
          origin: "http://localhost:3000", // Front-end URL
          methods: ["GET", "POST"],
          allowedHeaders: ["Content-Type"],
          credentials: true
        }
      });
    io.on('connection', socket => {
        console.log('Client connected');
    })
})
.catch(err =>  {
    console.log(err)
})