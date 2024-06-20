import { PrismaClient } from "@prisma/client";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const prisma = new PrismaClient();

let saltRounds = 20;

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
    let message = "";
    let new_password = req.body.password_signup_1;
    let new_email = req.body.email_signup;
    console.log(new_email);
    let new_login = new_email.split("@")[0];

    let users = await prisma.user.findMany({
        where: {
            email: new_email
        }
    })

    console.log("Users");
    console.log(users);

    if (users.length > 0) {
        message = "Correo ya fue registrado previamente";
    } else {
        // Encrypt password
        let epassword = await bcrypt.hash(new_password, saltRounds);
        console.log("Password encriptado");
        console.log(epassword);
        let new_user = await prisma.user.create({
            data: {
                login: new_login,
                email: new_email,
                password: epassword
            }
        });

        message = "Usuario creado";
    }

    console.log("User created");

    let res_json = {
        "alert": message
    }

    res.status(200).json(res_json);
    //res.redirect("/");
})

app.post("/login_user", async (req, res) => {
    let password_login = req.body.password_login;
    let email_login = req.body.email_login;
    let user = await prisma.user.findUnique({
        where: {
            email: email_login,
        }
    })
 
    console.log(user);

    let hash_password = user.password;
    //let user_validated = bcrypt.compare(password_login, hash_password);

    if (user_validated) {
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

/*app.get("/logout", (req, res) => {

})

app.post("/new_task", (req, res) => {

})

app.post("/edit_task", (req, res) => {

})

app.delete("/delete_task", (req, res) => {
     
})*/

app.listen(3000, () => {
    console.log("Listening port 3000");
})

app.use("/css",express.static("./node_modules/bootstrap/dist/css"));
app.use("/js",express.static("./node_modules/bootstrap/dist/js"));