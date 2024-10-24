# Smart Migration Recommendation System

This system helps match migrants with suitable migration agents in Australia based on specific needs and preferences.

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.9 or higher (https://www.python.org/downloads/)
- Git (https://git-scm.com/downloads)

## Setup and Installation

1. Clone the repository: `git clone https://github.com/benq0630/Smart-Migration.git  `

2. Navigate to the project directory: `cd Smart-Migration  `

3. Create and activate a virtual environment (optional but recommended):

   - On Windows: `python -m venv venv
venv\Scripts\activate    `
   - On macOS and Linux: `python3 -m venv venv
source venv/bin/activate    `

4. Install the required Python packages: `pip install -r requirements.txt  `

## Running the Application

1. Start the Flask application: `python -m backend.app  `

2. Open a web browser and go to: http://localhost:8080

3. Use the form on the webpage to input your preferences and find matching migration agents.

## Features

- Filter agents by gender, experience, consultation mode, language, budget, location, practice area, Google rating, and online reviews.
- View recommended agents and other options based on your preferences.
- See detailed information about each agent, including contact details.

## Technologies Used

- Frontend: HTML5, CSS3, JavaScript
- Backend: Python, Flask
- Data Processing and Machine Learning: pandas, numpy, scikit-learn, XGBoost

## Project Structure

- `backend/app.py`: Main Flask application
- `model/train.py`: Model training script
- `model/preprocess.py`: Data preprocessing functions
- `index.html`: Main webpage
- `style.css`: Stylesheet for the webpage
- `Script.js`: JavaScript for frontend functionality

## Troubleshooting

- If you encounter any "Module not found" errors, ensure you've activated the virtual environment and installed all requirements.
- For any other issues, please check the terminal for error messages.

## Acknowledgements

Special thanks to the University of Adelaide and Migrova for their support in developing this project.

## Version Information

- Flask: 2.0.1
- Flask-CORS: 3.0.10
- pandas: 1.3.3
- numpy: 1.21.2
- scikit-learn: 0.24.2
- XGBoost: 1.4.2

For a complete list of dependencies and their versions, please refer to the `requirements.txt` file.




# Smart Migration Recommendation System (Rule-Based Filtering Approach)

## Overview

The Migration Agent Finder is a simple rule-based filtering system that helps users find migration agents based on their preferences. This project uses a MySQL database to store data about agents, such as their gender, experience level, consultation mode, cost, location, and other attributes. It then filters these agents based on the user's input to recommend suitable migration agents. This README will guide you through setting up the project and running it on your local machine.

## Features

- Select preferences: Users can filter migration agents by gender, experience level, consultation mode, budget, location, practice area, language, Google rating, and online reviews.

- View Results: The top recommended migration agents are displayed based on the user's preferences.

## Prerequisites

- Node.js (v14.0.0 or higher)

- MySQL server

- npm (included with Node.js)

Installation Guide

### Step 1: Clone or Download the Project

Download or clone the repository to your local machine.

```sh
$ git clone <repository_url>
$ cd migration-agent-finder
```

### Step 2: Install Dependencies

Install all necessary dependencies by running the following command:

`$ npm install `

This command will install the following key dependencies:

- express: Node.js web application framework

- mysql2: For MySQL database connectivity

- cors, cookie-parser, express-session, morgan: Middleware packages for various purposes

### Step 3: MySQL Database Setup

1. Start your MySQL server and create a new database called filter.

`CREATE DATABASE filter; `

2. Import the intermediary.sql file into your database. This script contains the structure of the consultants table and pre-filled data that you need for the agent filtering process.

`$ mysql -u root -p filter < intermediary.sql `

Make sure to replace root with your MySQL username and filter with the database name.

### Step 4: Edit Database Configuration

In intermediary.js (located under the routes folder), change the database credentials to match your local MySQL setup:
```sh
const connection = mysql.createConnection({
    host: 'localhost', // Database host
    user: 'your_mysql_username', // Database username
    password: 'your_mysql_password', // Database password
    database: 'filter' // Database name
}); 
```
Replace your_mysql_username and your_mysql_password accordingly.

### Step 5: Start the Application

Use the following command to start the server:

`$ npm start `

By default, the application runs on http://127.0.0.1:3000.

### Step 6: Access the Web Interface

Open your browser and visit http://127.0.0.1:3000/index.html to interact with the Migration Agent Finder.

## Project Structure

- app.js: Main entry point for the application, handles all middleware setup and routing.

- routes/index.js: Manages homepage routes.

- routes/intermediary.js: Manages API requests, particularly for searching agents.

- public/: Contains static assets including HTML, CSS, JavaScript files.

- style.css: Holds styles for the web page.

## Usage Tips

1. Configure MySQL Access: Ensure your MySQL username and password are correct, and create the filter database using the intermediary.sql script.

2. Data and Privacy: Before deploying the app in a production environment, ensure your data is secured by changing the database user credentials an-d adding proper data validation.

3. Edit Passwords: Edit the database password in intermediary.js to match your local setup.

## FAQ

1. Why do I need to import intermediary.sql?

 This SQL file contains the migration agents' information required for filtering. You need it to populate the database with the necessary data to run this application.

2. How do I change the database password?

 Open intermediary.js and replace the password under the database configuration object.

## License

MIT License.
