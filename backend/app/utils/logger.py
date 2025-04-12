import logging
import os

LOG_FILE = os.getenv("LOG_FILE", "app.log")

# Set up basic logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("file-monitor")

def log(message: str, level: str = "info"):
    if level == "debug":
        logger.debug(message)
    elif level == "warning":
        logger.warning(message)
    elif level == "error":
        logger.error(message)
    else:
        logger.info(message)
