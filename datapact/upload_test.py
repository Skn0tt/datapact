# pylint: disable=redefined-outer-name

import pandas
import pytest_httpserver

import datapact
from datapact.fixture_test import iris_df  # pylint: disable=unused-import


def test_upload(httpserver: pytest_httpserver.HTTPServer, iris_df: pandas.DataFrame):
    httpserver.expect_request(r"/api/v1/testruns/.*")
    api_url = httpserver.url_for("/")

    dp = datapact.test(iris_df)
    dp.connect(api_url, token="abc")
    dp.SepalLength.should.be_between(0, 4)
    dp.check()


def test_protocol_default_https(iris_df: pandas.DataFrame):
    dp = datapact.test(iris_df)
    dp.connect("track.datapact.dev", "foo")
    assert dp.server is not None
    assert dp.server.startswith("https://")
