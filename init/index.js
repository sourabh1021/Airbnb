const mongoose = require("mongoose");
const axios = require("axios");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {

    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");

    console.log("Database connected");

    // Create geometry for every listing
    const listingsWithGeometry = [];

    for (let obj of initData.data) {

        const query = `${obj.location}, ${obj.country}`;

        console.log(`Searching location: ${query}`);

        try {

            const response = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: query,
                        format: "jsonv2",
                        limit: 1
                    },

                    headers: {
                        "User-Agent": "WanderLust-College-Project/1.0"
                    }
                }
            );

            if (response.data.length === 0) {

                console.log(`❌ Location not found: ${query}`);

                continue;
            }

            const result = response.data[0];

            const latitude = parseFloat(result.lat);
            const longitude = parseFloat(result.lon);

            console.log(`Latitude: ${latitude}`);
            console.log(`Longitude: ${longitude}`);

            // Add geometry
            listingsWithGeometry.push({
                ...obj,

                owner: "69c82deffed91b1ae1dff6c2",

                geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            });

            // Wait 1.1 seconds before next request
            await new Promise(resolve => setTimeout(resolve, 1100));

        } catch (error) {

            console.log(`❌ Error finding ${query}`);
            console.log(error.message);
        }
    }

    console.log(
        `\nSuccessfully prepared ${listingsWithGeometry.length} listings`
    );

    // Only delete old data AFTER geocoding succeeds
    await Listing.deleteMany({});

    // Insert new listings
    await Listing.insertMany(listingsWithGeometry);

    console.log("🎉 Data was initialized successfully!");

    await mongoose.connection.close();

}

main().catch((err) => {

    console.log("❌ Error:");
    console.log(err);

});