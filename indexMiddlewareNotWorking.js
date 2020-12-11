const express = require("express");
const app = express();
// const app = (module.exports.app = express());
const hb = require("express-handlebars");
const db = require("./db");
const { hash, compare } = require("./bc");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const {
    requireLoggedOutUser,
    requireUnsignedPetition,
    requireSignedPetition,
    requireLoggedInUser,
} = require("./middleware");

exports.app = app;

let dataUrlsignature;
let validUrlUserHp;

//Für Test
//const app = (exports.app = express());
// //alternativ in 2 lines: const app = express();exports.app = app;
// const { TestScheduler } = require("jest");
// const supertest = require("supertest");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: `pure being and pure nothing are the same.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use(csurf());

// app.use(requireLoggedOutUser);
// app.use(requireUnsignedPetition);
// app.use(requireSignedPetition);
// app.use(requireLoggedInUser);

app.use(function (req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    // res.locals.isAuthenticated = req.session.userId;
    console.log("-------");
    console.log(`${req.method} request coming in on route ${req.url}`);
    next();
});

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
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
                        error: "Something went wrong, try again!",
                    });
                });
        })
        .catch((err) => {
            console.log("there is an error in hash", err);
        });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    db.getHashAndIdByEmail(email)
        .then((hash) => {
            //   console.log("hash", hash);

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
                error: "Something went wrong, try again!",
            });
        });
});

app.get("/petition", requireUnsignedPetition, (req, res) => {
    res.render("petition");
});

app.post("/petition", requireUnsignedPetition, (req, res) => {
    const { signature } = req.body;
    // console.log(firstName, lastName, signature);
    if (signature) {
        db.insertSignatureAndUserId(signature, req.session.userId)
            .then((result) => {
                //console.log("result from insertSignature", result);
                req.session.sigId = result.rows[0].id;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in SignatureAndUserId", err);
                res.render("petition");
            });
    } else {
        //console.log("no signature");
        res.render("petition", {
            layout: "main",
            noSignature:
                "You still want to think about it? no problem take you time",
        });
    }
});

app.get("/thanks", requireSignedPetition, (req, res) => {
    db.getSignature(req.session.sigId).then((result) => {
        dataUrlsignature = result.rows[0].signature;
        db.getTotalOfSigners().then(({ rows }) => {
            res.render("thanks", {
                layout: "main",
                rows,
                dataUrl: dataUrlsignature,
            });
        });
    });
});

app.post("/thanks", requireSignedPetition, (req, res) => {
    db.deleteSignature(req.session.sigId)
        .then(() => {
            req.session.sigId = false;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error deleteSignature", err);
        });
});

app.get("/signers", requireSignedPetition, (req, res) => {
    db.getDataForSigners()
        .then(({ rows }) => {
            // console.log("result from getDataForSigners",rows);
            res.render("signers", {
                layout: "main",
                rows,
            });
        })
        .catch((err) => {
            console.log("error in db.getNames", err);
        });
});

app.get("/profile", requireLoggedInUser, (req, res) => {
    res.render("profile");
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    let { age, city, url } = req.body;
    if (age == "") {
        age = null;
    }

    if (url.startsWith("https://") || url.startsWith("http://")) {
        validUrlUserHp = url;
        // console.log(validUrlUserHp);
        db.insertDataUserProfile(age, city, validUrlUserHp, req.session.userId)
            .then(() => {
                //console.log("result1 from Profil insert", result);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error from insertDataUserProfile", err);
                res.render("profile", {
                    layout: "main",
                    error: "Something went wrong, try again!",
                });
            });
    } else {
        validUrlUserHp = "";
        db.insertDataUserProfile(age, city, validUrlUserHp, req.session.userId)
            .then(() => {
                //console.log("result2 from Profil insert", result);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error from insertDataUserProfile", err);
                res.render("profile", {
                    layout: "main",
                    error: "Something went wrong, try again!",
                });
            });
    }
});

app.get("/profile/edit", requireLoggedInUser, (req, res) => {
    db.getProfileData(req.session.userId)
        .then(({ rows }) => {
            //console.log("getProfileData result", rows);
            res.render("edit", {
                rows,
            });
            console.log("req.body", req.body);
        })
        .catch((err) => {
            console.log("error from getProfileData", err);
        });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    let { firstName, lastName, email, password, age, city, url } = req.body;
    console.log(firstName, lastName, email, password, age, city, url);
    if (age == "") {
        age = null;
        console.log("age is Null");
    }
    if (password) {
        hash(password).then((hash) => {
            db.updateUsersWithPassword(
                firstName,
                lastName,
                email,
                hash,
                req.session.userId
            )
                .then(() => {})
                .catch((err) => {
                    console.log("error in updateUsersWithPassword", err);
                    res.render("edit", {
                        error: "Something went wrong, try again!",
                    });
                });
        });

        db.updateUserProfiles(req.session.userId, age, city, url)
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in updateUserProfiles", err);
                res.render("edit", {
                    error: "Something went wrong, try again!",
                });
            });
    } else {
        // console.log("no password");
        db.updateUsersWithoutPassword(
            firstName,
            lastName,
            email,
            req.session.userId
        )
            .then((result) => {
                //  console.log("result updateUsersWithoutPassword", result);
            })
            .catch((err) => {
                console.log("err pdateUsersWithoutPassword", err);
                res.render("edit", {
                    error: "Something went wrong, try again!",
                });
            });
        db.updateUserProfiles(req.session.userId, age, city, url)
            .then((result) => {
                // console.log(" result updateUserProfiles", result);
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in updateUserProfiles", err);
                res.render("edit", {
                    error: "Something went wrong, try again!",
                });
            });
    }
});

app.get("/signers/:city", requireSignedPetition, (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            const { city } = req.params;
            console.log("city", city);
            // city.toLocaleLowerCase();
            db.getSignersByCity(city)
                .then(({ rows }) => {
                    console.log("signers by city", rows);
                    res.render("signersByCity", {
                        city: city,
                        rows,
                    });
                })
                .catch((err) => {
                    console.log("error getSignersByCity", err);
                });
        } else {
            res.redirect("/petition");
        }
    } else {
        res.redirect("/register");
    }
});

app.get("/logout", (req, res) => {
    req.session.userId = false;
    req.session.sigId = false;
    res.redirect("/register");
});

//für jest: jest soll server nicht starten)
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Petitionserver listening")
    );
}
