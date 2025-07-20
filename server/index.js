import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import axios from "axios";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from 'connect-pg-simple';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const API_URL = "https://api.tvmaze.com";
const saltRounds = 10;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const PgSession = connectPgSimple(session);

// Session setup with Postgres store
app.use(
  session({
    store: new PgSession({ pool: db }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---

// Get shows for authenticated user
app.get('/', async (req, res) => {
  let shows = [];
  if (req.isAuthenticated()) {
    const result = await db.query(
      `SELECT * FROM episodes 
       INNER JOIN shows ON episodes.show_id = shows.show_id 
       INNER JOIN users_shows AS us ON us.show_id = shows.show_id 
       WHERE us.user_id = $1 AND us.added = true 
       ORDER BY air_date ASC`,
      [req.user.id]
    );
    shows = result.rows;
  }
  res.json({ shows, user: req.user });
});

// Login endpoint using Passport local strategy
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.json({ success: false, message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, message: 'Authentication successful', user });
    });
  })(req, res, next);
});

// Logout endpoint — destroys session
app.post('/logout', (req, res) => {
  req.logOut({}, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during session destruction:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logout successful' });
    });
  });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username: email, password, repeatedPassword, name } = req.body;

  try {
    // Check if email already exists
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkResult.rows.length > 0) {
      return res.json({ success: false, message: "Email already exists in the system" });
    }

    if (password !== repeatedPassword) {
      return res.status(400).json({ error: 'The password was not repeated correctly' });
    }

    // Hash password and insert new user
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ success: false, message: 'Error processing request' });
      }
      const result = await db.query(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
        [email, hash, name]
      );
      const user = result.rows[0];
      req.login(user, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Login after registration failed' });
        res.json({ success: true, user });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search shows via TVmaze API
app.get('/search', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/search/shows?q=${req.query.q}`);
    res.json({ result: response.data, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// Get show details and user-related info
app.get('/show', async (req, res) => {
  try {
    const showResponse = await axios.get(`${API_URL}/shows/${req.query.id}`);
    const userShowResult = await db.query(
      `SELECT show_id, user_rating FROM users_shows WHERE show_id=$1 AND user_id=$2`,
      [req.query.id, req.user.id]
    );
    const showLocal = await db.query("SELECT rating FROM shows WHERE show_id=$1", [req.query.id]);
    const added = userShowResult.rows.length > 0;
    res.json({
      show: showResponse.data,
      added,
      user: req.user,
      userRating: userShowResult.rows[0]?.user_rating || null,
      totalRating: showLocal.rows[0]?.rating || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to get show' });
  }
});

// Add show and episodes to user's calendar
app.post('/add', async (req, res) => {
  const show = req.body;
  try {
    const episodesResponse = await axios.get(`${API_URL}/shows/${show.id}/episodes`);
    const userShowResult = await db.query('SELECT * FROM users_shows WHERE user_id=$1 AND show_id=$2', [req.user.id, show.id]);

    if (userShowResult.rows.length === 0) {
      await db.query(
        `INSERT INTO shows (show_id, name, network, web_channel, image_url) 
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (show_id) DO NOTHING`,
        [show.id, show.name, show.network?.name || null, show.webChannel?.name || null, show.image.medium]
      );
      await db.query(
        `INSERT INTO users_shows (user_id, show_id, added) VALUES ($1, $2, $3)`,
        [req.user.id, show.id, true]
      );
      for (const ep of episodesResponse.data) {
        await db.query(
          `INSERT INTO episodes (episode_id, show_id, url, name, season, number, air_date, air_time) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(episode_id) DO NOTHING`,
          [ep.id, show.id, ep.url, ep.name, ep.season, ep.number, ep.airdate, ep.airtime || null]
        );
      }
    } else {
      // Mark as added if previously removed
      await db.query(
        `UPDATE users_shows SET added = true WHERE user_id=$1 AND show_id=$2`,
        [req.user.id, show.id]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Rate a show
app.post('/rate', async (req, res) => {
  const { show, rate } = req.body;
  try {
    const episodesResponse = await axios.get(`${API_URL}/shows/${show.id}/episodes`);
    const userShowResult = await db.query('SELECT * FROM users_shows WHERE user_id=$1 AND show_id=$2', [req.user.id, show.id]);

    if (userShowResult.rows.length === 0) {
      // New user-show rating
      await db.query(
        `INSERT INTO shows (show_id, name, network, web_channel, image_url, rating, rater_num) 
         VALUES ($1, $2, $3, $4, $5, $6, 1) ON CONFLICT (show_id) DO NOTHING`,
        [show.id, show.name, show.network?.name || null, show.webChannel?.name || null, show.image.medium, rate]
      );
      await db.query(
        `INSERT INTO users_shows (user_id, show_id, user_rating) VALUES ($1, $2, $3)`,
        [req.user.id, show.id, rate]
      );
      for (const ep of episodesResponse.data) {
        await db.query(
          `INSERT INTO episodes (episode_id, show_id, url, name, season, number, air_date, air_time) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(episode_id) DO NOTHING`,
          [ep.id, show.id, ep.url, ep.name, ep.season, ep.number, ep.airdate, ep.airtime || null]
        );
      }
    } else {
      // Update rating and overall show rating
      const ratingResult = await db.query('SELECT rating, rater_num FROM shows WHERE show_id = $1', [show.id]);
      const oldRating = ratingResult.rows[0].rating;
      const oldRaterNum = ratingResult.rows[0].rater_num;
      const newRating = ((oldRating * oldRaterNum) + rate) / (oldRaterNum + 1);

      await db.query('UPDATE users_shows SET user_rating = $1 WHERE user_id = $2 AND show_id = $3', [rate, req.user.id, show.id]);
      await db.query('UPDATE shows SET rating = $1, rater_num = $2 WHERE show_id = $3', [newRating, oldRaterNum + 1, show.id]);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Delete a show from user's calendar
app.post('/delete', async (req, res) => {
  try {
    if (!req.body.rate) {
      await db.query('DELETE FROM users_shows WHERE show_id=$1 AND user_id=$2', [req.body.id, req.user.id]);
      const remainingUserShows = await db.query('SELECT show_id FROM users_shows WHERE show_id=$1', [req.body.id]);
      if (remainingUserShows.rows.length === 0) {
        await db.query('DELETE FROM episodes WHERE show_id=$1', [req.body.id]);
        await db.query('DELETE FROM shows WHERE show_id=$1', [req.body.id]);
      }
    } else {
      // If rate exists, mark as removed (added=false)
      await db.query('UPDATE users_shows SET added = false WHERE user_id=$1 AND show_id=$2', [req.user.id, req.body.id]);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Passport local strategy setup
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
    if (result.rows.length === 0) {
      return done(null, false, { message: "User not found" });
    }
    const user = result.rows[0];
    bcrypt.compare(password, user.password, (err, valid) => {
      if (err) return done(err);
      if (valid) return done(null, user);
      else return done(null, false, { message: "Incorrect password" });
    });
  } catch (err) {
    console.error(err);
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user); // Could store only user.id here for efficiency
});

passport.deserializeUser((user, done) => {
  done(null, user); // Could fetch fresh user from DB if needed
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
