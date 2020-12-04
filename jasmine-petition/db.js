const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
//spicedPg("whoAreWeTalkingTo:whichDBUserWillRunMyCommands:theUserPasswordForOurDbUser@PostgrePort/nameOfDatabase")

module.exports.NameAndSignature = (firstName, lastName, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
    VALUES ($1 , $2 , $3)`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);
};

// inserts are composed of INSERT INTO tableName (columnWeWantToAddValueInto, columnWeWantToAddValueInto)

module.exports.getNames = () => {
    const q = `SELECT first, second 
               FROM petition`;
    return db.query(q);
};


module.exports.getTotalOfSigners = () => {
    const q = `SELECT COUNT(first) 
               FROM petition`;
    return db.query(q);
};
