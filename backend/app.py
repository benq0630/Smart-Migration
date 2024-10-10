from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import traceback
from model.train import train_model
from model.preprocess import preprocess_data
import os
import logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

# 全局变量
model = None
label_encoders = None
scaler = None
df_synthetic = None
df_omara = None

def load_model():
    global df_synthetic, df_omara, model, label_encoders, scaler
    logging.info("Loading data and training model...")
    df_synthetic = pd.read_csv('Smart Project Database(Synthetic Database) .csv')
    df_omara = pd.read_csv('Smart Project Database(Omara).csv')
    
    logging.info("Data loaded. Preparing data for model training...")
    X, label_encoders, scaler = preprocess_data(df_synthetic)
    y = df_synthetic['Google Rating'].values
    
    logging.info("Data prepared. Training model...")
    model_tuple = train_model(df_synthetic)  # 假设 train_model 返回一个元组
    model = model_tuple[0]  # 假设模型是元组的第一个元素
    
    # 计算训练集和测试集分数
    train_score = model.score(X, y)
    
    # 为了获取测试集分数，我们需要分割数据
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    test_score = model.score(X_test, y_test)
    
    logging.info(f"Model trained. Train R2 score: {train_score:.4f}, Test R2 score: {test_score:.4f}")
    logging.info("Model ready for predictions.")

# 在应用启动时加载模型
load_model()

