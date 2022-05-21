import { Code, Text } from "@chakra-ui/react"
import { BinDistribution } from "./BinDistribution"
import { ExpectationVisualiser } from "./ExpectationVisualiser"

export const be_normal_distributed: ExpectationVisualiser<
  { alpha: number },
  {
    stat: number
    p: number
    bins: Record<string, string>
  }
> = {
  Body({ expectation: { result, args } }) {
    return (
      <>
        <Text>
          Alpha: <Code>{args.alpha}</Code>
        </Text>
        <Text>
          Stat: <Code>{result.stat}</Code>
        </Text>
        <Text>
          P: <Code>{result.p}</Code>
        </Text>
        <BinDistribution bins={result.bins} />
      </>
    )
  },
}
