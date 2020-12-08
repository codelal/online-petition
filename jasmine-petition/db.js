const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.insertSignatureAndUserId = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_Id)
    VALUES ($1 , $2)
    RETURNING id`,
        [signature, userId]
    );
};

module.exports.getNames = () => {
    const q = `SELECT first, last 
               FROM users`;
    return db.query(q);
};

module.exports.getTotalOfSigners = () => {
    const number = `SELECT COUNT(id) 
               FROM signatures`;
    return db.query(number);
};
module.exports.getDataOfSignature = (id) => {
    const signData = `SELECT signature FROM signatures WHERE id = ($1)`;
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

module.exports.getHashAndIdByEmail = (emailadress) => {
    return db.query(`SELECT password, id FROM users WHERE email = ($1)`, [
        emailadress,
    ]);
};

//do a db query to find out if they've signed: if there is a id, they have signed
module.exports.checkIfSignatureByUserId =(userId) =>{
    return db.query(
        `SELECT id FROM signatures WHERE user_Id = ($1)`,[userId]
    );
};
