import { TestRun } from "@prisma/client"
import { addHours, isAfter } from "date-fns"
import { DataframeResult } from "result_visualiser"

export function isFinalised(testRun: Pick<TestRun, "date">, now = new Date()) {
  return isAfter(now, addHours(testRun.date, 24))
}

export function isFailure(result: DataframeResult): boolean {
  return result.series.some((series) =>
    series.expectations.some((expectation) => expectation.success === false)
  )
}