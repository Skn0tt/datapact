import { getMailTransport } from "integrations/email"
import { EMAIL_DOMAIN, mjmlMail, websiteUrl } from "./util"

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
    subject: `[datapact/${orgSlug}/${datasetSlug}] warning: test run failed`,
    html: mjmlMail(`
      <mj-text font-size="20px">Test Run Failed</mj-text> 
      <mj-text>
        A test run on the dataset "${datasetSlug}" failed:
        <a href="${runUrl}">${runUrl}</a>
      </mj-text>
    `),
  }

  return {
    async send() {
      await getMailTransport().sendMail(msg)
    },
  }
}
