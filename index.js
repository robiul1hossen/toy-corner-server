const express = require("express");
var cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dowmgti.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const alltoysCollection = client.db("toyCorner").collection("alltoys");
    const usersCollection = client.db("toyCorner").collection("users");

    // creating users
    app.post("/users", async (req, res) => {
      const users = req.body;
      const query = { email: users.email };

      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exist" });
      }
      const result = await usersCollection.insertOne(users);
      res.send(users);
    });

    // get user
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/alltoys", async (req, res) => {
      const result = await alltoysCollection.find().toArray();
      res.send(result);
    });

    // shop by category api
    app.get("/subcategories/toys/:subcategory", async (req, res) => {
      const subcategory = req.params.subcategory;
      const query = { subcategory: subcategory };
      try {
        const data = await alltoysCollection.find(query).toArray();
        res.json(data);
      } catch (error) {
        res
          .status(500)
          .json({ error: "An error occurred while fetching data." });
      }
    });

    // get toy details by id
    app.get("/toy-details/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await alltoysCollection.findOne(filter);
      res.send(result);
    });

    // get toys by using seller email
    app.get("/my-toys", async (req, res) => {
      const sellerEmail = req.query.email;
      const result = await alltoysCollection
        .find({ sellerEmail: sellerEmail })
        .toArray();
      res.send(result);
    });

    // add a new toy api
    app.post("/alltoys", async (req, res) => {
      const newToy = req.body;
      const result = await alltoysCollection.insertOne(newToy);
      res.send(result);
    });

    // Delete a toy by ID
    app.delete("/delete-toy/:id", async (req, res) => {
      const toyId = req.params.id;
      const query = { _id: new ObjectId(toyId) };

      const result = await alltoysCollection.deleteOne(query);
      res.send(result);
    });

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

app.get("/", (req, res) => {
  res.send("toy is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
