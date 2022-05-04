import { AuthorizationError, Ctx } from "blitz"
import { db } from "db"
import crypto from "crypto"

export default async function createDataset(
  { slug, organisation }: { slug: string; organisation: string },
  ctx: Ctx
) {
  ctx.session.$authorize()

  const org = await db.organisation.findFirst({
    where: {
      slug: organisation,
      members: {
        some: {
          id: ctx.session.userId,
        },
      },
    },
  })

  if (!org) {
    throw new AuthorizationError()
  }

  return await db.dataset.create({
    data: {
      slug,
      token: crypto.randomUUID(),
      organisationId: org.id,
    },
  })
}
