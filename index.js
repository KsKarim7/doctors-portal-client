const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const JWT = require('jsonwebtoken');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from doctors portal')
})

app.listen(port, () => {
    console.log(`Doctors Portal listening on port: ${port}`)
})