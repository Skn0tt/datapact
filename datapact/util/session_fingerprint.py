import os
import platform

import urllib.parse


def get_login():
    return os.path.expanduser("~")


def get_session_fingerprint() -> str:
    return urllib.parse.quote(f"{get_login()}@{platform.node()}", safe="")
