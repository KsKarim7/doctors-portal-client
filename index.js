const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const JWT = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.txdd6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('doctors_portal').collection('services')
        const bookingCollection = client.db('doctors_portal').collection('bookings')


        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // warning
        // This is not the proper way to query
        // after learning more about mongodb. use aggregate lookup, pipeline, match, group
        app.get('/available', async (req, res) => {
            const date = req.query.date;

            // step:1 -get all services
            const services = await serviceCollection.find().toArray();

            // step 2: get the booking of that day
            const query = { date: date };
            const bookings = await bookingCollection.find(query).toArray();

            // step:3 for each service, f
            services.forEach(service => {
                // step 4:ind bookings for that service
                const serviceBookings = bookings.filter(book => book.treatment === service.name);
                // step 5: select slots for the service Bookings: 
                const bookedSlots = serviceBookings.map(book => book.slot);
                // step 6: select those slots that are not included in bookedSlots
                const available = service.slots.filter(s => !bookedSlots.includes(s))
                service.available = available;
            })

            res.send(services)
        })

        /** 
         * API Naming Convention
         * app.get('/booking') --it means to get all the booking of the collection or to get more than one booking or by filter
         * app.get('/booking:id') -- means to get a specific booking by id
         * app.post ('/booking') -- means to add a new booking
         * app.patch ('/booking:id') -- means to update a specific booking by id
         * app.delete ('/booking:id') -- means to delete a specific booking by id
        */

        app.get('/booking', async (req, res) => {
            const patient = req.query.patient;
            const query = { patient: patient };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)
        })

        // app.get('/booking', async (req, res) => {
        //     const patient = req.query.patient;
        //     const query = { patient: patient };
        //     const bookings = await bookingCollection.find(query).toArray();
        //     res.send(bookings);
        // })

        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const exists = await bookingCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, booking: exists })
            }
            const result = await bookingCollection.insertOne(booking);
            return res.send({ success: true, result });
        })


    }
    finally {

    }
}
run().catch(console.dir)

// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });


app.get('/', (req, res) => {
    res.send('Hello from doctors portal')
})

app.listen(port, () => {
    console.log(`Doctors Portal listening on port: ${port}`)
})