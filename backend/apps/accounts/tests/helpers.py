import re


def extract_verification_token(email_message):
    match = re.search(r"token=([^\s]+)", email_message.body)
    assert match, "verification link not found in email body"
    return match.group(1)
