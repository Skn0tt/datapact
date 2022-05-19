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

                const defaultBody = (
                  <img
                    src="https://media.giphy.com/media/8gNQZ9IpkcdiAjfOgN/giphy.gif"
                    alt="gif of a barchart, acting as a placeholder"
                    height="200px"
                    width="200px"
                  />
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
