import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, f1_score, recall_score, precision_score, accuracy_score
import xgboost as xgb
from .preprocess import preprocess_data
import logging

def train_model(df):
    X, label_encoders, scaler = preprocess_data(df)
    y = df['Google Rating'].values
    
    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
    
    logging.info("Dataset split proportions:")
    logging.info(f"Training set: 90% ({X_train.shape[0]} samples)")
    logging.info(f"Test set: 10% ({X_test.shape[0]} samples)")
    logging.info("-" * 50)
    
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42)
    
    # 执行5折交叉验证
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='neg_mean_squared_error')
    cv_rmse_scores = np.sqrt(-cv_scores)
    
    logging.info("Cross-validation results:")
    logging.info(f"RMSE scores: {cv_rmse_scores}")
    logging.info(f"Mean RMSE: {cv_rmse_scores.mean():.4f}")
    logging.info(f"Standard deviation of RMSE: {cv_rmse_scores.std():.4f}")
    logging.info("-" * 50)
    
    # 在全部训练数据上训练模型
    model.fit(X_train, y_train)
    
    # Evaluate the model on the test set
    y_pred = model.predict(X_test)
    
    # Calculate evaluation metrics
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    # Round predictions and actual values to calculate classification metrics
    y_pred_rounded = np.round(y_pred)
    y_test_rounded = np.round(y_test)
    
    f1 = f1_score(y_test_rounded, y_pred_rounded, average='weighted')
    recall = recall_score(y_test_rounded, y_pred_rounded, average='weighted')
    precision = precision_score(y_test_rounded, y_pred_rounded, average='weighted')
    accuracy = accuracy_score(y_test_rounded, y_pred_rounded)
    
    logging.info("Model performance on test set:")
    logging.info(f"Mean Squared Error (MSE): {mse:.4f}")
    logging.info(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
    logging.info(f"Coefficient of Determination (R^2): {r2:.4f}")
    logging.info(f"F1 Score: {f1:.4f}")
    logging.info(f"Recall: {recall:.4f}")
    logging.info(f"Precision: {precision:.4f}")
    logging.info(f"Accuracy: {accuracy:.4f}")
    logging.info("-" * 50)
    
    return model, label_encoders, scaler
