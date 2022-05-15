import { TestRun } from "@prisma/client"
import { addHours, isAfter } from "date-fns"

export function isFinalised(testRun: Pick<TestRun, "date">, now = new Date()) {
  return isAfter(now, addHours(testRun.date, 24))
}
