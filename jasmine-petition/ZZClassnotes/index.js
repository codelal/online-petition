const express = require("express");
const app = express();
const db = require("./db");

app.use((req, res, next) =>{
    console.log("-------");
    console.log(`${req.method} request coming in on route ${req.url}`);
})

app.get("/actors", (req, res) =>{
    db.getActors().then({rows}) => {
        console.log("results from Actors:", result.rows);
        res.sendStatus(200):
    })
    .catch((err) =>{
console.log("error in db.getActors", err)
    })
});

app.post("/add-actors", (req, res)=>{
    db.addActors("leo", "laala").then() => {
        console.log("hhh");
        res.sendStatus(200):
    })
    .catch((err)=>{
console.log("error:", err)
    })

});


app.listen(8080, () => console.log("petition server running"));