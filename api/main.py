from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI()

# 1. Define the Data Contract (Must match your TypeScript 'MaterialLayer')
class MaterialLayer(BaseModel):
    id: str
    name: str
    thickness: float
    roughness: float
    density: float

class SimulationRequest(BaseModel):
    layers: List[MaterialLayer]
    q_min: float = 0.0
    q_max: float = 0.5
    points: int = 100

# 2. Define the Endpoint
@app.post("/simulate")
async def simulate_xrr(request: SimulationRequest):
    print(f"Received simulation request for {len(request.layers)} layers")
    
    # Generate Q vector
    q = np.linspace(request.q_min, request.q_max, request.points)
    
    # --- PHYSICAL SIMULATION PLACEHOLDER ---
    # In the future, your real Parratt recursion goes here.
    # For now, return a decaying exponential to look like XRR data
    intensity = 1e9 * (q + 0.01)**(-4) * np.exp(-q * request.layers[0].roughness)
    
    return {
        "q": q.tolist(),
        "intensity": intensity.tolist()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)