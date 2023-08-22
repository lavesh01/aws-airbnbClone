const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking');
const multer = require('multer');
const mime = require('mime-types');

require('dotenv').config();

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname + '/uploads'));
app.use(cors({ credentials:true, origin: process.env.ORIGIN_URL}));

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "lasjfksafl";
const bucket = 'lavesh-booking-app';

async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: 'public-read',
    }));
    return `https:///${bucket}.s3.amazonaws.com/${newFilename}`;

}

app.post('/register', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        });
        res.json(userDoc);
    } catch (error) {
        console.error(error);
        res.status(422).json({ message: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    const { email, password } = req.body;
    try {
        const userDoc = await User.findOne({ email });

        if (userDoc) {
            const passOk = bcrypt.compareSync(password, userDoc.password);
            if (passOk) {
                jwt.sign({
                    email: userDoc.email,
                    id: userDoc._id
                }, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(userDoc);
                });
            } else {
                res.status(422).json('pass not ok');
            }
        } else {
            res.json("Login failed!");
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while logging in.' });
    }
});

app.get('/profile', (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    const { token } = req.cookies;
    try {
        if (token) {
            jwt.verify(token, jwtSecret, {}, async (err, userData) => {
                if (err) throw err;
                const { name, email, id } = await User.findById(userData.id);
                res.json({ name, email, id });
            });
        } else {
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the profile.' });
    }
});

app.post('/logout', (req, res) => {
    try {
        res.cookie('token', '').json(true);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while logging out.' });
    }
});

app.post('/upload-by-link', async (req, res) => {
    try {
        const { link } = req.body;
        const newName = 'photo' + Date.now() + '.jpg';
        await imageDownloader.image({
            url: link,
            dest: '/tmp/' + newName,
        });
        const url = await uploadToS3('/tmp/' + newName, newName, mime.lookup('/tmp/' + newName) );
        res.json(url);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while uploading an image by link.' });
    }
});

const photosMiddleware = multer({dest:'/tmp'});

app.post('/upload', photosMiddleware.array('photos', 100) , async (req, res) => {
    try {
        const uploadedFiles = [];
        for (let i = 0; i < req.files.length; i++) {
            const { path, originalname, mimetype } = req.files[i];
            const url = await uploadToS3(path, originalname, mimetype);
            uploadedFiles.push(url);
        }
        res.json(uploadedFiles);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while uploading images.' });
    }
});


app.post('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        const { token } = req.cookies;
        const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;

            const placeDoc = await Place.create({
                owner: userData.id,
                title, address, photos: addedPhotos,
                description, perks, extraInfo,
                checkIn, checkOut, maxGuests, price
            });
            res.json(placeDoc);
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating a new place.' });
    }
});

app.put('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        const { token } = req.cookies;
        const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const placeDoc = await Place.findById(id);

            if (userData.id === placeDoc.owner.toString()) {
                placeDoc.set({
                    title, address, photos: addedPhotos,
                    description, perks, extraInfo,
                    checkIn, checkOut, maxGuests, price
                });
                await placeDoc.save();
                res.json("ok");
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the place.' });
    }
});

app.get('/user-places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        const { token } = req.cookies;

        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { id } = userData;
            const placeDoc = await Place.find({ owner: id });
            res.json(placeDoc);
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching user places.' });
    }
});

app.get('/places/:id', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        const { id } = req.params;
        const placeDoc = await Place.findById(id);
        res.json(placeDoc);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the place.' });
    }
});

app.get('/places', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        res.json(await Place.find());
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching places.' });
    }
});

app.post('/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        const userData = await getUserDataFromReq(req);
        const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;
        const bookingDoc = await Booking.create({
            place, user: userData.id, checkIn, checkOut, numberOfGuests, name, phone, price
        });
        res.json(bookingDoc);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating a booking.' });
    }
});


function getUserDataFromReq(req) {    
    return new Promise((resolve,reject) => {

        jwt.verify(req.cookies.token, jwtSecret,{}, async (err, userData) => {
            if(err) throw err;
            resolve(userData);
        })
    });
}

app.get('/bookings', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL).then((e) => {
        console.log("MongoDB connected successfully!")
    }).catch(err => console.log(err));
    
    try {
        const userData = await getUserDataFromReq(req);
        const bookings = await Booking.find({ user: userData.id }).populate('place');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching bookings.' });
    }
});

app.listen( process.env.PORT || 8080, () => {
    console.log(`Port listening on ${process.env.PORT}.`);
})