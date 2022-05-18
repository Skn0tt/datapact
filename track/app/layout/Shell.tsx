import {
  Box,
  Flex,
  Avatar,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import NextLink from "next/link"
import { invoke } from "@blitzjs/rpc"
import logout from "app/auth/mutations/logout"
import Router from "next/router"
import { Suspense } from "react"

const TextLogo = () => {
  return (
    <Text fontSize={"lg"}>
      datapact{" "}
      <Text fontSize={"xl"} as="span">
        <b>Track</b>
      </Text>
    </Text>
  )
}

function LargeWithLogoCentered() {
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Box py={10}>
        <Flex
          align={"center"}
          _before={{
            content: '""',
            borderBottom: "1px solid",
            borderColor: useColorModeValue("gray.200", "gray.700"),
            flexGrow: 1,
            mr: 8,
          }}
          _after={{
            content: '""',
            borderBottom: "1px solid",
            borderColor: useColorModeValue("gray.200", "gray.700"),
            flexGrow: 1,
            ml: 8,
          }}
        >
          <TextLogo />
        </Flex>
        <Text pt={6} fontSize={"sm"} textAlign={"center"}>
          © 2022 Simon Knott &amp; Datapact Contributors. All rights reserved
        </Text>
      </Box>
    </Box>
  )
}

function AuthArea() {
  const currentUser = useCurrentUser()

  if (!currentUser) {
    return (
      <NextLink href="/auth/login">
        <Link>Sign In</Link>
      </NextLink>
    )
  }

  return (
    <Menu>
      <MenuButton as={Button} rounded={"full"} variant={"link"} cursor={"pointer"} minW={0}>
        <Avatar
          size={"sm"}
          name={currentUser.name}
          src={currentUser?.profilePictureUrl ?? undefined}
        />
      </MenuButton>
      <MenuList>
        <NextLink href="/settings">
          <MenuItem>Settings</MenuItem>
        </NextLink>
        <MenuDivider />
        <MenuItem
          onClick={async () => {
            await invoke(logout, null)
            await Router.push("/auth/login")
          }}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export function Shell(
  props: React.PropsWithChildren<{
    breadcrumbs?: { label: string; href: string }[]
  }>
) {
  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={8}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8}>
            <NextLink href="/">
              <Link>
                <TextLogo />
              </Link>
            </NextLink>
          </HStack>
          <Breadcrumb>
            {props.breadcrumbs?.map((breadcrumb, index) => {
              const isLastItem = index + 1 === props.breadcrumbs?.length
              return (
                <BreadcrumbItem key={index}>
                  <NextLink href={breadcrumb.href}>
                    <BreadcrumbLink
                      isCurrentPage={isLastItem}
                      textDecor={isLastItem ? "underline" : "none"}
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  </NextLink>
                </BreadcrumbItem>
              )
            })}
          </Breadcrumb>
          <Suspense fallback={<Box />}>
            <AuthArea />
          </Suspense>
        </Flex>
      </Box>

      <Box p={4} maxWidth="800px" margin="0 auto">
        <Suspense fallback={null}>{props.children}</Suspense>
      </Box>

      <LargeWithLogoCentered />
    </>
  )
}
