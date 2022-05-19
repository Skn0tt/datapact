
import os
import platform
import pwd

import urllib.parse


def get_login():
    return pwd.getpwuid(os.getuid())[0]


def get_session_fingerprint() -> str:
    return urllib.parse.quote(f"{get_login()}@{platform.node()}", safe="")
