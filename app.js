// configure to use dotenv - npm i dotenv
if (process.env.ENV !== "production") {
    require("dotenv").config();
}

// console.log(process);
// in case of trouble generating in connect-mongo
// const MongoStore = require('connect-mongo');
// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     touchAfter: 24 * 60 * 60,
//     crypto: {
//         secret: 'thisshouldbeabettersecret!'
//     }
// });

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // use this for storing session on Mongo Atlas

const flash = require("connect-flash");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const AppError = require("./utils/AppError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const User = require("./models/user");

// Enable strict mode for queries
// When strict mode is enabled, Mongoose will throw an error if you try to query with undefined fields or fields that are not defined in your schema. It helps to enforce the structure and validation of your data by ensuring that queries adhere to the defined schema.

mongoose.set("strictQuery", true);

// include helmet security lib
const helmet = require("helmet");

// mongoose
//     .connect("mongodb://127.0.0.1:2707/yelp-camp", {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     })
//     .then(() => {
//         console.log("Database Connected");
//     })
//     .catch((err) => {
//         console.log("Mongo error: ", err);
//     });
const db_URL =
    process.env.MONGO_DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
// const db_URL = "mongodb://127.0.0.1:27017/yelp-camp";
// new approach 9/1/2023
main()
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(db_URL);
}

//the on listener keeps checking for an event until it happens, multiple times if needed,
//and the once event is triggered once, as the name says.
// mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// use mongo sanitize
app.use(
    mongoSanitize({
        replaceWith: "_",
    })
);

app.use(express.urlencoded({ extended: true })); // parse data submitted via form into req.body

app.use(methodOverride("_method"));

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// configure mongo-connect - using this for storing on Mongo
const sessionSecret =
    process.env.SESSION_SECRET || "thisisasecretformongostore";
const store = MongoStore.create({
    mongoUrl: db_URL,
    secret: sessionSecret,
    touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR: ", e);
});

// session configuration
const sessionConfig = {
    store: store, // or either 'store,'
    name: "session", // change the session name
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    // configure cookies
    cookie: {
        httpOnly: true, // this is an extra HTTP security layer to avoid XSS (cross-site scripting)
        // secure: true, // the cookies can only be changed or confiured over https

        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expiration date
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
// uses flash
app.use(flash());

// USE helmet
// note on helmet: when firsly added the app.use(helmet()), it will added the content policy to the current session/cookie
// so when refesh it will block all external resource
// when set the contentSecurityPolicy to false, the effect still exist (in session/cookie) so in order to identify
// changes after setting back and forward the helmet, it will need to use Crnt-F5 for hard refresh the page\

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/",
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcvkwoxyi/", //CLOUDINARY ACCOUNT
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
            childSrc: ["blob:"],
        },
    })
);

// tell the app to use passport
app.use(passport.initialize());
// use this for persistent login session
app.use(passport.session());
// use LocalStrategy in User
passport.use(new LocalStrategy(User.authenticate()));

// serializeUser refers to how do we store a user in a session
passport.serializeUser(User.serializeUser());
// the opposite - how do you get user out of that session - another word - how do we store and unstore a user in a session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!["/users/login", "/users/logout"].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    // console.log("req.originalUrl: ", req.originalUrl);
    // console.log("req.session.returnTo: ", req.session.returnTo);

    res.locals.currentUser = req.user; // this tells if the user in dbs is logged in
    res.locals.flashMsg = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// app.get("/fakeuser", async (req, res) => {
//     const user = new User({
//         email: "phucmap3010@gmail.com",
//         username: "Brian",
//     });
//     const newUser = await User.register(user, "conga");
//     res.send(newUser);
// });

app.use("/users", userRoutes);

app.use("/campgrounds", campgroundRoutes);

app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
    console.log("HOME REQUEST /GET");
    console.log("req.query: ", req.query);
    res.render("home.ejs", { title: "Home Page" });
});

app.all("*", (req, res, next) => {
    next(new AppError("Page Not Found", 404));
});

// the above function pass parameter down to err variable
app.use((AppError, req, res, next) => {
    // const { status = 500, message = "something went wrong" } = AppError;
    const { status = 500 } = AppError;
    // console.log(AppError);
    if (!AppError.message) AppError.message = "Something Went Wrong";
    res.status(status).render("error.ejs", { title: "Error", AppError });
    // res.send("something when wrong");
});

app.listen("3000", () => {
    console.log("LISTENING ON PORT 3000");
});
