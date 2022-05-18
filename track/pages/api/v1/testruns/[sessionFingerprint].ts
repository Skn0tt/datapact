import { BlitzAPIHandler } from "@blitzjs/next"
import { db } from "db"
import { isFinalised } from "app/testruns"

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

  const sessionFingerprint = req.query.sessionFingerprint as string

  const testRun = await db.testRun.findFirst({
    where: {
      sessionFingerprint,
      datasetId: dataset.id,
    },
  })
  if (!testRun || isFinalised(testRun)) {
    const { id } = await db.testRun.create({
      data: {
        sessionFingerprint,
        date: new Date(),
        payload: req.body,
        datasetId: dataset.id,
      },
    })
    res.status(201).json({ id })
    return
  } else {
    await db.testRun.update({
      where: {
        id: testRun.id,
      },
      data: {
        payload: req.body,
      },
    })
    res.status(202).json({ id: testRun.id })
    return
  }
}

export default handler
