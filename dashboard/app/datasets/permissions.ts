import { ClientSession } from "@blitzjs/auth"
import { Dataset, Organisation } from "@prisma/client"

export function canUpdateOwner(
  session: Pick<ClientSession, "userId">,
  dataset: Pick<
    Dataset & { organisation: Pick<Organisation, "ownerId"> },
    "ownerId" | "organisation"
  >
) {
  return dataset.ownerId === session.userId || dataset.organisation.ownerId === session.userId
}
