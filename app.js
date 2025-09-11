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
const { check, validationResult } = require('express-validator'); // For sanitizing inputs
const helmet = require("helmet"); // For additional security
const {getUserByEmail, createUser} = require('./db/index.js');
	  

app.set('port', process.env.PORT || 3000);

// Add middleware for handling CORS requests from index.html
app.use(cors({
  origin: "https://https://daintreestore.netlify.app", // change to local host for local development
  credentials: true
}));

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

// Add middleware for handing session storage
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fwababa$$%%31",
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // one day expiry
      httpOnly: true, 
      secure: true,
      sameSite: 'none'
    }, 
    saveUninitialized: false,
    resave: false,
    store
  })
);

// Add passport middleware for logging in
app.use(passport.initialize());

// Add the middleware to implement a session with passport
app.use(passport.session());

// Add the middleware for addional security with http headers
app.use(helmet());

// For serializing the user
passport.serializeUser((user, done) => {
  done(null, user.email);
});

// Deserializing user
passport.deserializeUser(async (email, done) => {
  try {
    const user = await getUserByEmail(email);
    done(null, user);
  } catch (error) {
    console.error(error);
    done(error);
  }
});

// Adding passport's local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async function (email, password, done) {
    try {
      const user = await getUserByEmail(email);

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (error) {
      console.error(error);
      return done(error);
    }
  }
));

app.get('/', (req, res) => {
  res.send('Welcome to Daintree!');
});

app.get('/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  res.json(req.user);
});

app.get('/user/:email', async (req, res) => {
  try {
    const user = await getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ msg: "Logged out successfully" });
    });
  });
});

app.post('/login', async (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ 
        success: false, 
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      const { password, ...safeUser } = user;
      return res.json({ 
        success: true, 
        message: 'Login successful', 
        user: safeUser 
      });
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  try {
    // Use whole req.body object as parameter, createUser() will destructure
    const newUser = await createUser(req.body);

    if (newUser) {
      req.session.userEmail = newUser.email;

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

// Add middleware for the api and routes
app.use('/', apiRouter);

app.listen(3000, () => {
  console.log('Express server started at port 3000');
});
