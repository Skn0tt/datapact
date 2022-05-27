import { getMailTransport } from "integrations/email"
import { EMAIL_DOMAIN, mjmlMail } from "./util"

export function notificationSetupMailer({ to, datasetName }: { to: string; datasetName: string }) {
  const msg = {
    from: `noreply@${EMAIL_DOMAIN}`,
    to,
    subject: `notifications for dataset ${datasetName} setup successfully`,
    html: mjmlMail(`
      <mj-text font-size="20px">Notifications set up sucessfully</mj-text>
          
      <mj-text>
        Notifications for dataset "${datasetName}" will be delivered to this email.
      </mj-text>
    `),
  }

  return {
    async send() {
      await getMailTransport().sendMail(msg)
    },
  }
}
