const Express = require("express");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");

const app = Express();
app.use(cors());
app.use(Express.json()); // Add this line to parse JSON bodies

const CONNECTION_STRING = "mongodb+srv://nataliehill1324:nrfyN0J2XP5HZV83@lucci.biugtlq.mongodb.net/?retryWrites=true&w=majority";
const DATABASENAME = "luccidb";
var database;

app.listen(5038, () => {
    MongoClient.connect(CONNECTION_STRING, (error, client)=> {
        database=client.db(DATABASENAME);
        console.log("Mongo database connected successfully.")
    });
})

// Get users from DB
app.get('/api/lucci/users', (request, response) => {
    database.collection("users").find({}).toArray((error, users) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.send(users);
    });
});

// Add a new user to DB
app.post('/api/lucci/users', (request, response) => {
    const newUser = request.body;
    database.collection("users").insertOne(newUser, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        response.status(201).send(result.ops[0]);
    });
});

// Register a new user
app.post('/api/lucci/register', async (request, response) => {
    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10);
        // Correctly construct newUser object
        const newUser = {
            email: request.body.email, // Assign email directly
            password: hashedPassword
        };
        await database.collection("users").insertOne(newUser);
        response.send("Registration successful");
    } catch (error) {
        response.status(500).send("Error registering user");
    }
});



// Login user
app.post('/api/lucci/login', async (request, response) => {
    try {
        const user = await database.collection("users").findOne({ email: request.body.email });
        if (user && await bcrypt.compare(request.body.password, user.password)) {
            response.send("Login successful");
        } else {
            response.status(400).send("Invalid credentials");
        }
    } catch (error) {
        response.status(500).send("Error logging in");
    }
});