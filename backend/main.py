from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router  # adjust path as needed
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

# ✅ Add CORS support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for frontend dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)
