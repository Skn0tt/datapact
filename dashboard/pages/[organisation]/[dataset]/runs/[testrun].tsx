import { useQuery } from "@blitzjs/rpc"
import { Code } from "@chakra-ui/react"
import { Shell } from "app/layout/Shell"
import getTestRun from "app/testruns/queries/getTestRun"
import { useRouter } from "next/router"

export default function TestRun() {
  const { query } = useRouter()
  const [testRun] = useQuery(getTestRun, {
    id: Number.parseInt(query.testrun as string),
    organisation: query.organisation as string,
    project: query.project as string,
  })

  return (
    <Shell
      breadcrumbs={[
        {
          label: testRun.project.organisation.name,
          href: `/${testRun.project.organisation.slug}`,
        },
        {
          label: testRun.project.slug,
          href: `/${testRun.project.organisation.slug}/${testRun.project.slug}`,
        },
        {
          label: `Run #${testRun.id}`,
          href: `/${testRun.project.organisation.slug}/${testRun.project.slug}/${testRun.project.id}`,
        },
      ]}
    >
      <p>
        Created:{" "}
        <time dateTime={testRun.createdAt.toISOString()}>{testRun.createdAt.toISOString()}</time>
      </p>

      <p>Result: {testRun.result ? "✅" : "❌"}</p>

      <h2>Body</h2>

      <Code>{testRun.body}</Code>
    </Shell>
  )
}
