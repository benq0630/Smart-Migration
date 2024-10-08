from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pandas as pd
import numpy as np

def clean_rating(x):
    if pd.isna(x) or x == 'N/A':
        return np.nan
    elif isinstance(x, str):
        try:
            return float(x.split(',')[0])
        except ValueError:
            return np.nan
    else:
        try:
            return float(x)
        except ValueError:
            return np.nan

def preprocess_data(data):
    # 分离数值和分类特征
    numeric_features = ['Year of Experience', 'Google Rating', 'Consultation Charge']
    categorical_features = ['Gender', 'Language', 'Location', 'Consultation Mode', 'Practice Area']

    # 处理 'Google Rating' 列
    data['Google Rating'] = data['Google Rating'].apply(lambda x: x.split(',')[0] if isinstance(x, str) else x)
    data['Google Rating'] = pd.to_numeric(data['Google Rating'], errors='coerce')

    # 创建预处理管道
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # 拟合和转换数据
    X = preprocessor.fit_transform(data)
    
    # 创建特征名称
    feature_names = (numeric_features + 
                     preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(categorical_features).tolist())

    return X, preprocessor

# 其他函数保持不变