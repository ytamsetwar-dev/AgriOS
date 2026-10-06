import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, Sprout, Droplet, BarChart2, Sun, Settings, Bell, 
  Plus, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight,
  Activity, CloudRain, Navigation, History, Tractor, ScanLine, Maximize,
  Camera, Cpu, Send, X, ShieldAlert, Thermometer, Wind, CloudFog, TrendingUp
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const serviceConfigs = {
  "Crop recommendation": {
    icon: Sprout, color: "bg-green", title: "Find the right crop for your field.", copy: "Use soil nutrients, climate and rainfall conditions to discover a crop that can thrive.",
    fields: [
      ["N", "Nitrogen (N)", "number", "90"], ["P", "Phosphorus (P)", "number", "42"], ["K", "Potassium (K)", "number", "43"],
      ["temperature", "Temperature (°C)", "number", "24"], ["humidity", "Humidity (%)", "number", "72"], ["ph", "Soil pH", "number", "6.5"], ["rainfall", "Rainfall (mm)", "number", "180"],
    ]
  },
  "Fertilizer recommendation": {
    icon: Leaf, color: "bg-green", title: "Build a healthier soil plan.", copy: "Balance soil health and crop needs with a clear fertilizer recommendation for each growth stage.",
    fields: [
      ["Soil_Type", "Soil type", "select", "Loamy", ["Clay", "Loamy", "Sandy", "Black"]],
      ["Soil_pH", "Soil pH", "number", "6.1"], ["Soil_Moisture", "Soil moisture (%)", "number", "35"], ["Organic_Carbon", "Organic carbon", "number", "0.42"],
      ["Nitrogen_Level", "Nitrogen level", "number", "61"], ["Phosphorus_Level", "Phosphorus level", "number", "44"], ["Potassium_Level", "Potassium level", "number", "84"],
      ["Crop_Type", "Crop type", "select", "Wheat", ["Wheat", "Rice", "Cotton", "Maize"]], ["Crop_Growth_Stage", "Growth stage", "select", "Vegetative", ["Germination", "Vegetative", "Flowering", "Harvest"]], ["Season", "Season", "select", "Rabi", ["Kharif", "Rabi", "Summer"]],
    ]
  },
  "Irrigation prediction": {
    icon: Droplet, color: "bg-blue", title: "Water only when your field needs it.", copy: "Combine moisture, weather, crop and field data to make irrigation more efficient.",
    fields: [
      ["Soil_Type", "Soil type", "select", "Clay", ["Clay", "Loamy", "Sandy", "Black"]], ["Soil_pH", "Soil pH", "number", "6.1"], ["Soil_Moisture", "Soil moisture (%)", "number", "36"],
      ["Temperature_C", "Temperature (°C)", "number", "21.9"], ["Humidity", "Humidity (%)", "number", "31"], ["Rainfall_mm", "Rainfall (mm)", "number", "1167"], ["Sunlight_Hours", "Sunlight hours", "number", "4"],
      ["Crop_Type", "Crop type", "select", "Wheat", ["Wheat", "Rice", "Cotton", "Maize"]], ["Crop_Growth_Stage", "Growth stage", "select", "Vegetative", ["Germination", "Vegetative", "Flowering", "Harvest"]], ["Field_Area_hectare", "Field area (hectares)", "number", "4.7"],
    ]
  },
  "Price prediction": {
    icon: BarChart2, color: "bg-yellow", title: "Plan your selling moment.", copy: "Review commodity, location and market movement to make a more confident price plan.",
    fields: [
      ["month", "Forecast month", "month", "2025-03"], ["commodity_name", "Commodity", "select", "Maize", ["Maize", "Wheat", "Rice", "Cotton", "Soybean"]], ["state_name", "State", "text", "India"], ["district_name", "District", "text", "All"],
      ["avg_modal_price", "Average modal price (₹)", "number", "2341.58"], ["avg_min_price", "Average minimum price (₹)", "number", "2191.23"], ["avg_max_price", "Average maximum price (₹)", "number", "2402.98"], ["change", "Recent change (%)", "number", "-14.43"],
    ]
  },
  "Yield prediction": {
    icon: BarChart2, color: "bg-yellow", title: "See your harvest before it arrives.", copy: "Estimate yield from your crop, field size, planting date and growing inputs.",
    fields: [
      ["Crop Type", "Crop type", "select", "Soybean", ["Soybean", "Wheat", "Rice", "Maize", "Cotton"]], ["Field Size (hectares)", "Field size (hectares)", "number", "1.04"], ["Planting Date", "Planting date", "date", "2025-06-08"],
      ["Soil Type", "Soil type", "select", "Loamy", ["Clay", "Loamy", "Sandy", "Black"]], ["Fertilizer Used", "Fertilizer used", "select", "Urea", ["Urea", "MOP", "DAP", "NPK"]], ["Irrigation Type", "Irrigation type", "select", "Furrow / Canal irrigation", ["Rainfed", "Drip irrigation", "Furrow / Canal irrigation"]],
    ]
  },
};

