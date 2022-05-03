import { useQuery } from "@blitzjs/rpc"
import getProject from "app/projects/queries/getProject"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Project() {
  const { query } = useRouter()
  const [project] = useQuery(getProject, {
    organisation: query.organisation as string,
    slug: query.project as string,
  })

  return (
    <main>
      <h1>{project.slug}</h1>

      <p>Owner: {project.owner.name}</p>

      <h2>Runs</h2>
      <table>
        <thead>
          <tr>
            <td>Date</td>
            <td>Result</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {project.testRuns.map((run) => (
            <tr>
              <td>{run.createdAt.toISOString()}</td>
              <td>{run.result ? "✅" : "❌"}</td>
              <td>
                <Link href={`/${query.organisation}/${query.project}/runs/${run.id}`}>
                  <a>&rsaquo;</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
