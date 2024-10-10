import xgboost as xgb
from sklearn.model_selection import train_test_split
from .preprocess import preprocess_data

def train_model(df):
    X, label_encoders, scaler = preprocess_data(df)
    y = df['Google Rating'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"Train R2 score: {train_score}")
    print(f"Test R2 score: {test_score}")
    
    return model, label_encoders, scaler