from datapact.util.session_fingerprint import get_login
from .session_fingerprint import get_session_fingerprint


def test_session_fingerprint():
    assert isinstance(get_session_fingerprint(), str)
    assert get_session_fingerprint() == get_session_fingerprint()
    assert len(get_session_fingerprint()) > 0


def test_get_login():
    assert len(get_login()) > 0
