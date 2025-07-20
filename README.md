# TV Calendar

A simple full-stack app to search, track, and rate TV shows. Uses the TVmaze API to get show data and displays upcoming episodes in a calendar view.

## Features

- User registration & login (with sessions)
- Search for TV shows
- Add/remove shows to your calendar
- See upcoming episodes by air date
- Rate shows (stores user + global ratings)

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express, PostgreSQL, Passport.js
- **Other:** bcrypt for hashing, connect-pg-simple for session storage, TVmaze API for data

## Notes

- Data is fetched from TVmaze and stored locally (episodes, shows, ratings)

This app was built from scratch, including the UI, backend routes and database schema.

Data provided by the [TVmaze API](https://www.tvmaze.com/api).
