const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");

const { hash, compare, insertDatails } = require("./bc");

//const csurf = require("csurf"); not finished
let idCookie;
//console.log(idCookie);
let dataUrlsignature;

app.use(
    cookieSession({
        secret: `pure being and pure nothing are the same.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static("./public"));
//app.use(csurf()); //protect against CSURF - not finished

app.use((req, res, next) => {
    console.log("-------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    res.set("x-frame-options", "DENY"); //protect against framing
    // res.locals.csrfToken = req.csrfToken();//protect against CSURF - not finished
    ////
    // if (!req.session.userId) {
    //     if (req.url !== "/petition") {
    //         res.redirect("/petition");
    //     } else {
    //         next();
    //     }
    // } else {
    next();
    // }
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    //console.log(req.body);
    const { firstName, lastName, email, password } = req.body;
    hash(password)
        .then((hash) => {
            //  console.log("this is the hash", hash);
            db.insertDetails(firstName, lastName, email, hash).then(
                (result) => {
                    //console.log(result);
                    req.session.hash = result.rows[0].id;
                    idCookie = req.session.hash;
                    //console.log(idCookie);
                }
            );
        })
        .catch((err) => {
            console.log("there is an error in hash", err);
            res.render("register", {
                layout: "main",
                error: "Something went wrong, try again!",
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.get("/petition", (req, res) => {
    if (req.session.userId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    // const { firstName, secondName, signature } = req.body;
    // console.log(firstName, secondName, signature);
    db.NameAndSignature(firstName, lastName, signature)
        .then((result) => {
            if (firstName && lastName && signature) {
                req.session.userId = result.rows[0].id;
                idCookie = req.session.userId;
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
    db.getDataOfSignature(idCookie).then((result) => {
        dataUrlsignature = result.rows[0].signature;
    });
    db.getTotalOfSigners().then(({ rows }) => {
        res.render("thanks", {
            layout: "main",
            rows,
            dataUrl: dataUrlsignature,
        });
    });
});

app.get("/signers", (req, res) => {
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
});

app.listen(8080, () => console.log("Petitionserver listening"));
