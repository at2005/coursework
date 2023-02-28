const express = require("express");
const cors = require("cors");
var sqlite3 = require("sqlite3");
var bodyParser = require('body-parser');
var fs = require('fs');

let db = new sqlite3.Database('./diplomacy.db');

const PORT = process.env.PORT || 3005;

const app = express();
app.use(cors({origin: "http://localhost:3000"}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// initialise file for storing moves
fs.writeFile("moves.txt", "INIT\n", function(err) {console.log(err)});

app.get("/", function(req, res) {
  res.send("Hello World!");
});


const run_async_general = (query) => {
  return new Promise((resolve, reject) => {
    db.all(`${query}`, (err, rows) => {
      if(err) reject(err);
      resolve(rows);
    });
  }); 
}

app.get("/api", (req, res) => {res.send("Hello World!")});

app.get("/api/get_moves", function(req, res) {
  moves = fs.readFileSync("moves.txt", "utf8");
  res.send(moves);
});


app.post("/api/write_move", function(req, res) {
  // write to file
  const content = (req.body.unit_a_type + " " + req.body.unit_b_type + " " + req.body.current_a + " " + req.body.current_b + " " + req.body.target_a + " " + req.body.target_b + "\n");
  fs.writeFileSync("moves.txt", content, {flag: "a+"});
  res.send("Success");

});



// app.post("/api", (req, res) => {
//   if (req.body.api_type == "add_task") {
//     let task_name = req.body.task_name;
//     let task_desc = req.body.task_desc;
//     let task_date = req.body.task_date;
//     let task_status = "todo";
//     let email = req.body.task_user;
    
//     run_async_general(`SELECT * FROM user WHERE email="${email}"`).then((response) => {
//       let user_id = response[0].id;
//       let query =  `
//       INSERT INTO tasks (user_id, task_name, task_description, task_date, task_status) VALUES (${user_id},"${task_name}", "${task_desc}", "${task_date}", "${task_status}");
//       `
//       db.run(
//        query, function(err) {
//         if (err) {
//           console.log("Error: " + err);
//         }
  
  
//       });

//       res.json({});
  
//     });
  
//   }
// });


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on ${PORT}`);
});

