import { useQuery } from "@blitzjs/rpc"
import { Code, Heading, Text } from "@chakra-ui/react"
import { Shell } from "app/layout/Shell"
import getTestRun from "app/testruns/queries/getTestRun"
import { useRouter } from "next/router"

export default function TestRun() {
  const { query } = useRouter()
  const [testRun] = useQuery(getTestRun, {
    id: query.testrun as string,
    organisation: query.organisation as string,
    project: query.project as string,
  })

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
      <Text>
        Created: <time dateTime={testRun.date.toISOString()}>{testRun.date.toISOString()}</time>
      </Text>

      <Heading>Payload</Heading>

      <Code>{testRun.payload}</Code>
    </Shell>
  )
}
