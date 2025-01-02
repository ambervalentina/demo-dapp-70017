const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;

// Enable CORS
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api", require("./routes/apiRoutes"));

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
