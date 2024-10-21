import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, recall_score, precision_score, accuracy_score
from sklearn.neighbors import KNeighborsRegressor
from .preprocess import preprocess_data
import logging

def train_model(df):
    X, label_encoders, scaler = preprocess_data(df)
    y = df['Google Rating'].values
    
    for train_ratio in [0.9, 0.8, 0.7]:
        test_ratio = 1 - train_ratio
        logging.info("-" * 50)
        logging.info(f"Using training set ratio: {train_ratio*100:.0f}% training, {test_ratio*100:.0f}% testing")
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=train_ratio, random_state=42)
        
        # KNN
        knn_model = KNeighborsRegressor(n_neighbors=5)  # 你可以调整邻居数量
        knn_model.fit(X_train, y_train)
        
        y_pred = knn_model.predict(X_test)
        
        # 将预测值和实际值四舍五入到最接近的整数
        y_pred_rounded = np.round(y_pred)
        y_test_rounded = np.round(y_test)
        
        recall = recall_score(y_test_rounded, y_pred_rounded, average='weighted', zero_division=1)
        precision = precision_score(y_test_rounded, y_pred_rounded, average='weighted', zero_division=1)
        f1 = f1_score(y_test_rounded, y_pred_rounded, average='weighted', zero_division=1)
        accuracy = accuracy_score(y_test_rounded, y_pred_rounded)
        
        logging.info(f"Recall: {recall:.4f}")
        logging.info(f"Precision: {precision:.4f}")
        logging.info(f"F1 Score: {f1:.4f}")
        logging.info(f"Accuracy: {accuracy:.4f}")
        logging.info("-" * 50)
    
    # 使用全部数据训练最终模型
    final_model = KNeighborsRegressor(n_neighbors=5)
    final_model.fit(X, y)
    
    return final_model, label_encoders, scaler
