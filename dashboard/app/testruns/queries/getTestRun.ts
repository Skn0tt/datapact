import { Ctx, NotFoundError } from "blitz"
import { db } from "db"

export default async function getTestRun(
  { organisation, dataset, id }: { organisation: string; dataset: string; id: string },
  ctx: Ctx
) {
  ctx.session.$authorize()
  const testRun = await db.testRun.findFirst({
    where: {
      id,
      dataset: {
        slug: dataset,
        organisation: {
          slug: organisation,
          members: {
            some: {
              id: ctx.session.userId,
            },
          },
        },
      },
    },
    include: {
      dataset: {
        include: {
          organisation: true,
        },
      },
    },
  })
  if (!testRun) {
    throw new NotFoundError()
  }
  return testRun
}
