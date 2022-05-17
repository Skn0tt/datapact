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

export function TestRunResultVisualizer(props: { payload: any; finalized?: React.ReactElement }) {
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
              {series.lines.map((line, index) => {
                const visualiser = ExpectationVisualisers[line.type]
                const defaultTitle = line.message ? `${line.type}: ${line.message}` : line.type
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
}
