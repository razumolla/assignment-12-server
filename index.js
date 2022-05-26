const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json());





app.get('/home', (req, res) => {
  res.send('Hello From Electronic Tools House')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})