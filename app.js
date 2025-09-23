const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const apiRouter = require('./routes/api');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator'); // For sanitizing inputs
const helmet = require("helmet"); // For additional security
const {pool, getUserByEmail, createUser} = require('./db/index.js');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { validateRegistration, validateLogin, handleValidationErrors } = require('./middleware/validation');
	  

app.set('port', process.env.PORT || 3000);

const store = new pgSession({
  pool, 
  tableName: 'session'
});

// Add middleware for handling CORS requests from index.html
app.use(cors({
  origin: "https://daintreestore.netlify.app", // change to local host for local development
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

// Add the middleware for addional security with http headers
app.use(helmet());

// Add passport middleware for logging in
app.use(passport.initialize());

// Add the middleware to implement a session with passport
app.use(passport.session());

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

app.post('/login', validateLogin, handleValidationErrors, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    try {
      if (err) throw err;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || 'Invalid email or password'
        });
      }
      req.logIn(user, (err) => {
        if (err) throw err;
        const { password, ...safeUser } = user;
        return res.json({
          success: true,
          message: 'Login successful',
          user: safeUser
        });
      });
    } catch (error) {
      console.error('[Login error]', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  })(req, res, next);
});

// Register endpoint
app.post("/register", validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    // Use whole req.body object as parameter, createUser() will destructure
    const newUser = await createUser(req.body);

    if (newUser) {
      req.session.userEmail = newUser.email;
      const { password, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        msg: "New user created",
        user: safeUser
      });
    } else {
      res.status(500).json({
        success: false,
        msg: "New user was not created"
      });
    }
  } catch (error) {
    console.error(error);
    next(error); // Pass error to error handler middleware
  }
});

// Signup endpoint (alias for register to match frontend)
app.post("/signup", validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    // Use whole req.body object as parameter, createUser() will destructure
    const newUser = await createUser(req.body);

    if (newUser) {
      req.session.userEmail = newUser.email;
      const { password, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        msg: "New user created",
        user: safeUser
      });
    } else {
      res.status(500).json({
        success: false,
        msg: "New user was not created"
      });
    }
  } catch (error) {
    console.error(error);
    next(error); // Pass error to error handler middleware
  }
});

// Add middleware for the api and routes
app.use('/', apiRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Express server started at port 3000');
});
