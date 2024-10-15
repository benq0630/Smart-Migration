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

def load_model():
    global df_synthetic, model, label_encoders, scaler
    logging.info("Loading data and training model...")
    df_synthetic = pd.read_csv('Smart Project Database(Synthetic Database).csv')
    
    logging.info("Data loaded. Preparing data for model training...")
    X, label_encoders, scaler = preprocess_data(df_synthetic)
    y = df_synthetic['Google Rating'].values
    
    logging.info("Data prepared. Training model...")
    model, label_encoders, scaler = train_model(df_synthetic)
    
    logging.info("Model training completed.")

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
        
        filtered_agents = df_synthetic.copy()
        
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
            filtered_agents = filtered_agents[filtered_agents['Practice Area'].str.lower().str.contains(data['practiceArea'].lower())]
        
        if data.get('language'):
            filtered_agents = filtered_agents[filtered_agents['Language'].str.lower().str.contains(data['language'].lower())]
        
        def prepare_results(agents_df, is_recommended):
            results = []
            for _, row in agents_df.iterrows():
                agent_info = {
                    'name': row['Full_name'],
                    'gender': row['Gender'],
                    'marn': str(row['MARN']),
                    'contact': row['Website'] if pd.notna(row['Website']) else '',
                    'experience': f"{row['Year of Experience']} years",
                    'rating': float(row['Google Rating']),
                    'location': row['Location'],
                    'consultationMode': row['Consultation Mode'],
                    'practiceArea': row['Practice Area'],
                    'language': row['Language'],
                    'onlineReview': int(row['Online Review']),
                    'budget': f"${row['Consultation Charge']}",
                    'is_recommended': is_recommended,
                    'mismatched_fields': []
                }
                
                # 检查不匹配的字段
                if data.get('googleRating'):
                    rating_range = data['googleRating'].split('-')
                    min_rating, max_rating = float(rating_range[0]), float(rating_range[1])
                    if not (min_rating <= agent_info['rating'] <= max_rating):
                        agent_info['mismatched_fields'].append('rating')
                
                if data.get('onlineReviews'):
                    reviews_range = data['onlineReviews'].split('-')
                    min_reviews, max_reviews = int(reviews_range[0]), int(reviews_range[1])
                    if not (min_reviews <= agent_info['onlineReview'] <= max_reviews):
                        agent_info['mismatched_fields'].append('onlineReview')
                
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
                    if not (min_cost <= row['Consultation Charge'] <= max_cost):
                        agent_info['mismatched_fields'].append('budget')
                
                results.append(agent_info)
            
            return results

        all_results = prepare_results(filtered_agents, True)
        
        # 按照匹配程度排序
        all_results.sort(key=lambda x: len(x['mismatched_fields']))
        
        recommended_results = all_results[:3]
        other_results = all_results[3:6]
        
        # 如果结果不足6个，从原始数据中随机选择补充
        if len(all_results) < 6:
            remaining_agents = df_synthetic[~df_synthetic['Full_name'].isin([r['name'] for r in all_results])]
            additional_results = prepare_results(remaining_agents.sample(n=min(6-len(all_results), len(remaining_agents))), False)
            if len(recommended_results) < 3:
                recommended_results.extend(additional_results[:3-len(recommended_results)])
                other_results.extend(additional_results[3-len(recommended_results):])
            else:
                other_results.extend(additional_results)

        # 确保每个类别都有3个结果
        recommended_results = recommended_results[:3]
        other_results = other_results[:3]

        final_results = {
            'recommended_agents': recommended_results,
            'other_agents': other_results
        }

        logging.info(f"Found {len(recommended_results)} recommended agents and {len(other_results)} other options")
        return jsonify(final_results)
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

@app.route('/api/log_agent_info', methods=['POST'])
def log_agent_info():
    data = request.json
    logging.info(f"Agent Info: {data}")
    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
