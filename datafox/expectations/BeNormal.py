import json
import scipy.stats
import pandas
from datafox.schema import Line
from datafox.expectations.ExpectationProtocol import ExpectationProtocol


class BeNormal(ExpectationProtocol):
    def be_normal(self, alpha: float = 0.05) -> None:
        """
        checks if the series is normal distributed.

        :param: alpha defaults to 0.05
        """

        def execute(series: pandas.Series, line: Line):
            stat, p = scipy.stats.normaltest(series)
            line.set("stat", stat)
            line.set("p", p)
            bins = pandas.cut(series, bins=10).value_counts()
            line.set("bins", json.loads(bins.to_json()))
            if p < alpha:
                line.fail(f"not normal. p={p}, stat={stat}")

        self.record("BeNormal", execute, {"alpha": alpha})
