"""
demo docstring
"""

import os
import subprocess
import pwd
import platform
from typing import Callable, Optional
import urllib.parse
import re

import pandas
import pystache
import requests

from datafox.expectations.BeNormal import BeNormal
from datafox.expectations.BeBetween import BeBetween
from datafox.expectations.NotBeNull import NotBeNull
from datafox.schema import (
    Line,
    DataframeTestEvaluationResult,
    SeriesTestEvaluationResult,
)


class SeriesExpectation:
    """
    demo docstring
    """

    def __init__(
        self,
        asserter: "Asserter",
        name: str,
        execute_callable: Callable[[pandas.Series, Line], None],
        meta: dict,
    ):
        self.execute_callable = execute_callable
        self.line = Line(name, critical=asserter.critical, meta=meta)

    def execute(self, series: pandas.Series):
        self.execute_callable(series, self.line)
        return self.line


def get_login():
    return pwd.getpwuid(os.getuid())[0]


def get_session_fingerprint() -> str:
    return urllib.parse.quote(f"{get_login()}@{platform.node()}", safe="")


def get_github_url() -> Optional[str]:
    originUrlP = subprocess.run(
        ["git", "remote", "get-url", "origin"], check=False, capture_output=True
    )
    if originUrlP.returncode != 0:
        return None

    originUrl = originUrlP.stdout.decode("utf-8").strip()
    match = re.search(r"git@github\.com:(.*)\/(.*)\.git", originUrl)
    if match is None:
        return None
    org = match.group(1)
    repo = match.group(2)

    refP = subprocess.run(
        ["git", "show", "-s", "--format=%H"], check=True, capture_output=True
    )
    ref = refP.stdout.decode("utf-8").strip()

    url = f"https://github.com/{org}/{repo}/tree/{ref}"

    isClean = (
        subprocess.run(
            ["git", "diff", "--exit-code"], check=False, capture_output=True
        ).returncode
        == 0
    )
    if not isClean:
        url += "#dirty"

    return url


class SeriesTest:
    """
    wraps a column
    """

    def __init__(self, parent: "DataframeTest", series: pandas.Series):
        self.parent = parent
        self.series = series
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.unit: Optional[str] = None
        self.should = Asserter(series, critical=False)
        self.must = Asserter(series, critical=True)

    def describe(
        self,
        title: Optional[str] = None,
        description: Optional[str] = None,
        unit: Optional[str] = None,
    ):
        """
        demo docstring
        """
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if unit is not None:
            self.unit = unit
        return self

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self

    def report(self, error: str):
        """
        demo docstring
        """
        self.parent.report(self.series.name, error)


class Asserter(NotBeNull, BeBetween, BeNormal):
    """
    demo docstring
    """

    def __init__(self, series: pandas.Series, critical: bool):
        for base in self.__class__.__bases__:
            if hasattr(base, "__init__"):
                base.__init__(self)

        self.series = series
        self.critical = critical
        self.expectations: "list[SeriesExpectation]" = []

    def record(
        self,
        _type: str,
        execute: Callable[[pandas.Series, "Line"], None],
        meta: dict = None,
    ):
        self.expectations.append(SeriesExpectation(self, _type, execute, meta))


# pylint: disable=too-many-instance-attributes
class DataframeTest:
    """
    some demo doc
    """

    def __init__(self, dataframe: pandas.DataFrame):
        self.dataframe = dataframe
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.url: Optional[str] = get_github_url()
        self.reports: "list[str]" = []
        self.series_tests: "dict[str, SeriesTest]" = {}
        self.server: Optional[str] = None
        self.token: Optional[str] = None
        super().__init__()

    def connect(self, server: str = "datafox.dev", token: Optional[str] = None):
        if "://" not in server:
            server = "https://" + server
        self.server = server
        self.token = token

    def is_connected(self):
        return self.token is not None

    def upload(self, result: DataframeTestEvaluationResult):
        requests.put(
            f"{self.server}/api/v1/testruns/{get_session_fingerprint()}",
            headers={"Authorization": f"Bearer {self.token}"},
            json=result.to_dict(),  # pyright: reportGeneralTypeIssues=false
        )

    def describe(
        self,
        title: Optional[str] = None,
        description: Optional[str] = None,
        url: Optional[str] = None,
    ):
        """
        demo docstring
        """
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if url is not None:
            self.url = url
        return self

    def get_series_test(self, series: pandas.Series):
        if not series.name in self.series_tests:
            self.series_tests[series.name] = SeriesTest(self, series)
        return self.series_tests[series.name]

    def __getattr__(self, attr) -> SeriesTest:
        if not attr in self.dataframe.columns:
            raise AttributeError
        series = self.dataframe[attr]
        return self.get_series_test(series)

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self

    def evaluate(self) -> DataframeTestEvaluationResult:
        """
        Runs all tests on the dataframe.
        If connected, uploads results.
        Returns a JSON representation of the results. (TODO: make this a real JSON)
        """

        result = DataframeTestEvaluationResult(self.title, self.description, self.url)

        for series_test in self.series_tests.values():
            series_result = SeriesTestEvaluationResult(
                series_test.series.name,
                series_test.title,
                series_test.description,
                series_test.unit,
            )
            result.series.append(series_result)

            for asserter in [series_test.should, series_test.must]:
                for expectation in asserter.expectations:
                    line = expectation.execute(series_test.series)
                    series_result.lines.append(line)

        if self.is_connected():
            self.upload(result)

        return result

    def report(self, column: str, error: str):
        self.reports.append(f"`{column}`: {error}")

    def __repr__(self):
        self.evaluate()
        return pystache.render(
            """
{{#reports}}
- {{.}}
{{/reports}}
""",
            {"reports": self.reports},
        )

    def _repr_markdown_(self):
        """
        see https://ipython.readthedocs.io/en/stable/config/integrating.html#rich-display
        """
        self.evaluate()
        return pystache.render(
            """
reports:
{{#reports}}
- {{.}}
{{/reports}}
""",
            {"reports": self.reports},
        )


def test(dataframe: pandas.DataFrame):
    """
    demo docstring
    """
    return DataframeTest(dataframe)
