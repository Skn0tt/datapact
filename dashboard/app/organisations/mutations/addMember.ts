import { AuthorizationError, Ctx, NotFoundError } from "blitz"
import { db } from "db"

export default async function addMember(
  { organisation, userId }: { organisation: string; userId: number },
  ctx: Ctx
) {
  ctx.session.$authorize()

  const org = await db.organisation.findUnique({ where: { slug: organisation } })
  if (!org) {
    throw new NotFoundError()
  }
  if (org.ownerId !== ctx.session.userId) {
    throw new AuthorizationError()
  }

  await db.organisation.update({
    where: {
      slug: organisation,
    },
    data: {
      members: {
        connect: {
          id: userId,
        },
      },
    },
  })
}