@app.route('/')
def index():
    return send_from_directory(os.path.join(app.root_path, '..'), 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory(os.path.join(app.root_path, '..'), path)

@app.route('/api/filter_agents', methods=['POST'])
def filter_agents():
    try:
        data = request.json
        logging.info(f"Received filter request: {data}")
        
        all_agents = df_synthetic.copy()
        filtered_agents = all_agents.copy()
        
        # 应用筛选条件
        if data.get('gender'):
            filtered_agents = filtered_agents[filtered_agents['Gender'].str.lower() == data['gender'].lower()]
        
        if data.get('experience'):
            experience_mapping = {
                'beginner': (0, 5),
                'intermediate': (6, 10),
                'experienced': (11, 15),
                'advanced': (16, 20),
                'expert': (21, float('inf'))
            }
            min_exp, max_exp = experience_mapping.get(data['experience'].lower(), (0, float('inf')))
            filtered_agents = filtered_agents[filtered_agents['Year of Experience'].between(min_exp, max_exp)]
        
        if data.get('consultationMode'):
            filtered_agents = filtered_agents[filtered_agents['Consultation Mode'].str.lower() == data['consultationMode'].lower()]
        
        if data.get('location'):
            filtered_agents = filtered_agents[filtered_agents['Location'].str.lower().str.contains(data['location'].lower())]
        
        if data.get('practiceArea'):
            filtered_agents = filtered_agents[filtered_agents['Practice Area'].str.lower() == data['practiceArea'].lower()]
        
        if data.get('language'):
            filtered_agents = filtered_agents[filtered_agents['Language'].str.lower().str.contains(data['language'].lower())]
        
        if data.get('googleRating'):
            rating_range = data['googleRating'].split('-')
            min_rating = float(rating_range[0])
            max_rating = float(rating_range[1])
            filtered_agents = filtered_agents[filtered_agents['Google Rating'].between(min_rating, max_rating)]
        
        if data.get('onlineReviews'):
            reviews_range = data['onlineReviews'].split('-')
            min_reviews = int(reviews_range[0])
            max_reviews = int(reviews_range[1])
            filtered_agents = filtered_agents[filtered_agents['Online Review'].between(min_reviews, max_reviews)]
        
        if data.get('cost'):
            cost_range = data['cost'].lower().replace('$', '').split('-')
            if 'standard' in cost_range[0]:
                min_cost, max_cost = 0, 250
            elif 'premium' in cost_range[0]:
                min_cost, max_cost = 251, 500
            elif 'vip' in cost_range[0]:
                min_cost, max_cost = 501, float('inf')
            else:
                min_cost = int(cost_range[0])
                max_cost = int(cost_range[1]) if len(cost_range) > 1 else float('inf')
            filtered_agents = filtered_agents[filtered_agents['Consultation Charge'].between(min_cost, max_cost)]
        
        logging.info(f"After filtering, {len(filtered_agents)} agents remain.")
        
        # 如果筛选后没有结果，返回空列表
        if filtered_agents.empty:
            logging.info("No exact matches found.")
            return jsonify([])
        
        # 对筛选后的代理进行评分预测
        X_filtered, _, _ = preprocess_data(filtered_agents)
        if X_filtered.shape[0] > 0 and model is not None:
            filtered_agents['Predicted_Rating'] = model.predict(X_filtered)
        else:
            filtered_agents['Predicted_Rating'] = 0
        
        # 获取完全符合条件的代理
        exact_matches = filtered_agents.sort_values('Predicted_Rating', ascending=False).head(3)
        
        # 获取推荐代理（包括部分匹配和不匹配的）
        remaining_agents = all_agents[~all_agents['Full_name'].isin(exact_matches['Full_name'])]
        X_remaining, _, _ = preprocess_data(remaining_agents)
        if X_remaining.shape[0] > 0:
            remaining_agents['Predicted_Rating'] = model.predict(X_remaining)
        else:
            remaining_agents['Predicted_Rating'] = 0
        recommended_agents = remaining_agents.sort_values('Predicted_Rating', ascending=False).head(3)
        
        def prepare_results(agents_df, is_exact_match):
            results = []
            for _, row in agents_df.iterrows():
                full_name = row['Full_name']
                omara_row = df_omara[df_omara['Full_name'] == full_name].iloc[0] if not df_omara[df_omara['Full_name'] == full_name].empty else None
                
                linkedin_url = omara_row['Linkedin URL'] if omara_row is not None and pd.notna(omara_row['Linkedin URL']) else None
                website = omara_row['Website'] if omara_row is not None and pd.notna(omara_row['Website']) else None
                email = omara_row['Email'] if omara_row is not None and pd.notna(omara_row['Email']) else None

                if linkedin_url and full_name.lower() not in linkedin_url.lower():
                    contact_info = website if website else (email if email else 'N/A')
                else:
                    contact_info = linkedin_url if linkedin_url else (website if website else (email if email else 'N/A'))
                
                agent_info = {
                    'name': full_name,
                    'gender': row['Gender'],
                    'marn': omara_row['MARN'] if omara_row is not None else 'N/A',
                    'contact': contact_info,
                    'experience': f"{row['Year of Experience']} years",
                    'rating': float(row['Google Rating']),
                    'predicted_rating': float(row['Predicted_Rating']),
                    'location': row['Location'],
                    'consultationMode': row['Consultation Mode'],
                    'practiceArea': row['Practice Area'],
                    'language': row['Language'],
                    'onlineReview': int(row['Online Review']),
                    'budget': f"${row['Consultation Charge']}",
                    'is_exact_match': is_exact_match
                }
                
                results.append(agent_info)
                
                # 在服务器端输出详细信息
                logging.info(f"""
                    Full Name: {full_name}
                    Gender: {row['Gender']}
                    MARN: {agent_info['marn']}
                    Contact: {contact_info}
                    Experience: {agent_info['experience']}
                    Rating: {agent_info['rating']} stars
                    Location: {row['Location']}
                    Consultation Mode: {row['Consultation Mode']}
                    Practice Area: {row['Practice Area']}
                    Language: {row['Language']}
                    Online Review: {agent_info['onlineReview']}
                    Budget: {agent_info['budget']}
                """)
            
            return results

        exact_match_results = prepare_results(exact_matches, True)
        recommended_results = prepare_results(recommended_agents, False)

        all_results = exact_match_results + recommended_results

        logging.info(f"Found {len(exact_match_results)} exact matches and {len(recommended_results)} recommended agents")
        return jsonify(all_results)
    except Exception as e:
        logging.error(f"Error filtering agents: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/languages', methods=['GET'])
def get_languages():
    try:
        languages = df_synthetic['Language'].unique().tolist()
        return jsonify(languages)
    except Exception as e:
        logging.error(f"Error fetching languages: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)