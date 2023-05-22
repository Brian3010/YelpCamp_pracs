const express = require("express");
const router = express.Router({ mergeParams: true });
const WrapAsync = require("../utils/WrapAsync");

const { isLoggedIn } = require("../middleware");

const { validateReview, isReviewAuthor } = require("../middleware");

// controllers library
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, WrapAsync(reviews.createReview));

router.delete("/:reviewId", isReviewAuthor, WrapAsync(reviews.deleteReview));

module.exports = router;
