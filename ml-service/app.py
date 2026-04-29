from fastapi import FastAPI
import joblib
import numpy as np


#  Initialize FastAPI app

app = FastAPI()
#  Load trained ML model
model = joblib.load("queue_time_model.pkl")


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


    #  Extract features
  
    features = [[
        data["totalPrepWeight"],
        data["totalQuantity"],
        data["queueLength"],
        data["timeOfDay"],
        data["dayOfWeek"]
    ]]


    #  Convert to numpy array

    features = np.array(features)

   
    #  Predict using model

    prediction = model.predict(features)

  
    #  Return result
   
    return {
        "predicted_time": float(prediction[0])
    }