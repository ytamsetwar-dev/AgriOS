# 🌿 AgriOS - Advanced AI & Computer Vision Farming Dashboard

![AgriOS Dashboard](https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=1200)

**AgriOS** is a hyper-realistic, enterprise-grade AI farming application built to bring military-grade telemetry and AI predictive modeling to the agricultural sector. 

Developed by **Yash Tamsetwar**, this project moves away from standard dashboards and utilizes a highly custom, glassmorphic UI, real-time weather tracking, and advanced simulated AI assistance.

## 🚀 Mind-Blowing Features

- **🧠 AgriBrain AI**: A simulated quantum AI chat assistant that provides real-time logistics and farm telemetry analysis.
- **📷 Computer Vision Diagnostics**: Live-feed plant disease detection using bounding boxes to identify crop health (e.g., Early Blight detection).
- **🛰️ Satellite Topography**: A custom-built Lidar scanning interface to track field coordinates, altitudes, and sync statuses.
- **🌤️ Real-Time Telemetry**: Auto-locates your city via HTML5 Geolocation and pulls live weather data (Temp, Humidity, Wind, Precipitation) with zero API key configuration needed.
- **📊 Predictive ML Models**: Fully integrated backend models for:
  - Crop Recommendation
  - Fertilizer Recommendation
  - Irrigation Prediction
  - Yield Prediction
  - Market Price Forecasting

## 💻 Tech Stack
- **Frontend**: React, Vite, Framer Motion (for smooth, linear animations), Recharts, Lucide-React.
- **Backend**: FastAPI, Python 3.11+
- **Machine Learning**: Scikit-Learn, Joblib
- **Styling**: 100% Custom Vanilla CSS (Enterprise-grade Glassmorphism, Inter font).

## 🛠️ Installation & Setup

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/AgriOS.git
cd AgriOS
```

**2. Start the FastAPI Backend:**
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.app.main:app --reload
```
*The API will run at http://127.0.0.1:8000*

**3. Start the React Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*The UI will run at http://localhost:5173*

## 👨‍💻 Author
**Yash Tamsetwar** - Architect & Developer