"""
demo docstring
"""

from typing import Optional, ContextManager, Union, overload
import pandas


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

    series: pandas.Series
    title: str
    description: str
    unit: str

    def __init__(self, series: pandas.Series):
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
        return Asserter(self.series, critical=False)

    @property
    def must(self):
        """
        failure-test
        """
        return Asserter(self.series, critical=True)

    @property
    def should_not(self):
        """
        negated warning-test
        """
        return Asserter(self.series, critical=False, negated=True)

    @property
    def must_not(self):
        """
        negated failure-test
        """
        return Asserter(self.series, critical=True, negated=True)

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self


class Asserter:
    """
    demo docstring
    """

    series: pandas.Series
    critical: bool
    negated: bool

    def __init__(self, series: pandas.Series, critical: bool, negated: bool = False):
        self.series = series
        self.critical = critical
        self.negated = negated

    def be_numbers(self) -> "Asserter":
        """
        demo docstring
        """
        return self

    def contain_null(self) -> "Asserter":
        """
        demo docstring
        """
        return self

    def be_between(
        self, minimum: Union[int, float, str], maximum: Union[int, float, str]
    ) -> "Asserter":
        """
        demo docstring
        """
        print(minimum, maximum)
        return self

    def be_normal(self, alpha) -> "Asserter":
        """
        demo docstring
        """
        print(alpha)
        return self


class DataframeTest(ContextManager):
    """
    some demo doc
    """

    dataframe: pandas.DataFrame
    title: str
    description: str

    def __init__(self, dataframe: pandas.DataFrame):
        self.dataframe = dataframe

    def describe(self, title: Optional[str] = None, description: Optional[str] = None):
        """
        demo docstring
        """
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        return self

    def __getattribute__(self, attr) -> SeriesTest:
        """
        demo docstring
        """
        series = getattr(self.dataframe, attr)
        return SeriesTest(series)  # pylint: disable=abstract-class-instantiated

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return self


@overload
def test(dataframe: pandas.DataFrame) -> DataframeTest:
    ...


@overload
def test(dataframe: pandas.Series) -> SeriesTest:
    ...


def test(
    dataframe: Union[pandas.DataFrame, pandas.Series]
) -> Union[pandas.DataFrame, pandas.Series]:
    """
    demo docstring
    """
    if isinstance(dataframe, pandas.DataFrame):
        return DataframeTest(dataframe)  # pylint: disable=abstract-class-instantiated
    if isinstance(dataframe, pandas.Series):
        return SeriesTest(dataframe)  # pylint: disable=abstract-class-instantiated
    raise TypeError("df must be pandas.DataFrame or pandas.Series")
