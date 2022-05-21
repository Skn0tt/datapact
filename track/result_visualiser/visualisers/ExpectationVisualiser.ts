import type React from "react"
import type { Expectation, SeriesResult } from "result_visualiser"
export interface ExpectationVisualiser<
  Args extends Record<string, any> = {},
  Result extends Record<string, any> = {}
> {
  Title?: React.FC<{ expectation: Expectation<Args, Result>; series: SeriesResult }>
  Body?: React.FC<{ expectation: Expectation<Args, Result>; series: SeriesResult }>
}
