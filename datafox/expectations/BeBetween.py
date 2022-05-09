import pandas
from datafox.schema import Line
from datafox.expectations.ExpectationProtocol import ExpectationProtocol


class BeBetween(ExpectationProtocol):
    def be_between(self, minimum: float, maximum: float) -> None:
        """
        checks if the series is normal distributed.

        :param: alpha defaults to 0.05
        """

        def execute(series: pandas.Series, line: Line):
            found_min = series.min()
            found_max = series.max()

            extends_left = found_min < minimum
            extends_right = found_max > maximum

            if extends_left and extends_right:
                line.fail(
                    f"out of range. expected to be in $({minimum}, {maximum})$ \n"
                    + f"but found $({found_min}, {found_max})$."
                )
            elif extends_left:
                line.fail(
                    f"expected values to be at least ${minimum}$, but found ${found_min}$"
                )
            elif extends_right:
                line.fail(
                    f"expected values to be at most ${maximum}$, but found ${found_max}$"
                )

        self.record("BeNormal", execute, {"minimum": minimum, "maximum": maximum})
