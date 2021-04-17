const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const port = process.env.PORT || 4000;


app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('This is complete-website-server!')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.kbcau.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db("house-relocation").collection("services");
    const adminCollection = client.db("house-relocation").collection("admin");
    const bookingCollection = client.db("house-relocation").collection("booking");
    const reviewsCollection = client.db("house-relocation").collection("reviews");

    //post services to db

    app.post('/addServices', (req, res) => {
        const newService = req.body;
        servicesCollection.insertOne(newService)
            .then(result => {
                res.send(result.insertedCount > 0)
                console.log(result.insertedCount)
            })
    })

    // get services from db to show in ui

    app.get('/services', (req, res) => {
        servicesCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    //manage services

    app.get('/manage', (req, res) => {
        servicesCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    //delete single service item

    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        servicesCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })

    // adding admin
    app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
            .then(result => res.send(result.insertedCount > 0))
    })

    //load selected service

    app.get('/select/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        servicesCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    // add booking to db

    app.post('/addBooking', (req, res) => {
        const booking = req.body;
        bookingCollection.insertOne(booking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    // adding review

    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
            .then(result => res.send(result.insertedCount > 0))
    })


    // loading all reviews

    app.get('/allReviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, docs) => res.send(docs));
    })

    // loading all bookings
    app.get('/allBookings', (req, res) => {
        bookingCollection.find({})
            .toArray((err, docs) => res.send(docs));
    })

    // loading bookings by email
    app.get('/bookingInfo', (req, res) => {
        bookingCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // updating order
    app.patch('/edit/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        bookingCollection.updateOne({ _id: id },
            {
                $set: {
                    status: req.body.status
                }
            })
            .then(result => res.send(result.modifiedCount > 0))
    })

    // Is Admin post
    app.post("/isAdmin", (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })

});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

