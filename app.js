if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { v4: uuid } = require('uuid');

// ===== Database =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper function for DB queries
const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("DB query error:", err);
    throw err;
  }
};

// ===== Middleware =====
app.use(bodyParser.json());

app.use(cors({
  origin: 'https://daintreestore.netlify.app',
  credentials: true,
}));

// ===== Session =====
app.set('trust proxy', 1); // for Railway/Heroku HTTPS

app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET || 'secret_dts_snw_2025_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: true,   // must be true for HTTPS
    sameSite: 'none'
  }
}));

// ===== Passport =====
app.use(passport.initialize());
app.use(passport.session());

// Example user login helpers
const getUserByEmail = async (email) => {
  const res = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [email.toLowerCase()]);
  return res.rows[0] || null;
};

// Local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) return done(null, false, { message: 'User not found' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser(async (email, done) => {
  try {
    const user = await getUserByEmail(email);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ===== Routes =====
app.get('/', (req, res) => res.send('Welcome to Daintree!'));

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info.message });

    req.logIn(user, err => {
      if (err) return next(err);
      const { password, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    });
  })(req, res, next);
});

app.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ msg: 'Logout failed' });
    req.session.destroy(() => res.clearCookie('connect.sid').json({ msg: 'Logged out' }));
  });
});

// ===== Server Start =====
const PORT = process.env.PORT || 3000; // Railway sets this automatically
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));