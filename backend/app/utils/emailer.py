import smtplib
from email.message import EmailMessage
import os

def send_email(subject, body):
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("EMAIL_FROM")
    msg["To"] = os.getenv("EMAIL_TO")

    with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as server:
        server.starttls()
        server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
        server.send_message(msg)
