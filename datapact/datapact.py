import datetime
from functools import wraps
import importlib.resources
import inspect
import json
from typing import Callable, Optional
from dataclasses import dataclass, field
from numpy import int64

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
    failed_sample_indices: Optional[list] = None
    failed_sample: Optional[pandas.DataFrame] = None

    @staticmethod
    def Fail(message: str, failed_sample_indices=None, **kwargs):
        return Expectation(
            success=False,
            message=message,
            failed_sample_indices=failed_sample_indices,
            result=kwargs,
        )

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
            "failed_sample_indices": [
                coerce_to_json(i) for i in self.failed_sample_indices
            ]
            if self.failed_sample_indices
            else None,
            "failed_sample": self.failed_sample.to_dict(orient="records")
            if self.failed_sample is not None
            else None,
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

def coerce_to_json(arg):
    if inspect.isfunction(arg):
        return arg.__name__
    if isinstance(arg, int64):
        return int(arg)
    return arg


def expectation(func):
    @wraps(func)
    def wrap(self, *args, **kwargs):
        result: "Expectation" = func(self, *args, **kwargs)
        if not result.name:
            result.name = func.__name__
        result.critical = self.critical
        result.parent = self.parent.parent

        result.args = {**kwargs}
        for i, parameter in enumerate(inspect.signature(func).parameters.values()):
            if parameter.name == "self":
                continue
            if parameter.kind in [
                inspect.Parameter.VAR_KEYWORD,
                inspect.Parameter.VAR_POSITIONAL,
            ]:
                result.args[parameter.name] = [coerce_to_json(arg) for arg in args]
            else:
                result.args[parameter.name] = coerce_to_json(
                    args[i - 1] if len(args) >= i else parameter.default
                )

        if result.failed_sample_indices and not result.failed_sample:
            if type(self.parent.parent.dataframe) == pandas.DataFrame:
                result.failed_sample = self.parent.parent.dataframe.filter(
                    items=result.failed_sample_indices, axis=0
                )

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
        if type(self.series) is not pandas.Series:
            # TODO: implement for dask
            return None

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
                failed_sample_indices=[
                    compute(self.series.idxmin()),
                    compute(self.series.idxmax()),
                ],
                **result,
            )
        elif extends_left:
            return Expectation.Fail(
                f"expected values to be at least {minimum}, but found {found_min}",
                failed_sample_indices=[compute(self.series.idxmin())],
                **result,
            )
        elif extends_right:
            return Expectation.Fail(
                f"expected values to be at most {maximum}, but found {found_max}",
                failed_sample_indices=[compute(self.series.idxmax())],
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
                f"negative value found: min is {found_min}",
                failed_sample_indices=[compute(self.series.idxmin())],
                **result,
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
                f"positive value found: max is {found_max}",
                failed_sample_indices=[compute(self.series.idxmax())],
                **result,
            )

        return Expectation.Pass(**result)

    @expectation
    def not_be_null(self):
        """
        checks if all values are non-null.

        Examples:
            >>> dp.user_id.must.not_be_null()
        """

        null_index = self.series.isnull().first_valid_index()

        if null_index:
            return Expectation.Fail(
                "found null values",
                failed_sample_indices=[null_index],
            )

        return Expectation.Pass()

    @expectation
    def not_be_na(self):
        """
        checks if all values are non-na.

        Examples:
            >>> dp.user_id.must.not_be_na()
        """

        na_index = self.series.isna().first_valid_index()

        if na_index:
            return Expectation.Fail("found na values", failed_sample_indices=[na_index])

        return Expectation.Pass()

    @expectation
    def be_one_of(self, *allowed_values):
        """
        checks if values are in the allowed values.

        Examples:
            >>> dp.state.must.be_one_of("active", "sleeping", "inactive")
        """

        existing = set(compute(self.series.unique()))
        expected = set(allowed_values)

        additional = existing - expected

        used_pct = len(existing) / len(expected)

        if len(additional) > 0:
            additional_values = list(additional)
            additional_values.sort()

            return Expectation.Fail(
                f"found additional values: {additional_values}",
                failed_sample_indices=[
                    compute(self.series.eq(value)).idxmax()
                    for value in additional_values[:5]
                ],
                used_pct=used_pct,
            )

        return Expectation.Pass(used_pct=used_pct)

    @expectation
    def be_date(self):
        """
        checks if all values are ISO8601-compliant dates.
        datetimes will be rejected.

        Examples:
            >>> dp.day.must.be_date()
        """

        rejected = compute(
            self.series[-self.series.str.match(r"\d{4}-\d{2}-\d{2}")].index
        ).to_list()

        if len(rejected) > 0:
            return Expectation.Fail(
                "found non-date values", failed_sample_indices=rejected[:5]
            )

        return Expectation.Pass()

    @expectation
    def be_datetime(self):
        """
        checks if all values are ISO8601-compliant datetimes.

        Examples:
            >>> dp.timestamp.must.be_datetime()
        """

        rejected = compute(
            self.series[-pandas.to_datetime(self.series, errors="coerce").isna()].index
        ).to_list()

        if len(rejected) > 0:
            return Expectation.Fail(
                "found non-datetime values", failed_sample_indices=rejected[:5]
            )

        return Expectation.Pass()

    @expectation
    def be_unix_epoch(self):
        """
        checks if all values are unix epoch-compliant timestamps.

        Examples:
            >>> dp.timestamp.must.be_unix_epoch()
        """

        found_min = compute(self.series.min())
        found_max = compute(self.series.max())

        result = {
            "minimum": found_min,
            "maximum": found_max,
        }

        if found_min < 0:
            return Expectation.Fail(
                f"unix epoch times should be positive. found {found_min}, which is before 1970.",
                failed_sample_indices=[compute(self.series.idxmin())],
                **result,
            )

        max_timestamp = datetime.datetime(2100, 0, 0).timestamp()
        if found_max > max_timestamp:
            return Expectation.Fail(
                f"found {found_max}, which is after the year 2100",
                failed_sample_indices=[compute(self.series.idxmax())],
                **result,
            )

        return Expectation.Pass(**result)

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

    def expectations(self) -> "list[Expectation]":
        """
        Returns a list of all executed expectations.
        """
        result = []
        for s in self.collect().series:
            result += s.expectations
        return result

    def failed_expectations(self) -> Expectation:
        """
        Returns a list of all failed expectations.
        """
        return [e for e in self.expectations() if not e.success]

    def failed_critical_expectations(self) -> Expectation:
        """
        Returns a list of all failed critical expectations.
        """
        return [e for e in self.failed_expectations() if e.critical]

    def is_failure(self) -> bool:
        """
        Returns True if one of the expectations failed.
        """
        return len(self.failed_expectations()) > 0

    def is_critical_failure(self) -> bool:
        """
        Returns True if a critical expectation failed.
        """
        return len(self.failed_critical_expectations()) > 0

    def check(self):
        """
        Raises an exception if a critical expectation failed.
        """
        if self.is_critical_failure():
            raise Exception("critical expectation failed")

    def _repr_markdown_(self):
        """
        see https://ipython.readthedocs.io/en/stable/config/integrating.html#rich-display
        """
        result = self.collect()

        md = ""

        for series in result.series:
            md += f"**{series.name}**  \n"
            for e in series.expectations:
                if e.success:
                    md += f"✅ {e.name}  \n"
                else:
                    md += f"❌ {e.name}: {e.message}  \n"
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
