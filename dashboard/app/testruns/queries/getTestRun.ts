import { Ctx, NotFoundError } from "blitz"
import { db } from "db"

export default async function getTestRun(
  { organisation, project, id }: { organisation: string; project: string; id: number },
  ctx: Ctx
) {
  ctx.session.$authorize()
  const testRun = await db.testRun.findFirst({
    where: {
      id,
      project: {
        slug: project,
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
      project: {
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
