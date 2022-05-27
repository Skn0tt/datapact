import { Ctx } from "blitz"
import { db } from "db"
import { checkForDataset } from "./updateNotificationMail"

export default async function removeNotificationMail(
  { datasetId }: { datasetId: number },
  ctx: Ctx
) {
  await checkForDataset(datasetId, ctx)

  await db.dataset.update({
    where: {
      id: datasetId,
    },
    data: {
      notificationMail: null,
    },
  })
}
