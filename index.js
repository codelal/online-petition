const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");

const { hash, compare } = require("./bc");

//const csurf = require("csurf"); not finished

let dataUrlsignature;
let validUrlUserHp;

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
    res.set("x-frame-options", "DENY");
    next();
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
                    req.session.userId = result.rows[0].id;
                    res.redirect("/profile");
                    //console.log("req.session.userId", req.session.userId);
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
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } else {
            res.render("petition", {
                layout: "main",
            });
        }
    } else {
        res.render("login");
    }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.getHashAndIdByEmail(email)
        .then((hash) => {
            console.log("hash", hash);

            compare(password, hash.rows[0].password)
                .then((result) => {
                    if (result) {
                        //store the userId in a cookie
                        req.session.userId = hash.rows[0].id;

                        db.checkIfSignatureByUserId(req.session.userId)
                            .then((r) => {
                                console.log("das ist r", r);
                                if (r.rows.length) {
                                    req.session.sigId = r.rows[0].id;
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
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("/thanks");
        } else {
            res.render("petition", {
                layout: "main",
            });
        }
    } else {
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    // console.log(firstName, lastName, signature);
    db.insertSignatureAndUserId(signature, req.session.userId)
        .then((result) => {
            req.session.sigId = result.rows[0].id;
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
    if (req.session.userId) {
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
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/register");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.userId) {
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
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/register");
    }
});

app.get("/profile", (req, res) => {
    if (req.session.userId) {
        res.render("profile");
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    // let userId = req.session.userId;

    if (url.startsWith("https://") || url.startsWith("http://")) {
        validUrlUserHp = url;
        // console.log(validUrlUserHp);
    } else {
        validUrlUserHp = "";
    }

    db.insertDataUserProfile(age, city, validUrlUserHp, req.session.userId);
});

app.listen(process.env.PORT || 8080, () => console.log("Petitionserver listening"));
