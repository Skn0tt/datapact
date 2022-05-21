import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons"
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Code,
  Heading,
  HStack,
  Link,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import ExpectationVisualisers from "./visualisers"

export interface DataframeResult {
  title?: string
  description?: string
  url?: string
  series: SeriesResult[]
}

export interface SeriesResult {
  name: string
  title?: string
  description?: string
  unit?: string
  expectations: Expectation<any, any>[]
}

export interface Expectation<Args, Result> {
  name: string
  success: boolean
  critical: boolean
  message: string
  args: Args
  result: Result
  failed_sample_indices?: number[]
  failed_sample?: Record<string, any>[]
}

function RecordTable(props: { items: Record<string, any>[] }) {
  const columnNames: string[] = Object.keys(props.items[0]!)
  const rows: string[][] = props.items.map((item) => Object.values(item))

  return (
    <Table>
      <Thead>
        <Tr>
          {[...columnNames].map((colName) => (
            <Th>{colName}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr>
            {row.map((cell) => (
              <Td>{cell}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

export function TestRunResultVisualizer(props: {
  payload: DataframeResult
  finalized?: React.ReactElement
}) {
  const { payload } = props
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

      {props.finalized}

      {payload.series.map((series) => (
        <Stack as="section" key={series.name} pt={4}>
          <Heading size="md">
            <Link href={`#${series.name}`} id={series.name}>
              {series.title ?? series.name}
            </Link>
          </Heading>

          <Stack spacing={2}>
            {series.description && <Text>Description: {series.description}</Text>}
            {series.unit && (
              <Text>
                Unit: <Code>{series.unit}</Code>
              </Text>
            )}

            <Accordion allowMultiple allowToggle>
              {series.expectations.map((expectation: Expectation<any, any>, index) => {
                const visualiser = ExpectationVisualisers[expectation.name]
                const defaultTitle = expectation.message
                  ? `${expectation.name}: ${expectation.message}`
                  : expectation.name

                expectation.args

                const defaultBody = (
                  <Box>
                    <Text>
                      <Text as="b" fontWeight="semibold" pr="2">
                        Arguments:
                      </Text>
                      {Object.entries(expectation.args).map(([key, value], i) => (
                        <>
                          {i !== 0 && <span>, </span>}
                          <Code>{`${key}=${value}`}</Code>
                        </>
                      ))}
                    </Text>
                    <Text>
                      <Text as="b" fontWeight="semibold" pr="2">
                        Results:
                      </Text>
                      {Object.entries(expectation.result).map(([key, value], i) => (
                        <>
                          {i !== 0 && <span>, </span>}
                          <Code>{`${key}=${value}`}</Code>
                        </>
                      ))}
                    </Text>
                  </Box>
                )
                return (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton justifyContent="space-between">
                        <HStack textAlign="left">
                          {expectation.success ? (
                            <CheckCircleIcon color="green" />
                          ) : (
                            <WarningIcon color="red" />
                          )}
                          <Text>
                            {visualiser?.Title ? visualiser.Title({ expectation }) : defaultTitle}
                          </Text>
                        </HStack>

                        <AccordionIcon float="right" />
                      </AccordionButton>
                    </h2>

                    <AccordionPanel>
                      {visualiser?.Body ? visualiser.Body({ expectation }) : defaultBody}

                      {expectation.failed_sample && (
                        <Box as="section" pt="4">
                          <Heading size="md">Failed Items Sample</Heading>
                          <RecordTable items={expectation.failed_sample} />
                        </Box>
                      )}

                      {!expectation.failed_sample && expectation.failed_sample_indices && (
                        <p>Failed Indices: {expectation.failed_sample_indices.join(", ")}</p>
                      )}
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
}
