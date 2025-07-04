# 🧠 Business Location Optimiser (Full Stack Web App)

This project allows users to upload population and competitor location CSVs, run geo-optimisation, and visualise business placement strategy on an interactive map.

---

## 📂 Project Structure

```
root/
├── backend/         	# Express + TypeScript API
│   └── src/        
│   	└── data/		# Stores CSV files
│   	└── routes/		# ...
│   	└── services/	# ...

├── frontend/        	# React + TypeScript app
│   └── components/     # ...
├── .gitignore
└── README.md
```

---

## ⚙️ Requirements

- Node.js (v18 or higher recommended)
- npm (v9+)
- Internet connection (for tile maps)

---

## 🛠️ 1. Install Dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

---

## 🚀 2. Run the Backend (First!)

Start the Express API server **before** launching the frontend to avoid port conflicts.

```bash
cd backend
npx ts-node-dev src/index.ts
```

- The backend runs on **http://localhost:3000**
- Uploaded files (CSV) are stored in `backend/data/`

---

## 🌐 3. Run the Frontend

```bash
cd frontend
npm start
```

- If prompted with:

  ```
  Something is already running on port 3000.
  Would you like to run the app on another port instead?
  ```

  ✅ Press **Y** to run on port **3001** or another available port.

- The frontend will open in your default browser.

---

## 🧪 4. Testing Functionality

- Use the interface to:
  - Upload new **population.csv** and **competitor.csv**
  - Visualise optimisation results and population heatmaps
  - View changes in competitor locations between uploads

- Backend functionality:
  - Automatically archives `week2.csv` to `week1.csv`
  - Compares the two to determine changes
  - Computes best 500 business locations by score:
    ```
    score = population × (1 + distance from nearest competitor in km)
    ```

---

## 📄 License

MIT License
