from typing import Callable, Protocol

import pandas

from datafox.schema import Line


class ExpectationProtocol(Protocol):
    series: pandas.Series

    def record(
        self,
        _type: str,
        execute: Callable[[pandas.Series, Line, dict], None],
        meta: dict = None,
    ):
        ...
