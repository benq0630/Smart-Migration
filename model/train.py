import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, recall_score, precision_score, accuracy_score
from .preprocess import preprocess_data
import logging
import numpy as np

def train_model(df):
    X, label_encoders, scaler = preprocess_data(df)
    y = df['Google Rating'].values
    
    # Split the dataset
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_test, X_accuracy, y_test, y_accuracy = train_test_split(X_temp, y_temp, test_size=0.33, random_state=42)
    
    logging.info("Dataset split proportions:")
    logging.info(f"Training set: 70% ({X_train.shape[0]} samples)")
    logging.info(f"Test set: 20% ({X_test.shape[0]} samples)")
    logging.info(f"Accuracy evaluation set: 10% ({X_accuracy.shape[0]} samples)")
    
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate the model on the test set
    y_pred = model.predict(X_test)
    
    # Calculate evaluation metrics
    mse = ((y_test - y_pred) ** 2).mean()
    rmse = mse ** 0.5
    r2 = model.score(X_test, y_test)
    
    # Round predictions and actual values to calculate classification metrics
    y_pred_rounded = np.round(y_pred)
    y_test_rounded = np.round(y_test)
    
    f1 = f1_score(y_test_rounded, y_pred_rounded, average='weighted')
    recall = recall_score(y_test_rounded, y_pred_rounded, average='weighted')
    precision = precision_score(y_test_rounded, y_pred_rounded, average='weighted')
    accuracy = accuracy_score(y_test_rounded, y_pred_rounded)
    
    logging.info(f"Mean Squared Error (MSE): {mse:.4f}")
    logging.info(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    logging.info(f"Coefficient of Determination (R^2): {r2:.4f}")
    logging.info(f"F1 Score: {f1:.4f}")
    logging.info(f"Recall: {recall:.4f}")
    logging.info(f"Precision: {precision:.4f}")
    logging.info(f"Accuracy: {accuracy:.4f}")
    
    # Evaluate the model on the accuracy evaluation set
    y_pred_accuracy = model.predict(X_accuracy)
    y_pred_accuracy_rounded = np.round(y_pred_accuracy)
    y_accuracy_rounded = np.round(y_accuracy)
    accuracy_on_accuracy_set = accuracy_score(y_accuracy_rounded, y_pred_accuracy_rounded)
    
    logging.info(f"Accuracy on the accuracy evaluation set: {accuracy_on_accuracy_set:.4f}")
    
    return model, label_encoders, scaler
