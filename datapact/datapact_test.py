import pandas
import datapact
from datapact.datapact import compute

from datapact.fixture_test import iris_df, covid_df


def test_iris(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    dp.SepalLength.describe(
        title="flower Sepal Lenght",
        description="A sepal is a part of the flower of angiosperms.",
        unit="cm",
    )
    be_between = dp.SepalLength.must.be_between(3, 4)
    dp.SepalLength.must.be_positive()

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

    custom_result = dp.SepalLength.must.fulfill(be_bigger_than_3)
    assert custom_result.name == "be_bigger_than_3"

    expected_markdown = (
        "**SepalLength**  \n"
        + "❌ be_between: expected values to be at most 4, but found 7.9  \n"
        + "✅ be_positive  \n"
        + "✅ be_bigger_than_3  \n\n"
    )
    assert dp._repr_markdown_() == expected_markdown


def test_be_between(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert (
        dp.Name.should.be_one_of("Iris-setosa").message
        == "found additional values: ['Iris-versicolor', 'Iris-virginica']"
    )
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


def test_failed_sample(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    assert dp.SepalLength.should.be_between(3, 4).failed_sample_indices == [131]

    if type(iris_df) is pandas.DataFrame:
        assert dp.SepalLength.should.be_between(3, 4).failed_sample.to_dict(
            orient="records"
        ) == [
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
