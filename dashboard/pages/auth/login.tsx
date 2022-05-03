import { Box, useColorModeValue } from "@chakra-ui/react"
import { LoginForm } from "app/auth/components/LoginForm"
import { useRouter } from "next/router"

const LoginPage = () => {
  const router = useRouter()

  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.50", "gray.800")}>
      <LoginForm
        onSuccess={(_user) => {
          const next = router.query.next ? decodeURIComponent(router.query.next as string) : "/"
          return router.push(next)
        }}
      />
    </Box>
  )
}

export default LoginPage
