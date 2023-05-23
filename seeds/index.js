const mongoose = require("mongoose");
const Campground = require("../models/campground");
const axios = require("axios");
const cities = require("./cities");
const { places, discriptors, descriptors } = require("./seedHelpers");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImage() {
    try {
        const getImg = await axios.get(
            "https://api.unsplash.com/photos/random",
            {
                params: {
                    collections: 483251,
                    client_id: "bbRQmFuufCtoai6roR0-Xne280ld71OiFGgJn-DA-38",
                },
            }
        );

        // console.log(getImg.data.urls.regular);
        return getImg.data.urls.regular;
    } catch (err) {
        console.error(err);
    }
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 5; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 20 + 10);
        console.log(i);
        const newCamp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, ratione sint repellendus exercitationem minus totam inventore quo aliquam adipisci, ipsum corporis voluptatibus nemo quod soluta veniam voluptate, nesciunt eius. Adipisci.",
            price: randomPrice,
            // images: [
            //     {
            //         url: await seedImage(),
            //         filename: "testing",
            //     },
            // ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            images: [
                {
                    url: "https://res.cloudinary.com/dcvkwoxyi/image/upload/v1681883687/samples/animals/three-dogs.jpg",
                    filename: "three-dogs",
                },
                {
                    url: "https://res.cloudinary.com/dcvkwoxyi/image/upload/v1681883693/samples/animals/kitten-playing.gif",
                    filename: "kitten-playing",
                },
            ],
            // author: "643644362a6328518f283ea1",
            author: "646b92a4c604749408021930", // seed using created user on atlas DB
        });
        await newCamp.save();
        // console.log(newCamp);
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
