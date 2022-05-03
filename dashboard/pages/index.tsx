import React, { Suspense } from "react"
import Link from "next/link"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getOrganisations from "app/organisations/queries/getOrganisations"
import { Shell } from "app/layout/Shell"
import { Box, Heading, Stack, StackDivider, Text } from "@chakra-ui/react"

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

function ProjectList() {
  const [organisations] = useQuery(getOrganisations, null)

  return (
    <section>
      <Heading fontSize="xl">Projects</Heading>

      <Stack divider={<StackDivider />}>
        {organisations.map((organisation) => (
          <Box key={organisation.id} p={5} shadow="md" borderWidth="1px">
            <Link href={`/${organisation.slug}`}>
              <a>
                <Heading fontSize="md">{organisation.name}</Heading>
              </a>
            </Link>

            <ul>
              {organisation.projects.map((project) => (
                <Link key={project.id} href={`/${organisation.slug}/${project.slug}`}>
                  <a>
                    <li>{project.slug}</li>
                  </a>
                </Link>
              ))}
            </ul>
          </Box>
        ))}
      </Stack>
    </section>
  )
}

const Dashboard = () => {
  return <ProjectList />
}

const Home = () => {
  const user = useCurrentUser()

  return <Shell>{user ? <Dashboard /> : <LandingPage />}</Shell>
}

export default Home
