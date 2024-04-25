const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const store = new session.MemoryStore();
const apiRouter = require('./routes/api');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {query, getUserById, getUserByUsername} = require('./db/index');
	  
app.set('port', process.env.PORT || 3000);

// Add middleware for handling CORS requests from index.html
app.use(cors());

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

// Add middleware for handing seesion storage
app.use(
  session({
    secret: "fwababa$$%%31",
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: true }, // one day expiry
    saveUninitialized: false,
    resave: false,
    store
  })
);

// Add middleware for the api and routes
app.use('/', apiRouter);

// Add passport middleware for loggin in
app.use(passport.initialize());

// Add the middleware to implement a session with passport
app.use(passport.session());

// For serializing the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializing user
passport.deserializeUser(async (id, done) => {
  const user = await getUserById(id);
  done(null, user)
});

// Adding passport's local strategy
passport.use(new LocalStrategy(
  async function (username, password, done) {
    const user = await getUserByUsername(username);

    if (!user) {
      done (null, false);
    }

    if(user.password != password) {
      done(null, false);
    }

    done(null, user);
  }
))

app.get('/', (req, res) => {
  res.send('Welcome to Daintree!');
});

app.get("/profile", (req, res) => {
  res.render("profile", { user: req.user });
});

app.post("/login",
  passport.authenticate("local", { failureRedirect : "/login"}),
  (req, res) => {
    res.redirect("profile");
  }
);

app.listen(3000,()=>{
 console.log('Express server started at port 3000');
});