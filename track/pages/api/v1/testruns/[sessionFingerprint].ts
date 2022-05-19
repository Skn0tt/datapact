import { BlitzAPIHandler } from "@blitzjs/next"
import { db } from "db"
import { isFinalised } from "app/testruns"
import type { DataframeResult } from "result_visualiser"
import { warningMailer } from "mailers/warningMailer"

function isFailure(result: DataframeResult): boolean {
  return result.series.some((series) =>
    series.expectations.some((expectation) => expectation.success === false)
  )
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
    include: {
      organisation: {
        select: {
          slug: true,
        },
      },
    },
  })

  if (!dataset) {
    res.status(401).end()
    return
  }

  async function sendWarningEmail(runId: string) {
    if (!dataset?.notificationMail) {
      return
    }
    await warningMailer({
      to: dataset.notificationMail,
      datasetSlug: dataset.slug,
      orgSlug: dataset.organisation.slug,
      runId,
    }).send()
  }

  const submittedDataset = req.body as DataframeResult

  const sessionFingerprint = req.query.sessionFingerprint as string

  const testRun = await db.testRun.findFirst({
    where: {
      sessionFingerprint,
      datasetId: dataset.id,
    },
  })

  const datasetIsFailure = isFailure(submittedDataset)

  if (!testRun || isFinalised(testRun)) {
    const { id } = await db.testRun.create({
      data: {
        sessionFingerprint,
        date: new Date(),
        payload: req.body,
        datasetId: dataset.id,
        emailSent: datasetIsFailure ? new Date() : undefined,
      },
    })
    if (datasetIsFailure) {
      await sendWarningEmail(id)
    }
    res.status(201).json({ id })
    return
  } else {
    const sendEmail = datasetIsFailure && !testRun.emailSent
    await db.testRun.update({
      where: {
        id: testRun.id,
      },
      data: {
        payload: req.body,
        emailSent: sendEmail ? new Date() : undefined,
      },
    })
    if (sendEmail) {
      await sendWarningEmail(testRun.id)
    }
    res.status(202).json({ id: testRun.id })
    return
  }
}

export default handler
