"""
tests example
"""

from datafox.example import add_one


def test_add_one():
    """
    test
    """
    assert add_one(10) == 11
