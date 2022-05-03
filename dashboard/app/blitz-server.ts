import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage } from "@blitzjs/auth"
import { db } from "db"
import { simpleRolesIsAuthorized } from "@blitzjs/auth"

export const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      cookiePrefix: "dashboard-cookie-prefix",
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
})
