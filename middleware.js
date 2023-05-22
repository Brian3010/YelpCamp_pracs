const Campground = require("./models/campground");
const Review = require("./models/review");
const { campgroundSchema, reviewSchema } = require("./schemas");
const AppError = require("./utils/AppError");

// checking middleware request
module.exports.middlewareChecking = (req, res, next) => {
    console.log("middlewareChecking hit");

    console.log("req.body in middlewarechecking: ", req.body);
    next();
};

// Check user logged in
module.exports.isLoggedIn = (req, res, next) => {
    // console.log("isLoggedIn:  TRIGGERED");
    // console.log("req.body: ", req.body);
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/users/login");
    }
    next();
};

// this middleware is use to store req.session.returnTo to res.locals.returnTo
// that is because the passport.authenticate(..) will delete session when log in and out,
// result in the originalUrl cannot be stored in req.session.returnTo
// so, we store the session.returnTo (if true) to the res.locals.returnTo (as it is persistent between middlewares)
// then, we add the middleware before passport.authenticate(...) in router.post('/login',...) to trigger the saving.
module.exports.saveReturnTo = (req, res, next) => {
    // console.log("req.session.returnTo: ", req.session.returnTo);
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
};

// check if the author is currently logged in
module.exports.isAuthor = async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }

    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

// check if the user wrote a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    console.log(`campId = ${id}`);
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete the review");
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
};

// validate the campground schema
module.exports.validateCampground = (req, res, next) => {
    // console.log("req.body: ", req.body);
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        // console.log("validateCampground: TRIGGERED");

        const msg = error.details.map((e) => e.message);
        console.log("msg: ", msg);
        // throw new AppError(msg, 400); # for testing error purpose

        if (msg.includes("include HTML")) {
            req.flash("error", "Not allowing HTML inputs");
            return res.redirect(`/campgrounds/${req.params.id}/edit`);
        } else {
            throw new AppError(msg, 400);
        }
    } else {
        next();
    }
};

// validate the review Schema
module.exports.validateReview = (req, res, next) => {
    console.log("validateReview: TRIGGERED ");

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((e) => e.message);
        console.log(msg);
        // console.log( error.message);
        // throw new AppError(msg, 400);

        msg[0].includes("include HTML")
            ? req.flash("error", "Not allowing HTML inputs")
            : req.flash("error", "Review Text must not be empty");

        // console.log(req.params.id);
        return res.redirect("/campgrounds/" + req.params.id);
    } else {
        next();
    }
};

module.exports.isValidCampId = async (req, res, next) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        req.flash("error", "Cannot Find That Campground");
        return res.redirect("/campgrounds");
    } else {
        next();
    }
};
