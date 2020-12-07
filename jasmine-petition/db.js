const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.NameAndSignature = (firstName, lastName, signature) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature)
    VALUES ($1 , $2 , $3)
    RETURNING id`,
        [firstName, lastName, signature]
    );
};

module.exports.getNames = () => {
    const q = `SELECT first, last 
               FROM signatures`;
    return db.query(q);
};

module.exports.getTotalOfSigners = () => {
    const number = `SELECT COUNT(first) 
               FROM signatures`;
    return db.query(number);
};
module.exports.getDataOfSignature = (id) => {
    const signData = "SELECT signature FROM signatures WHERE id = ($1)";
    const userId = [id];
    return db.query(signData, userId);
};

module.exports.insertDetails = (firstName, lastName, emailadress, hashedPW) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING id`,
        [firstName, lastName, emailadress, hashedPW]
    );
};

module.exports.getHashByEmail = (emailadress) => {
    return db.query(
        `SELECT password, id FROM users WHERE email = ($1)`,[emailadress]
    );
};

module.exports.checkSignatureByUserId =(userId) =>{
    return db.query(
        `SELECT id FROM signatures WHERE userId = {S1}`,[userId]
    );
};