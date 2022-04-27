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

    def __init__(self, parent: "DataframeTest", series: pandas.Series):
        self.parent = parent
        self.series = series
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.unit: Optional[str] = None

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
                f"out of range. expected to be in $({minimum}, {maximum})$ \n"
                + f"but found $({found_min}, {found_max})$."
            )
        elif extends_left:
            self.report(
                f"expected values to be at least ${minimum}$, but found ${found_min}$"
            )
        elif extends_right:
            self.report(
                f"expected values to be at most ${maximum}$, but found ${found_max}$"
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


class DataframeTest:
    """
    some demo doc
    """

    def __init__(self, dataframe: pandas.DataFrame):
        self.dataframe = dataframe
        self.title: Optional[str] = None
        self.description: Optional[str] = None
        self.reports: "list[str]" = []
        self.series_tests: "dict[str, SeriesTest]" = {}
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

    def report(self, column: str, error: str):
        self.reports.append(f"`{column}`: {error}")

    def __repr__(self):
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
