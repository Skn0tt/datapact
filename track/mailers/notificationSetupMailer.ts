import { getMailTransport } from "integrations/email"
import { EMAIL_DOMAIN } from "./util"

export function notificationSetupMailer({ to, datasetName }: { to: string; datasetName: string }) {
  const msg = {
    from: `noreply@${EMAIL_DOMAIN}`,
    to,
    subject: `notifications for dataset ${datasetName} setup successfully`,
    html: `
      <h1>Notifications set up sucessfully</h1>

      <p>
        Notifications for dataset ${datasetName} will be delivered to this email.
      </p>
    `,
  }

  return {
    async send() {
      await getMailTransport().sendMail(msg)
    },
  }
}
