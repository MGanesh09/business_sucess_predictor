import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
import joblib
import os

def train_models():
    print("Generating synthetic business success dataset...")
    np.random.seed(42)
    n_samples = 250
    
    # Generate random features
    budget = np.random.uniform(10000, 500000, n_samples)
    shop_area = np.random.uniform(100, 5000, n_samples)
    rent = np.random.uniform(500, 15000, n_samples)
    employees = np.round(np.random.uniform(1, 20, n_samples))
    price = np.random.uniform(2, 500, n_samples)
    customers = np.random.uniform(10, 1000, n_samples)
    lat = np.random.uniform(37.7, 37.8, n_samples)
    lng = np.random.uniform(-122.5, -122.4, n_samples)
    
    # Calculate synthetic target (Success Score from 0 to 100)
    # Success goes up with high customers, reasonable rent to budget ratio, high area per employee
    rent_to_budget = (rent * 12) / budget
    c_factor = customers / 100.0
    
    # success score formula
    success_score = 45 + (c_factor * 12) - (rent_to_budget * 25) + (shop_area / employees / 100.0)
    success_score = success_score + np.random.normal(0, 5, n_samples) # add noise
    success_score = np.clip(success_score, 15, 98) # clip between 15% and 98%
    
    # Create DataFrame
    df = pd.DataFrame({
        'budget': budget,
        'shopArea': shop_area,
        'rent': rent,
        'employeesCount': employees,
        'expectedProductPrice': price,
        'expectedDailyCustomers': customers,
        'lat': lat,
        'lng': lng,
        'successScore': success_score
    })
    
    X = df[['budget', 'shopArea', 'rent', 'employeesCount', 'expectedProductPrice', 'expectedDailyCustomers', 'lat', 'lng']]
    y = df['successScore']
    
    print("Training Scikit-Learn RandomForestRegressor...")
    model_rf = RandomForestRegressor(n_estimators=100, random_state=42)
    model_rf.fit(X, y)
    
    print("Training XGBoost Regressor...")
    model_xgb = xgb.XGBRegressor(n_estimators=50, max_depth=4, learning_rate=0.1, random_state=42)
    model_xgb.fit(X, y)
    
    # Save models
    os.makedirs('models', exist_ok=True)
    joblib.dump(model_rf, 'models/success_model_rf.joblib')
    joblib.dump(model_xgb, 'models/success_model_xgb.joblib')
    print("Models saved successfully in 'models/' directory.")

if __name__ == '__main__':
    train_models()
