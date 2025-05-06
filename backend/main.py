from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.state.reconnector import reconnect_watchers
from dotenv import load_dotenv
from pydantic import BaseModel
from app.state.state_store import persistent_state, save_watcher_status
load_dotenv()

app = FastAPI(title="State Guardian")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    reconnect_watchers()

class PollIntervalRequest(BaseModel):
    host_file: str
    interval: int

@app.post("/update_poll_interval")
async def update_poll_interval(data: PollIntervalRequest):
    if data.host_file not in persistent_state:
        persistent_state[data.host_file] = {}
    persistent_state[data.host_file]["poll_interval"] = data.interval
    save_watcher_status()
    return {"message": f"Poll interval for {data.host_file} updated to {data.interval} seconds"}