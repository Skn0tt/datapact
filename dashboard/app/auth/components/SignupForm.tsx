import signup from "app/auth/mutations/signup"
import { useMutation } from "@blitzjs/rpc"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react"
import { useState } from "react"
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import NextLink from "next/link"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation, signupMutationMeta] = useMutation(signup)
  const [showPassword, setShowPassword] = useState(false)

  const toast = useToast()

  return (
    <form
      onSubmit={async (evt) => {
        evt.preventDefault()
        const form = new FormData(evt.target as any)
        console.log(form.get("email"))
        try {
          await signupMutation({
            email: form.get("email") as string,
            name: form.get("name") as string,
            password: form.get("password") as string,
          })
          props.onSuccess?.()
        } catch (error: any) {
          if (error.code === "P2002" && error.meta?.target?.includes("email")) {
            // This error comes from Prisma
            toast({
              title: "This email is already being used",
              isClosable: true,
            })
          } else {
            toast({
              title: error.toString(),
              isClosable: true,
            })
          }
        }
      }}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box rounded={"lg"} bg={useColorModeValue("white", "gray.700")} boxShadow={"lg"} p={8}>
          <Stack spacing={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input type="text" name="name" />
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input type="email" name="email" />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input name="password" type={showPassword ? "text" : "password"} />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                type="submit"
                isLoading={signupMutationMeta.isLoading}
              >
                Sign up
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Already a user?{" "}
                <NextLink href="/auth/login">
                  <Link color={"blue.400"}>Sign In</Link>
                </NextLink>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </form>
  )
}

export default SignupForm
