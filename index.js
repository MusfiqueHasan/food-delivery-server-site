const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config()


const app = express();
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ga0n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function run() {
    try {
        await client.connect();
        const database = client.db("food-delivery-system");
        const restaurantCollection = database.collection("restaurant");
        const itemsCollection = database.collection("items");
        const catagoriesCollection = database.collection("categories");
        const myOrdersCollection = database.collection("myOrders");

        // create categories
        app.post("/addCategories", async (req, res) => {

            const result = await catagoriesCollection.insertOne(req.body);
            res.send(result);
        });

        // get all categories

        app.get("/addCategories", async (req, res) => {
            const result = await catagoriesCollection.find({}).toArray();
            res.send(result);

        });
        // create categories
        app.post("/addRestaurant", async (req, res) => {

            const result = await restaurantCollection.insertOne(req.body);
            res.send(result);
        });
        // get all categories

        app.get("/addRestaurant", async (req, res) => {
            const result = await restaurantCollection.find({}).toArray();
            res.send(result);

        });

        // create foodItems
        app.post("/addFoodItems", async (req, res) => {

            const result = await itemsCollection.insertOne(req.body);
            res.send(result);
        });
        // get all foodItems
        app.get("/addFoodItems", async (req, res) => {
            const result = await itemsCollection.find({}).toArray();
            res.send(result);

        });

        // create myOrders
        app.post("/myOrders", async (req, res) => {
            const { title, userEmail } = req.body
            let product = await myOrdersCollection.findOne({ title: title, userEmail: userEmail })

            if (!product) {
                const result = await myOrdersCollection.insertOne(req.body);
                res.send(result);

            } else {
                console.log('product already added yet')
                res.send('product already added')
            }
        });
        // get my orders by email
        app.get("/myOrders/:email", async (req, res) => {
            const result = await myOrdersCollection.find({
                userEmail: req.params.email,
            }).toArray();
            res.send(result);
        });

        // get all orders 
        app.get("/myOrders", async (req, res) => {
            const result = await myOrdersCollection.find({}).toArray();
            res.send(result);
        });
        // delete all orders 
        app.delete("/myOrders/:orderId", async (req, res) => {
            const id = req.params.orderId;
            const query = { _id: ObjectId(id) }
            const items = await myOrdersCollection.deleteOne(query)
            res.json(items)
        });

        // get orders to checkout
        app.get("/addFoodItems/:itemsId", async (req, res) => {
            const id = req.params.itemsId;
            const query = { _id: ObjectId(id) }
            const items = await itemsCollection.findOne(query)
            res.json(items)
        });
        // update orders 
        app.put("/myOrders/:itemsId", async (req, res) => {
            const id = req.params.itemsId;
            const item = await itemsCollection.findOne({ _id: ObjectId(id) })
            const updatedOrder = req.body;
            const filter = { title: item.title }
            const options = { update: true }
            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                }
            };
            const items = await myOrdersCollection.updateOne(filter, updateDoc, options)
            res.send(items)
        });
        // update order approval
        app.put("/myOrdersAdmin/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const item = await myOrdersCollection.findOne({ _id: ObjectId(id) })
            const updatedOrder = req.body;
            const filter = { title: item.title }
            const options = { update: true }
            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                }
            };
            const items = await myOrdersCollection.updateOne(filter, updateDoc, options)
            res.send(items)
        });

        app.get("/getRestaurantItems/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const restaurant = await restaurantCollection.findOne(query)
            const Categories = restaurant.categories
            const allItems = await itemsCollection.find({}).toArray()
            const currentItems = allItems.filter(item => Categories.includes(item.categories) && item)
            
            res.json(currentItems)
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('successfully connected')
})

app.listen(port, () => {
    console.log("successfully running on", port)
})
