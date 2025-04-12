from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from app.service.file_watcher import watch_file

router = APIRouter()

class WatchRequest(BaseModel):
    filepath: str

@router.post("/start-watch")
def start_watch(request: WatchRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(watch_file, request.filepath)
    return {
        "success": True,
        "status": "Monitoring started",
        "filepath": request.filepath,
    }
