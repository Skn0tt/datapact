import pandas
from datafox.schema import Line
from datafox.expectations.ExpectationProtocol import ExpectationProtocol


class NotBeNull(ExpectationProtocol):
    def not_be_null(self, percentage: float = 0.05) -> None:
        """
        expects values to not be null
        """

        def execute(series: pandas.Series, line: Line):
            if series.isnull().values.any():
                line.fail("found null values")

        self.record("NotBeNull", execute, {"percentage": percentage})
