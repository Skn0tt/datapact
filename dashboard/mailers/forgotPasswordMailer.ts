import { getMailTransport } from "integrations/email"
import { EMAIL_DOMAIN, websiteUrl } from "./util"

type ResetPasswordMailer = {
  to: string
  token: string
}

export function forgotPasswordMailer({ to, token }: ResetPasswordMailer) {
  const resetUrl = websiteUrl(`/reset-password?token=${token}`)

  const msg = {
    from: `noreply@${EMAIL_DOMAIN}`,
    to,
    subject: "Your Password Reset Instructions",
    html: `
      <h1>Reset Your Password</h1>

      <a href="${resetUrl}">
        Click here to set a new password
      </a>
    `,
  }

  return {
    async send() {
      await getMailTransport().sendMail(msg)
    },
  }
}
