import { useQuery } from "@blitzjs/rpc"
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons"
import { Code, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react"
import type { TestRun } from "@prisma/client"
import { Shell } from "app/layout/Shell"
import { isFinalised } from "app/testruns"
import getTestRun from "app/testruns/queries/getTestRun"
import { useRouter } from "next/router"
import NextLink from "next/link"

function TestRunViz(props: { testRun: TestRun }) {
  try {
    const payload = JSON.parse(props.testRun.payload)

    return (
      <Stack>
        <Heading size="xl">{payload.title}</Heading>
        <Text>{payload.description}</Text>
        {payload.url && (
          <Text>
            Location:{" "}
            <Link href={payload.url} isExternal color="blue.700">
              {payload.url}
            </Link>
          </Text>
        )}
        <Text>Finalized: {isFinalised(props.testRun) ? "Yes" : "No"}</Text>

        {payload.series.map((series) => (
          <Stack as="section" key={series.name} pt={4}>
            <Heading size="md">
              <NextLink href={`#${series.name}`} passHref>
                <Link>{series.title ?? series.name}</Link>
              </NextLink>
            </Heading>

            <Stack spacing={2}>
              {series.description && <Text>{series.description}</Text>}
              {series.unit && (
                <Text>
                  Unit: <Code>{series.unit}</Code>
                </Text>
              )}

              {series.lines.map((line, index) => (
                <HStack key={index} align="center">
                  {line.success ? <CheckCircleIcon color="green" /> : <WarningIcon color="red" />}
                  <Text>{line.message ? `${line.type}: ${line.message}` : line.type}</Text>
                </HStack>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    )
  } catch (error) {
    return <Code>{props.testRun.payload}</Code>
  }
}

export default function TestRunPage() {
  const { query } = useRouter()
  const [testRun] = useQuery(getTestRun, {
    id: query.testrun as string,
    organisation: query.organisation as string,
    dataset: query.dataset as string,
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
      <TestRunViz testRun={testRun} />
    </Shell>
  )
}
