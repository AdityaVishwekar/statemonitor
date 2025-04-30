import threading
from app.state.state_store import watcher_status
from app.service.file_watcher import watch_remote_file

def reconnect_watchers():
    for key, config in watcher_status.items():
        host, filepath = key.split(":", 1)
        t = threading.Thread(
            target=watch_remote_file,
            args=(
                host,
                config.get("port", 22),
                config["username"],
                filepath,
                config.get("passphrase", ""),
                config["private_key_path"]
            ),
            daemon=True
        )
        print(f"🔁 Reconnecting to {key}")
        t.start()