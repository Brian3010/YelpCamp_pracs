const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/WrapAsync");
// const AppError = require("../utils/AppError");
// const Campground = require("../models/campground");

// image upload library npm i multer
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });

// middleware
const {
    middlewareChecking,
    isLoggedIn,
    isAuthor,
    validateCampground,
    saveReturnTo,
    isValidCampId,
} = require("../middleware");

// controllers library
const campgrounds = require("../controllers/campgrounds");

// Note: the upload.array('image') upload everything while it's parsing,
// then, it sent the parsed body and the files to req.body,
// in other words, the multer middleware adds the data onto the req.body

// so if we place the upload.array('image') after the validateCampground()
// it will cause issues as the upload.array('image') has not been able to
// parse the req.body and files and it will not ready for validating (req.body empty).
// needing to look for correct way to handle this, but for now, the upload.array()
// needed to come before the validateCampground
router
    .route("/")
    .get(WrapAsync(campgrounds.index))
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        WrapAsync(campgrounds.createNewCamp)
    );

router.get("/new", isLoggedIn, campgrounds.renderNewCampForm);
// router.get("/new", campgrounds.renderNewCampForm);

router
    .route("/:id")
    .get(WrapAsync(campgrounds.showCamp))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array("image"),
        validateCampground,
        WrapAsync(campgrounds.updateCamp)
    )
    .delete(isLoggedIn, isAuthor, WrapAsync(campgrounds.deleteCamp));

router.get(
    "/:id/edit",
    isValidCampId,
    isLoggedIn,
    isAuthor,

    WrapAsync(campgrounds.renderUpdateForm)
);

module.exports = router;

// router.get("/", WrapAsync(campgrounds.index));

// router.get("/new", isLoggedIn, campgrounds.renderNewCampForm);

// router.post(
//     "/",
//     isLoggedIn,
//     validateCampground,
//     WrapAsync(campgrounds.createNewCamp)
// );

// router.get("/:id", WrapAsync(campgrounds.showCamp));

// router.get(
//     "/:id/edit",
//     isLoggedIn,
//     isAuthor,
//     WrapAsync(campgrounds.renderUpdateForm)
// );

// router.put(
//     "/:id",
//     validateCampground,
//     isLoggedIn,
//     isAuthor,
//     WrapAsync(campgrounds.updateCamp)
// );

// router.delete("/:id", isLoggedIn, isAuthor, WrapAsync(campgrounds.deleteCamp));
