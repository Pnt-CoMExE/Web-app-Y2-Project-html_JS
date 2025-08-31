const express = require("express");
const path = require("path");
// database connection
const con = require("./config/db");


const app = express();
//set "public" folder to be static folder, user can access it directly
app.use(express.static(path.join(__dirname, "public")));

// for json exchange
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============= Login ==============
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const sql = "SELECT id, username, role FROM user WHERE username = ? AND password = ?";

    con.query(sql, [username, password], function (err, results) {
        if (err) {
            return res.status(500).send("Database server error");
        }
        if (results.length != 1) {
            return res.status(401).send("Wrong username or password");
        }
        res.status(200).send("Login successful");
    });
});

// ============= Root ==============
app.get("/", function (_req, res) {
    res.sendFile(path.join(__dirname, "views/index.html"));
});

const port = 3000;
app.listen(port, function () {
    console.log("Server is ready at " + port);
});
