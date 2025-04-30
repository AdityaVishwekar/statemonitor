import time
import paramiko
from datetime import datetime
from app.utils.emailer import send_email
from app.state.state_store import watcher_status, save_watcher_status
from app.state.tracker import is_muted, get_subscribers

def log_event(key, message):
    watcher_status[key]["last_updated"] = datetime.utcnow().isoformat()
    watcher_status[key]["logs"].append(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
    save_watcher_status()

def watch_remote_file(host, port, username, remote_filepath, passphrase, private_key_path, poll_interval=10):
    key = f"{host}:{remote_filepath}"
    client = None
    sftp = None

    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=host,
            port=port,
            username=username,
            key_filename=private_key_path,
            passphrase=passphrase,
            disabled_algorithms=dict(pubkeys=["rsa-sha2-512", "rsa-sha2-256"])
        )

        sftp = client.open_sftp()
        print(f"Connected. Watching {remote_filepath}")
        watcher_status[key].update({
            "status": "active",
            "username": username,
            "port": port,
            "passphrase": passphrase,
            "private_key_path": private_key_path
        })
        log_event(key, "Started watching.")
        prev_mtime = sftp.stat(remote_filepath).st_mtime

        while True:
            time.sleep(poll_interval)
            try:
                current_mtime = sftp.stat(remote_filepath).st_mtime
                if current_mtime != prev_mtime:
                    prev_mtime = current_mtime
                    print("File changed!")
                    log_event(key, "File changed!")
                    if is_muted(host, remote_filepath):
                        print(f"🔕 Alerts muted for {host}:{remote_filepath}")
                        log_event(key, "Alert muted.")
                        continue
                    emails = get_subscribers(host, remote_filepath)
                    if emails:
                        send_email("Remote File Changed", f"The file '{remote_filepath}' on '{host}' was modified.", to_emails=emails)
            except FileNotFoundError:
                print("File not found.")
                log_event(key, "File not found.")
                break

    except Exception as e:
        print(f"Error: {e}")
        log_event(key, f"Error: {e}")
    finally:
        if sftp:
            sftp.close()
        if client:
            client.close()
        print("SSH connection closed.")
        log_event(key, "SSH connection closed.")


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