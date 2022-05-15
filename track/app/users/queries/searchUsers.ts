import { Ctx } from "blitz"
import { db } from "db"

export default async function searchUsers(
  { term, exclude }: { term: string; exclude: number[] },
  ctx: Ctx
) {
  ctx.session.$authorize()
  return db.user.findMany({
    where: {
      id: {
        notIn: exclude,
      },
      OR: [
        {
          email: {
            contains: term,
          },
        },
        {
          name: {
            contains: term,
          },
        },
      ],
    },
    take: 20,
    select: {
      id: true,
      name: true,
    },
  })
}
