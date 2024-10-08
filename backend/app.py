from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
import traceback
import time

app = Flask(__name__)
CORS(app)

print("开始加载数据...")
start_time = time.time()

# 读取CSV文件
df_synthetic = pd.read_csv('Smart Project Database(Synthetic Database) .csv')
df_omara = pd.read_csv('Smart Project Database(Omara).csv')

print(f"数据加载完成，耗时 {time.time() - start_time:.2f} 秒")

# 准备数据和训练模型
def prepare_data(df):
    print("开始准备数据...")
    start_time = time.time()

    le_dict = {}
    categorical_columns = ['Gender', 'Language', 'Location', 'Consultation Mode', 'Practice Area']
    for col in categorical_columns:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col])
        le_dict[col] = le
    
    # 将 'Year of Experience', 'Google Rating', 'Online Review' 转换为数值型
    df['Year of Experience'] = pd.to_numeric(df['Year of Experience'], errors='coerce')
    df['Google Rating'] = pd.to_numeric(df['Google Rating'], errors='coerce')
    df['Online Review'] = pd.to_numeric(df['Online Review'], errors='coerce')
    
    # 添加新特征
    df['Experience_Rating_Interaction'] = df['Year of Experience'] * df['Google Rating']
    
    feature_columns = [col + '_encoded' if col in categorical_columns else col for col in df.columns if col != 'Full_name' and col != 'Google Rating']
    feature_columns.append('Experience_Rating_Interaction')
    
    X = df[feature_columns]
    y = df['Google Rating']
    
    # 标准化数值特征
    scaler = StandardScaler()
    X = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)
    
    print(f"数据准备完成，耗时 {time.time() - start_time:.2f} 秒")
    return X, y, le_dict, feature_columns, scaler

def train_model(X, y):
    print("开始训练模型...")
    start_time = time.time()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 定义随机搜索的参数范围
    param_distributions = {
        'n_estimators': [50, 100, 200],
        'max_depth': [3, 5, 7, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    model = RandomForestRegressor(random_state=42)
    
    # 使用随机搜索找到最佳参数
    random_search = RandomizedSearchCV(model, param_distributions, n_iter=20, cv=5, scoring='r2', random_state=42, n_jobs=-1)
    random_search.fit(X_train, y_train)
    
    best_model = random_search.best_estimator_
    
    # 添加特征重要性分析
    feature_importance = pd.DataFrame({'feature': X.columns, 'importance': best_model.feature_importances_})
    feature_importance = feature_importance.sort_values('importance', ascending=False)
    print("Top 10 most important features:")
    print(feature_importance.head(10))
    
    # 使用交叉验证
    cv_scores = cross_val_score(best_model, X, y, cv=5, scoring='r2')
    print(f"交叉验证分数: {cv_scores}")
    print(f"平均交叉验证分数: {np.mean(cv_scores)}")
    
    best_model.fit(X_train, y_train)
    
    train_score = r2_score(y_train, best_model.predict(X_train))
    test_score = r2_score(y_test, best_model.predict(X_test))
    
    print(f"训练集 R2 分数: {train_score}")
    print(f"测试集 R2 分数: {test_score}")
    
    print(f"模型训练完成，耗时 {time.time() - start_time:.2f} 秒")
    return best_model

print("开始准备数据和训练模型...")
start_time = time.time()

# 准备数据和训练模型
X, y, label_encoders, feature_columns, scaler = prepare_data(df_synthetic)
model = train_model(X, y)

print(f"数据准备和模型训练完成，总耗时 {time.time() - start_time:.2f} 秒")

@app.route('/')
def index():
    return send_from_directory('../', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('../', path)

@app.route('/api/languages', methods=['GET'])
def get_languages():
    try:
        languages = df_synthetic['Language'].unique().tolist()
        print(f"Available languages: {languages}")
        return jsonify(languages)
    except Exception as e:
        print(f"Error in get_languages: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/filter_agents', methods=['POST'])
def filter_agents():
    try:
        data = request.json
        print("Received data:", data)
        
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
            filtered_agents = filtered_agents[filtered_agents['Language'].str.lower() == data['language'].lower()]
        
        if data.get('googleRating'):
            rating_range = data['googleRating'].split('-')
            min_rating = float(rating_range[0])
            max_rating = float(rating_range[1])
            filtered_agents = filtered_agents[filtered_agents['Google Rating'].between(min_rating, max_rating)]
        
        # 对筛选后的代理进行评分预测
        X_filtered = prepare_data_for_prediction(filtered_agents)
        if X_filtered.shape[0] > 0:
            filtered_agents['Predicted_Rating'] = model.predict(X_filtered)
        else:
            filtered_agents['Predicted_Rating'] = 0
        
        # 获取完全符合条件的代理
        exact_matches = filtered_agents.sort_values('Predicted_Rating', ascending=False).head(3)
        
        # 获取推荐代理（包括部分匹配和不匹配的）
        remaining_agents = all_agents[~all_agents['Full_name'].isin(exact_matches['Full_name'])]
        X_remaining = prepare_data_for_prediction(remaining_agents)
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
                
                results.append({
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
                    'is_exact_match': is_exact_match
                })
            return results

        exact_match_results = prepare_results(exact_matches, True)
        recommended_results = prepare_results(recommended_agents, False)

        all_results = exact_match_results + recommended_results

        print(f"Found {len(all_results)} agents in total")
        return jsonify(all_results)
    except Exception as e:
        print(f"Error filtering agents: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

def prepare_data_for_prediction(df):
    # 这个函数应该与训练模型时使用的数据预处理步骤相同
    # 例如：
    categorical_columns = ['Gender', 'Language', 'Location', 'Consultation Mode', 'Practice Area']
    for col in categorical_columns:
        df[col + '_encoded'] = label_encoders[col].transform(df[col])
    
    df['Experience_Rating_Interaction'] = df['Year of Experience'] * df['Google Rating']
    
    feature_columns = [col + '_encoded' if col in categorical_columns else col for col in df.columns if col != 'Full_name' and col != 'Google Rating']
    feature_columns.append('Experience_Rating_Interaction')
    
    X = df[feature_columns]
    X_scaled = scaler.transform(X)
    
    return X_scaled

if __name__ == '__main__':
    print("启动Flask应用...")
    app.run(debug=True, port=8080)