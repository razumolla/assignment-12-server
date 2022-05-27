const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mt0mx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    console.log("DB Connected");
    const toolCollection = client.db("electronic_house").collection("tools");
    const orderCollection = client.db("electronic_house").collection("order");

    // get all tools
    app.get('/tools', async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    })
    // get one data for purchase page
    app.get('/tools/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const tool = await toolCollection.findOne(query);
      res.send(tool)
    })
    // send data to server from order
    app.post("/order", async (req, res) => {
      const product = req.body;
      const result = await orderCollection.insertOne(product);
      res.send(result)
    })




  } finally {
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/house', (req, res) => {
  res.send('Hello From Electronic Tools House')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})