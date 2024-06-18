import { PrismaClient } from "@prisma/client";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/get_all_users", async (req, res) => {
    let users = await prisma.user.findMany();
    res.send(users);
})

app.post("/create_user", async (req, res) => {
    let new_password = req.body.password;
    let new_email = req.body.email;
    let new_login = password.split("@")[0];
    let new_user = await prisma.user.create({
        data: {
            login: new_login,
            email: new_email,
            password: new_password
        }
    })

    console.log("User created");
    res.redirect("/");
})

app.post("/login_user", async (req, res) => {
    console.log("INICIO REQ");
    console.log(req.body);
    console.log("FIN REQ");
    let password_login = req.body.password_login;
    let email_login = req.body.email_login;
    let user = await prisma.user.findUnique({
        where: {
            email: email_login,
            password: password_login
        }
    })

    console.log(user);

    if (user) {
        console.log("Validated user");
        res.redirect("/list_tasks");
    } else {
        console.log("Access not allowed");
        res.redirect("/")
    }
})

app.get("/list_tasks", (req, res) => {
    res.send("Access allowed");
})

app.listen(3000, () => {
    console.log("Listening port 3000");
})

app.use("/css",express.static("./node_modules/bootstrap/dist/css"));
app.use("/js",express.static("./node_modules/bootstrap/dist/js"));