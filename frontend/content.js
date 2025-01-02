// Import required modules
const { Pool } = require("pg");
const stringSimilarity = require("string-similarity");

// PostgreSQL connection setup
const db = new Pool({
  database: "d8id4egncg0qi",
  user: "uevj4j57oum2ms",
  password: "p1647359b7b9e0585f410d5c511cb70cb3332a881209541503c8e899c1beabc08",
  host: "c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
});

// Function to add banners to episode cards
async function addEpisodeBanners() {
  // Select all episode cards
  const cards = document.querySelectorAll(".playable-card--GnRbX");

  if (cards.length === 0) {
    console.log("No episode cards found!");
    return;
  }

  cards.forEach(async (card) => {
    // Check if banner already exists
    if (card.querySelector(".episode-banner")) return;

    // Find the series title
    const seriesTitleElement = card.querySelector(
      ".playable-card__body-aligner---Vepg .playable-card__show-title-wrapper--kIrAB small"
    );
    if (!seriesTitleElement) return; // Skip if series title not found
    const seriesTitle = seriesTitleElement.textContent.trim();

    // Find the episode title
    const episodeTitleElement = card.querySelector(
      ".playable-card__body-aligner---Vepg .text--gq6o- .playable-card__title--rgmp7"
    );
    if (!episodeTitleElement) return; // Skip if episode title not found
    const episodeTitle = episodeTitleElement.textContent.trim();

    // Fetch episode type from the database
    const episodeType = await getEpisodeType(seriesTitle, episodeTitle);
    if (!episodeType) return; // Skip if no match found in the database

    // Create the banner element
    const banner = document.createElement("div");
    banner.textContent =
      episodeType === "Canon" ? "Canon Episode" : "Filler Episode";
    banner.classList.add("episode-banner"); // Add a class for CSS styling
    banner.style.position = "absolute";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.padding = "5px";
    banner.style.backgroundColor = episodeType === "Canon" ? "green" : "red";
    banner.style.color = "white";
    banner.style.textAlign = "center";
    banner.style.fontWeight = "bold";
    banner.style.zIndex = "10";

    // Append the banner to the card
    card.style.position = "relative"; // Ensure the card is positioned for absolute positioning
    card.appendChild(banner);
  });
}

// Function to fetch episode type from the database
async function getEpisodeType(seriesTitle, episodeTitle) {
  try {
    const query = `
            SELECT series_name, episode_title, episode_type 
            FROM anime_fillers
        `;
    const result = await db.query(query);

    if (result.rows.length === 0) {
      console.log("No data found in the database.");
      return null;
    }

    // Lowercase and clean the input
    const cleanedSeriesTitle = seriesTitle.toLowerCase().trim();
    const cleanedEpisodeTitle = episodeTitle
      .toLowerCase()
      .trim()
      .replace(/^s\d+\se\d+\s-\s/i, "");

    let bestMatch = null;
    let bestScore = 0;

    for (const row of result.rows) {
      const dbSeriesTitle = row.series_name.toLowerCase().trim();
      const dbEpisodeTitle = row.episode_title.toLowerCase().trim();

      // Calculate similarity scores
      const seriesSimilarity = stringSimilarity.compareTwoStrings(
        cleanedSeriesTitle,
        dbSeriesTitle
      );
      const episodeSimilarity = stringSimilarity.compareTwoStrings(
        cleanedEpisodeTitle,
        dbEpisodeTitle
      );

      // Check if both scores meet the 80% threshold
      if (seriesSimilarity >= 0.8 && episodeSimilarity >= 0.8) {
        const combinedScore = seriesSimilarity + episodeSimilarity;

        // Keep track of the best match based on the highest combined score
        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestMatch = row.episode_type;
        }
      }
    }

    return bestMatch;
  } catch (error) {
    console.error("Error querying the database:", error);
    return null;
  }
}

// Observe DOM changes for dynamic loading
const observer = new MutationObserver(() => {
  addEpisodeBanners();
});

// Start observing the document body
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Run the function initially in case the cards are already loaded
addEpisodeBanners();
