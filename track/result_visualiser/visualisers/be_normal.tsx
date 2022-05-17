import { Code, Text } from "@chakra-ui/react"
import { ExpectationVisualiser } from "./ExpectationVisualiser"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const be_normal: ExpectationVisualiser<
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
        <Bar
          data={{
            labels: Object.keys(result.bins),
            datasets: [
              {
                label: "Distribution",
                data: Object.values(result.bins).map((i) => parseInt(i)),
                order: 1,
              },
            ],
          }}
        />
      </>
    )
  },
}
