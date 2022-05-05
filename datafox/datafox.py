"""
demo docstring
"""

from abc import abstractmethod
from dataclasses import dataclass, field
from typing import Optional, ContextManager
import os
import subprocess
import pwd
import platform
import urllib.parse
import re

import pandas
import pystache
import scipy.stats
import requests
from dataclasses_json import dataclass_json


class SeriesExpectation:
    """
    demo docstring
    """

    def __init__(self):
        self.success = True
        self.message: Optional[str] = None

    def fail(self, message: str):
        self.success = False
        self.message = message

    @abstractmethod
    def execute(self, series: pandas.Series):
        pass

    def to_line(self, critical: bool):
        meta = self.__dict__.copy()
        meta.pop("success")
        meta.pop("message")
        return Line(self.__class__.__name__, self.success, critical, self.message, meta)


class IsBetween(SeriesExpectation):
    """
    demo docstring
    """

    def __init__(self, minimum: float, maximum: float):
        self.minimum = minimum
        self.maximum = maximum
        super().__init__()

    def execute(self, series: pandas.Series):
        found_min = series.min()
        found_max = series.max()

        extends_left = found_min < self.minimum
        extends_right = found_max > self.maximum

        if extends_left and extends_right:
            self.fail(
                f"out of range. expected to be in $({self.minimum}, {self.maximum})$ \n"
                + f"but found $({found_min}, {found_max})$."
            )
        elif extends_left:
            self.fail(
                f"expected values to be at least ${self.minimum}$, but found ${found_min}$"
            )
        elif extends_right:
            self.fail(
                f"expected values to be at most ${self.maximum}$, but found ${found_max}$"
            )


class IsNormal(SeriesExpectation):
    """
    demo docstring
    """

    def __init__(self, alpha: float):
        self.alpha = alpha
        super().__init__()

    def execute(self, series: pandas.Series):
        stat, p = scipy.stats.normaltest(series)
        if p < self.alpha:
            self.fail(f"not normal. p={p}, stat={stat}")


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


class SeriesTest(ContextManager):
    """
    wraps a column
    """

    def __init__(self, parent: "DataframeTest", series: pandas.Series):
        self.parent = parent
        self.series = series
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.unit: Optional[str] = None
        self.should = Asserter(self, critical=False)
        self.must = Asserter(self, critical=True)

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


class Asserter:
    """
    demo docstring
    """

    def __init__(self, parent: SeriesTest, critical: bool):
        self.parent = parent
        self.critical = critical
        self.expectations: "list[SeriesExpectation]" = []

    @property
    def series(self):
        return self.parent.series

    def report(self, error: str):
        self.parent.report(error)

    def add_expectation(self, expectation: SeriesExpectation):
        self.expectations.append(expectation)

    def be_numbers(self):
        """
        demo docstring
        """
        return self

    def contain_null(self):
        """
        demo docstring
        """
        return self

    def be_between(self, minimum: float, maximum: float):
        self.add_expectation(IsBetween(minimum, maximum))
        return self

    def be_normal(self, alpha=0.05):
        self.add_expectation(IsNormal(alpha))
        return self


@dataclass_json
@dataclass
class Line:
    """
    demo docstring
    """

    type: str
    success: bool
    critical: bool
    message: Optional[str]
    meta: dict


@dataclass_json
@dataclass
class SeriesTestEvaluationResult:
    """
    demo docstring
    """

    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    lines: "list[Line]" = field(default_factory=list)


@dataclass_json
@dataclass
class DataframeTestEvaluationResult:
    """
    demo docstring
    """

    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    series: "list[SeriesTestEvaluationResult]" = field(default_factory=list)


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
                    expectation.execute(series_test.series)
                    line = expectation.to_line(asserter.critical)
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
