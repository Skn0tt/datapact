import { AuthorizationError, Ctx, NotFoundError } from "blitz"
import { db } from "db"
import { canUpdateOwner } from "../permissions"

export default async function updateOwner(
  { datasetId, userId }: { datasetId: number; userId: number },
  ctx: Ctx
) {
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
    include: {
      organisation: true,
    },
  })
  if (!dataset) {
    throw new NotFoundError()
  }
  if (!canUpdateOwner(ctx.session, dataset)) {
    throw new AuthorizationError()
  }

  const userInOrgOfDataset = await db.user.findFirst({
    where: {
      id: userId,
      organisations: {
        some: {
          datasets: {
            some: {
              id: datasetId,
            },
          },
        },
      },
    },
  })
  if (!userInOrgOfDataset) {
    throw new NotFoundError()
  }

  await db.dataset.update({
    where: {
      id: datasetId,
    },
    data: {
      ownerId: userId,
    },
  })
}
