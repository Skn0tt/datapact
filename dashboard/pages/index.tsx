import React, { Suspense } from "react"
import Link from "next/link"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getOrganisations from "app/organisations/queries/getOrganisations"

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

function ProjectList() {
  const [organisations] = useQuery(getOrganisations, null)

  return (
    <section>
      <h2>Your Projects</h2>

      {organisations.map((organisation) => (
        <React.Fragment key={organisation.id}>
          <Link href={`/${organisation.slug}`}>
            <a>
              <h3>{organisation.name}</h3>
            </a>
          </Link>

          <ul>
            {organisation.projects.map((project) => (
              <Link href={`/${organisation.slug}/${project.slug}`}>
                <a>
                  <li key={project.id}>{project.slug}</li>
                </a>
              </Link>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </section>
  )
}

const Home = () => {
  const user = useCurrentUser()
  return (
    <main>
      <h1>DataFox</h1>
      <Suspense fallback="Loading...">
        <UserInfo />
      </Suspense>

      {user && (
        <Suspense fallback="Loading Projects...">
          <ProjectList />
        </Suspense>
      )}
    </main>
  )
}

export default Home
