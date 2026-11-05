const express = require("express");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

// Middleware to parse JSON and static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MySQL Database Connection Configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "puneeth@mysql",
  database: "events"
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err.message);
  } else {
    console.log("Successfully connected to MySQL database 'events'.");
  }
});

// ----------------------------------------------------
// REST API ROUTES FOR EVENT CRUD OPERATIONS
// ----------------------------------------------------

// 1. GET /events -> Fetch all events
app.get("/events", (req, res) => {
  const query = "SELECT * FROM event";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error: Unable to fetch events." });
    }
    res.json(results);
  });
});

// 2. GET /events/:event_id -> Fetch a single event by ID
app.get("/events/:event_id", (req, res) => {
  const eventId = req.params.event_id;
  const query = "SELECT * FROM event WHERE event_id = ?";

  db.query(query, [eventId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error: Unable to fetch event." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.json(results[0]);
  });
});

// 3. POST /events -> Insert a new event
app.post("/events", (req, res) => {
  const { event_id, event_name, event_type, date, venue, description } = req.body;

  if (!event_id || !event_name) {
    return res.status(400).json({ error: "Event ID and Event Name are required fields." });
  }

  const query = "INSERT INTO event (event_id, event_name, event_type, date, venue, description) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [event_id, event_name, event_type || null, date || null, venue || null, description || null];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Internal Server Error: Unable to insert event. (Event ID might already exist)" });
    }

    res.status(201).json({ message: "Event added successfully.", event_id });
  });
});

// 4. PUT /events/:event_id -> Update an existing event
app.put("/events/:event_id", (req, res) => {
  const eventId = req.params.event_id;
  const { event_name, event_type, date, venue, description } = req.body;

  const query = "UPDATE event SET event_name = ?, event_type = ?, date = ?, venue = ?, description = ? WHERE event_id = ?";
  const values = [event_name, event_type, date, venue, description, eventId];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Internal Server Error: Unable to update event." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found with ID: " + eventId });
    }

    res.json({ message: "Event updated successfully." });
  });
});

// 5. DELETE /events/:event_id -> Delete an event
app.delete("/events/:event_id", (req, res) => {
  const eventId = req.params.event_id;
  const query = "DELETE FROM event WHERE event_id = ?";

  db.query(query, [eventId], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Internal Server Error: Unable to delete event." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found with ID: " + eventId });
    }

    res.json({ message: "Event deleted successfully." });
  });
});

// Start express server
app.listen(PORT, () => {
  console.log(`Event Management Server is running at http://localhost:${PORT}`);
});
