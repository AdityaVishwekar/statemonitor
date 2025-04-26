import time
import os
import paramiko
from datetime import datetime
from collections import defaultdict, deque
from app.utils.emailer import send_email
from app.utils.logger import log
from app.state.tracker import is_muted, get_subscribers


watcher_status = defaultdict(lambda: {
    "status": "pending",
    "last_updated": None,
    "logs": deque(maxlen=100)
})

def log_event(host, remote_filepath, message):
    key = f"{host}:{remote_filepath}"
    watcher_status[key]["status"] = "active"
    watcher_status[key]["last_updated"] = datetime.utcnow().isoformat()
    watcher_status[key]["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

def watch_remote_file(
    host, port, username, remote_filepath, passphrase, private_key_path, poll_interval=10
):
    client = None
    sftp = None

    try:
        print(f"Connecting to {host}...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print(private_key_path)
        print(passphrase)
        print(username)
        client.connect(
            hostname=host,
            username=username,
            key_filename=private_key_path,
            passphrase=passphrase,
            disabled_algorithms=dict(pubkeys=["rsa-sha2-512", "rsa-sha2-256"])
        )

        sftp = client.open_sftp()
        print(f"Connected. Watching {remote_filepath}")
        log_event(host, remote_filepath, "Started watching.")

        prev_mtime = sftp.stat(remote_filepath).st_mtime

        while True:
            time.sleep(poll_interval)
            try:
                current_mtime = sftp.stat(remote_filepath).st_mtime
                if current_mtime != prev_mtime:
                    prev_mtime = current_mtime
                    print("File changed!")
                    log_event(host, remote_filepath, "File changed!")
                    # Check if alerts are muted for server
                    if is_muted(host, remote_filepath):
                        print(f"🔕 Alerts muted for {host}:{remote_filepath}")
                        continue

                    emails = get_subscribers(host, remote_filepath)
                    if emails:
                        send_email(
                            "Remote File Changed",
                            f"The file '{remote_filepath}' on '{host}' has been modified.",
                            to_emails=emails
                        )
            except FileNotFoundError:
                print("File not found.")
                log_event(host, remote_filepath, "File not found. Stopping monitor.")
                break

    except Exception as e:
        print(f"Error: {e}")
        log_event(host, remote_filepath, f"Error: {e}")
    finally:
        try:
            if sftp:
                sftp.close()
        except:
            pass
        if client:
            client.close()
        print("SSH connection closed.")
        log_event(host, remote_filepath, "SSH connection closed.")


def get_all_status():
    return [
        {
            "host_file": key,
            **value,
            "status": "muted" if is_muted(*key.split(":")) else value["status"],
            "logs": list(value["logs"]),
            "emails": get_subscribers(*key.split(":")),
        }
        for key, value in watcher_status.items()
    ]