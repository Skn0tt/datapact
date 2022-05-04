import { Ctx, NotFoundError } from "blitz"
import { db } from "db"

export default async function getOrganisation(slug: string, ctx: Ctx) {
  ctx.session.$authorize()

  const org = await db.organisation.findFirst({
    where: {
      slug,
      members: {
        some: {
          id: ctx.session.userId,
        },
      },
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      datasets: {
        include: {
          owner: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!org) {
    throw new NotFoundError()
  }

  return org
}
