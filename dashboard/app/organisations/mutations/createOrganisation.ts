import { Ctx } from "blitz"
import { db } from "db"

export default async function createOrganisation(
  { name, slug }: { name: string; slug: string },
  ctx: Ctx
) {
  ctx.session.$authorize()

  return await db.organisation.create({
    data: {
      name,
      slug,
      members: {
        connect: {
          id: ctx.session.userId,
        },
      },
      owner: {
        connect: {
          id: ctx.session.userId,
        },
      },
    },
  })
}
