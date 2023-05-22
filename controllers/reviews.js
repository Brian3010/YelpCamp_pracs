const Review = require("../models/review");
const Campground = require("../models/campground");
const AppError = require("../utils/AppError");

// POST request /
module.exports.createReview = async (req, res) => {
    console.log("/campgrounds/:id/reviews POST REQUEST");
    const { id } = req.params;
    const camp = await Campground.findById(id);
    // console.log(req.body.review);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash("success", "New Review Added");
    res.redirect(`/campgrounds/${camp._id}`);
};

// DELETE request :/reviewId
// needed 2 ids because we want to remove the reference in the Campground
// and remove the review in the Review itself.
module.exports.deleteReview = async (req, res) => {
    console.log("/campgrounds/:id/reviews/:reviewId DELETE REQUEST HIT");
    const { id, reviewId } = req.params;
    console.log(id, "---", reviewId);
    // remove reference of review in Campground
    await Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });
    // remove reviewid in Review
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Sucessfully Deleted");
    res.redirect(`/campgrounds/${id}`);
};
