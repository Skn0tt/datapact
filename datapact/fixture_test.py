# pylint: disable=redefined-outer-name

from numpy import dtype, random
import pytest
import pandas
import dask.dataframe

from datapact import compute


iris_pandas = pandas.read_csv("datapact/iris.csv")
iris_dask = dask.dataframe.read_csv(  # pyright: ignore [reportPrivateImportUsage]
    "datapact/iris.csv"
)


@pytest.fixture(params=[iris_pandas, iris_dask], ids=["pandas", "dask"])
def iris_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture_iris_df(iris_df: pandas.DataFrame):
    assert compute(iris_df.size) == 750


covid_pandas = pandas.read_csv("datapact/covid.csv")
covid_pandas_typed = pandas.read_csv(
    "datapact/covid.csv",
    dtype={
        "area_id": "category",
        "age group": "category",
        "sex": "category",
        "infection_start": "uint",
        "new_case": "uint",
        "new_death": "uint",
        "new_recovered": "int",
        "number_cases": "uint",
        "number_deaths": "uint",
        "number_recovered": "uint",
    },
    parse_dates=["report_date", "ref_date"],
)
covid_dask = dask.dataframe.read_csv(  # pyright: ignore [reportPrivateImportUsage]
    "datapact/covid.csv"
)


@pytest.fixture(
    params=[covid_pandas, covid_pandas_typed, covid_dask],
    ids=["pandas", "pandas_typed", "dask"],
)
def covid_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture_covid_df(covid_df: pandas.DataFrame):
    assert compute(covid_df.size) == 1199988


def test_fixture_pandas_typed():
    assert isinstance(covid_pandas_typed.area_id.dtype, pandas.CategoricalDtype)
    assert covid_pandas_typed.report_date.dtype == dtype("datetime64[ns]")


contrived_pandas = pandas.read_csv("datapact/contrived.csv")
contrived_dask = dask.dataframe.read_csv(  # pyright: ignore [reportPrivateImportUsage]
    "datapact/contrived.csv"
)


@pytest.fixture(params=[contrived_pandas, contrived_dask], ids=["pandas", "dask"])
def contrived_df(request) -> pandas.DataFrame:
    return request.param


def test_fixture_contrived_df(contrived_df: pandas.DataFrame):
    assert contrived_df.optional.dtype == dtype("float64")


random.seed(0)
distribution_pandas = pandas.DataFrame(
    {
        "poisson": random.poisson(5000, 10000),
        "exp": random.exponential(5, 10000),
        "binom": random.binomial(10000, 0.5, 10000),
    }
)
distribution_dask = dask.dataframe.from_pandas(distribution_pandas, npartitions=2)


@pytest.fixture(params=[distribution_pandas, distribution_dask], ids=["pandas", "dask"])
def distribution_df(request) -> pandas.DataFrame:
    return request.param
