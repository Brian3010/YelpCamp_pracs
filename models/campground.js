const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const { cloudinary } = require("../cloudinary");
// set toJSON for schema
const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema({
    url: String,
    filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload/", "/upload/w_200/");
});

imageSchema.virtual("cardImg").get(function () {
    return this.url.replace("/upload/", "/upload/c_fill,ar_4:3/");
});

const CampgroundSchema = new Schema(
    {
        location: String,
        title: String,
        price: Number,
        description: String,
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        images: [imageSchema],
        // make a owner field
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review",
            },
        ],
    },
    opts //https://mongoosejs.com/docs/tutorials/virtuals.html
);

CampgroundSchema.virtual("properties.popupMarkup").get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.location}</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (deletedCamp) {
    console.log("POST MIDDLEWARE");

    console.log("deletedCamp.reviews: ", deletedCamp.reviews);
    // check if the campground data exists
    if (deletedCamp) {
        await Review.deleteMany({
            _id: {
                $in: deletedCamp.reviews,
            },
        });
    }

    if (deletedCamp.images) {
        for (let img of deletedCamp.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

const Campground = mongoose.model("Campground", CampgroundSchema);

module.exports = Campground;
