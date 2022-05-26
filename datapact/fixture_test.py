# pylint: disable=redefined-outer-name

import pytest
import pandas
import dask.dataframe

from datapact import compute


iris_pandas = pandas.read_csv("datapact/iris.csv")
iris_dask = dask.dataframe.read_csv("datapact/iris.csv")


@pytest.fixture(params=[iris_pandas, iris_dask], ids=["pandas", "dask"])
def iris_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture_iris_df(iris_df: pandas.DataFrame):
    assert compute(iris_df.size) == 750


covid_pandas = pandas.read_csv("datapact/covid.csv")
covid_dask = dask.dataframe.read_csv("datapact/covid.csv")


@pytest.fixture(params=[covid_pandas, covid_dask], ids=["pandas", "dask"])
def covid_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture_covid_df(covid_df: pandas.DataFrame):
    assert compute(covid_df.size) == 1199988
