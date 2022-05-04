import { BlitzAPIHandler } from "@blitzjs/next"
import { db, TestRun } from "db"
import { addHours, isAfter } from "date-fns"

function isFinalised(testRun: Pick<TestRun, "date">, now = new Date()) {
  return isAfter(now, addHours(testRun.date, 24))
}

const handler: BlitzAPIHandler = async (req, res, ctx) => {
  if (req.method !== "PUT") {
    res.status(405).end()
    return
  }

  const token = req.headers.authorization?.split("Bearer ")[1]
  if (!token) {
    res.status(401).end()
    return
  }

  const dataset = await db.dataset.findUnique({
    where: {
      token,
    },
  })

  if (!dataset) {
    res.status(401).end()
    return
  }

  const testRunId = req.query.id as string
  const testRun = await db.testRun.findUnique({
    where: {
      datasetId_id: {
        datasetId: dataset.id,
        id: testRunId,
      },
    },
  })
  if (!testRun) {
    await db.testRun.create({
      data: {
        date: new Date(),
        id: testRunId,
        payload: JSON.stringify(req.body),
        datasetId: dataset.id,
      },
    })
  } else {
    if (isFinalised(testRun)) {
      res.status(409).end("already finalised")
      return
    }

    await db.testRun.update({
      where: {
        datasetId_id: {
          datasetId: dataset.id,
          id: testRunId,
        },
      },
      data: {
        payload: JSON.stringify(req.body),
      },
    })
  }

  res.status(200).end()
}

export default handler
