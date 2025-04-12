# 📡 StateMonitor

StateMonitor is a modular web application that monitors changes in a specified file and sends email notifications when the file is modified.

---

## ⚙️ Features

- ✅ Monitor any local file for changes.
- 📧 Sends email alerts on file change.
- 🌐 Modern UI built with React & Tailwind CSS.
- 🚀 Backend powered by FastAPI.

---

## 🖼️ Frontend (React + Tailwind)

### 📁 Directory
```bash
frontend/
```

### ▶️ Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 🛠 Tech Stack
- React (TypeScript)
- Tailwind CSS
- Axios

---

## 🔧 Backend (FastAPI)

### 📁 Directory
```bash
backend/
```

### ▶️ Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 🛠 Tech Stack
- FastAPI
- Watchdog (file monitoring)
- smtplib (email service)
- Python 3.10+

---

## 📬 Email Setup

Set the following environment variables (create a `.env` file in `backend/`):

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_RECEIVER=receiver_email@gmail.com
```

For Gmail users, generate an App Password:  
👉 https://myaccount.google.com/apppasswords

---

## 🧪 API Endpoint

### Start Monitoring
```http
POST /start-watch
Content-Type: application/json

{
  "filepath": "/absolute/path/to/your/file.txt"
}
```

## Usage
1. Navigate to the frontend URL (`http://localhost:3000`).
2. Enter the file path in the input field (e.g., `/path/to/your/file.txt`).
3. Click the "Start Monitoring" button to begin file monitoring.
4. The backend will start monitoring the file, and you will receive an email notification when the file is changed.

---

## 📝 To-Do
- Add authentication
- Log file changes
- Add multi-file support

---

## 🧑‍💻 Author

**Aditya Vishwekar**  
[GitHub](https://github.com/AdityaVishwekar)

---

## License
This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for more details.

