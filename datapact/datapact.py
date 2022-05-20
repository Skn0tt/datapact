from functools import wraps
import importlib.resources
import inspect
import json
from typing import Callable, Optional
from dataclasses import dataclass, field

import pandas
import requests
import scipy.stats

from datapact.util.github import get_github_url
from datapact.util.session_fingerprint import get_session_fingerprint


@dataclass
class Expectation:
    name: str = None
    success: bool = True
    critical: bool = False
    message: Optional[str] = None
    args: dict = field(default_factory=dict)
    result: dict = field(default_factory=dict)
    parent: "DataframeTest" = None

    @staticmethod
    def Fail(message: str, **kwargs):
        return Expectation(success=False, message=message, result=kwargs)

    @staticmethod
    def Pass(message: Optional[str] = None, **kwargs):
        return Expectation(success=True, message=message, result=kwargs)

    def to_dict(self):
        return {
            "name": self.name,
            "success": self.success,
            "critical": self.critical,
            "message": self.message,
            "args": self.args,
            "result": self.result,
        }

    def _repr_markdown_(self):
        if self.parent is not None:
            return self.parent._repr_markdown_()

    def _repr_html_(self):
        if self.parent is not None:
            return self.parent._repr_html_()


@dataclass
class SeriesResult:
    name: str
    title: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    expectations: "list[Expectation]" = field(default_factory=list)

    def to_dict(self):
        return {
            "name": self.name,
            "title": self.title,
            "description": self.description,
            "unit": self.unit,
            "expectations": [e.to_dict() for e in self.expectations],
        }


@dataclass
class DataframeResult:
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    series: "list[SeriesResult]" = field(default_factory=list)

    def to_dict(self):
        return {
            "title": self.title,
            "description": self.description,
            "url": self.url,
            "series": [s.to_dict() for s in self.series],
        }


def compute(value):
    """
    Checks if a value is a Dask Delayed, and computes it.
    """
    if "compute" in dir(value):
        return value.compute()
    return value


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
        if not result.name:
            result.name = func.__name__
        result.critical = self.critical
        result.parent = self.parent.parent

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
    def be_normal_distributed(self, alpha: float = 0.05):
        """
        performs a normaltest.

        uses `scipy.stats.normaltest` under the hood.

        Args:
            alpha :
                sensitivity of the test. low value = more sensitive.

        Examples:
            >>> dp.salary.should.be_normal(alpha=0.1)
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
            >>> dp.age.should.be_between(0, 150)
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
                f"out of range. expected to be in ({minimum}, {maximum}) \n"
                + f"but found ({found_min}, {found_max}).",
                **result,
            )
        elif extends_left:
            return Expectation.Fail(
                f"expected values to be at least {minimum}, but found {found_min}",
                **result,
            )
        elif extends_right:
            return Expectation.Fail(
                f"expected values to be at most {maximum}, but found {found_max}",
                **result,
            )

        return Expectation.Pass(**result)

    @expectation
    def be_positive(self):
        """
        checks if all values are 0 or higher.

        Examples:
            >>> dp.age.should.be_positive()
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
            >>> dp.debt.should.be_negative()
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
            >>> dp.user_id.must.not_be_null()
        """

        if self.series.isnull().values.any():
            return Expectation.Fail("found null values")

        return Expectation.Pass()

    @expectation
    def be_one_of(self, *args):
        """
        checks if there's any value not in the given list.

        Examples:
            >>> dp.state.must.be_one_of("active", "sleeping", "inactive")
        """

        existing = set(compute(self.series.unique()))
        expected = set(args)

        additional = existing - expected

        used_pct = len(existing) / len(expected)

        if len(additional) > 0:
            additional_values = list(additional)
            additional_values.sort()
            return Expectation.Fail(
                f"found additional values: {additional_values}",
                used_pct=used_pct,
            )

        return Expectation.Pass(used_pct=used_pct)

    @expectation
    def be_date(self):
        """
        checks if all values are ISO8601-compliant dates.
        datetimes will be rejected.

        TODO: implement

        Examples:
            >>> dp.day.must.be_date()
        """

        return Expectation.Pass()

    @expectation
    def be_datetime(self):
        """
        checks if all values are ISO8601-compliant datetimes.

        TODO: implement

        Examples:
            >>> dp.timestamp.must.be_datetime()
        """

        return Expectation.Pass()

    @expectation
    def be_unix_epoch(self):
        """
        checks if all values are unix epoch-compliant timestamps.

        TODO: implement

        Examples:
            >>> dp.timestamp.must.be_unix_epoch()
        """

        return Expectation.Pass()

    @expectation
    def fulfill(self, custom_assertion: Callable[[pandas.Series], Optional[str]]):
        """
        checks if series passes your custom validator

        Examples:
            >>> def custom_assertion(series: pandas.Series):
            ...     if series.max() > 100:
            ...         return "too high"
            >>> dp.user_id.must.fulfill(custom_assertion)
        """

        result = Expectation.Pass()
        message = custom_assertion(self.series)
        if message is not None:
            result = Expectation.Fail(message)
        result.name = custom_assertion.__name__
        return result


class DataframeTest:
    def __init__(self, dataframe: pandas.DataFrame):
        self.dataframe = dataframe
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.url: Optional[str] = get_github_url()
        self.series_tests: "dict[str, SeriesTest]" = {}
        self.server: Optional[str] = None
        self.token: Optional[str] = None

    def connect(self, server: str = "track.datapact.dev", token: Optional[str] = None):
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

    def __dir__(self):
        return self.dataframe.columns.to_list()

    def get_series_test(self, series: pandas.Series):
        if not series.name in self.series_tests:
            self.series_tests[series.name] = SeriesTest(self, series)
        return self.series_tests[series.name]

    def __getattr__(self, attr) -> SeriesTest:
        if not attr in self.dataframe.columns:
            raise AttributeError
        series = self.dataframe[attr]
        return self.get_series_test(series)

    def __getitem__(self, key):
        return self.__getattr__(key)

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self

    def collect(self) -> DataframeResult:
        """
        Collects all tests and returns a DataframeResult object.
        If connected, uploads results.
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

    def _repr_markdown_(self):
        """
        see https://ipython.readthedocs.io/en/stable/config/integrating.html#rich-display
        """
        result = self.collect()

        md = ""

        for series in result.series:
            md += f"**{series.name}**  \n"
            for expectation in series.expectations:
                if expectation.success:
                    md += f"✅ {expectation.name}  \n"
                else:
                    md += f"❌ {expectation.name}: {expectation.message}  \n"
            md += "\n"

        return md

    def _repr_html_(self):
        """
        see https://ipython.readthedocs.io/en/stable/config/integrating.html#rich-display
        """
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
    return DataframeTest(dataframe)
