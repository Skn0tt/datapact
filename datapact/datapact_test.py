import pandas
import datapact
from datapact.datapact import compute

from datapact.fixture_test import iris_df


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
    assert dp.Name.should.be_one_of("Iris-setosa").message == "found additional values: ['Iris-versicolor', 'Iris-virginica']"
    assert dp.Name.should.be_one_of("Iris-setosa", "Iris-virginica", "Iris-versicolor").success is True
    assert dp.Name.should.be_one_of("Iris-setosa", "Iris-virginica", "Iris-versicolor", "additional").result["used_pct"] == .75
    # TODO: implement
    # assert dp.Name.should.be_one_of("Iris-setosa", "Iris-virginica", "Iris-versicolor", "additional").args == {}
    