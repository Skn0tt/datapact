import { useRouter } from "next/router"
import { SignupForm } from "app/auth/components/SignupForm"
import { Box, useColorModeValue } from "@chakra-ui/react"

const SignupPage = () => {
  const router = useRouter()

  return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.50", "gray.800")}>
      <SignupForm onSuccess={() => router.push("/")} />
    </Box>
  )
}

export default SignupPage
