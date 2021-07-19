var express = require("express");
var app = express();
var connectDB = require("./config/db");
var cors = require("cors");

//Connecting database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

//Defining routes
app.use("/api/db", require("./routes/crud"));

//heroku deploy codes
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//Declaring the servers
var port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on ${port}`));
