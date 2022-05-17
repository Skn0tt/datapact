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
  Body({ expectation: { meta, args } }) {
    return (
      <>
        <Text>
          Alpha: <Code>{args.alpha}</Code>
        </Text>
        <Text>
          Stat: <Code>{meta.stat}</Code>
        </Text>
        <Text>
          P: <Code>{meta.p}</Code>
        </Text>
        <Bar
          data={{
            labels: Object.keys(meta.bins),
            datasets: [
              {
                label: "Distribution",
                data: Object.values(meta.bins).map((i) => parseInt(i)),
                order: 1,
              },
            ],
          }}
        />
      </>
    )
  },
}
