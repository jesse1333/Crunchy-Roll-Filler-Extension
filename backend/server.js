const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const https = require("https");
const fs = require("fs");

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Certificates
const options = {
  cert: fs.readFileSync("/home/ec2-user/ssl/selfsigned.crt"),
  key: fs.readFileSync("/home/ec2-user/ssl/selfsigned.key"),
};

// Database config
const pool = new Pool({
  user: "jesse1333",
  host: "anime-fillers-db.ct6jb8ipav6m.us-east-2.rds.amazonaws.com",
  database: "anime_fillers",
  password: "",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Basic endpoint for testing
app.get("/", (req, res) => {
  res.send(
    "Hello, this is your secure Node.js app using a self-signed certificate!"
  );
});

// Series endpoint
app.post("/series", async (req, res) => {
  const { seriesName, episodeName } = req.body;

  if (!seriesName || !episodeName) {
    return res
      .status(400)
      .send("Both series name and episode name are required");
  }

  try {
    // Query for the series first
    const seriesQuery = {
      text: "SELECT id, series_name FROM anime_fillers WHERE series_name ILIKE $1 LIMIT 1",
      values: [seriesName],
    };

    const seriesResult = await pool.query(seriesQuery);

    if (seriesResult.rows.length > 0) {
      const seriesId = seriesResult.rows[0].id;

      console.log(`Found series: ${seriesResult.rows[0].series_name}`);
      console.log(`Finding episode: ${episodeName}`);

      // Search for the episode
      const episodeQuery = {
        text: "SELECT episode_title, episode_type FROM anime_fillers WHERE series_name ILIKE $1 AND episode_title ILIKE $2 LIMIT 1",
        values: [seriesName, episodeName],
      };

      const episodeResult = await pool.query(episodeQuery);

      if (episodeResult.rows.length > 0) {
        const episodeTitle = episodeResult.rows[0].episode_title;
        const episodeType = episodeResult.rows[0].episode_type;

        console.log(`Found episode: ${episodeTitle}, Type: ${episodeType}`);

        res.status(200).send({
          message: `Found series: ${seriesResult.rows[0].series_name}, episode: ${episodeTitle}`,
          episodeType: episodeType,
        });
      } else {
        console.log("No matching episode found in this series.");
        res.status(404).send("Episode not found in this series");
      }
    } else {
      console.log("No matching series found.");
      res.status(404).send("Series not found");
    }
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Server error");
  }
});

// Creates HTTPS Server
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on https://<your-ec2-public-ip>:${port}`);
});
