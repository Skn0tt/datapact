from functools import wraps
import importlib.resources
import inspect
import json
import os
from pathlib import Path
import subprocess
import pwd
import platform
from typing import Optional
import urllib.parse
import re

import pandas
import requests
import scipy.stats

from datapact.schema import (
    Expectation,
    DataframeResult,
    SeriesResult,
)


def compute(value):
    if "compute" in dir(value):
        return value.compute()
    return value


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


def expectation(func):
    @wraps(func)
    def wrap(self, *args, **kwargs):
        result: "Expectation" = func(self, *args, **kwargs)
        result.name = func.__name__
        result.critical = self.critical

        args_names = list(inspect.signature(func).parameters.keys())[1:]
        result.args = {
            **dict(zip(args_names, args)),
            **kwargs,
        }

        self.expectations.append(result)
        return result

    return wrap


class Asserter:
    def __init__(self, parent: SeriesTest, critical: bool):
        self.parent = parent
        self.series = parent.series
        self.critical = critical
        self.expectations: "list[Expectation]" = []

    def bins(self):
        bins = pandas.cut(self.series, bins=10).value_counts()
        return json.loads(bins.to_json())

    @expectation
    def be_normal(self, alpha: float = 0.05):
        """
        performs a normaltest.

        uses `scipy.stats.normaltest` under the hood.

        Args:
            alpha :
                sensitivity of the test. low value = more sensitive.

        Examples:
            >>> de.salary.should.be_normal(alpha=0.1)
        """

        stat, p = scipy.stats.normaltest(self.series)
        bins = self.bins()

        result = {"stat": stat, "p": p, "bins": bins}

        if p < alpha:
            return Expectation.Fail(f"not normal. p={p}, stat={stat}", **result)

        return Expectation.Pass(**result)

    @expectation
    def be_between(self, minimum: float, maximum: float):
        """
        checks the value range.

        Args:
            minimum :
                if there's a value lower than this, it will fail.
            maximum :
                if there's a value higher than this, it will fail.

        Examples:
            >>> de.age.should.be_between(0, 150)
        """

        found_min = compute(self.series.min())
        found_max = compute(self.series.max())

        result = {
            "minimum": found_min,
            "maximum": found_max,
        }

        extends_left = found_min < minimum
        extends_right = found_max > maximum

        if extends_left and extends_right:
            return Expectation.Fail(
                f"out of range. expected to be in $({minimum}, {maximum})$ \n"
                + f"but found $({found_min}, {found_max})$.",
                **result,
            )
        elif extends_left:
            return Expectation.Fail(
                f"expected values to be at least ${minimum}$, but found ${found_min}$",
                **result,
            )
        elif extends_right:
            return Expectation.Fail(
                f"expected values to be at most ${maximum}$, but found ${found_max}$",
                **result,
            )

        return Expectation.Pass(**result)

    @expectation
    def be_positive(self):
        """
        checks if all values are 0 or higher.

        Examples:
            >>> de.age.should.be_positive()
        """

        found_min = compute(self.series.min())

        result = {"minimum": found_min}

        if found_min < 0:
            return Expectation.Fail(
                f"negative value found: min is {found_min}", **result
            )

        return Expectation.Pass(**result)

    @expectation
    def be_negative(self):
        """
        checks if all values are 0 or smaller.

        Examples:
            >>> de.debt.should.be_negative()
        """

        found_max = self.series.max()

        result = {"maximum": found_max}

        if found_max < 0:
            return Expectation.Fail(
                f"positive value found: max is {found_max}", **result
            )

        return Expectation.Pass(**result)

    @expectation
    def not_be_null(self):
        """
        checks if there are any null values.

        Examples:
            >>> de.user_id.must.not_be_null()
        """

        if self.series.isnull().values.any():
            return Expectation.Fail("found null values")

        return Expectation.Pass()

    @expectation
    def be_one_of(self):
        """
        checks if there's any value not in the given list.

        Examples:
            >>> de.state.must.be_one_of("active", "sleeping", "inactive")
        """

        raise Exception("not implemented")


class DataframeTest:
    def __init__(self, dataframe: pandas.DataFrame):
        self.dataframe = dataframe
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.url: Optional[str] = get_github_url()
        self.series_tests: "dict[str, SeriesTest]" = {}
        self.server: Optional[str] = None
        self.token: Optional[str] = None

    def connect(self, server: str = "datafox.dev", token: Optional[str] = None):
        if "://" not in server:
            server = "https://" + server
        self.server = server
        self.token = token

    def is_connected(self):
        return self.token is not None

    def upload(self, result: DataframeResult):
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

    def collect(self) -> DataframeResult:
        """
        Runs all tests on the dataframe.
        If connected, uploads results.
        Returns a JSON representation of the results. (TODO: make this a real JSON)
        """

        result = DataframeResult(self.title, self.description, self.url)

        for series_test in self.series_tests.values():
            series_result = SeriesResult(
                series_test.series.name,
                series_test.title,
                series_test.description,
                series_test.unit,
                series_test.should.expectations + series_test.must.expectations,
            )
            result.series.append(series_result)

        if self.is_connected():
            self.upload(result)

        return result

    def __repr__(self):
        return self._repr_markdown_()

    def _repr_markdown_(self):
        """
        see https://ipython.readthedocs.io/en/stable/config/integrating.html#rich-display
        """
        result = self.collect()

        md = ""

        for series in result.series:
            md += f"**{series.name}**  \n"
            for expectation in series.expectations:
                md += expectation._repr_markdown_()
                md += "  \n"
            md += "\n"

        return md

    def _repr_html_(self):
        result = self.collect()

        js = importlib.resources.read_text(
            "datapact.javascript", "entrypoint.js", encoding="utf-8"
        )

        html = f"""
<script>{js}</script>
<div id="root" />
<script>
    window.renderVisualisation(
        document.getElementById('root'),
        {json.dumps(result.to_dict())}
    )
</script>
        """.strip()

        return html


def test(dataframe: pandas.DataFrame):
    """
    demo docstring
    """
    return DataframeTest(dataframe)
