const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
//spicedPg("whoAreWeTalkingTo:whichDBUserWillRunMyCommands:theUserPasswordForOurDbUser@PostgrePort/nameOfDatabase")

// inserts are composed of INSERT INTO tableName (columnWeWantToAddValueInto, columnWeWantToAddValueInto)

// module.exports.NameAndSignature = (firstName, lastName, signature) => {
//     const q = `INSERT INTO signatures (first, last, signature)
//     VALUES ($1 , $2 , $3)`;
//     const params = [firstName, lastName, signature];
//     return db.query(q, params);
// };

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
    const signData = `SELECT signature FROM signatures WHERE id = ${id}`;
    return db.query(signData);
};
