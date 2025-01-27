import requests
from bs4 import BeautifulSoup
import psycopg2

# Scrape Episode Data
def scrape_episode_data(show_url):
   response = requests.get(show_url)
   if response.status_code != 200:
      print(f"Failed to fetch URL: {show_url}")
      return None

   soup = BeautifulSoup(response.text, 'html.parser')

   table = soup.find('table', class_='EpisodeList')
   if not table:
      print("No EpisodeList table found.")
      return None

   tbody = table.find('tbody')
   if not tbody:
      print("No tbody tag found in the EpisodeList.")
      return None

   episodes = []
   for row in tbody.find_all('tr'):
      number_cell = row.find('td', class_='Number')
      episode_number = number_cell.text.strip() if number_cell else None

      title_cell = row.find('td', class_='Title')
      episode_title = title_cell.text.strip() if title_cell else None

      type_cell = row.find('td', class_='Type')
      episode_type = type_cell.text.strip() if type_cell else None

      type_mapping = {
         'Manga Canon': 1,
         'Anime Canon': 2,
         'Mixed Canon/Filler': 3,
         'Filler': 4,
      }
      
      episode_type_value = type_mapping.get(episode_type, 0) 

      if episode_number and episode_title and episode_type_value:
         episodes.append({
            'number': episode_number,
            'title': episode_title,
            'type': episode_type_value
         })

   return episodes

# Insert Episode Data
def insert_episodes_to_db(episodes, series_title):
   try:
      conn = psycopg2.connect(
        dbname="anime_fillers",
        user="jesse1333",
        password="",
        host="anime-fillers-db.ct6jb8ipav6m.us-east-2.rds.amazonaws.com",
        port="5432"
    )
      
      cursor = conn.cursor()

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
            continue

         cursor.execute(
               """
               INSERT INTO anime_fillers (series_name, episode_number, episode_title, episode_type)
               VALUES (%s, %s, %s, %s)
               """,
               (series_title, episode['number'], episode['title'], episode['type'])
         )

      conn.commit()
      print(f"{len(episodes)} episodes inserted successfully.")

   except Exception as e:
      print(f"An error occurred: {e}")
   finally:
      if conn:
         cursor.close()
         conn.close()

# Database Parameters
db_params = {
   "host": "anime-fillers-db.ct6jb8ipav6m.us-east-2.rds.amazonaws.com",
   "database": "anime_fillers",
   "user": "jesse1333",
   "password": "",
}


conn = psycopg2.connect(**db_params)
cursor = conn.cursor()

url = "https://www.animefillerlist.com/shows"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

groups = soup.find_all('div', class_='Group')

links = []

for group in groups:
    ul_elements = group.find_all('ul')
    
    for ul in ul_elements:
        li_elements = ul.find_all('li')
        
        for li in li_elements:
            a_tag = li.find('a', href=True)
            
            if a_tag and a_tag['href'].startswith('/shows'):
                links.append(a_tag['href'])

for show_url in links:
   print(f"Processing URL: {show_url}")
   episodes = scrape_episode_data(f"https://www.animefillerlist.com/{show_url}")
   if episodes:
      response = requests.get(f"https://www.animefillerlist.com/{show_url}")
      soup = BeautifulSoup(response.text, "html.parser")
      h1_tag = soup.find('h1')
      
      if h1_tag:
          series_title = h1_tag.text.replace(' Filler List', '').strip()
      else:
          print(f"Failed to find h1 tag for URL: {show_url}")
          continue
      
      insert_episodes_to_db(episodes, series_title)
