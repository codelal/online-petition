module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireUnsignedPetition = (req, res, next) => {
    if (req.session.sigId) {
        return res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireSignedPetition = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    } else {
        next();
    }
};
