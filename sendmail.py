import smtplib
import string
import random

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
from email import encoders

class MailSender:
    """
    Contains email contents, connection settings and recipient settings. Has functions to compose and send mail. MailSenders are tied to an SMTP server, which must be specified when the instance is created. The default SMTP server is Google's Gmail server, with a connection over TLS.

    :param in_username: Username for mail server login (required)
    :param in_password: Password for mail server login (required)
    :param in_server: SMTP server to connect to (default is Gmail)
    :param use_SSL: Select whether to connect over SSL (True) or TLS (False) (default is TLS). Keep in mind that SMTP servers use different ports for SSL and TLS.

    """
    def __init__(self, in_username, in_password, in_server=("smtp.gmail.com", 587), use_SSL=False):
        self.username = in_username
        self.password = in_password
        self.server_name = in_server[0]
        self.server_port = in_server[1]
        self.use_SSL = use_SSL

        if self.use_SSL:
            self.smtpserver = smtplib.SMTP_SSL(self.server_name, self.server_port)
        else:
            self.smtpserver = smtplib.SMTP(self.server_name, self.server_port)
        self.connected = False
        self.recipients = []

    def __str__(self):
        return "Type: Mail Sender \n" \
               "Connection to server {}, port {} \n" \
               "Connected: {} \n" \
               "Username: {}, Password: {}".format(self.server_name, self.server_port, self.connected, self.username, self.password)

    def set_message(self, in_plaintext, in_subject="", in_from=None, in_htmltext=None, attachment=None, filename=None):
        """
        Creates the MIME message to be sent by e-mail.
        Supports optional HTML body and optional attachment.

        :param in_plaintext: Plaintext email body (required, fallback even if HTML is used)
        :param in_subject: Email subject (optional)
        :param in_from: Email 'From' header (optional, defaults to login address)
        :param in_htmltext: Optional HTML version of the message body
        :param attachment: Path to a file to attach (optional)
        :param filename: Filename to show in email for the attachment (optional)
        """
        self.html_ready = in_htmltext is not None

        if self.html_ready:
            self.msg = MIMEMultipart('alternative')  # Allows plain + HTML

            # Optional file attachment
            if attachment and filename:
                try:
                    part = MIMEBase('application', "octet-stream")
                    with open(attachment, "rb") as f:
                        part.set_payload(f.read())
                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition', f"attachment; filename={filename}")
                    self.msg.attach(part)
                except Exception as e:
                    print(f"[EMAIL ATTACHMENT ERROR] {e}")

            self.msg.attach(MIMEText(in_plaintext, 'plain'))
            self.msg.attach(MIMEText(in_htmltext, 'html'))

        else:
            # Plaintext-only email
            self.msg = MIMEText(in_plaintext, 'plain')

        self.msg['Subject'] = in_subject
        self.msg['From'] = in_from if in_from else self.username
        self.msg["To"] = None  # Will be set per recipient
        self.msg["CC"] = None
        self.msg["BCC"] = None


    def clear_message(self):
        """
        Remove the whole email body. If both plaintext and html are attached both are removed
        """
        self.msg.set_payload("")

    def set_subject(self, in_subject):
        self.msg.replace_header("Subject", in_subject)

    def set_from(self, in_from):
        self.msg.replace_header("From", in_from)

    def set_plaintext(self, in_body_text):
        """
        Set plaintext message: replaces entire payload if no html is used, otherwise replaces the plaintext only

        :param in_body_text: Plaintext email body, replaces old plaintext email body
        """
        if not self.html_ready:
            self.msg.set_payload(in_body_text)
        else:
            payload = self.msg.get_payload()
            payload[0] = MIMEText(in_body_text)
            self.msg.set_payload(payload)

    def set_html(self, in_html):
        """
        Replace HTML version of the email body. The plaintext version is unaffected.

        :param in_html: HTML email body, replaces old HTML email body
        """
        try:
            payload = self.msg.get_payload()
            payload[1] = MIMEText(in_html, 'html')
            self.msg.set_payload(payload)
        except TypeError:
            print("ERROR: "
                  "Payload is not a list. Specify an HTML message with in_htmltext in MailSender.set_message()")
            raise

    def set_recipients(self, in_recipients):
        """
        Sets the list of recipients' email addresses. This is used by the email sending functions.

        :param in_recipients: All recipients to whom the email should be sent (Must be a list, even when there is only one recipient)
        """
        if not isinstance(in_recipients, (list, tuple)):
            raise TypeError("Recipients must be a list or tuple, is {}".format(type(in_recipients)))

        self.recipients = in_recipients

    def add_recipient(self, in_recipient):
        """Adds a recipient to the back of the list

        :param in_recipient: Recipient email addresses
        """
        self.recipients.append(in_recipient)

    def connect(self):
        """
        Must be called before sending messages. Connects to SMTP server using the username and password.
        """
        if not self.use_SSL:
            self.smtpserver.starttls()
        self.smtpserver.login(self.username, self.password)
        self.connected = True
        print("Connected to {}".format(self.server_name))

    def disconnect(self):
        self.smtpserver.close()
        self.connected = False

    def send_all(self, close_connection=True):
        """Sends message to all specified recipients, one at a time. Optionally closes connection after sending. Close the connection after sending if you are not sending another batch of emails immediately after.

        :param close_connection: Should the connection to the server be closed after all emails have been sent (True) or not (False)
         """
        if not self.connected:
            raise ConnectionError("Not connected to any server. Try self.connect() first")

        print("Message: {}".format(self.msg.get_payload()))

        for recipient in self.recipients:
                self.msg.replace_header("To", recipient)
                print("Sending to {}".format(recipient))
                self.smtpserver.send_message(self.msg)

        print("All messages sent")

        if close_connection:
            self.disconnect()
            print("Connection closed")
