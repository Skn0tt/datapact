# pylint: disable=protected-access,redefined-outer-name

import pandas
import pytest
import datapact
from datapact.datapact import compute

from datapact.fixture_test import iris_df, covid_df  # pylint: disable=unused-import


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


def test_be_normal_distributed(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert dp.SepalWidth.should.be_normal_distributed().success
    assert dp.SepalWidth.should.be_normal_distributed().args == {"alpha": 0.05}


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
