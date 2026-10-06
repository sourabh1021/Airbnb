const express = require("express")
const router  = express.Router()
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js")

const {IsloggedIn, isOwner,validateListing} = require("../middleware.js")  // using for login check

const ListingController = require("../controllers/listings.js")
const multer  = require('multer') // understanding image formate AND for upload image
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

router.route("/") // this combine same route path in one 
.get(
  wrapAsync(ListingController.Index)) //Index
.post(
  IsloggedIn, upload.single("listing[image]"), validateListing,wrapAsync(ListingController.createListing));//  CREATE Route

  //  NEW Route (must come before /:id)
  router.get("/new", IsloggedIn,ListingController.renderNewform);
  
router.route("/:id")
.get(
  wrapAsync(ListingController.showListing))//  SHOW Route
.put(
  IsloggedIn ,upload.single("listing[image]"),isOwner,validateListing, wrapAsync(ListingController.updateListing))// update
.delete(
  IsloggedIn,isOwner,wrapAsync(ListingController.Deletelisitng)) //delete Rout


//Edit Rout
router.get("/:id/edit", IsloggedIn,isOwner,wrapAsync(ListingController.renderEditForm));

module.exports  = router