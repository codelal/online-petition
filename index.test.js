const supertest = require("supertest");
const { app } = require("./index.js"); //bedenke, dass ap auch exported werden muss
const cookieSession = require("cookie-session");
// console.log("app", app);

test("Loggedout Users are redirected to /registration when they attempt to go to the petition page", () => {
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/register");
        });
});

test("Logged in users are redirected to /petition when they attempt to go to either the registration page or the login page", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/register" || "/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("Users Logged in and Signed are redirected to /thanks when they attempt to go to /petition or submit a signature", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        sigId: 2,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("Users who are logged in and have not signed are redirected to /petition when they attempt to go to either the thank you page or the signers page", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/thanks" || "/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

//???The below is  maybe not correct
test("POST/petition,when the input is good, the user is redirected to the thank you page", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        sigId: 2,
    });
    return supertest(app)
        .post("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});


