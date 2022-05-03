import React, { Suspense } from "react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getOrganisations from "app/organisations/queries/getOrganisations"
import { Shell } from "app/layout/Shell"
import {
  Box,
  Heading,
  ListItem,
  Stack,
  StackDivider,
  Text,
  UnorderedList,
  Link,
} from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import { o } from "@blitzjs/auth/dist/index-b6a6318c"
import NextLink from "next/link"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link href="/auth/signup">
          <a className="button small">
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href="/auth/login">
          <a className="button small">
            <strong>Login</strong>
          </a>
        </Link>
      </>
    )
  }
}

function LandingPage() {
  return <p>Sign in to get started.</p>
}

const Dashboard = () => {
  const user = useCurrentUser()
  if (!user) {
    return null
  }

  const [orgs] = useQuery(getOrganisations, null)
  return (
    <>
      <PageTitle title="welcome," name={user.name} suffix="!" />

      <Heading size="md" pt={4} pb={2}>
        Organisations
      </Heading>
      <UnorderedList>
        {orgs.map((org) => (
          <ListItem key={org.slug}>
            <NextLink href={`/${org.slug}`}>
              <Link>{org.name}</Link>
            </NextLink>{" "}
            (owned by <b>{org.owner.name}</b>)
          </ListItem>
        ))}
      </UnorderedList>
    </>
  )
}

const Home = () => {
  const user = useCurrentUser()

  return <Shell>{user ? <Dashboard /> : <LandingPage />}</Shell>
}

export default Home
