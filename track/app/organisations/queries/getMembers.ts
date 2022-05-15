import { Ctx } from "blitz"
import { db } from "db"

export default async function getMembers(slug: string, ctx: Ctx) {
  ctx.session.$authorize()

  return await db.user.findMany({
    where: {
      organisations: {
        some: {
          slug,
          members: {
            some: {
              id: ctx.session.userId,
            },
          },
        },
      },
    },
  })
}
