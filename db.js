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
module.exports.checkIfSignatureByUserId = (userId) => {
    return db.query(`SELECT id FROM signatures WHERE user_Id = ($1)`, [userId]);
};

module.exports.insertDataUserProfile = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_Id)
    VALUES($1, $2, $3, $4)`,
        [age || null, city || null, url || null, userId]
    );
};

module.exports.getDataForSigners = () => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url, signatures.user_id
    FROM users
    JOIN signatures
    ON signatures.user_id = users.id
    JOIN user_profiles
    ON user_profiles.user_id = users.id`
    );
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.url, signatures.user_id
    FROM users
    JOIN signatures
    ON signatures.user_id = users.id
    JOIN user_profiles  
    ON user_profiles.user_id = users.id
    WHERE user_profiles.city = ($1)`,
        [city]
    );
};

module.exports.allCitys = () => {
    return db.query(`SELECT user_profiles.city
    FROM user_profiles
    JOIN signatures
    ON signatures.user_id = user_profiles.user_id`);
};
