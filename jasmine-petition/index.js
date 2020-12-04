const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
//const cookieParser = require("cookie-parser");
//const csurf = require("csurf"); not finished

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
//app.use(cookieParser());

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    }));

//app.use(csurf()); //protect against CSURF - not finished

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
   
    }*/ 
    res.set("x-frame-options", "DENY"); //protect against framing
   // res.locals.csrfToken = req.csrfToken();//protect against CSURF - not finished
    next();
});

app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    // if (req.cookies.petitionSigned) {
    //     res.redirect("/thanks");
    // } else {
    res.render("petition", {
        layout: "main",
    });
    // }
});

app.post("/petition", (req, res) => {
    const { firstName, secondName, signature } = req.body;
    console.log(firstName, secondName, signature);
    db.NameAndSignature(firstName, secondName, signature)
        .then(() => {
            // console.log("it worked");
            if (firstName && secondName && signature) {
                //res.cookie("petitionSigned", true);
                res.redirect("/thanks");
            }
        })
        .catch((err) => {
            console.log("error in db.NameAndSignature", err);
            res.render("petition", {
                layout: "main",
            });
        });
});

app.get("/thanks", (req, res) => {
    db.getTotalOfSigners().then(({ rows }) => {
        console.log(rows);
        res.render("thanks", {
            layout: "main",
            rows,
        });
    });

    //if (req.cookies.petitionSigned) {

    // } else {
    //     res.redirect("/petition");
    // }
});

app.get("/signers", (req, res) => {
    // if (!req.cookies.petitionSigned) {
    //     res.render("petition", {
    //         layout: "main",
    //     });
    // } else {

    db.getNames()
        .then(({ rows }) => {
            // console.log("result from getNames", rows);
            res.render("signers", {
                layout: "main",
                rows,
            });
        })
        .catch((err) => {
            console.log("error in db.getNames", err);
        });
    // }
});

app.listen(8080, () => console.log("Petitionserver listening"));
