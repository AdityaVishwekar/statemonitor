from fastapi import APIRouter, UploadFile, Form, BackgroundTasks
from app.service.file_watcher import watch_remote_file
import tempfile

router = APIRouter()

@router.post("/start-remote-watch")
async def start_remote_watch(
    background_tasks: BackgroundTasks,
    host: str = Form(...),
    port: int = Form(...),
    username: str = Form(...),
    remote_filepath: str = Form(...),
    passphrase: str = Form(""),
    private_key_file: UploadFile = None,
):
    # Save uploaded key file to a temp file
    temp_key = tempfile.NamedTemporaryFile(delete=False)
    contents = await private_key_file.read()
    temp_key.write(contents)
    temp_key.close()

    # Launch background task
    background_tasks.add_task(
        watch_remote_file,
        host,
        port,
        username,
        remote_filepath,
        passphrase,
        private_key_path=temp_key.name
    )
    return {"status": "Monitoring started", "remote_filepath": remote_filepath}
