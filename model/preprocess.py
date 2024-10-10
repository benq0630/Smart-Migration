import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler

def preprocess_data(df):
    label_encoders = {}
    scaler = StandardScaler()
    
    # 创建一个新的 DataFrame 来存储转换后的数据
    transformed_df = pd.DataFrame()
    
    # 确保特征顺序与训练时一致
    feature_order = [
        'Gender_encoded', 'Language_encoded', 'Location_encoded', 
        'Consultation Mode_encoded', 'Practice Area_encoded',
        'Year of Experience', 'Online Review', 'Consultation Charge',
        'Experience_Rating_Interaction'
    ]
    
    categorical_columns = ['Gender', 'Language', 'Location', 'Consultation Mode', 'Practice Area']
    for col in categorical_columns:
        if col in df.columns:
            label_encoders[col] = LabelEncoder().fit(df[col])
            transformed_df[f'{col}_encoded'] = label_encoders[col].transform(df[col])
    
    # 处理数值列
    numeric_columns = ['Year of Experience', 'Online Review', 'Consultation Charge']
    for col in numeric_columns:
        if col in df.columns:
            transformed_df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # 添加交互特征
    if 'Year of Experience' in transformed_df.columns and 'Google Rating' in df.columns:
        transformed_df['Experience_Rating_Interaction'] = transformed_df['Year of Experience'] * pd.to_numeric(df['Google Rating'], errors='coerce')
    else:
        transformed_df['Experience_Rating_Interaction'] = 0
    
    # 确保所有需要的特征都存在，并按照正确的顺序排列
    for feature in feature_order:
        if feature not in transformed_df.columns:
            transformed_df[feature] = 0  # 或者其他适当的默认值
    
    transformed_df = transformed_df[feature_order]
    
    # 应用 StandardScaler
    scaled_data = scaler.fit_transform(transformed_df)
    
    return scaled_data, label_encoders, scaler