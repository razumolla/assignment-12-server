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


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized Access' });
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    req.decoded = decoded;
    next();
  })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mt0mx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    console.log("DB Connected");
    const toolCollection = client.db("electronic_house").collection("tools");
    const orderCollection = client.db("electronic_house").collection("order");
    const userCollection = client.db("electronic_house").collection("users");
    const reviewCollection = client.db("electronic_house").collection("reviews");

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
    // send data to server from add product
    app.post("/tools", async (req, res) => {
      const product = req.body;
      const result = await toolCollection.insertOne(product);
      res.send(result)
    })
    // delete tool from server from manage product
    app.delete("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await toolCollection.deleteOne(query);
      res.send(result);
    })





    // send data to server from My review
    app.post("/reviews", async (req, res) => {
      const product = req.body;
      const result = await reviewCollection.insertOne(product);
      res.send(result)
    })

    //load data to server from My review
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })





    // send data to server from order
    app.post("/order", async (req, res) => {
      const product = req.body;
      const result = await orderCollection.insertOne(product);
      res.send(result)
    })
    // get data from server from order
    app.get("/order", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })
    // delete order from server from my-order page
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })



    // update user >order Quantity
    /*  app.put('/tools/:id', async (req, res) => {
       const quantity = req.params.quantity;
       const newQuantity = req.body;
       const filter = { _id: ObjectId(id) };
       const options = { upsert: true }
       const updatedDoc = {
         $set: {
           quantity: newQuantity
         }
       }
       const result = await toolCollection.updateOne(filter, updatedDoc, options);
       res.send(result);
     }) */

    // get data to MyOrder page
    app.get("/order", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { email: email }
        const orders = await orderCollection.find(query).toArray();
        res.send(orders)
      }
      else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })


    // create user 
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email }
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    })

    // Admin panel 
    app.put('/user/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        const filter = { email: email }
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else {
        res.status(403).send({ message: "Forbidden" })
      }
    })

    // useAdmin er jonno :if you admin , you see all user
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email })
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })



    // get all user and show All Users page
    app.get('/user', verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users)
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