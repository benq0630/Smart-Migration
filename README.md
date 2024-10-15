# Smart Migration Recommendation System

The Smart Migration Recommendation System is an intelligent tool designed to match migrants with appropriate migration agents based on their specific needs and preferences. This project aims to streamline the process of finding suitable migration agents in Australia, ensuring better service and reducing the risk of fraud.

## Features

- Gender Filter: Select agents based on gender preference.
- Experience Filter: Choose agents based on their years of experience.
- Consultation Mode: Option for online, face-to-face, or hybrid consultations.
- Language Search: Find agents who speak specific languages.
- Budget Range: Filter agents based on consultation fees.
- Location Filter: Select agents from specific Australian states and territories.
- Practice Area Filter: Find agents specializing in particular visa types.
- Google Rating Filter: Choose agents based on their Google ratings.
- Online Reviews Filter: Select agents based on the number of online reviews.

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- Machine Learning: XGBoost, scikit-learn
- Database: CSV files (Smart Project Database)

## Setup and Installation

1. Clone the repository: `git clone https://github.com/benq0630/Smart-Migration.git  `

2. Navigate to the project directory: `cd Smart-Migration  `

3. Install the required Python packages: `pip install -r requirements.txt  `

4. Run the Flask application: `python -m backend.app  `

5. Open a web browser and navigate to `http://localhost:8080` to use the application.

## Project Structure

- `backend/`: Contains the Flask application and API routes.
- `model/`: Includes machine learning model training and prediction scripts.
- `Script.js`: Frontend JavaScript for handling user interactions.
- `index.html`: Main HTML file for the web interface.
- `style.css`: CSS file for styling the web interface.
- `Smart Project Database(Synthetic Database).csv`: Dataset for migration agents.

## Machine Learning Model

The project uses XGBoost for predicting agent ratings and recommendations. The model is trained on synthetic data and evaluated using various metrics including MSE, RMSE, R², F1 Score, Recall, Precision, and Accuracy.

## Contributing

Contributions to improve the Smart Migration Recommendation System are welcome. Please feel free to submit pull requests or open issues for any bugs or feature requests.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgements

Special thanks to the University of Adelaide and Migrova for their support and resources in developing this project.
