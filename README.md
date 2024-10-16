# Smart Migration Recommendation System

This system helps match migrants with suitable migration agents in Australia based on specific needs and preferences.

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.9 or higher (https://www.python.org/downloads/)
- Git (https://git-scm.com/downloads)

## Setup and Installation

1. Open your computer's terminal or command prompt.

2. Clone the repository: `git clone https://github.com/benq0630/Smart-Migration.git  `

3. Navigate to the project directory: `cd Smart-Migration  `

4. Create a virtual environment (optional but recommended):

   - On Windows: `python -m venv venv
venv\Scripts\activate    `
   - On macOS and Linux: `python3 -m venv venv
source venv/bin/activate    `

5. Install the required Python packages: `pip install -r requirements.txt  `

## Running the Application

1. Start the Flask application: `python -m backend.app  `

2. Open a web browser and go to: http://localhost:8080

3. Use the form on the webpage to input your preferences and find matching migration agents.

## Features

- Filter agents by gender, experience, consultation mode, language, budget, location, practice area, Google rating, and online reviews.
- View recommended agents and other options based on your preferences.
- See detailed information about each agent, including contact details.

## Troubleshooting

- If you encounter any "Module not found" errors, ensure you've activated the virtual environment and installed all requirements.
- For any other issues, please check the terminal for error messages.

## Acknowledgements

Special thanks to the University of Adelaide and Migrova for their support in developing this project.
