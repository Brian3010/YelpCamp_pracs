const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const { saveReturnTo } = require("../middleware");

// controllers library
const users = require("../controllers/users");

router
    .route("/register")
    .get(users.renderRegisterForm)
    .post(wrapAsync(users.registerUser));

router
    .route("/login")
    .get(users.renderLoginForm)

    .post(
        saveReturnTo,
        // the session in when execute passport.authenticate(...) will be changing everytime we logged in/out for security purposes.
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/users/login",
        }),
        users.loginUser
    );

router.get("/logout", saveReturnTo, users.logoutUser);

module.exports = router;

// router.get("/register", users.renderRegisterForm);
// router.post("/register", wrapAsync(users.registerUser));

// router.get("/login", users.renderLoginForm);

// router.post(
//     "/login",
//     saveReturnTo,
//     // the session in when execute passport.authenticate(...) will be changing everytime we logged in/out for security purposes.
//     passport.authenticate("local", {
//         failureFlash: true,
//         failureRedirect: "/users/login",
//     }),
//     users.loginUser
// );
