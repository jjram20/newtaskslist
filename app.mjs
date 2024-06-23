import { PrismaClient } from "@prisma/client";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const prisma = new PrismaClient();

let saltRounds = 20;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(flash());

app.use(cookieParser("SecretStringForSession"));
app.use(session({
    secret: "SecretStringForSession",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    let notification_success = req.flash("notification");
    let notification_error = req.flash("notification_error")
    res.render("index", {
        notification: notification_success,
        notification_error: notification_error
    });
})

app.get("/get_all_users", async (req, res) => {
    let users = await prisma.user.findMany();
    res.send(users);
})

app.post("/create_user", async (req, res) => {
    let message = "";
    let new_password = req.body.password_signup_1;
    let new_email = req.body.email_signup;
    let new_login = new_email.split("@")[0];
    
    // Verify if email was registered previously
    let users = await prisma.user.findMany({
        where: {
            email: new_email
        }
    })

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

    // Send flash notification
    req.flash("notification", message);
    res.redirect("/");
})

app.post("/login_user", async (req, res) => {
    let password_login = req.body.password_login;
    let email_login = req.body.email_login;
    let user = await prisma.user.findUnique({
        where: {
            email: email_login,
        }
    })

    let hash_password = user.password;
    let user_validated = await bcrypt.compare(password_login, hash_password);

    if (user_validated) {
        console.log("Validated user");
        res.redirect("/list_tasks");
    } else {
        console.log("Access not allowed");
        req.flash("notification_error", "Usuario no validado")
        res.redirect("/")
    }
})

app.get("/list_tasks", (req, res) => {
    let usuario = "Usuario";
    let items = ["Item1", "Item2", "Item3"]
    res.render("list_tasks", {
        usuario: usuario,
        items: items
    });
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