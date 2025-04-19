import json
from typing import List
from fastapi import APIRouter, BackgroundTasks, UploadFile, Form
from pydantic import BaseModel
from app.service.file_watcher import watch_remote_file
import tempfile
import shutil
import threading


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
    servers: str = Form(...),  # ← JSON string from form
    private_key_file: UploadFile = Form(...)
):
    try:
        server_list = json.loads(servers)
    except json.JSONDecodeError:
        return {"error": "Invalid server JSON format"}

    key_path = tempfile.mkstemp()[1]
    with open(key_path, "wb") as f:
        shutil.copyfileobj(private_key_file.file, f)

    # for server_dict in server_list:
    #     server = ServerConfig(**server_dict)
    #     background_tasks.add_task(
    #         watch_remote_file,
    #         server.host,
    #         server.port,
    #         server.username,
    #         server.remote_filepath,
    #         server.passphrase,
    #         key_path
    #     )
    #     print(f"📡 Adding watcher: {server.host} -> {server.remote_filepath}")
    #     threading.Thread(target=watch_remote_file, args=(...), daemon=True).start()

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
        print(f"📡 Adding watcher: {server.host} -> {server.remote_filepath}")
        thread.start()


    return {"status": f"Started monitoring {len(server_list)} servers."}
