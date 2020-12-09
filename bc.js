const bcrypt = require("bcryptjs");
const{ promisify } = require("util");

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);
//3 Methoden von bycript die wir promisifying, um keine callbacks nutzen zu müssen

//this will be for when the user registers!
exports.hash = (plainTextPw) => {
    //genSalt creates random string(salt)!
    return genSalt().then((salt) => {
        return hash(plainTextPw, salt);
        //hash-methode : 1.Arg: plainetextPasswort from user, 2.Arg durch genSalt generiertes Salt
        // Funtion returned hash inkl.Salt
        // wir übergeben hash-funktion nur pw  
    });
};



// COMPARE will compare what the user typed in with our hashed password in the db
// this will be for when the user logs in!!!
exports.compare = compare;
// compare takes 2 arguments
// 1st arg - password user sends from the client
// 2nd arg - hashed password stored in db

// if it matches, boolean TRUE
// if it doesn't, boolean FALSE