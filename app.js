const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Routers and DB helpers
const apiRouter = require("./routes/api");
const { pool, getUserByEmail } = require("./db/index.js");

const app = express();

// Debug logging
console.log("Initializing server...");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

app.use(express.json());

// CORS BEFORE routes
const FRONTEND_URL = process.env.FRONTEND_URL || "https://daintreestore.netlify.app";

console.log("FRONTEND_URL:", FRONTEND_URL);

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "https://daintreestore.netlify.app",
      "http://localhost:3001",
      "http://localhost:3000"
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("CORS blocked origin:", origin);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Sessions BEFORE passport.session()
app.set("trust proxy", 1); // Railway is behind a proxy

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
    }),
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "dev_fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: true,
      sameSite: "none",
      // partitioned: true, // optional - may need this later
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.email));

passport.deserializeUser(async (email, done) => {
  try {
    const user = await getUserByEmail(email);
    done(null, user || false);
  } catch (e) {
    done(e);
  }
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) return done(null, false, { message: "User not found" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (e) {
      return done(e);
    }
  })
);

// Basic route
app.get("/", (req, res) => res.send("Welcome to Daintree!"));

// User endpoint (frontend calls this)
app.get("/user", (req, res) => {
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  res.json(req.user);
});

// Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid email or password",
      });
    }

    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      const { password, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    });
  })(req, res, next);
});

// Logout
app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err2) => {
      if (err2) return next(err2);
      res.clearCookie("connect.sid", {
        secure: true,
        sameSite: "none",
      });
      res.json({ msg: "Logged out successfully" });
    });
  });
});

// API routes AFTER middleware (items/cart/etc)
app.use("/", apiRouter);

// Error handler (must be after all routes)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  
  // Always send CORS headers
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server on Railway port
const PORT = process.env.PORT || 3000;
console.log("PORT var =", process.env.PORT);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;