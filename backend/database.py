import pandas as pd
import os
import logging
from model.train import train_model

logging.basicConfig(level=logging.INFO)

def load_data():
    csv_path = 'Smart Project Database(Omara).csv'
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    # 尝试不同的编码
    encodings = ['utf-8', 'iso-8859-1', 'cp1252']
    for encoding in encodings:
        try:
            data = pd.read_csv(csv_path, encoding=encoding)
            logging.info(f"Successfully loaded data with encoding: {encoding}")
            logging.info(f"Loaded data shape: {data.shape}")
            logging.info(f"Loaded data columns: {data.columns.tolist()}")
            return data
        except UnicodeDecodeError:
            continue
    
    raise ValueError(f"Unable to read the CSV file with any of the attempted encodings: {encodings}")

def get_trained_model():
    data = get_data()
    model, preprocessor = train_model(data)
    return model, preprocessor, data

def get_data():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    omara_csv_path = os.path.join(project_root, 'Smart Project Database(Omara).csv')
    synthetic_csv_path = os.path.join(project_root, 'Smart Project Database(Synthetic Database) .csv')
    
    try:
        omara_data = pd.read_csv(omara_csv_path, encoding='utf-8')
        synthetic_data = pd.read_csv(synthetic_csv_path, encoding='utf-8')
    except UnicodeDecodeError:
        omara_data = pd.read_csv(omara_csv_path, encoding='ISO-8859-1')
        synthetic_data = pd.read_csv(synthetic_csv_path, encoding='ISO-8859-1')
    
    merged_data = pd.merge(synthetic_data, omara_data, on='Full_name', suffixes=('', '_omara'))
    
    return merged_data

def filter_agents(data, filters):
    filtered_data = data.copy()
    
    if filters.get('gender'):
        filtered_data = filtered_data[filtered_data['Gender'].str.lower() == filters['gender'].lower()]
    
    if filters.get('experience'):
        experience_map = {
            'beginner': (0, 5),
            'intermediate': (6, 10),
            'expert': (11, float('inf'))
        }
        exp_range = experience_map.get(filters['experience'].lower(), (0, float('inf')))
        filtered_data = filtered_data[(filtered_data['Year of Experience'] >= exp_range[0]) & 
                                      (filtered_data['Year of Experience'] <= exp_range[1])]
    
    if filters.get('language'):
        filtered_data = filtered_data[filtered_data['Language'].str.contains(filters['language'], case=False, na=False)]
    
    if filters.get('consultation-charge'):
        charge_map = {
            'standard': (0, 250),
            'premium': (251, 500),
            'vip': (501, float('inf'))
        }
        charge_range = charge_map.get(filters['consultation-charge'].lower(), (0, float('inf')))
        filtered_data = filtered_data[(filtered_data['Consultation Charge'] >= charge_range[0]) & 
                                      (filtered_data['Consultation Charge'] <= charge_range[1])]
    
    if filters.get('location'):
        filtered_data = filtered_data[filtered_data['Location'].str.lower() == filters['location'].lower()]
    
    if filters.get('consultation-mode'):
        filtered_data = filtered_data[filtered_data['Consultation Mode'].str.lower() == filters['consultation-mode'].lower()]
    
    if filters.get('practice-area'):
        filtered_data = filtered_data[filtered_data['Practice Area'].str.contains(filters['practice-area'], case=False, na=False)]
    
    if filters.get('google-rating'):
        filtered_data = filtered_data[filtered_data['Google Rating'] >= float(filters['google-rating'])]
    
    if filters.get('online-review'):
        review_map = {
            '0-100': (0, 100),
            '101-500': (101, 500),
            '501+': (501, float('inf'))
        }
        review_range = review_map.get(filters['online-review'], (0, float('inf')))
        filtered_data = filtered_data[(filtered_data['Online Review'] >= review_range[0]) & 
                                      (filtered_data['Online Review'] <= review_range[1])]
    
    return filtered_data.head(3)

def get_contact_detail(agent):
    if pd.notna(agent['Linkedin URL']):
        return agent['Linkedin URL']
    elif pd.notna(agent['Website']):
        return agent['Website']
    elif pd.notna(agent['Email']):
        return agent['Email']
    else:
        return "No contact information available"

def get_filtered_agents(filters):
    data = get_data()
    filtered_agents = filter_agents(data, filters)
    
    results = []
    for _, agent in filtered_agents.iterrows():
        results.append({
            'full_name': agent['Full_name'],
            'gender': agent['Gender'],
            'MARN': agent['MARN'],
            'contact_detail': get_contact_detail(agent)
        })
    
    return results

def get_lawyers(filters):
    # 读取 CSV 文件
    df = pd.read_csv('Smart Project Database(Synthetic Database) .csv')
    
    # 应用过滤器
    if filters.get('gender'):
        df = df[df['Gender'] == filters['gender']]
    if filters.get('experience'):
        df = df[df['Experience'] == filters['experience']]
    if filters.get('language'):
        df = df[df['Language'].str.contains(filters['language'], case=False, na=False)]
    if filters.get('location'):
        df = df[df['Location'].str.contains(filters['location'], case=False, na=False)]
    if filters.get('consultation_charge'):
        df = df[df['Consultation Charge'] <= float(filters['consultation_charge'])]
    if filters.get('consultation_mode'):
        df = df[df['Consultation Mode'] == filters['consultation_mode']]
    if filters.get('practice_area'):
        df = df[df['Practice Area'].str.contains(filters['practice_area'], case=False, na=False)]
    if filters.get('google_rating'):
        df = df[df['Google Rating'] >= float(filters['google_rating'])]
    if filters.get('online_review'):
        df = df[df['Online Review'].str.contains(filters['online_review'], case=False, na=False)]
    
    # 将结果转换为字典列表
    results = df.to_dict('records')
    return results

def get_languages():
    # 读取 CSV 文件
    df = pd.read_csv('Smart Project Database(Synthetic Database) .csv')
    
    # 获取所有唯一的语言
    languages = df['Language'].dropna().unique().tolist()
    
    return languages