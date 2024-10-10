# Smart-Migration

Migration agents are pivotal in assisting migrants with navigating the Australian immigration process, ensuring adherence to legal requirements and providing essential support. With a growing number of migration agents, each with varying expertise, migrants often struggle to find the most suitable agent, increasing their risk of falling victim to fraud and receiving inadequate services. To address this challenge, this project aims to develop a Machine Learning Enabled Recommendation System designed to match migrants with appropriate migration agents based on their specific needs and preferences.

This project involves generating synthetic data, selecting an appropriate machine learning model, and performing rigorous training, testing, and validation to enhance the accuracy and reliability of the recommendation system.

## Features

- Gender Filter: Filter agents based on their gender (Male/Female).
- Experience Filter: Filter agents based on years of experience, from beginner to expert.
- Consultation Mode: Choose between online or face-to-face consultations.
- Language Search: Type and search for agents who speak specific languages.
- Budget Range: Select a budget range for agent consultation fees.
- Location Filter: Filter agents based on their location across Australian states and territories.
- Practice Area Filter: Filter by the practice area (e.g., Working Visa, Student Visa).
- Google Rating: Filter agents based on their Google ratings.
- Online Reviews: Filter agents based on the number of online reviews they have received.

## Requirements

- Python 3.x
- Flask
- pandas
- scikit-learn
- xgboost
- A modern web browser (Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge)

## Installation and Setup

1. Clone the repository or download the project files.
2. Install the required Python packages:
   ```
   pip install flask pandas scikit-learn xgboost
   ```
3. Run the backend server:
   ```
   python -m backend.app
   ```
4. Open index.html in your web browser to access the frontend.

## Project Structure

- README.txt: This file, containing project information and instructions.
- Smart Project Database(Synthetic Database) .csv: Synthetic data for migration agents.
- Smart Project Database(Omara).csv: Additional data for migration agents.
- Script.js: Frontend JavaScript for handling user interactions and API calls.
- model/**init**.py: Initialization file for the model package.
- backend/app.py: Flask application for serving the API.
- model/preprocess.py: Data preprocessing functions.
- model/predict.py: Functions for making predictions using the trained model.
- model/train.py: Model training script.
- index.html: Frontend HTML file.

## Model Performance

The current implementation uses XGBoost for predictions. Based on the latest run:

- Top 3 most important features:

  1. Year of Experience (importance: 0.394516)
  2. Experience_Rating_Interaction (importance: 0.303158)
  3. Experience_Rating_Interaction (importance: 0.299728)

- Cross-validation scores: [0.99903891, 0.99889623, 0.99878773, 0.99897345, 0.99900837]
- Mean CV score: 0.9989409350152407
- Train R2 score: 0.9998589206187525
- Test R2 score: 0.9991785762579161

Note: These scores are based on synthetic data and may not reflect real-world performance. Validation with actual data is recommended.

## Customization

You can customize the project by modifying these files:

- index.html: Modify page structure or add new elements.
- Script.js: Modify or add new functionality to filters and interaction logic.
- backend/app.py: Adjust API endpoints or add new features to the backend.
- model/train.py: Modify the machine learning model or training process.

## Skills Required

- Machine Learning
- Software Engineering
- Python (e.g., Scikit-learn, TensorFlow, or PyTorch)
- Database and Data Management
- Statistical Analysis

## License

This project is open-source and available for modification and distribution.
