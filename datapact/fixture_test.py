"""
tests example
"""

import pytest
import pandas
import dask.dataframe

from datapact.datapact import compute


iris_pandas = pandas.read_csv("datapact/iris.csv")
iris_dask = dask.dataframe.read_csv("datapact/iris.csv")


@pytest.fixture(params=[iris_pandas, iris_dask], ids=["pandas", "dask"])
def iris_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture(iris_df: pandas.DataFrame):
    assert compute(iris_df.size) == 750
