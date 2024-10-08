from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from .preprocess import preprocess_data

def train_model(data):
    # 预处理数据
    X, preprocessor = preprocess_data(data)
    y = data['Consultation Charge']

    # 分割数据
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 训练模型
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    return model, preprocessor