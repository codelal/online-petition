const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");

const { hash, compare } = require("./bc");

//const csurf = require("csurf"); not finished

//console.log(idCookie);
let dataUrlsignature;
let hashFromDb;
let idFromUsers;
let idFromSignatures;
let notSigned = false;

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
                    notSigned = true;
                    res.redirect("/login");
                    idFromUsers = req.session.hash;
                    // console.log("idFromUsers", idFromUsers);
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
    db.getHashAndIdByEmail(email)
        .then((hash) => {
            // console.log("hash", hash);
            hashFromDb = hash.rows[0].password;
            idFromUsers = hash.rows[0].id;
            // console.log("idFromUsers in hash", idFromUsers);

            compare(password, hashFromDb)
                .then((result) => {
                    if (result) {
                        //store the userId in a cookie
                        req.session.userId = idFromUsers;
                        db.checkIfSignatureByUserId(idFromUsers)
                            .then((result) => {
                                if (!result.rows.length == 0) {
                                    req.session.sigId = result.rows[0].id;
                                    notSigned = false;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    "error in checkIfSignatureByUserId",
                                    err
                                );
                                res.redirect("/petition");
                            });
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: "Something went wrong, try again!",
                        });
                    }
                })
                .catch((err) => {
                    console.log("error in compare", err);
                });
        })
        .catch((err) => {
            console.log("error in getHashByEmail", err);
            res.render("login", {
                layout: "main",
                error: "Something went wrong, try again!",
            });
        });
});

app.get("/petition", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    }
    if (req.session.userId) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    // console.log(firstName, lastName, signature);
    db.insertSignatureAndUserId(signature, idFromUsers) //idFromUsers
        .then((result) => {
            req.session.sigId = result.rows[0].id;
            notSigned = false;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error in SignatureAndUserId", err);
            res.render("petition", {
                layout: "main",
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.sigId) {
        db.getDataOfSignature(req.session.sigId).then((result) => {
            dataUrlsignature = result.rows[0].signature;
            db.getTotalOfSigners().then(({ rows }) => {
                res.render("thanks", {
                    layout: "main",
                    rows,
                    dataUrl: dataUrlsignature,
                });
            });
        });
    } else if(notSigned) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/register");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.sigId) {
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
    }
    if (!req.session.userId) {
        res.redirect("/register");
        
    } 
});

app.listen(8080, () => console.log("Petitionserver listening"));
