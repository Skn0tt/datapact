import { useQuery } from "@blitzjs/rpc"
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Code,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import type { TestRun } from "@prisma/client"
import { Shell } from "app/layout/Shell"
import { isFinalised } from "app/testruns"
import getTestRun from "app/testruns/queries/getTestRun"
import { useRouter } from "next/router"
import NextLink from "next/link"
import ExpectationVisualisers from "app/expectations"

function TestRunViz(props: { testRun: TestRun }) {
  try {
    const payload = JSON.parse(props.testRun.payload)

    return (
      <Stack>
        {payload.title && <Heading size="xl">{payload.title}</Heading>}

        {payload.url && (
          <Text>
            Location:{" "}
            <Link href={payload.url} isExternal color="blue.700">
              {payload.url}
            </Link>
          </Text>
        )}

        {payload.description && (
          <Text>
            Description: <span>{payload.description}</span>
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
              {series.description && <Text>Description: {series.description}</Text>}
              {series.unit && (
                <Text>
                  Unit: <Code>{series.unit}</Code>
                </Text>
              )}

              <Accordion allowMultiple allowToggle>
                {series.lines.map((line) => {
                  const visualiser = ExpectationVisualisers[line.type]
                  const defaultTitle = line.message ? `${line.type}: ${line.message}` : line.type
                  const defaultBody = (
                    <img
                      src="https://media.giphy.com/media/8gNQZ9IpkcdiAjfOgN/giphy.gif"
                      height="200px"
                      width="200px"
                    />
                  )
                  return (
                    <AccordionItem>
                      <h2>
                        <AccordionButton justifyContent="space-between">
                          <HStack textAlign="left">
                            {line.success ? (
                              <CheckCircleIcon color="green" />
                            ) : (
                              <WarningIcon color="red" />
                            )}
                            <Text>
                              {visualiser?.Title ? visualiser.Title({ line }) : defaultTitle}
                            </Text>
                          </HStack>

                          <AccordionIcon float="right" />
                        </AccordionButton>
                      </h2>

                      <AccordionPanel>
                        {visualiser?.Body ? visualiser.Body({ line }) : defaultBody}
                      </AccordionPanel>
                    </AccordionItem>
                  )
                })}
              </Accordion>
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
