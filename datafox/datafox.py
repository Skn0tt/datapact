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


class SeriesTest(ContextManager):
    """
    demo docstring
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

    def expect_numbers(self) -> "SeriesTest":
        """
        demo docstring
        """
        return self

    def expect_not_null(self) -> "SeriesTest":
        """
        demo docstring
        """
        return self

    def expect_between(
        self, minimum: Union[int, float, str], maximum: Union[int, float, str]
    ) -> "SeriesTest":
        """
        demo docstring
        """
        print(minimum, maximum)
        return self

    def expect_normal(self, alpha) -> "SeriesTest":
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
