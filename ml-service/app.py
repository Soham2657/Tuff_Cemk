from fastapi import FastAPI
import joblib
import numpy as np
import os
from sklearn.linear_model import LinearRegression


#  Initialize FastAPI app

app = FastAPI()

#  Load trained ML model with error handling
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "queue_time_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(f"⚠️ Model file not found at {MODEL_PATH}")
    print("Creating a fallback dummy model for testing...")
    # Create a simple linear regression model as fallback
    model = LinearRegression()
    # Fit with dummy data to prevent errors during prediction
    dummy_data = np.array([
        [100, 10, 5, 12, 3],
        [150, 15, 8, 14, 2],
        [200, 20, 10, 18, 4],
        [120, 12, 6, 13, 1]
    ])
    dummy_labels = np.array([15, 20, 25, 18])
    model.fit(dummy_data, dummy_labels)


#  Health check endpoint
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "ML Service is running",
        "model_loaded": os.path.exists(MODEL_PATH)
    }


#  Prediction API

@app.post("/predict")
def predict(data: dict):
    """
    Expected JSON input:
    {
      "totalPrepWeight": number,
      "totalQuantity": number,
      "queueLength": number,
      "timeOfDay": number,
      "dayOfWeek": number
    }
    """
    try:
        #  Extract features
        features = [[
            float(data.get("totalPrepWeight", 0)),
            float(data.get("totalQuantity", 0)),
            float(data.get("queueLength", 0)),
            float(data.get("timeOfDay", 12)),
            float(data.get("dayOfWeek", 3))
        ]]

        #  Convert to numpy array
        features = np.array(features)

        #  Predict using model
        prediction = model.predict(features)

        #  Return result
        return {
            "predicted_time": float(prediction[0]),
            "status": "success"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
            "predicted_time": None
        }