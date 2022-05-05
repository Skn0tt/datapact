import nodemailer from "nodemailer"
import JSONTransport from "nodemailer/lib/json-transport"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import previewEmail from "preview-email"

export function getMailTransport() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(
      new SMTPTransport({
        url: process.env.SMTP_URL,
      })
    )
  } else {
    const jsonTransport = new JSONTransport({
      jsonTransport: true,
    })
    const oldSend = jsonTransport.send
    jsonTransport.send = (mail, callback) => {
      oldSend(mail, (...args) => {
        previewEmail(mail as any)
        callback(...args)
      })
    }
    return nodemailer.createTransport(jsonTransport)
  }
}
