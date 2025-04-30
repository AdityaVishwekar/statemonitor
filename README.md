
# 📡 StateMonitor

StateMonitor is a modular web application that monitors changes in specified remote files over SSH and sends email notifications when the file is modified.

---

## ⚙️ Features

- ✅ Monitor any remote file(s) over SSH
- 📧 Sends email alerts to multiple users
- ✍️ Bulk mute/unmute alerts per server/file
- 🌐 Modern UI built with React & Tailwind CSS
- 🚀 Backend powered by FastAPI

---

## 🖼️ Frontend (React + Tailwind)

### 📁 Directory
```bash
frontend/
```

### ▶️ Start Frontend
```bash
cd frontend
export NODE_OPTIONS=--openssl-legacy-provider
npm install
npm install react-router-dom@5
npm install --save-dev @types/react-router-dom@5
npm start
```

### 🛠 Tech Stack
- React (TypeScript)
- Tailwind CSS
- Axios
- React Router v5

### ⚙️ Frontend `.env` Configuration

Create a `.env` file inside the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:8000
```

✅ `REACT_APP_API_URL` points to your FastAPI backend server.  
✅ Used internally to make API calls from React (e.g., `/start-multi-watch`, `/status`, etc.)

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
- Paramiko (SSH monitoring)
- smtplib (email service)
- Python 3.11+

---

## 📬 Email Setup

Create a `.env` file inside `backend/`:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

👉 For Gmail users, generate an App Password here:  
https://myaccount.google.com/apppasswords

---
## 💾 Persistence (State Saving)

StateGuardian automatically saves:
- Active monitored servers
- Muted/unmuted states
- Subscribed email addresses
- Logs of file changes

Saved into a simple JSON file:
```bash
state.json
```
---

## 🧪 API Endpoints

### Start Monitoring Remote Files
```http
POST /start-multi-watch
Form Data:
- servers (JSON list)
- private_key_file (SSH Key File)
- emails (comma-separated)

Returns: {"status": "Started monitoring X servers"}
```

---

## Usage
1. Open the frontend URL (`http://localhost:3000`).
2. Fill in:
   - Username
   - SSH private key file
   - Hosts (one per line)
   - Remote file paths (one per line)
   - Emails (comma-separated or newline)
3. Click **Start Monitoring**.
4. ✅ Alerts will be emailed on file changes.

---

## 📝 To-Do
- Add frontend toast notifications
- Add total server counters (muted/active)
- Full Helm chart for K8s deployment

---

## 🧑‍💻 Author

**Aditya Vishwekar**  
[GitHub](https://github.com/AdityaVishwekar)

---

## 📄 License

This project is licensed under the **Apache License 2.0**.  
See the [LICENSE](LICENSE) file for full terms.
