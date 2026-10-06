const Listing = require("../models/listing")
const axios = require("axios");
module.exports.Index = async (req, res, next) => {
  let allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
}

module.exports.renderNewform = (req, res) => {
  // console.log(req.user)
 
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res, next) => {
  let { id } = req.params;
    let oneData = await Listing.findById(id)
    .populate({
      path:"reviews",
      populate:{
        path:"author" // this for getting author for every review using nexted populate
      }})
  .populate("owner");
  if(!oneData){
   req.flash("error","Listing you requested for does not exist!")
   return res.redirect("/listings");   //  RETURN added
} 
  // console.log(oneData)
  res.render("listings/show.ejs", { oneData });
}
module.exports.createListing = async (req, res, next) => {
    try {
        const { location, country } = req.body.listing;

        // Create listing
        const newlisting = new Listing(req.body.listing);

        newlisting.owner = req.user._id;

        // Image
        newlisting.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        // Forward geocoding
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: `${location}, ${country}`,
                    format: "jsonv2",
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    "User-Agent": "WanderLust/1.0"
                }
            }
        );

        if (response.data.length === 0) {
            req.flash(
                "error",
                "Location could not be found. Please enter a valid location."
            );

            return res.redirect("/listings/new");
        }

        const result = response.data[0];

        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        console.log("Entered location:", location);
        console.log("Found location:", result.display_name);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        // GeoJSON
        newlisting.geometry = {
            type: "Point",
            coordinates: [
                longitude,
                latitude
            ]
        };

        await newlisting.save();

        req.flash("success", "New listing created!");
        res.redirect("/listings");

    } catch (error) {
        next(error);
    }
};module.exports.createListing = async (req, res, next) => {
    try {
        const { location, country } = req.body.listing;

        // Create listing
        const newlisting = new Listing(req.body.listing);

        newlisting.owner = req.user._id;

        // Image
        newlisting.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        // Forward geocoding
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: `${location}, ${country}`,
                    format: "jsonv2",
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    "User-Agent": "WanderLust/1.0"
                }
            }
        );

        if (response.data.length === 0) {
            req.flash(
                "error",
                "Location could not be found. Please enter a valid location."
            );

            return res.redirect("/listings/new");
        }

        const result = response.data[0];

        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        console.log("Entered location:", location);
        console.log("Found location:", result.display_name);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        // GeoJSON
        newlisting.geometry = {
            type: "Point",
            coordinates: [
                longitude,
                latitude
            ]
        };

        await newlisting.save();

        req.flash("success", "New listing created!");
        res.redirect("/listings");

    } catch (error) {
        next(error);
    }
};

module.exports.renderEditForm = async (req, res, next) => {
  const { id } = req.params;
  const editListing = await Listing.findById(id);
  if(!editListing){
     req.flash("error","Listing you requested for does not exist!")
     return res.redirect("/listings")
  }

  let originalImageUrl = editListing.image.url
  originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250")
  res.render("listings/edit.ejs", { editListing, originalImageUrl});
}

module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;

    listing.image = {
      url: url,
      filename: filename
    };

    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.Deletelisitng = async (req, res, next) => {
  let { id } = req.params
  let deleted = await Listing.findByIdAndDelete(id)
  // console.log(deleted)
  req.flash("success","listing Deleted!")
  res.redirect("/listings")
} 