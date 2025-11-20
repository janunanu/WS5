// --- Imports ---
const express = require("express"); // Import the Express framework
const mongoose = require("mongoose"); // Import the Mongoose library
require("dotenv").config(); // Import and run the dotenv config to load .env variables

// --- App Setup ---
const app = express(); // Create an Express application instance
// Use the PORT from environment variables, or default to 3000
const PORT = process.env.PORT || 3000;
// Get the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middleware ---
app.use(express.json()); // Tell Express to use the JSON parsing middleware

// --- Database Connection ---
mongoose.connect(MONGODB_URI) // Start the connection process
  .then(() => { // '.then()' runs if the connection is successful
    console.log("Successfully connected to MongoDB Atlas!");
  })
  .catch((error) => { // '.catch()' runs if the connection fails
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the Node.js process with a failure code
  });

// --- Schema and Model ---
// 1. Define the Schema (the blueprint)
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title is a required string
  completed: { type: Boolean, default: false }, // Completed is a boolean, defaults to false
  createdAt: { type: Date, default: Date.now } // CreatedAt is a date, defaults to now
});
// 2. Compile the Schema into a Model
const Todo = mongoose.model("Todo", todoSchema); // 'Todo' model will manage the 'todos' collection

// --- API Routes (CRUD) ---

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running.");
});

// 1. CREATE
app.post("/api/todos", async (req, res) => {
  try {
    const newTodo = new Todo({ title: req.body.title });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. READ (All)
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. READ (One)
app.get("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo == null) {
      return res.status(404).json({ message: "Cannot find todo" });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. UPDATE
app.put("/api/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedTodo == null) {
      return res.status(404).json({ message: "Cannot find todo" });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. DELETE
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (todo == null) {
      return res.status(404).json({ message: "Cannot find todo" });
    }
    res.json({ message: "Deleted Todo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Start Server ---
// Tell the Express app to listen for incoming connections on the specified PORT
app.listen(PORT, () => {
  // This callback function runs once the server is successfully listening
  console.log(`Server listening on port ${PORT}`);
});