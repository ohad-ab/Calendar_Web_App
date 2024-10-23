import express from "express";
import bodyParser from "body-parser";
import cors from 'cors'
import axios from "axios";
import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import connectPgSimple from 'connect-pg-simple';

const app = express();
const port = 5000;
const API_URL = "https://api.tvmaze.com"
const saltRounds = 10;
env.config();
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({pool: db}),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
      maxAge:1000*60*60*24
    }
  })
);



app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/', async (req, res) => {
  let shows = [];
  if(req.isAuthenticated())
    {
      const result = await db.query("SELECT * FROM episodes INNER JOIN shows ON episodes.show_id=shows.show_id INNER JOIN users_shows AS us ON us.show_id=shows.show_id WHERE us.user_id=$1 ORDER BY air_date ASC",[req.user.id]);
      shows = result.rows;
    }
  res.json({shows: shows, user: req.user});
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
      if (err) {
          return next(err);
      }
      if (!user) {
          return res.json({ success: false, message: info.message });
      }
      req.logIn(user, (err) => {
          if (err) {
              return next(err);
          }
          return res.json({ success: true, message: 'Authentication successful', user });
      });
  })(req, res, next);
});

app.post('/logout', (req,res)=>{
  req.logOut({}, (err)=>{
    if(err){
      console.log(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.log('Error during session destruction:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      console.log('Logout successful, session destroyed.');
      return res.json({ success: true, message: 'Logout successful' });
    });
  });
})

app.post('/register', async (req,res)=>{
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.json({success: false, message:"Email already exists in the system"});
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          console.log(user);
          req.login(user, (err) => {
            console.log("success");
            res.json({success: true});
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
})

app.get('/search', async (req,res)=>{
  const response = await axios.get(`${API_URL}/search/shows?q=${req.query.q}`);
  res.json({result: response.data, user: req.user});
})

app.get('/show', async (req,res)=>{
  const response = await axios.get(`${API_URL}/shows/${req.query.id}`);
  const result = await db.query(`SELECT show_id FROM users_shows WHERE show_id=${response.data.id} AND show_id=${req.user.id} `);
  const added = result.rows.length > 0? true:false;
  res.json({show: response.data, added: added, user: req.user});
})

app.post('/add', async (req,res)=>{
  const show = req.body;
  try {
    const response = await axios.get(`https://api.tvmaze.com/shows/${show.id}/episodes`);
    await db.query('INSERT INTO shows (show_id, name, network, web_channel, image_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (show_id) DO NOTHING', [show.id, show.name, show.network && show.network.name, show.webChannel && show.webChannel.name, show.image.medium]);
    await db.query('INSERT INTO users_shows (user_id, show_id) VALUES ($1, $2)',[req.user.id, show.id]);
    for(const element of response.data){
      await db.query("INSERT INTO episodes VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(episode_id) DO NOTHING",[element.id, show.id, element.url, element.name, element.season, element.number, element.airdate.split('T')[0], element.airtime || null]);
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post('/delete',async (req,res)=>{
  try {
    console.log(req.body)
    await db.query('DELETE FROM episodes WHERE show_id=$1',[req.body.id]);
    await db.query('DELETE FROM shows WHERE show_id=$1',[req.body.id]);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    sendStatus(500);
  }
})

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        console.log(username, user);
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, ()=>{
  console.log(`server is listening on port ${port}`)
});