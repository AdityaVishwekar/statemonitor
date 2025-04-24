from collections import defaultdict

# Set of muted "host:file" keys
muted_hosts = set()

# Dict of "host:file" → list of email subscribers
subscriptions = defaultdict(list)

def is_muted(host, path):
    return f"{host}:{path}" in muted_hosts

def mute(host, path):
    muted_hosts.add(f"{host}:{path}")

def unmute(host, path):
    muted_hosts.discard(f"{host}:{path}")

def add_subscribers(host, path, emails):
    subscriptions[f"{host}:{path}"].extend(emails)

def get_subscribers(host, path):
    return subscriptions.get(f"{host}:{path}", [])
