const { saveReturnTo } = require("../middleware");
const Campground = require("../models/campground");
const AppError = require("../utils/AppError");
const { cloudinary } = require("../cloudinary");

// get Mapbox lib
const mbxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeocoding({ accessToken: mbxToken });

// GET request /
module.exports.index = async (req, res) => {
    console.log("campground GET REQUEST");
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render("campgrounds/index.ejs", {
        campgrounds,
        title: "All Campgrounds",
    });
};

// GET request /new
module.exports.renderNewCampForm = (req, res) => {
    console.log("campground/new GET REQUEST");
    res.render("campgrounds/new.ejs", { title: "Add campground" });
};

// POST request /
module.exports.createNewCamp = async (req, res, next) => {
    console.log("campground POST REQUEST");
    // console.log(req);
    console.log(req.body.campground.location);
    const geoData = await geoCoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    console.log("geoData: ", geoData.body.features[0].geometry.coordinates);

    // res.send(geoData.body.features[0].geometry.coordinates);

    const newCamp = req.body.campground;
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.author = req.user._id;
    newCamp.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    console.log(newCamp);
    // res.send(newCamp);
    if (!newCamp) throw new AppError("Invalid Campground Data", 400);
    const campground = new Campground(newCamp);
    await campground.save();
    req.flash("success", "New Campground Added");
    res.redirect(`campgrounds/${campground._id}`);
};

// GET request /:id
module.exports.showCamp = async (req, res) => {
    console.log("campground/:id GET REQUEST");
    // console.log(
    //     "campground/:id GET REQUEST" + req.user + "---" + req.originalUrl
    // );
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log("triggered");
        req.flash("error", "Cannot Find That Campground");
        return res.redirect("/campgrounds");
    }

    // populate all the reviews from the reviews array on the one campground we're finding.
    // populate the reviews then populate on each one of them their author, and then seperately populate the one author on this campground
    const campground = await Campground.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } }) // poplute the reviews, then populate on each one of them their authors
        .populate("author"); // populate the campground's author

    // console.log("campground: ", campground.reviews);
    // console.log(campground);
    if (!campground) {
        console.log("triggered");
        req.flash("error", "Cannot Find That Campground");
        return res.redirect("/campgrounds");
    }
    // console.log(campground);
    res.render("campgrounds/show.ejs", {
        campground,
        title: "Campground details",
    });
};

// GET request /:id/edit
module.exports.renderUpdateForm = async (req, res) => {
    console.log("campgrounds/:id/edit GET REQUEST");
    const id = req.params.id;

    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }
    // console.log(campground);
    res.render("campgrounds/edit.ejs", {
        campground,
        title: "Edit Campground",
    });
};

// PUT /:id
module.exports.updateCamp = async (req, res) => {
    console.log("campgrounds/:id PUT REQUEST");
    // console.log(req.body.deleteImages);['filename','filename']
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    // Delete if deleteImages[] exists
    // updateOne - pull out images field in dbs where has filename is in the req.body.deleteImages[]
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename, function (result) {
                console.log(result);
            });
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
        console.log(campground);
    }

    req.flash("success", "Successfully Updated");
    res.redirect(`/campgrounds/${campground._id}`);
};

// DELETE request /:id
module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Sucessfully Deleted");
    res.redirect("/campgrounds");
};
