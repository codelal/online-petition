const express = require("express");
const app = express();
const db = require("./db");
const cookieParser = require("cookie-parser");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(cookieParser());
app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use((req, res, next) => {
    console.log("-------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    /* if (!req.cookies.petitionSigned) {
        if (req.url !== "/petition") {
            res.redirect("/petition");
        } else {
            next();
        }
    } else {
        
    }*/ next();
});

app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    if (req.cookies.petitionSigned) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    const { firstName, secondName, signature } = req.body;
    // console.log(firstName, secondName, signature);
    db.NameAndSignature(firstName, secondName, signature).then(() => {
        console.log("it worked");
        res.sendStatus(200);
    }).catch((err) =>{
        console.log("error in db.NameAndSignature", err);
    });

    if (firstName && secondName && signature) {
        res.cookie("petitionSigned", true);
        res.redirect("/thanks");
    }
});

app.get("/thanks", (req, res) => {
    if (req.cookies.petitionSigned) {
        res.render("thanks", {
            layout: "main",
        });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    if (!req.cookies.petitionSigned) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.render("signers", {
            layout: "main",
        });
    }
});

app.listen(8080, () => console.log("Petitionserver listening"));
