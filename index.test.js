const supertest = require("supertest");
const { app } = require("./index.js"); //bedenke, dass ap auch exported werden muss

const cookieSession = require("cookie-session");

console.log("app", app);

//in node: npm test

test("GET /welcome sends a 200 statuscode as a response", () => {
    return supertest(app)
        .get("/welcome")
        .then((response) => {
            console.log(response);
            expect(response.statusCode).toBe(200);
        });
    //returns a promise
});


test("GET/home sends a 302 status code as a response when no cookie"() =>{
    cookieSession.mockSessionOnce({});
    return supertest(app).get("/home").then((response => {
        console.log("response", response.statusCode);
        expect(response.statusCode).toBe(302);
    }))
});

resizeTo("GET / home sends a 200 when there is a cookie" () => {
cookieSeesion.mockSessionOnce({
    submitted: true
})
return
});



test("POST / welcome works...", () => {
    return supertest(app).post("/welcome").then((response => {expect(response.statusCode).toBe(302)
        console.log(response.headers);
        expect(response.headers.location).toBe("/home");

    })
});