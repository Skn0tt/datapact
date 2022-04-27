"""
demo docstring
"""

from typing import Optional, ContextManager, Union
import pandas
import pystache
import scipy.stats


def connect(server: str = "datafox.dev", api_key: Optional[str] = None):
    """
    demo docstring
    """
    print(server, api_key)


def generate_report(_filename: str):
    """
    collects all executed tests and generates a report
    """


class SeriesTest(ContextManager):
    """
    wraps a column
    """

    parent: "DataframeTest"
    series: pandas.Series
    title: str
    description: str
    unit: str

    def __init__(self, parent: "DataframeTest", series: pandas.Series):
        self.parent = parent
        self.series = series

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

    @property
    def should(self):
        """
        warning-test
        """
        return Asserter(self, critical=False)

    @property
    def must(self):
        """
        failure-test
        """
        return Asserter(self, critical=True)

    @property
    def should_not(self):
        """
        negated warning-test
        """
        return Asserter(self, critical=False, negated=True)

    @property
    def must_not(self):
        """
        negated failure-test
        """
        return Asserter(self, critical=True, negated=True)

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self

    def report(self, error: str):
        """
        demo docstring
        """
        self.parent.report(self.series.name, error)

    def __repr__(self):
        return self.parent.__repr__()  # pylint: disable=protected-access

    def _repr_html_(self):
        return self.parent._repr_html_()  # pylint: disable=protected-access


class Asserter:
    """
    demo docstring
    """

    parent: SeriesTest
    critical: bool
    negated: bool

    def __init__(self, parent: SeriesTest, critical: bool, negated: bool = False):
        self.parent = parent
        self.critical = critical
        self.negated = negated

    @property
    def series(self):
        return self.parent.series

    def report(self, error: str):
        self.parent.report(error)

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

    def be_between(
        self, minimum: Union[int, float, str], maximum: Union[int, float, str]
    ):
        """
        demo docstring
        """
        self.be_numbers()

        found_min = self.series.min()
        found_max = self.series.max()

        extends_left = found_min < minimum
        extends_right = found_max > maximum

        if extends_left and extends_right:
            self.report(
                f"out of range. expected to be in ({minimum}, {maximum}) \n"
                + f"but found ({found_min}, {found_max})."
            )
        elif extends_left:
            self.report(
                f"expected values to be at least {minimum}, but found {found_min}"
            )
        elif extends_right:
            self.report(
                f"expected values to be at most {maximum}, but found {found_max}"
            )

        return self

    def be_normal(self, alpha=0.05):
        """
        demo docstring
        """
        stat, p = scipy.stats.normaltest(self.series)
        if p < alpha:
            self.report(f"not normal. p={p}, stat={stat}")
        return self

    def __repr__(self):
        return self.parent.__repr__()  # pylint: disable=protected-access

    def _repr_html_(self):
        return self.parent._repr_html_()  # pylint: disable=protected-access


class DataframeTest:
    """
    some demo doc
    """

    dataframe: pandas.DataFrame
    title: str
    description: str
    reports: "list[str]" = []

    def __init__(self, dataframe: pandas.DataFrame):
        self.dataframe = dataframe
        super().__init__()

    def describe(self, title: Optional[str] = None, description: Optional[str] = None):
        """
        demo docstring
        """
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        return self

    def __getattr__(self, attr) -> SeriesTest:
        """
        demo docstring
        """
        if not attr in self.dataframe.columns:
            raise AttributeError
        series = self.dataframe[attr]
        return SeriesTest(self, series)

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self

    def report(self, column: str, error: str):
        self.reports.append(f"{column}: {error}")

    def __repr__(self):
        return pystache.render(
            """
{{#reports}}
- {{.}}
{{/reports}}
""",
            {"reports": self.reports},
        )

    def _repr_html_(self):
        return pystache.render(
            """
<h1>Reports:</h1>
<ul>
    {{#reports}}
    <li>{{.}}</li>
    {{/reports}}
</ul>
""",
            {"reports": self.reports},
        )


def test(dataframe: pandas.DataFrame):
    """
    demo docstring
    """
    return DataframeTest(dataframe)
