const express = require("express");
const cors = require("cors");
var bodyParser = require('body-parser');
var fs = require('fs');


let counter = 41;

const PORT = process.env.PORT || 3005;

const app = express();
app.use(cors({origin: "http://localhost:3000"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {res.send("Hello World!")});

app.post("/api/post_event_log", function(req, res) {
  let data_json = req.body;
  data_json = JSON.stringify(data_json);
  fs.writeFile("data/moves" + counter.toString() + ".json", data_json, () => {
    console.log("Success");
    res.send({body: "Success"});
  });  

  counter++;

});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});

