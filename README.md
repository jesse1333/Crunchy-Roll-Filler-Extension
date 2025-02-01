# Crunchy Roll Filler Extension

<table>
  <tr>
    <td><img width="1416" alt="Screenshot 2025-01-31 at 10 36 59 PM" src="https://github.com/user-attachments/assets/0cd6860b-de6b-4def-85f6-b4a2affb6751" /></td>
    <td>
      Crunchy Roll Filler Extension is an extension for Google Chrome that allows users to identify anime filler episodes across dozens of anime series, allowing users to skip filler content irrelevant to the main story!
    </td>
  </tr>
</table>

## How It's Made:

**Tech used:** Node.js, JavaScript, AWS EC2, AWS RDS, Postgres, BeautifulSoup, Psycopg2

I built this extension using multiple front/backend technologies. Anime filler content was webscraped from https://www.animefillerlist.com/shows/ using BeautifulSoup, which was then inserted into a Postgres RDB hosted on AWS using Psycopg2.
The RDB is then accessed from by a node.js server file, which is hosted on AWS EC2. A frontend JavaScript script interacts with https://www.crunchyroll.com/ to find the relevant HTML to display the filler content banners, including the home page view, episode view, and series overview page.

## Lessons Learned:

This project was a valuable learning experience! By making this project, I...

- learned the basics of EC2 and RDB (Relational Database), including how to configure and manage an EC2 instance for hosting a Node.js server
- gained a solid understanding of networking and security, especially through the challenges of hosting a server indefinitely on EC2, managing certificates, and configuring HTTPS to ensure secure communication
- explored how to make the front-end and back-end communicate effectively, which involved resolving issues around server connections and API integration
- became more proficient with web scraping using BeautifulSoup, improving my ability to extract data and automate information gathering
- gained comfort in designing my own RDB (PostgreSQL) schema for storing anime filler data, and learned how to structure data for optimal performance
- set up API endpoints that enabled communication between the Node.js server and the backend, facilitating seamless data flow and enhancing my understanding of full-stack development
