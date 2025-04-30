from collections import defaultdict, deque
from app.state.persistence import load_state, save_state

watcher_status = defaultdict(lambda: {
    "status": "pending",
    "last_updated": None,
    "logs": deque(maxlen=100),
    "emails": [],
    "port": 22,
    "username": "",
    "passphrase": "",
    "private_key_path": ""
})

_loaded = load_state()
for k, v in _loaded.get("watcher_status", {}).items():
    watcher_status[k].update({
        "status": v.get("status", "pending"),
        "last_updated": v.get("last_updated"),
        "logs": deque(v.get("logs", []), maxlen=100),
        "emails": v.get("emails", []),
        "port": v.get("port", 22),
        "username": v.get("username", ""),
        "passphrase": v.get("passphrase", ""),
        "private_key_path": v.get("private_key_path", "")
    })

def save_watcher_status():
    save_state({
        "watcher_status": {
            k: {
                "status": v["status"],
                "last_updated": v["last_updated"],
                "logs": list(v["logs"]),
                "emails": v.get("emails", []),
                "port": v.get("port", 22),
                "username": v.get("username", ""),
                "passphrase": v.get("passphrase", ""),
                "private_key_path": v.get("private_key_path", "")
            }
            for k, v in watcher_status.items()
        }
    })