const yieldData = [
  { name: 'May', yield: 4.2 }, { name: 'Jun', yield: 4.5 }, { name: 'Jul', yield: 4.8 },
  { name: 'Aug', yield: 5.1 }, { name: 'Sep', yield: 5.4 }, { name: 'Oct', yield: 5.8 },
];

const moistureData = [
  { name: 'Week 1', level: 35 }, { name: 'Week 2', level: 45 }, { name: 'Week 3', level: 42 },
  { name: 'Week 4', level: 55 }, { name: 'Week 5', level: 60 },
];

const easing = [0.25, 0.1, 0.25, 1];

// -------------------------------------------------------------
// REAL-TIME WEATHER HOOK
// -------------------------------------------------------------
function useRealWeather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon, locName) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto`);
        const data = await res.json();
        setWeather({
          location: locName,
          temperature: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          precipitation: data.current.precipitation,
          windSpeed: data.current.wind_speed_10m
        });
      } catch (e) {
        console.error(e);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
             // Free reverse geocoding to get the user's city
             const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
             const geoData = await geoRes.json();
             const city = geoData.city || geoData.locality || "Your Field";
             fetchWeather(latitude, longitude, city);
          } catch(e) {
             fetchWeather(latitude, longitude, "Your Field");
          }
        },
        (error) => {
          // Default location if user denies location permission
          fetchWeather(18.5204, 73.8567, "Pune (Default)");
        }
      );
    } else {
      fetchWeather(18.5204, 73.8567, "Pune (Default)");
    }
  }, []);

  return weather;
}


function ServiceForm({ serviceName, onBack, showNotice }) {
  const config = serviceConfigs[serviceName];
  const initialValues = Object.fromEntries(config.fields.map(([key, , , value]) => [key, value]));
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  
  const IconCmp = config.icon;

  const submitPrediction = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpointByService = {
      "Crop recommendation": "/api/crop/recommend",
      "Fertilizer recommendation": "/api/fertilizer/predict",
      "Irrigation prediction": "/api/irrigation/predict",
      "Price prediction": "/api/price/predict",
      "Yield prediction": "/api/yield/predict",
    };
    const payload = { ...values };
    
    if (serviceName === "Yield prediction") {
      Object.assign(payload, {
        Crop_Type: payload["Crop Type"],
        Field_Size_hectares: payload["Field Size (hectares)"],
        Planting_Date: payload["Planting Date"],
        Soil_Type: payload["Soil Type"],
        Fertilizer_Used: payload["Fertilizer Used"],
        Irrigation_Type: payload["Irrigation Type"],
      });
      ["Crop Type", "Field Size (hectares)", "Planting Date", "Soil Type", "Fertilizer Used", "Irrigation Type"].forEach(k => delete payload[k]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpointByService[serviceName]}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Prediction failed.");
      setPrediction(data.prediction);
      showNotice(`Analysis complete.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easing }} className="service-page">
      <button onClick={onBack} className="btn-back">
        <ArrowLeft size={18} /> Back
      </button>
      
      <div className="service-header-row">
        <div className={`service-icon-hero bg-emerald`}><IconCmp size={32} /></div>
        <div className="service-header-text">
          <h1>{serviceName}</h1>
          <p>{config.copy}</p>
        </div>
      </div>
      
      <div className="form-layout">
        <form onSubmit={submitPrediction} className="glass-panel form-container">
          <div className="panel-header">
            <h2>Data Parameters</h2>
          </div>
          <div className="form-grid">
            {config.fields.map(([key, label, type, , options]) => (
              <div key={key} className="input-group">
                <label>{label}</label>
                {type === "select" ? (
                  <select value={values[key]} onChange={e => setValues({...values, [key]: e.target.value})}>
                    {options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type={type} value={values[key]} onChange={e => setValues({...values, [key]: e.target.value})} />
                )}
              </div>
            ))}
          </div>
          <div className="form-footer">
            <button type="submit" className="btn-primary form-submit">
              {loading ? "Analyzing Data..." : "Run Analysis"} {loading ? "" : <ArrowRight size={18} />}
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="glass-panel result-card">
          <IconCmp size={64} className="result-watermark" />
          <h3>Analysis Output</h3>
          {prediction ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easing }}>
              <div className="result-value">
                {serviceName === "Price prediction" ? `₹${Number(prediction).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : 
                 serviceName === "Yield prediction" ? `${Number(prediction).toFixed(2)} t/ha` : prediction}
              </div>
              <div className="result-confidence">
                <span>Confidence Score</span>
                <strong>97.4%</strong>
              </div>
            </motion.div>
          ) : (
            <p className="result-placeholder">System is awaiting data inputs to generate analysis.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// MAIN PAGES
// -------------------------------------------------------------

function Dashboard({ weather }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="dashboard-content">
      <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0, transition: {ease: easing}}}} className="dashboard-header glass-panel">
        <div className="dashboard-header-text">
          <h1 className="dashboard-title">Command Center</h1>
          <span className="greeting-kicker">Live telemetry active</span>
        </div>
        <div className="weather-widget">
          <div className="weather-icon-wrapper text-amber"><Sun size={28} /></div>
          <div className="weather-details">
            <strong>{weather ? weather.temperature : '--'}°C</strong>
            <small>{weather ? weather.location : 'Locating satellite telemetry...'}</small>
          </div>
        </div>
      </motion.div>

      <div className="stats-grid">
        {[
          { label: "Active Area", value: "124.5", unit: "ha", icon: Sprout, color: "text-emerald", trend: "+1.2%" },
          { label: "Projected Yield", value: "4.8", unit: "t/ha", icon: BarChart2, color: "text-amber", trend: "+0.8%" },
          { label: "System Efficiency", value: "96", unit: "%", icon: Droplet, color: "text-blue", trend: "+1.5%" },
        ].map((stat, i) => {
          const IconCmp = stat.icon;
          return (
            <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0, transition: {ease: easing}}}} key={i} className="stat-card glass-panel">
              <div className="stat-header">
                <div className="stat-label-group">
                  <IconCmp size={18} className={`stat-icon ${stat.color}`} />
                  <span className="stat-label">{stat.label}</span>
                </div>
                <span className="stat-trend trend-up">{stat.trend}</span>
              </div>
              <div className="stat-value">
                {stat.value}<span className="stat-unit">{stat.unit}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.section variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0, transition: {ease: easing}}}} className="dashboard-bifurcation" style={{marginTop: '0.5rem'}}>
        <div className="glass-panel dashboard-section">
           <div className="panel-header map-header">
             <h2><Camera size={20} className="title-icon text-amber" /> Computer Vision Analysis</h2>
             <span className="live-badge"><span className="pulse-dot"></span> LIVE FEED</span>
           </div>
           <div className="vision-container">
              <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800" alt="Leaf scan" className="vision-image" />
              <div className="bounding-box box-1">
                 <span className="box-label alert"><ShieldAlert size={10} /> Early Blight - 92%</span>
              </div>
              <div className="bounding-box box-2">
                 <span className="box-label ok"><CheckCircle2 size={10} /> Healthy Tissue - 98%</span>
              </div>
              <div className="vision-scan-line"></div>
              <div className="vision-overlay"></div>
           </div>
        </div>

        <div className="glass-panel chart-card" style={{height: '100%'}}>
          <div className="panel-header"><h2>Yield History</h2></div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="yield" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function MyFields() {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easing }} className="dashboard-content">
      <div className="glass-panel dashboard-section map-section" style={{minHeight: '400px'}}>
         <div className="panel-header map-header">
           <h2><ScanLine size={20} className="title-icon text-blue" /> Satellite Topography</h2>
         </div>
         <div className="technical-map-container">
           <div className="tech-grid">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((plot) => (
               <div key={plot} className="tech-plot">
                  <span className="tech-label">SEC-{plot}</span>
                  <div className="tech-scan-line"></div>
               </div>
             ))}
           </div>
           <div className="map-overlay-data">
             <div className="data-row"><span>COORD</span><span>34.05°N, 118.24°W</span></div>
             <div className="data-row"><span>ALTITUDE</span><span>412m</span></div>
             <div className="data-row"><span>STATUS</span><span className="status-ok">SYNCED</span></div>
           </div>
         </div>
      </div>
      <div className="glass-panel dashboard-section">
        <div className="panel-header"><h2>Registered Fields</h2></div>
        <table className="table-container">
          <thead><tr><th>Field Name</th><th>Crop</th><th>Area (ha)</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>North Block Alpha</td><td>Wheat</td><td>4.5</td><td><span className="badge success">Optimal</span></td></tr>
            <tr><td>South Block Beta</td><td>Maize</td><td>2.1</td><td><span className="badge warning">Low Moisture</span></td></tr>
            <tr><td>East Valley</td><td>Soybean</td><td>6.8</td><td><span className="badge success">Optimal</span></td></tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function Insights({ setServicePage }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easing }} className="dashboard-content">
      <div className="glass-panel dashboard-section">
         <div className="panel-header">
           <h2><Activity size={20} className="title-icon text-emerald" /> AI Predictive Models</h2>
           <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Select a predictive model to run an analysis.</p>
         </div>
         <div className="services-grid-sm" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
           {Object.entries(serviceConfigs).map(([name, config]) => {
             const IconCmp = config.icon;
             return (
               <div key={name} className="service-card" onClick={() => setServicePage(name)}>
                 <div className="service-icon-box"><IconCmp size={24} className="text-emerald" /></div>
                 <div className="service-card-info">
                   <h3 className="service-title">{name}</h3>
                   <span className="service-action">Access Model</span>
                 </div>
               </div>
             );
           })}
         </div>
      </div>
      
      <div className="glass-panel dashboard-section">
         <div className="panel-header">
           <h2><TrendingUp size={20} className="title-icon text-amber" /> Real-time Market Trends</h2>
         </div>
         <table className="table-container">
          <thead><tr><th>Commodity</th><th>Current Price (₹/q)</th><th>Change</th></tr></thead>
          <tbody>
            <tr><td>Wheat</td><td>2,450</td><td className="status-ok">+1.2%</td></tr>
            <tr><td>Maize</td><td>2,100</td><td style={{color: '#ef4444'}}>-0.5%</td></tr>
            <tr><td>Soybean</td><td>4,800</td><td className="status-ok">+3.4%</td></tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function WeatherPage({ weather }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easing }} className="dashboard-content">
      <div className="glass-panel dashboard-section" style={{alignItems: 'center', textAlign: 'center', padding: '4rem'}}>
         <Sun size={64} className="text-amber" style={{marginBottom: '1rem'}} />
         <h1 style={{fontSize: '4rem', fontWeight: '800', letterSpacing: '-2px'}}>{weather ? weather.temperature : '--'}°C</h1>
         <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>{weather ? weather.location : 'Locating satellite telemetry...'}</p>
         
         <div className="stats-grid" style={{marginTop: '4rem', width: '100%', maxWidth: '800px'}}>
           <div className="stat-card" style={{background: 'var(--secondary)', borderRadius: 'var(--radius-md)'}}>
             <Thermometer size={24} className="text-amber mb-2"/>
             <span className="stat-label">Humidity</span>
             <strong style={{fontSize: '1.5rem', marginTop: '0.5rem', display: 'block'}}>{weather ? weather.humidity : '--'}%</strong>
           </div>
           <div className="stat-card" style={{background: 'var(--secondary)', borderRadius: 'var(--radius-md)'}}>
             <Wind size={24} className="text-blue mb-2"/>
             <span className="stat-label">Wind Speed</span>
             <strong style={{fontSize: '1.5rem', marginTop: '0.5rem', display: 'block'}}>{weather ? weather.windSpeed : '--'} km/h</strong>
           </div>
           <div className="stat-card" style={{background: 'var(--secondary)', borderRadius: 'var(--radius-md)'}}>
             <CloudFog size={24} className="text-emerald mb-2"/>
             <span className="stat-label">Precipitation</span>
             <strong style={{fontSize: '1.5rem', marginTop: '0.5rem', display: 'block'}}>{weather ? weather.precipitation : '--'} mm</strong>
           </div>
         </div>
      </div>
    </motion.div>
  );
}

function HistoryPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easing }} className="dashboard-content">
      <div className="glass-panel dashboard-section">
        <div className="panel-header"><h2>Prediction Log</h2></div>
        <table className="table-container">
          <thead><tr><th>Date</th><th>Model</th><th>Input Parameters</th><th>Result</th></tr></thead>
          <tbody>
            <tr><td>Oct 6, 2026</td><td>Yield Prediction</td><td>Wheat, Loamy, 4.5ha</td><td><strong className="text-emerald">4.8 t/ha</strong></td></tr>
            <tr><td>Oct 5, 2026</td><td>Fertilizer Rec.</td><td>Nitrogen: 61, Soil: Clay</td><td><strong>Urea</strong></td></tr>
            <tr><td>Oct 2, 2026</td><td>Price Prediction</td><td>Maize, India</td><td><strong>₹2,341</strong></td></tr>
            <tr><td>Sep 28, 2026</td><td>Crop Rec.</td><td>Temp: 24°C, Hum: 72%</td><td><strong>Rice</strong></td></tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// WIDGETS
// -------------------------------------------------------------

function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'AgriBrain AI online. How can I assist with your farm logistics today?' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `I've analyzed your telemetry. Based on current soil moisture (35%) and forecast, I recommend delaying irrigation by 48 hours to conserve water.` 
      }]);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.2 }} className="ai-chat-window glass-panel">
            <div className="chat-header">
              <div className="ai-orb-small"></div>
              <div className="chat-title-group">
                 <h4>AgriBrain</h4>
                 <small>Quantum Model v4.2</small>
              </div>
              <button className="chat-close" onClick={() => setIsOpen(false)}><X size={16}/></button>
            </div>
            
            <div className="chat-body">
               {messages.map((msg, i) => (
                 <div key={i} className={`chat-bubble ${msg.sender}`}>
                   {msg.text}
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
            
            <form className="chat-input-area" onSubmit={handleSend}>
               <input type="text" placeholder="Ask AgriBrain..." value={input} onChange={(e) => setInput(e.target.value)} />
               <button type="submit" className="chat-send"><Send size={16}/></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button className={`ai-fab ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
         <div className="ai-orb pulse">
           <Cpu size={24} color="white" />
         </div>
      </button>
    </>
  );
}

// -------------------------------------------------------------
// APP CONTAINER
// -------------------------------------------------------------

function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [servicePage, setServicePage] = useState("");
  const [notice, setNotice] = useState("");
  
  // Use our real-time weather hook globally
  const realWeather = useRealWeather();

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  const navItems = [
    { name: "Dashboard", icon: Activity },
    { name: "My Fields", icon: Tractor },
    { name: "Insights", icon: BarChart2 },
    { name: "Weather", icon: CloudRain },
    { name: "History", icon: History },
  ];

  const renderActivePage = () => {
    if (servicePage) return <ServiceForm key="service" serviceName={servicePage} onBack={() => setServicePage("")} showNotice={showNotice} />;
    
    switch (activeNav) {
      case "Dashboard": return <Dashboard showNotice={showNotice} weather={realWeather} />;
      case "My Fields": return <MyFields />;
      case "Insights": return <Insights setServicePage={setServicePage} />;
      case "Weather": return <WeatherPage weather={realWeather} />;
      case "History": return <HistoryPage />;
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: easing }} className="sidebar">
        <div className="brand">
          <Leaf size={24} className="text-emerald" /> <span>AgriOS</span>
        </div>
        
        <div className="nav-label">Main Menu</div>
        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.name} className={`nav-item ${activeNav === item.name && !servicePage ? "active" : ""}`} 
                onClick={() => { setActiveNav(item.name); setServicePage(""); }}>
                <Icon size={18} /> <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="user-profile">
          <div className="avatar">YT</div>
          <div className="user-info">
            <span className="user-name">Yash Tamsetwar</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </motion.aside>

      <main className="main-content">
        <motion.header initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: easing }} className="topbar glass-panel">
          <div className="breadcrumb">
            AgriOS <ChevronRight size={14} className="breadcrumb-separator" /> <span className="breadcrumb-active">{servicePage || activeNav}</span>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => showNotice("Settings opened")}><Settings size={18} /></button>
            <button className="icon-button" onClick={() => showNotice("System alerts")}><Bell size={18} /><span className="notification-dot"></span></button>
            <button className="btn-primary" onClick={() => showNotice("New configuration initialized")}>
              <Plus size={16} /> New Config
            </button>
          </div>
        </motion.header>

        <div className="scroll-area">
          <AnimatePresence mode="wait">
            {renderActivePage()}
          </AnimatePresence>
        </div>
      </main>

      <AIChatWidget />

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="toast">
            <CheckCircle2 size={18} className="toast-icon text-emerald" /> 
            <span>{notice}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;