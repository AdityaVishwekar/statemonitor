import time
import os
import paramiko
from app.utils.emailer import send_email
from app.utils.logger import log


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
        client.connect(hostname=host, username=username, key_filename=private_key_path, passphrase=passphrase,disabled_algorithms=dict(pubkeys=["rsa-sha2-512", "rsa-sha2-256"]))
        # Execute commands or perform actions after successful connection
        # stdin, stdout, stderr = client.exec_command('ls -l')
        # output = stdout.read().decode('utf-8')
        # print(output)

        sftp = client.open_sftp()
        print(f"Connected. Watching {remote_filepath}")
        prev_mtime = sftp.stat(remote_filepath).st_mtime

        while True:
            time.sleep(poll_interval)
            try:
                current_mtime = sftp.stat(remote_filepath).st_mtime
                if current_mtime != prev_mtime:
                    prev_mtime = current_mtime
                    print("File changed!")
                    send_email("Remote File Changed", f"The file {remote_filepath} on {host} has been modified.")
            except FileNotFoundError:
                print("File not found.")
                break

    except Exception as e:
        print(f"Error: {e}")
    finally:
        try:
            if sftp:
                sftp.close()
        except:
            pass
        if client:
            client.close()
        print("SSH connection closed.")
