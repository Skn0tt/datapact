import { db } from "db"
import { SecurePassword } from "@blitzjs/auth"
import { Ctx } from "blitz"
import { Role } from "types"
import * as z from "zod"
import { Signup } from "../validations"

export default async function signup(input: z.TypeOf<typeof Signup>, ctx: Ctx) {
  const { email, name, password } = Signup.parse(input)

  const role: Role = "USER"

  const hashedPassword = await SecurePassword.hash(password)
  const user = await db.user.create({
    data: { email, name, hashedPassword, role },
    select: { id: true, name: true, email: true, role: true },
  })

  await ctx.session.$create({
    userId: user.id,
    role: user.role as Role,
  })

  return { userId: ctx.session.userId, ...user, email: input.email }
}
