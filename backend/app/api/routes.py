import json
from typing import List
from fastapi import APIRouter, BackgroundTasks, UploadFile, Form
from pydantic import BaseModel
from app.service.file_watcher import watch_remote_file
import tempfile
import shutil
import threading
from app.service.file_watcher import watch_remote_file, get_all_status
from app.state.tracker import add_subscribers
from app.state.tracker import mute, unmute


router = APIRouter()

class ServerConfig(BaseModel):
    host: str
    port: int
    username: str
    remote_filepath: str
    passphrase: str

@router.post("/start-multi-watch")
async def start_multi_watch(
    background_tasks: BackgroundTasks,
    servers: str = Form(...),
    emails: str = Form(''),
    private_key_file: UploadFile = Form(...)
):
    try:
        server_list = json.loads(servers)
    except json.JSONDecodeError:
        return {"error": "Invalid server JSON format"}

    key_path = tempfile.mkstemp()[1]
    with open(key_path, "wb") as f:
        shutil.copyfileobj(private_key_file.file, f)

    email_list = [e.strip() for e in emails.replace("\n", ",").split(",") if e.strip()]

    for server_dict in server_list:
        server = ServerConfig(**server_dict)
        thread = threading.Thread(
            target=watch_remote_file,
            args=(
                server.host,
                server.port,
                server.username,
                server.remote_filepath,
                server.passphrase,
                key_path,
            ),
            daemon=True
        )
        add_subscribers(server.host, server.remote_filepath, email_list)
        print(f"📡 Adding watcher: {server.host} -> {server.remote_filepath}")
        thread.start()

    return {"status": f"Started monitoring {len(server_list)} servers."}


@router.get("/status")
def status():
    return get_all_status()

@router.post("/mute")
def mute_host(data: dict):
    mute(data["host"], data["file"])
    return {"status": "muted"}

@router.post("/unmute")
def unmute_host(data: dict):
    unmute(data["host"], data["file"])
    return {"status": "unmuted"}

