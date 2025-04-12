import hashlib
import time
from app.utils.emailer import send_email
from app.utils.logger import log
import time
import os
import logging

logging.basicConfig(level=logging.INFO)

last_modified_time = 0


def get_file_hash(filepath):
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()

def watch_file(filepath: str):
    global last_modified_time
    prev_modified = os.path.getmtime(filepath)

    while True:
        time.sleep(1)
        try:
            current_modified = os.path.getmtime(filepath)
            if current_modified != prev_modified:
                if time.time() - last_modified_time > 2:  # 2-second debounce
                    logging.info("File change detected.")
                    send_email("File Changed", f"The file {filepath} has been modified.")
                    last_modified_time = time.time()
                prev_modified = current_modified
        except FileNotFoundError:
            logging.warning("File not found.")
        except Exception as e:
            logging.error(f"Error in watcher: {e}")

