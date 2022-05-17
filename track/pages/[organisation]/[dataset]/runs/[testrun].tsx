import { useQuery } from "@blitzjs/rpc"
import { Code, Text } from "@chakra-ui/react"
import { Shell } from "app/layout/Shell"
import { isFinalised } from "app/testruns"
import getTestRun from "app/testruns/queries/getTestRun"
import { useRouter } from "next/router"
import { TestRunResultVisualizer } from "result_visualiser"

export default function TestRunPage() {
  const { query } = useRouter()
  const [testRun] = useQuery(getTestRun, {
    id: query.testrun as string,
    organisation: query.organisation as string,
    dataset: query.dataset as string,
  })

  try {
    const payload = JSON.parse(testRun.payload)

    return (
      <Shell
        breadcrumbs={[
          {
            label: testRun.dataset.organisation.name,
            href: `/${testRun.dataset.organisation.slug}`,
          },
          {
            label: testRun.dataset.slug,
            href: `/${testRun.dataset.organisation.slug}/${testRun.dataset.slug}`,
          },
          {
            label: `${testRun.date.toISOString()}`,
            href: `/${testRun.dataset.organisation.slug}/${testRun.dataset.slug}/${testRun.id}`,
          },
        ]}
      >
        <TestRunResultVisualizer
          payload={payload}
          finalized={<Text>Finalized: {isFinalised(testRun) ? "Yes" : "No"}</Text>}
        />
      </Shell>
    )
  } catch (error) {
    return <Code>{testRun.payload}</Code>
  }
}
