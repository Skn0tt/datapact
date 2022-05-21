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

export function BinDistribution({ bins }: { bins: Record<string, string> }) {
  return (
    <Bar
      data={{
        labels: Object.keys(bins),
        datasets: [
          {
            label: "Distribution",
            data: Object.values(bins).map((i) => parseInt(i)),
            order: 1,
          },
        ],
      }}
    />
  )
}
