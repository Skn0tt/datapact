import { AuthenticationError, PromiseReturnType } from "blitz"
import login from "app/auth/mutations/login"
import { useMutation } from "@blitzjs/rpc"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react"
import NextLink from "next/link"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation, loginMutationMeta] = useMutation(login)
  const toast = useToast()

  return (
    <form
      onSubmit={async (evt) => {
        evt.preventDefault()
        const form = new FormData(evt.target as any)
        try {
          const user = await loginMutation({
            email: form.get("email") as string,
            password: form.get("password") as string,
          })
          props.onSuccess?.(user)
        } catch (error: any) {
          if (error instanceof AuthenticationError) {
            // This error comes from Prisma
            toast({
              title: "Sorry, those credentials are invalid",
            })
          } else {
            toast({
              title: "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              isClosable: true,
            })
          }
        }
      }}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign in to your account
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box rounded={"lg"} bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} p={8}>
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input type="email" name="email" required />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" name="password" required />
            </FormControl>
            <Stack spacing={10}>
              <Stack direction={{ base: "column", sm: "row" }} align={"start"} justify={"end"}>
                <Link color={"blue.400"}>Forgot password?</Link>
              </Stack>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                type="submit"
                loadingText="Signing in..."
                isLoading={loginMutationMeta.isLoading}
              >
                Sign in
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Or{" "}
                <NextLink href="/auth/signup">
                  <Link color={"blue.400"}>Sign Up</Link>
                </NextLink>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </form>
  )
}
export default LoginForm
