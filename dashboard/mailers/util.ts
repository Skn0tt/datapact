export function websiteUrl(path: string) {
  const origin = process.env.URL
  return origin + path
}

export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN ?? "datafox.dev"
