// Normalize Episode Names
function normalizeEpisodeName(episodeName) {
  console.log("Normalizing episode name:", episodeName);
  const normalizedName = episodeName
    .replace(/^S\d+\s*E\d+\s*-*\s*/i, "")
    .replace(/^E\d+\s*-*\s*/i, "")
    .trim();
  console.log("Normalized to:", normalizedName);
  return normalizedName;
}

// Send Series Data
async function processSeriesData(
  wrapperClass,
  seriesNameClass,
  episodeNameClass
) {
  console.log(document.documentElement.outerHTML);
  const imageWrappers = document.querySelectorAll(wrapperClass);
  console.log("Found image wrappers:", imageWrappers.length);
  console.log("Looked for " + wrapperClass);
  let bannerType = 0;

  for (const wrapper of imageWrappers) {
    let seriesNameElement;
    let episodeElement;

    let seriesName;
    let episodeName;

    if (wrapperClass == ".playable-card-hover__body--PYTVW") {
      seriesNameElement = wrapper.querySelector(seriesNameClass);
      episodeElement = wrapper.querySelector(episodeNameClass);

      seriesName = seriesNameElement?.textContent;
      episodeName = episodeElement?.textContent?.trim();
      bannerType = 1;
    } else if (wrapperClass == ".playable-card-mini-static--WU--V") {
      console.log("VERSION TWO");
      seriesNameElement = document.querySelector(
        "h4.text--gq6o-.text--is-fixed-size--5i4oU.text--is-semibold--AHOYN.text--is-l--iccTo"
      );
      episodeElement = wrapper.querySelector(episodeNameClass);

      seriesName = seriesNameElement.textContent.trim();
      episodeName = episodeElement.getAttribute("title");

      console.log(seriesName);
      console.log(episodeName);
      bannerType = 2;
    }

    if (!seriesName || !episodeName) {
      console.warn("Missing series name or episode name. Skipping...");
      continue;
    }

    const normalizedEpisodeName = normalizeEpisodeName(episodeName);

    console.log({
      seriesName,
      normalizedEpisodeName,
    });

    try {
      const response = await fetch(
        "https://ec2-3-145-8-251.us-east-2.compute.amazonaws.com:8080/series",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seriesName,
            episodeName: normalizedEpisodeName,
          }),
        }
      );

      const textResponse = await response.text();
      let data;

      try {
        data = JSON.parse(textResponse);
        console.log("Server response:", data);

        if (data.episodeType) {
          console.log(
            "CREATING BANNER FOR: " + seriesName + " WITH " + data.episodeType
          );
          createBanner(wrapper, data.episodeType, bannerType);
        }
      } catch (parseError) {
        console.log("Server message (non-JSON):", textResponse);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  }
}

// Create Banners
function createBanner(wrapper, episodeType, bannerType) {
  if (wrapper.querySelector(".episode-banner")) return;

  const banner = document.createElement("div");
  banner.classList.add("episode-banner");

  banner.style.position = "absolute";
  banner.style.top = "0";
  banner.style.left = "50%";
  banner.style.width = "50%";
  banner.style.padding = "3px";
  banner.style.color = "white";
  banner.style.textAlign = "center";
  banner.style.fontWeight = "bold";
  banner.style.zIndex = "10";
  banner.style.fontSize = "11px";
  banner.style.height = "18px";
  banner.style.lineHeight = "12px";

  if (bannerType == 2) {
    console.log("BANNER TYPE");
    banner.style.left = "0%";
    banner.style.width = "20%";
  }

  switch (episodeType) {
    case 1:
      banner.style.backgroundColor = "#2ecc71";
      if (bannerType == 1) {
        banner.textContent = `Manga Canon`;
        banner.style.left = "50%";
      } else if (bannerType == 2) {
        banner.textContent = `Canon (M)`;
        banner.style.removeProperty("left");
        banner.style.right = "0%";
        banner.style.width = "20%";
      }
      break;
    case 2:
      banner.style.backgroundColor = "#3498db";
      if (bannerType == 1) {
        banner.textContent = `Anime Canon`;
        banner.style.left = "50%";
      } else if (bannerType == 2) {
        banner.textContent = `Canon (A)`;
        banner.style.removeProperty("left");
        banner.style.right = "0%";
        banner.style.width = "20%";
      }
      break;
    case 3:
      banner.textContent = `Mixed`;
      banner.style.backgroundColor = "#e67e22";
      if (bannerType == 1) {
        banner.style.left = "70%";
        banner.style.width = "30%";
      } else if (bannerType == 2) {
        banner.style.removeProperty("left");
        banner.style.right = "0%";
        banner.style.width = "20%";
      }
      break;
    case 4:
      banner.textContent = `Filler`;
      banner.style.backgroundColor = "#e74c3c";
      if (bannerType == 1) {
        banner.style.left = "70%";
        banner.style.width = "30%";
      } else if (bannerType == 2) {
        banner.style.removeProperty("left");
        banner.style.right = "0%";
        banner.style.width = "20%";
      }
      break;
    default:
      return;
  }

  wrapper.style.position = "relative";
  wrapper.appendChild(banner);
}

// Fetch URLs (Calls ProcessSeriesData)
function fetchFillersURL() {
  const currentURL = window.location.href;

  if (
    currentURL === "https://www.crunchyroll.com/" ||
    currentURL.startsWith("https://www.crunchyroll.com/series/")
  ) {
    processSeriesData(
      ".playable-card-hover__body--PYTVW",
      ".playable-card-hover__secondary-title-link--Exdsq small",
      "h4"
    );
  } else if (currentURL.startsWith("https://www.crunchyroll.com/watch/")) {
    processSeriesData(
      ".playable-card-mini-static--WU--V",
      "NULL",
      ".playable-card-mini-static__link--UOJQm"
    );
  }
}

// Detect URLs 
function handlePageNavigation() {
  const currentURL = window.location.href;
  console.log("URL changed:", currentURL);

  if (
    currentURL === "https://www.crunchyroll.com/" ||
    currentURL.startsWith("https://www.crunchyroll.com/series/")
  ) {
    fetchFillersURL();
  } else if (currentURL.startsWith("https://www.crunchyroll.com/watch/")) {
    fetchFillersURL();
  }
}

window.addEventListener("popstate", handlePageNavigation);
window.addEventListener("pushState", handlePageNavigation);
window.addEventListener("replaceState", handlePageNavigation);

const observer = new MutationObserver(() => {
  handlePageNavigation();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded event triggered");
  fetchFillersURL();
});

console.log("Script end reached, executing fetchFillersURL");
fetchFillersURL();

const homeButton = document.querySelector("#home-button");

if (homeButton) {
  homeButton.addEventListener("click", function () {
    window.location.reload();
  });
}
