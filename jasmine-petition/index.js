const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");

const { hash, compare } = require("./bc");

//const csurf = require("csurf"); not finished
let idFromSignatures;
//console.log(idCookie);
let dataUrlsignature;
let hashFromDb;
let idFromUsers;

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
            db.insertDetails(firstName, lastName, email, hash)
                .then((result) => {
                    req.session.hash = result.rows[0].id;
                    res.redirect("/login");
                    idFromUsers = req.session.hash;
                    console.log("idFromUsers", idFromUsers);
                })
                .catch(() => {
                    res.render("register", {
                        layout: "main",
                        error: "Something went wrong, try again!",
                    });
                });
        })
        .catch((err) => {
            console.log("there is an error in hash", err);
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.getHashByEmail(email)
        .then((hash) => {
            hashFromDb = hash.rows[0].password;
            //console.log("hashFromDb", hashFromDb);

            compare(password, hashFromDb)
                .then((result) => {
                    if (result) {
                        //store the userId in a cookie
                        req.session.userId = hash.rows[0].id;
                        idFromUsers = req.session.userId;
                        // console.log("id from users in compare", idFromUsers);
                        db.checkIfSignatureByUserId(idFromUsers)
                            .then((result) => { 
                                console.log("results", result);
                                res.session.sigId = result.rows[0].id;
                                idFromSignatures = res.session.sigId;
                                res.redirect("/thanks");
                            })
                            .catch((err) => {
                                console.log(
                                    "error in checkIfSignatureByUserId",
                                    err
                                );
                            });
                    }
                })
                .catch((err) => {
                    console.log("error in compare", err);
                });
        })
        .catch((err) => {
            console.log("error in getHashByEmail", err);
        });
});

app.get("/petition", (req, res) => {
    // if (idFromSignatures) {
    //     res.redirect("/thanks");
    // } else {
    res.render("petition", {
        layout: "main",
    });
    // }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    // console.log(firstName, lastName, signature);
    db.insertSignatureAndUserId(signature, idFromUsers) //idFromUsers
        .then((result) => {
            req.session.sigId = result.rows[0].id;
            idFromSignatures = req.session.sigId;
            res.redirect("/thanks");
            console.log("signatures inserted und redirected to thanks");
        })
        .catch((err) => {
            console.log("error in SignatureAndUserId", err);
            res.render("petition", {
                layout: "main",
            });
        });
});

app.get("/thanks", (req, res) => {
    db.getDataOfSignature(idFromSignatures).then((result) => {
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
