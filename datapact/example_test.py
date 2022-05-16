"""
tests example
"""

import pytest
import pandas
import dask.dataframe
import dask.delayed
from datapact.example import add_one


def compute(value):
    if "compute" in dir(value):
        return value.compute()
    return value


def test_add_one():
    """
    test
    """
    assert add_one(10) == 11


iris_pandas = pandas.read_csv("datapact/iris.csv")
iris_dask = dask.dataframe.read_csv("datapact/iris.csv")


@pytest.fixture(params=[iris_pandas, iris_dask])
def iris_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture(iris_df: pandas.DataFrame):
    assert compute(iris_df.size) == 750
