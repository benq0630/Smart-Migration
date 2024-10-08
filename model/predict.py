import numpy as np
import xgboost as xgb
from .preprocess import preprocess_data
import logging

def predict_agents(model, encoder, scaler, input_data, all_agents_data):
    try:
        # 预处理输入数据
        X, _, _ = preprocess_data(input_data)
        
        # 创建DMatrix
        dinput = xgb.DMatrix(X)
        
        # 预测所有代理的得分
        predictions = model.predict(dinput)
        
        # 获取前三名代理的索引
        top_indices = np.argsort(predictions)[-3:][::-1]
        
        # 获取前三名代理的详细信息
        top_agents = all_agents_data.iloc[top_indices]
        
        logging.info(f"Top indices: {top_indices}")
        logging.info(f"Top agents: {top_agents['Full_name'].tolist()}")

        return top_agents
    except Exception as e:
        logging.error(f"Error in predict_agents: {str(e)}")
        raise