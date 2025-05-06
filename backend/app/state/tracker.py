from collections import defaultdict
from app.state.state_store import watcher_status, save_watcher_status

state_file = "state.json"

subscribers = defaultdict(list, {
    key: value.get("emails", [])
    for key, value in watcher_status.items()
})
muted = set()

def add_subscribers(host, file, emails):
    key = f"{host}:{file}"
    subscribers[key] = emails
    watcher_status[key]["emails"] = emails  # critical for state.json
    save_watcher_status()

def get_subscribers(host, file):
    return subscribers.get(f"{host}:{file}", [])

def mute(host, file):
    muted.add(f"{host}:{file}")
    watcher_status[f"{host}:{file}"]["status"] = "muted"
    save_watcher_status()

def unmute(host, file):
    muted.discard(f"{host}:{file}")
    watcher_status[f"{host}:{file}"]["status"] = "active"
    save_watcher_status()

def is_muted(host, file):
    return f"{host}:{file}" in muted

def update_poll_interval(host, remote_filepath, interval):
    key = f"{host}:{remote_filepath}"
    state["poll_intervals"][key] = interval
    save_state()