import { Ctx, NotFoundError } from "blitz"
import { db } from "db"
import { notificationSetupMailer } from "mailers/notificationSetupMailer"

export async function checkForDataset(datasetId: number, ctx: Ctx) {
  ctx.session.$authorize()
  const dataset = await db.dataset.findFirst({
    where: {
      id: datasetId,
      organisation: {
        members: {
          some: {
            id: ctx.session.userId,
          },
        },
      },
    },
  })
  if (!dataset) {
    throw new NotFoundError()
  }
  return dataset
}

export default async function updateNotificationMail(
  { datasetId, email }: { datasetId: number; email?: string },
  ctx: Ctx
) {
  const dataset = await checkForDataset(datasetId, ctx)

  await db.dataset.update({
    where: {
      id: datasetId,
    },
    data: {
      notificationMail: email,
    },
  })

  if (email) {
    await notificationSetupMailer({ to: email, datasetName: dataset.slug }).send()
  }
}
