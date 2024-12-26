// Function to create the banner
function createBanner() {
   let banner = document.getElementById('hello-world-banner');
   if (!banner) {
     banner = document.createElement('div');
     banner.id = 'hello-world-banner';
     banner.textContent = 'Hello World!';
     document.body.prepend(banner);
   }
 }
 
 // Create the banner initially
 createBanner();
 
 // Set up a Mutation Observer to monitor changes to the body
 const observer = new MutationObserver(() => {
   createBanner(); // Ensure the banner is always present
 });
 
 // Start observing the document's body for changes
 observer.observe(document.body, { childList: true, subtree: true });
 