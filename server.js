/** Server.js, hanterar server-logik, databasanslutning och rutter för kurser */

const { Client } = require("pg");
require("dotenv").config();
const express = require("express");
const app = express();

// inställningar 
app.set("view engine", "ejs"); 
app.use(express.static("public")); 
app.use(express.urlencoded({ extended: true })); 

// anslut till databas
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    },
});

// upprätta anslutning till PostgreSQL
client.connect((err) => {
    if (err) {
        console.log("Connection error: " + err);
    } else {
        console.log("Connected to database!");
    }
});

// startsida - visa kurser
app.get("/", async(req, res) => {
    try {
        // hämtar alla kurser, sorterade med den senaste tillagd sist i listan
        const result = await client.query("SELECT * FROM courses ORDER BY created_at ASC");
        res.render("index", { courses: result.rows });
    } catch (err) {
        res.send("Fel vid hämtning" + err);
    }
});

// lägg till kurs - visa formulär
app.get("/add", (req, res) => {
    res.render("add", { error: "" });
})

// lägg till kurs - hantera post
app.post("/add", async (req, res) => {
    const { coursecode, coursename, syllabus, progression } = req.body;

    // validering på serversidan - kollar att ingen tom data skickas till databasen
    if(!coursecode || !coursename || !syllabus || !progression) {
        return res.render("add", { error: "Alla fält måste fyllas i!" });
    }

    try {
        // SQL query 
        await client.query(
            "INSERT INTO courses(coursecode, coursename, syllabus, progression) VALUES($1, $2, $3, $4)",
            [coursecode, coursename, syllabus, progression]
        );
        res.redirect("/"); // omdirigera till startsidan efter lyckad lagring
    } catch(error) {
        res.render("add", { error: "Ett fel uppstod vid lagring." });
    }
});

// redigera kurs
app.get("/edit/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await client.query("SELECT * FROM courses WHERE id = $1", [id]);
            res.render("edit", { course: result.rows[0], error: "" });
    } catch (err) {
        res.redirect("/")
    }
});

// uppdatera redigerad kurs
app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const { coursecode, coursename, syllabus, progression } = req.body;

    try {
        await client.query(
            "UPDATE courses SET coursecode=$1, coursename=$2, syllabus=$3, progression=$4 WHERE id=$5",
            [coursecode, coursename, syllabus, progression, id]
        );
        res.redirect("/");
    } catch (err) {
        res.render("edit", { course: req.body, error: "Kunde inte uppdatera." });
    }
});

// radera kurs baserat på unikt ID
app.get("/delete/:id", async (req, res) => {
    const id = req.params.id; 
    await client.query("DELETE FROM courses WHERE id = $1", [id]);
    res.redirect("/");
});

// om-sidan
app.get("/about", (req, res) => {
    res.render("about");
})

// starta servern på angiven port eller standardport 3000
app.listen(process.env.PORT || 3000, () => {
    console.log("Server startad på http://localhost:" + (process.env.PORT || 3000));
})

