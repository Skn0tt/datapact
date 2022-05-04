import { Ctx } from "blitz"
import { db } from "db"

export default async function getOrganisations(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  return db.organisation.findMany({
    where: {
      members: {
        some: {
          id: ctx.session.userId,
        },
      },
    },
    include: {
      datasets: true,
      owner: {
        select: {
          name: true,
        },
      },
    },
  })
}
