const Listing = require("./models/listing")
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema ,reviewSchema } = require("./schema.js")
const Review = require("./models/review.js")


module.exports.IsloggedIn = (req,res,next)=>{
  // console.log(req.path,"..",req.originalUrl) // gives path 
     if(!req.isAuthenticated()){ // checks user is logged in or not
      req.session.redirectUrl = req.originalUrl // original url save here
      req.flash("error","You must be logged in to create listing!")
        return res.redirect("/login")
      }
      next()
}

module.exports.saveRedirect = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl // then store original in locals so because originall url will delete by paassport
  }
  next()
}

module.exports.isOwner = async(req,res,next) =>{
   const { id } = req.params;
  let listing = await Listing.findById(id)
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error","you are not the owner of  this listing!")
    return res.redirect(`/listings/${id}`)
  }
  next()
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body)
  // console.log(result)
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400, errMsg)
  } else {
    next()
  }
}

module.exports.validatereview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body)
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400, errMsg)
  } else {
    next()
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewid } = req.params;
  let review = await Review.findById(reviewid)
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "you are not the author of this Review!")
    return res.redirect(`/listings/${id}`)
  }
  next()
};