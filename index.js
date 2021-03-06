const express = require("express");
const app = (module.exports.app = express());
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

const error = "Something went wrong, try again!";

let dataUrlsignature;
let validUrlUserHp;

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

app.use(function (req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
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
    const { firstName, lastName, email, password } = req.body;
    if ((firstName, lastName, email, password)) {
        hash(password)
            .then((hash) => {
                db.insertDetails(firstName, lastName, email, hash)
                    .then((result) => {
                        req.session.userId = result.rows[0].id;
                        res.redirect("/profile");
                    })
                    .catch(() => {
                        res.render("register", {
                            error,
                        });
                    });
            })
            .catch((err) => {
                console.log("there is an error in hash", err);
            });
    } else {
        res.render("register", {
            error: "Please fill out all fields correctly!",
        });
    }
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    if ((email, password)) {
        db.getHashAndIdByEmail(email)
            .then((hash) => {
                compare(password, hash.rows[0].password)
                    .then((result) => {
                        if (result) {
                            req.session.userId = hash.rows[0].id;
                            db.checkIfSignatureByUserId(req.session.userId)
                                .then((r) => {
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
                                error,
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
                    error,
                });
            });
    } else {
        res.render("register", {
            error: "Please fill out all fields correctly!",
        });
    }
});

app.get(
    "/petition",
    requireLoggedInUser,
    requireUnsignedPetition,
    (req, res) => {
        res.render("petition");
    }
);

app.post(
    "/petition",
    requireLoggedInUser,
    requireUnsignedPetition,
    (req, res) => {
        const { signature } = req.body;
        if (signature) {
            db.insertSignatureAndUserId(signature, req.session.userId)
                .then((result) => {
                    req.session.sigId = result.rows[0].id;
                    res.redirect("/thanks");
                })
                .catch((err) => {
                    console.log("error in SignatureAndUserId", err);
                    res.render("petition");
                });
        } else {
            res.render("petition", {
                layout: "main",
                noSignature:
                    "You still want to think about it? no problem take you time",
            });
        }
    }
);

app.get("/thanks", requireLoggedInUser, requireSignedPetition, (req, res) => {
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

app.post("/thanks", requireLoggedInUser, requireSignedPetition, (req, res) => {
    db.deleteSignature(req.session.sigId)
        .then(() => {
            req.session.sigId = false;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error deleteSignature", err);
        });
});

app.get("/signers", requireLoggedInUser, requireSignedPetition, (req, res) => {
    db.getDataForSigners()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "main",
                rows,
            });
        })
        .catch((err) => {
            console.log("error in db.getNames", err);
        });
});

app.get("/profile", requireLoggedInUser, requireLoggedInUser, (req, res) => {
    res.render("profile");
});

app.post("/profile", requireLoggedInUser, (req, res) => {
    let { age, city, url } = req.body;
    if (age == "") {
        age = null;
    }
    if (url.startsWith("https://") || url.startsWith("http://")) {
        validUrlUserHp = url;
        db.insertDataUserProfile(age, city, validUrlUserHp, req.session.userId)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error from insertDataUserProfile", err);
                res.render("profile", {
                    layout: "main",
                    error,
                });
            });
    } else {
        validUrlUserHp = "";
        db.insertDataUserProfile(age, city, validUrlUserHp, req.session.userId)
            .then(() => {
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
            res.render("edit", {
                rows,
            });
        })
        .catch((err) => {
            console.log("error from getProfileData", err);
        });
});

app.post("/profile/edit", requireLoggedInUser, (req, res) => {
    let { firstName, lastName, email, password, age, city, url } = req.body;
    if (age == "") {
        age = null;
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
                    res.render("editError", {
                        error,
                    });
                });
        });

        db.updateUserProfiles(req.session.userId, age, city, url)
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in updateUserProfiles", err);
                res.render("editError", {
                    error,
                });
            });
    } else {
        db.updateUsersWithoutPassword(
            firstName,
            lastName,
            email,
            req.session.userId
        )
            .then(() => {})
            .catch((err) => {
                console.log("err pdateUsersWithoutPassword", err);
                res.render("editError", {
                    error,
                });
            });
        db.updateUserProfiles(req.session.userId, age, city, url)
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("error in updateUserProfiles", err);
                res.render("editError", {
                    error,
                });
            });
    }
});

app.get(
    "/signers/:city",
    requireLoggedInUser,
    requireSignedPetition,
    (req, res) => {
        if (req.session.userId) {
            if (req.session.sigId) {
                const { city } = req.params;
                db.getSignersByCity(city)
                    .then(({ rows }) => {
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
    }
);

app.get("/logout", requireLoggedInUser, (req, res) => {
    req.session.userId = false;
    req.session.sigId = false;
    res.redirect("/register");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Petitionserver listening")
    );
}
