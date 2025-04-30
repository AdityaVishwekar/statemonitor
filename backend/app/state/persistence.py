import json
import os
import threading

STATE_FILE = "state.json"
_lock = threading.Lock()

def save_state(data):
    with _lock:
        try:
            with open(STATE_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"❌ Failed to save state: {e}")

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Failed to load state: {e}")
    return {}
