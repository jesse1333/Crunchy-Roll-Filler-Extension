import requests
from bs4 import BeautifulSoup
import psycopg2


def scrape_episode_data(show_url):
   # Make a request to the page
   response = requests.get(show_url)
   if response.status_code != 200:
      print(f"Failed to fetch URL: {show_url}")
      return None

   # Parse the page content
   soup = BeautifulSoup(response.text, 'html.parser')

   # Find the table containing episode data
   table = soup.find('table', class_='EpisodeList')
   if not table:
      print("No EpisodeList table found.")
      return None

   tbody = table.find('tbody')
   if not tbody:
      print("No tbody tag found in the EpisodeList.")
      return None

   # Extract episode details
   episodes = []
   for row in tbody.find_all('tr'):
      # Extract episode number
      number_cell = row.find('td', class_='Number')
      episode_number = number_cell.text.strip() if number_cell else None

      # Extract episode title
      title_cell = row.find('td', class_='Title')
      episode_title = title_cell.text.strip() if title_cell else None

      # Extract episode type
      type_cell = row.find('td', class_='Type')
      episode_type = type_cell.text.strip() if type_cell else None

      # Map episode types
      type_mapping = {
         'Manga Canon': 1,
         'Anime Canon': 2,
         'Mixed Canon/Filler': 3,
         'Filler': 4,
      }
      
      episode_type_value = type_mapping.get(episode_type, 0) 

      # Append to list
      if episode_number and episode_title and episode_type_value:
         episodes.append({
            'number': episode_number,
            'title': episode_title,
            'type': episode_type_value
         })

   return episodes

def insert_episodes_to_db(episodes, series_title):
   try:
      # Connect to the PostgreSQL database
      conn = psycopg2.connect(
         dbname="d8id4egncg0qi",
         user="uevj4j57oum2ms",
         password="p1647359b7b9e0585f410d5c511cb70cb3332a881209541503c8e899c1beabc08",
         host="c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
      )
      
      cursor = conn.cursor()

      # Check for existing episodes before inserting
      for episode in episodes:
         cursor.execute(
               """
               SELECT 1 FROM anime_fillers 
               WHERE series_name = %s AND episode_number = %s
               """, 
               (series_title, episode['number'])
         )
         if cursor.fetchone():
            print(f"Skipping duplicate episode {episode['number']} for {series_title}")
            continue  # Skip if episode already exists in the database

         # Insert episode data if not duplicate
         cursor.execute(
               """
               INSERT INTO anime_fillers (series_name, episode_number, episode_title, episode_type)
               VALUES (%s, %s, %s, %s)
               """,
               (series_title, episode['number'], episode['title'], episode['type'])
         )

      # Commit the transaction
      conn.commit()
      print(f"{len(episodes)} episodes inserted successfully.")

   except Exception as e:
      print(f"An error occurred: {e}")
   finally:
      # Close the connection
      if conn:
         cursor.close()
         conn.close()


# main

db_params = {
   "host": "c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
   "database": "d8id4egncg0qi",
   "user": "uevj4j57oum2ms",
   "password": "p1647359b7b9e0585f410d5c511cb70cb3332a881209541503c8e899c1beabc08",
}

# Establish a connection to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cursor = conn.cursor()

url = "https://www.animefillerlist.com/shows"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Find all divs with class "Group"
groups = soup.find_all('div', class_='Group')

# Initialize a list to store the links
links = []

# Loop through each group to extract the links
for group in groups:
    # Find all <ul> within the group
    ul_elements = group.find_all('ul')
    
    # Loop through each <ul> to extract the <a> tags
    for ul in ul_elements:
        li_elements = ul.find_all('li')
        
        for li in li_elements:
            a_tag = li.find('a', href=True)
            
            if a_tag and a_tag['href'].startswith('/shows'):
                links.append(a_tag['href'])
                
# scrape & insert
for show_url in links:
   print(f"Processing URL: {show_url}")
   episodes = scrape_episode_data(f"https://www.animefillerlist.com/{show_url}")
   if episodes:
      response = requests.get(f"https://www.animefillerlist.com/{show_url}")
      soup = BeautifulSoup(response.text, "html.parser")
      h1_tag = soup.find('h1')
      
      if h1_tag:
          # Get the series title and remove "Filler List"
          series_title = h1_tag.text.replace(' Filler List', '').strip()
      else:
          print(f"Failed to find h1 tag for URL: {show_url}")
          continue  # Skip if no h1 tag is found
      
      # Insert episodes into the database with the cleaned series title
      insert_episodes_to_db(episodes, series_title)
      