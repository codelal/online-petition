
module.exports.requireLoggedOutUser = (res, req, next) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};


module.exports.requireUnsignedPetition = (res, req, next) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireSignedPetition = (res, req, next) => {
    if (!req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
};