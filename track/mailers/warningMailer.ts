import { getMailTransport } from "integrations/email"
import { EMAIL_DOMAIN, websiteUrl } from "./util"

export function warningMailer({
  to,
  orgSlug,
  datasetSlug,
  runId,
}: {
  to: string
  orgSlug: string
  datasetSlug: string
  runId: string
}) {
  const runUrl = websiteUrl(`/${orgSlug}/${datasetSlug}/runs/${runId}`)

  const msg = {
    from: `noreply@${EMAIL_DOMAIN}`,
    to,
    subject: `Warning: expectations about dataset ${datasetSlug} failed`,
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
