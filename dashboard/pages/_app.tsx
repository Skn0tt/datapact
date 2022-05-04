import { ErrorFallbackProps, ErrorComponent, ErrorBoundary } from "@blitzjs/next"
import { AuthenticationError, AuthorizationError } from "blitz"
import type { AppProps } from "next/app"
import React, { Suspense } from "react"
import { withBlitz } from "app/blitz-client"
import { ChakraProvider } from "@chakra-ui/react"
import { Shell } from "app/layout/Shell"

function RootErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <div>Error: You are not authenticated</div>
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent
        statusCode={(error as any)?.statusCode || 400}
        title={error.message || error.name}
      />
    )
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        <Suspense fallback={<Shell />}>
          <Component {...pageProps} />
        </Suspense>
      </ErrorBoundary>
    </ChakraProvider>
  )
}

export default withBlitz(MyApp)
