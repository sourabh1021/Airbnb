if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

console.log("Cloud Name:", process.env.CLOUD_NAME);
console.log("API Key:", process.env.CLOUD_API_KEY);
console.log("API Secret:", process.env.CLOUD_API_SECRET);


const express = require("express");
const { MongoStore } = require("connect-mongo");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session")
const flash = require("connect-flash");
const passport = require("passport")
const LocalStrategy = require("passport-local")
const user = require("./models/user.js")

const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");

const dburl = process.env.ATLASDB_URL

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}
const store = MongoStore.create({
  mongoUrl:dburl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24 * 3600,
})

store.on("error",(err)=>{
  console.log("ERROR IN MONGO SESSION",err)
})

const sessionOption = {
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000, // sets sesssion time how many it saves on web page
    maxage: 7 * 24 * 60 *60*1000,
    httpOnly:true
  }
}



app.use(session(sessionOption))
app.use(flash())
// ===================================================
app.use(passport.initialize()) // Adds Passport methods to req
app.use(passport.session()) // Enables persistent login sessions

passport.use(new LocalStrategy(user.authenticate())) // Defines how login works (username + password check)
passport.serializeUser(user.serializeUser()) //Defines what data to store in session
passport.deserializeUser(user.deserializeUser())//Defines how to get user back from session
// =========================================================

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// for user
app.get("/demouser",async(req,res,next)=>{
  const fakeuser = new user({
    email:"std@gmail.com",
    username:"sdm"
  })

  const registeredUser =   await user.register(fakeuser,"helloworld") // userschema data , password
  res.send(registeredUser)
})

//  INDEX Route
app.use("/listings", listingsRouter)
app.use("/listings/:id/reviews", reviewsRouter)
app.use("/", userRouter)
 
// when no route matches
app.all(/.*/, (req, res, next) => {
  throw new ExpressError(404, "Page Not Found!");
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err
  // res.status(statusCode).send(message)
  res.status(statusCode).render("listings/error.ejs", { err })
})

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
