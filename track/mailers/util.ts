import mjml2html from "mjml"

export function websiteUrl(path: string) {
  const origin = process.env.URL
  return origin + path
}

export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN ?? "datapact.dev"

const mjmlHeader = `
<mj-text align="center">datapact <span style="font-weight: 700">Track</span></mj-text>
<mj-divider border-color="gray" border-width="1px"></mj-divider>
`

export const mjmlMail = (body: string): string =>
  mjml2html(`
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        ${mjmlHeader}

        ${body}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`).html
