const User = require("../models/user");

// GET request /register
module.exports.renderRegisterForm = (req, res) => {
    // console.log(req.session.returnTo);
    res.render("users/register.ejs", { title: "Register" });
};

// POST request /register
module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = await new User({ email, username });
        const newUser = await User.register(user, password);
        console.log(newUser);
        req.login(newUser, function (e) {
            if (e) return next(e);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/users/register");
    }
};

// GET request /login
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs", { title: "login" });
};

// POST request /login
module.exports.loginUser = (req, res) => {
    req.flash("success", "Welcome Back!");
    const returnUrl = res.locals.returnTo || "/campgrounds";

    // delete req.session.returnTo;
    res.redirect(returnUrl);
};

// GET request /logout
module.exports.logoutUser = (req, res) => {
    req.logout(function (e) {
        const returnUrl = res.locals.returnTo || "/";
        console.log("returnUrl: ", returnUrl);
        if (e) {
            return next(e);
        }
        req.flash("success", "Bai Bai!");
        res.redirect(returnUrl);
    });
};
