const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const store = new session.MemoryStore();
const apiRouter = require('./routes/api');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const {getUserById, getUserByUsername, createUser} = require('./db/index.js');
	  
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
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Adding passport's local strategy
passport.use(new LocalStrategy(
  async function (username, password, done) {
    try {
      const user = await getUserByUsername(username);

      if (!user) {
        return done(null, false);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return done(error);
    }
  }
));

app.get('/', (req, res) => {
  res.send('Welcome to Daintree!');
});

app.get('/profile', (req, res) => {
  if (!req.user) {
    // If user is not authenticated, redirect to login page
    return res.redirect('/login');
  } else {
    res.send(req.user); 
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.post('/login',
  passport.authenticate('local', { failureRedirect : '/login' }),
  (req, res) => {
    res.redirect('profile'); 
  }
);

app.post("/register", async (req, res) => {
  try {
    // Use whole req.body object as parameter, createUser() will destructure
    const newUser = await createUser(req.body);

    if (newUser) {
      req.session.userId = newUser.id;

      res.status(201).json({
        msg: "New user created",
        newUser
      });
    } else {
      res.status(500).json({
        msg: "New user was not created"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000,()=>{
 console.log('Express server started at port 3000');
});