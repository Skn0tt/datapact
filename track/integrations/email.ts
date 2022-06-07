import nodemailer from "nodemailer"
import JSONTransport from "nodemailer/lib/json-transport"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import previewEmail from "preview-email"

function getDevelopmentTransport() {
  const jsonTransport = new JSONTransport({
    jsonTransport: true,
  })
  jsonTransport.send = async (mail, callback) => {
    await previewEmail(mail.data)
    callback(null, null as any)
  }
  return jsonTransport
}

export function getMailTransport() {
  return nodemailer.createTransport(
    process.env.SMTP_URL
      ? new SMTPTransport({
          url: process.env.SMTP_URL,
        })
      : getDevelopmentTransport()
  )
}
