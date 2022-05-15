import { getMailTransport } from "integrations/email"
import { EMAIL_DOMAIN, websiteUrl } from "./util"

export function warningMailer({
  to,
  orgId,
  datasetId,
  runId,
}: {
  to: string
  orgId: string
  datasetId: string
  runId: string
}) {
  const runUrl = websiteUrl(`/${orgId}/${datasetId}/${runId}`)

  const msg = {
    from: `noreply@${EMAIL_DOMAIN}`,
    to,
    subject: `Warning: expectations about dataset ${datasetId} failed`,
    html: `
      <h1>Expectations Failed</h1>

      <a href="${runUrl}">
        ${runUrl}
      </a>
    `,
  }

  return {
    async send() {
      await getMailTransport().sendMail(msg)
    },
  }
}
