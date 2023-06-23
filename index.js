const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const UserRoute = require("./Routes/UserRoute");
const PromptRoute = require("./Routes/PromptRoute");
const { notFound, errorHandler } = require("./MiddleWare/errMiddleWare");

// middleware
//new
app.use(cors());
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.z1jayhr.mongodb.net/?retryWrites=true&w=majority;`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// routes start
app.get("/", (req, res) => {
  res.send("neuronex is running");
});
app.use("/user", UserRoute);
app.use("/generate", PromptRoute);
// routes end

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Neuronex is running: ${port}`);
});
//finish index.js
