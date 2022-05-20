import { db } from "db"
import { SecurePassword } from "@blitzjs/auth"
import { Ctx } from "blitz"
import { Role } from "types"
import * as z from "zod"
import { Signup } from "../validations"
import { createHash } from "crypto"
import * as undici from "undici"

function md5(v: string) {
  const hash = createHash("md5")
  hash.update(v.trim())
  return hash.digest("hex")
}

async function getGravatarUrl(email: string): Promise<string | undefined> {
  const profileUrl = `https://en.gravatar.com/${md5(email.trim())}`
  const avatarUrl = `https://www.gravatar.com/avatar/${md5(email.trim())}`
  const { headers } = await undici.request(profileUrl, {
    maxRedirections: 0,
  })
  const emailHasGravatar = headers["location"] !== "/profiles/no-such-user"
  return emailHasGravatar ? avatarUrl : undefined
}

export default async function signup(input: z.TypeOf<typeof Signup>, ctx: Ctx) {
  const { email, name, password } = Signup.parse(input)

  const role: Role = "USER"

  const hashedPassword = await SecurePassword.hash(password)
  const user = await db.user.create({
    data: { email, name, hashedPassword, role, profilePictureUrl: await getGravatarUrl(email) },
    select: { id: true, name: true, email: true, role: true },
  })

  await ctx.session.$create({
    userId: user.id,
    role: user.role as Role,
  })

  return { userId: ctx.session.userId, ...user, email: input.email }
}
