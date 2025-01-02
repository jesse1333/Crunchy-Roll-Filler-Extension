// Dataset mapping episode titles to canon/filler status
const episodeStatus = {
  "Clash! Frieza Vs Son Goku This Is The Result of My Training!": "Canon",
  // Add more episode titles here
};

// Function to add banners
function addEpisodeBanners() {
  // Select all episode cards
  const cards = document.querySelectorAll('.playable-card__hover-info--OueGA');
  
  if (cards.length === 0) {
      console.log("No episode cards found!");
      return;
  }

  cards.forEach(card => {
      // Check if banner already exists
      if (card.querySelector('.episode-banner')) return;

      // Find the episode title
      const titleElement = card.querySelector('h4[data-t="episode-title"]');
      if (!titleElement) return; // Skip if title not found
      
      const episodeTitle = titleElement.textContent.trim();
      const status = episodeStatus[episodeTitle] || "Unknown"; // Default to Unknown

      // Create the banner element
      const banner = document.createElement('div');
      banner.textContent = status === "Canon" ? "Canon Episode" : "Filler Episode";
      banner.classList.add('episode-banner'); // Add a class for CSS styling
      banner.style.position = "absolute";
      banner.style.top = "0";
      banner.style.left = "0";
      banner.style.width = "100%";
      banner.style.padding = "5px";
      banner.style.backgroundColor = status === "Canon" ? "green" : "red";
      banner.style.color = "white";
      banner.style.textAlign = "center";
      banner.style.fontWeight = "bold";
      banner.style.zIndex = "10";

      // Append the banner to the card
      card.style.position = "relative"; // Ensure the card is positioned for absolute positioning
      card.appendChild(banner);
  });
}

// Observe DOM changes for dynamic loading
const observer = new MutationObserver(() => {
  addEpisodeBanners();
});

// Start observing the document body
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Run the function initially in case the cards are already loaded
addEpisodeBanners();
