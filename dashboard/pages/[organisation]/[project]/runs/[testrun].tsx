import { useQuery } from "@blitzjs/rpc"
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
    <main>
      <p>
        Created:{" "}
        <time dateTime={testRun.createdAt.toISOString()}>{testRun.createdAt.toISOString()}</time>
      </p>

      <p>Result: {testRun.result ? "✅" : "❌"}</p>

      <h2>Body</h2>

      <code>{testRun.body}</code>
    </main>
  )
}
