import { useQuery } from "@blitzjs/rpc"
import getOrganisation from "app/organisations/queries/getOrganisation"
import Link from "next/link"
import { useRouter } from "next/router"

export default function OrganisationPage() {
  const {
    query: { organisation },
  } = useRouter()

  const [org] = useQuery(getOrganisation, organisation as string)

  return (
    <div>
      <h1>{org.name}</h1>

      <code>{org.id}</code>

      <p>
        Owner: <b>{org.owner.name}</b>
      </p>

      <h2>Projects</h2>

      <ul>
        {org.projects.map((project) => (
          <li key={project.id}>
            <Link href={`/${organisation}/${project.slug}`}>
              <a>
                {project.slug} (owned by <b>{project.owner.name}</b>)
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
