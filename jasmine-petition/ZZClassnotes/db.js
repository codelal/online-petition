const spicedPg = require ("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/actors");

//which users we want our commands to run, thats 2 command space pg
//1) postgres = username
//2) postgres = password
//where is the connection happens? localhost
//Database muss im sysstem existieren, zB actors

// db creates an object with 1 query method, so we can runn query commands on sql in node

module.exports.getActors = () =>{
    return db.query('SELECT * FROM cities');
};

//

module.exports.addCity = (cityName, countryName) =>{
    const q = ÌNSERT INTO cities (city, country)VALUES ($1, $2)`
    return db.query(ÌNSERT INTO cities (city, country)VALUES ($1, $2)`;
    const params =  [cityNAme, countryName];
    //SICHERHEIT!!! um sql- commands injections zu vermeiden
};