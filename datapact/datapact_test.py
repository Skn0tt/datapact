# pylint: disable=protected-access,redefined-outer-name

import numpy.random
import scipy.stats
import pandas
import pytest

import datapact
from datapact.datapact import Expectation, compute

from datapact.fixture_test import (  # pylint: disable=unused-import
    iris_df,
    covid_df,
    contrived_df,
    distribution_df,
)


def test_iris(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    dp.SepalLength.describe(
        title="flower Sepal Lenght",
        description="A sepal is a part of the flower of angiosperms.",
        unit="cm",
    )
    be_between = dp.SepalLength.must.be_between(3, 4)
    dp.SepalLength.must.be_positive()

    assert dir(dp) == [
        "Name",
        "PetalLength",
        "PetalWidth",
        "SepalLength",
        "SepalWidth",
    ]

    with pytest.raises(AttributeError):
        dp.NonExistant  # pylint: disable=pointless-statement

    result = dp.collect()
    assert len(result.series) == 1

    sepalLengthResult = result.series[0]
    assert sepalLengthResult.name == "SepalLength"
    assert sepalLengthResult.title == "flower Sepal Lenght"
    assert sepalLengthResult.unit == "cm"
    assert len(sepalLengthResult.expectations) == 2

    assert sepalLengthResult.expectations[0] == be_between
    assert be_between.success is False
    assert be_between.message == "expected values to be at most 4, but found 7.9"
    assert be_between.result == {
        "minimum": 4.3,
        "maximum": 7.9,
    }
    assert be_between.args == {"minimum": 3, "maximum": 4}
    assert be_between._repr_markdown_() == dp._repr_markdown_()

    be_positive = sepalLengthResult.expectations[1]
    assert be_positive.success is True
    assert be_positive.result == {
        "minimum": 4.3,
    }

    def be_bigger_than_3(series: pandas.Series):
        if compute(series.min()) < 3:
            return "must be bigger than 3"
        return None

    custom_result = dp.SepalLength.must.fulfill(be_bigger_than_3)
    assert custom_result.name == "be_bigger_than_3"
    assert custom_result.__repr__() == "be_bigger_than_3: Success"
    assert dp.PetalLength.must.fulfill(be_bigger_than_3).success is False

    expected_markdown = (
        "**SepalLength**  \n"
        + "❌ be_between: expected values to be at most 4, but found 7.9  \n"
        + "✅ be_positive  \n"
        + "✅ be_bigger_than_3  \n\n"
        + "**PetalLength**  \n"
        + "❌ be_bigger_than_3: must be bigger than 3  \n\n"
    )
    assert dp._repr_markdown_() == expected_markdown
    assert dp._repr_html_() == be_positive._repr_html_()
    assert isinstance(dp.collect().to_dict(), dict)


def test_describe(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    dp.describe(title="foo", description="bar", url="https://datapact.dev")
    assert "foo" in dp.to_html()
    assert "bar" in dp.to_html()
    assert "https://datapact.dev" in dp.to_html()


def test_be_normal_distributed(iris_df: pandas.DataFrame, covid_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert dp.SepalWidth.should.be_normal_distributed().success
    assert dp.SepalWidth.should.be_normal_distributed().args == {"alpha": 0.05}
    result = dp.SepalWidth.should.be_normal_distributed().result
    assert 0.1 < result["p"] < 0.2
    assert 3 < result["stat"] < 4

    assert (
        dp.Name.should.be_normal_distributed().message
        == "not numeric. cannot perform normaltest."
    )

    covid_dp = datapact.test(covid_df)
    assert covid_dp.new_case.should.be_normal_distributed().success is False


def test_be_between(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert (
        dp.SepalWidth.should.be_between(3, 4).message
        == "expected values to be in (3, 4), but found (2.0, 4.4)"
    )
    assert (
        dp.SepalWidth.should.be_between(3, 50).message
        == "expected values to be at least 3, but found 2.0"
    )


def test_be_positive(covid_df: pandas.DataFrame):
    dp = datapact.test(covid_df)
    assert dp.new_recovered.should.be_positive().success is False


def test_be_negative(covid_df: pandas.DataFrame):
    copy = covid_df.copy()
    copy["negative"] = copy.new_case * -1
    dp = datapact.test(copy)
    assert dp.negative.should.be_negative().success is True
    assert dp.number_recovered.should.be_negative().success is False


def test_not_be_na(contrived_df: pandas.DataFrame):
    dp = datapact.test(contrived_df)
    assert dp.full.should.not_be_na()
    assert not dp.optional.should.not_be_na()


def test_be_datetime(contrived_df: pandas.DataFrame):
    dp = datapact.test(contrived_df)
    assert dp.datetime.should.be_datetime()
    assert not dp.datetimebroken.should.be_datetime()


def test_be_unix_epoch(contrived_df: pandas.DataFrame):
    dp = datapact.test(contrived_df)
    assert dp.unix.should.be_unix_epoch()
    assert (
        dp.unixtoofar.should.be_unix_epoch().message
        == "found 5000000000, which is after the year 2100"
    )
    assert (
        dp.unixnegative.should.be_unix_epoch().message
        == "unix epoch times should be positive. found -100, which is before 1970."
    )


def test_be_one_of(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert (
        dp.Name.should.be_one_of("Iris-setosa").message
        == "found additional values: ['Iris-versicolor', 'Iris-virginica']"
    )
    if isinstance(iris_df, pandas.DataFrame):
        result = dp.Name.should.be_one_of("Iris-setosa")
        assert result.failed_sample is not None
        assert result.failed_sample.to_dict(orient="list")["Name"] == [
            "Iris-versicolor",
            "Iris-virginica",
        ]
    assert dp.Name.should.be_one_of(
        "Iris-setosa", "Iris-virginica", "Iris-versicolor"
    ).success
    assert (
        dp.Name.should.be_one_of(
            "Iris-setosa", "Iris-virginica", "Iris-versicolor", "additional"
        ).result["used_pct"]
        == 0.75
    )
    assert dp.Name.should.be_one_of(
        "Iris-setosa", "Iris-virginica", "Iris-versicolor", "additional"
    ).args == {
        "allowed_values": [
            "Iris-setosa",
            "Iris-virginica",
            "Iris-versicolor",
            "additional",
        ]
    }


def test_spaces_in_series_name(covid_df: pandas.DataFrame):
    dp = datapact.test(covid_df)
    assert (
        dp["age group"]
        .should.be_one_of(
            "A00-A04", "A05-A14", "A15-A34", "A35-A59", "A60-A79", "A80+", "unbekannt"
        )
        .success
    )


def test_be_date(covid_df: pandas.DataFrame):
    dp = datapact.test(covid_df)
    assert dp.report_date.should.be_date().success
    assert not dp["age group"].should.be_date().success
    assert dp["age group"].should.be_date().failed_sample_indices == [0, 1, 2, 3, 4]


def test_failed_sample(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert dp.SepalLength.should.be_between(3, 4).failed_sample_indices == [131]

    if isinstance(iris_df, pandas.DataFrame):
        result = dp.SepalLength.should.be_between(3, 4)
        assert result.failed_sample is not None
        assert result.failed_sample.to_dict(orient="records") == [
            {
                "Name": "Iris-virginica",
                "SepalLength": 7.9,
                "SepalWidth": 3.8,
                "PetalLength": 6.4,
                "PetalWidth": 2.0,
            }
        ]
    else:
        assert dp.SepalLength.should.be_between(3, 4).failed_sample is None


def test_checks(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)

    assert dp.SepalLength.should.be_between(3, 10).success
    assert dp.is_failure() is False
    assert len(dp.failed_expectations()) == 0
    dp.check()

    failingExpectation = dp.SepalLength.should.be_between(3, 4)
    assert failingExpectation.success is False
    assert dp.is_failure() is True
    assert len(dp.failed_expectations()) == 1
    assert failingExpectation in dp.failed_expectations()
    assert dp.is_critical_failure() is False
    dp.check()

    failingCriticalExpectation = dp.SepalLength.must.be_between(3, 4)
    assert failingCriticalExpectation.success is False
    assert dp.is_failure() is True
    assert len(dp.failed_expectations()) == 2
    assert len(dp.failed_critical_expectations()) == 1
    assert failingCriticalExpectation in dp.failed_expectations()
    assert failingCriticalExpectation in dp.failed_critical_expectations()
    assert dp.is_critical_failure() is True
    with pytest.raises(Exception):
        assert dp.check()


def test_expectation_without_parent():
    e = Expectation.Pass()
    assert e._repr_markdown_() is None
    assert e._repr_html_() is None


def test_match_sample(distribution_df):
    dp = datapact.test(distribution_df)

    assert dp.poisson.should.match_sample(numpy.random.poisson(5000, 10000))
    assert not dp.poisson.should.match_sample(numpy.random.poisson(10, 50))

    assert dp.exp.should.match_sample(numpy.random.exponential(5, 10000))
    assert not dp.exp.should.match_sample(numpy.random.poisson(5, 50))


def test_match_cdf(distribution_df):
    dp = datapact.test(distribution_df)

    assert dp.poisson.should.match_cdf(scipy.stats.poisson.cdf, [5000])


def test_be_binomial_distributed(distribution_df):
    dp = datapact.test(distribution_df)

    assert not dp.poisson.should.be_binomial_distributed(10, 0.5)
    assert (
        dp.poisson.should.be_binomial_distributed(10, 0.5).name
        == "be_binomial_distributed"
    )
    assert dp.binom.should.be_binomial_distributed(10000, 0.5, N=10000)


def test_be_poisson_distributed(distribution_df):
    dp = datapact.test(distribution_df)

    assert dp.poisson.should.be_poisson_distributed(5000, N=1000)


def test_summary_stats(iris_df):
    dp = datapact.test(iris_df)

    assert dp.SepalWidth.should.have_average_between(3, 4)
    assert dp.SepalWidth.should.have_variance_between(0.1, 0.2)
    assert not dp.SepalWidth.should.have_variance_between(3, 4)
    assert dp.SepalWidth.should.have_percentile_between(.95, 3, 4)


    if isinstance(iris_df, pandas.DataFrame):
        assert dp.SepalWidth.should.have_median_between(3, 4)
    else:
        with pytest.raises(NotImplementedError):
            assert dp.SepalWidth.should.have_median_between(3, 4)
