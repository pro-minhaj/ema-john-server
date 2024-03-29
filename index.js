const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middle wore
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xevudqv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const database = client.db("emaJohnDB");
    const productsDB = database.collection("products");

    app.get('/total', async(req, res) => {
      const total = await productsDB.estimatedDocumentCount();
      res.send({total})
    })

    app.get("/products", async (req, res) => {
      const {page, limit} = req.query;
      const pageNumber = parseInt(page) || 0;
      const itemsPerPage = parseInt(limit) || 10;
      const skip = pageNumber * itemsPerPage;
      const result = await productsDB.find().skip(skip).limit(itemsPerPage).toArray();
      res.send(result);
    });

    app.post('/productids', async(req, res) => {
      const ids = req.body;
      const objectIds = ids.map(id => new ObjectId(id));
      const query = { _id: { $in: objectIds } };
      const result = await productsDB.find(query).toArray();
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
